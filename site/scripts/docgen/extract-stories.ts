import {readdirSync, readFileSync} from 'node:fs';
import {basename, dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {synthesizeJsx} from './synthesize-jsx';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * One story extracted from a stories file.
 */
export interface StoryDoc {
  /**
   * Human heading, from the story `name` or the start-cased export name.
   */
  displayName: string;
  exportName: string;
  /**
   * The code shown next to the live demo.
   */
  snippet: string;
}

/**
 * All stories of one `<File>.stories.tsx` within a component directory.
 */
export interface StoriesFileDoc {
  /**
   * File basename without extension, e.g. `Button` or `Collapsible`.
   */
  file: string;
  stories: StoryDoc[];
}

export function storyFilesOf(componentName: string): string[] {
  const dir = join(repoRoot, 'src/components', componentName);
  return readdirSync(dir)
    .filter(entry => entry.endsWith('.stories.tsx'))
    .map(entry => basename(entry, '.stories.tsx'))
    .sort((a, b) => {
      // The directory-named stories file leads the page.
      if (a === componentName) {
        return -1;
      }
      if (b === componentName) {
        return 1;
      }
      return a.localeCompare(b);
    });
}

function unwrapSatisfies(expression: ts.Expression): ts.Expression {
  return ts.isSatisfiesExpression(expression)
    ? expression.expression
    : expression;
}

function unwrapComponentExpression(expression: ts.Expression): ts.Expression {
  if (
    ts.isAsExpression(expression) ||
    ts.isParenthesizedExpression(expression) ||
    ts.isSatisfiesExpression(expression)
  ) {
    return unwrapComponentExpression(expression.expression);
  }
  return expression;
}

function objectProperty(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.Expression | undefined {
  for (const property of object.properties) {
    if (
      ts.isPropertyAssignment(property) &&
      (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
      property.name.text === name
    ) {
      return property.initializer;
    }
  }
  return undefined;
}

/**
 * Strips the common indentation of lines 2+ from a multi-line node text.
 */
function dedent(text: string): string {
  const lines = text.split('\n');
  if (lines.length === 1) {
    return text;
  }
  const indents = lines
    .slice(1)
    .filter(line => line.trim() !== '')
    .map(line => line.match(/^\s*/)?.[0].length ?? 0);
  const minIndent = Math.min(...indents);
  return [lines[0], ...lines.slice(1).map(line => line.slice(minIndent))].join(
    '\n',
  );
}

function plainReturnExpression(block: ts.Block): ts.Expression | undefined {
  if (block.statements.length !== 1) {
    return undefined;
  }
  const [statement] = block.statements;
  return ts.isReturnStatement(statement) ? statement.expression : undefined;
}

/**
 * The snippet for a `render:` story: the JSX the render function returns
 * (unwrapping parens); if the body isn't a plain return, the whole function
 * source is shown.
 */
function renderSnippet(render: ts.Expression): string {
  if (ts.isArrowFunction(render)) {
    let body: ts.Node = render.body;
    if (ts.isBlock(body)) {
      const returned = plainReturnExpression(body);
      if (returned != null) {
        body = returned;
      } else {
        return dedent(render.getText());
      }
    }
    while (ts.isParenthesizedExpression(body)) {
      body = body.expression;
    }
    return dedent(body.getText());
  }
  return dedent(render.getText());
}

function snippetNode(render: ts.Expression): ts.Node {
  if (ts.isArrowFunction(render)) {
    let body: ts.Node = render.body;
    if (ts.isBlock(body)) {
      const returned = plainReturnExpression(body);
      if (returned != null) {
        body = returned;
      } else {
        return render;
      }
    }
    while (ts.isParenthesizedExpression(body)) {
      body = body.expression;
    }
    return body;
  }
  return render;
}

function jsxTagName(node: ts.Node): string | undefined {
  if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
    const {tagName} = node;
    if (ts.isIdentifier(tagName)) {
      return tagName.text;
    }
  }
  return undefined;
}

function referencedComponents(node: ts.Node): Set<string> {
  const names = new Set<string>();
  function visit(child: ts.Node): void {
    const name = jsxTagName(child);
    if (name != null) {
      names.add(name);
    }
    ts.forEachChild(child, visit);
  }
  visit(node);
  return names;
}

function localComponentDefinitions(
  source: ts.SourceFile,
): Map<string, ts.Node> {
  const definitions = new Map<string, ts.Node>();
  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name != null) {
      definitions.set(statement.name.text, statement);
      continue;
    }
    if (!ts.isVariableStatement(statement)) {
      continue;
    }
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.initializer != null &&
        (ts.isArrowFunction(declaration.initializer) ||
          ts.isFunctionExpression(declaration.initializer))
      ) {
        definitions.set(declaration.name.text, statement);
      }
    }
  }
  return definitions;
}

function importedLibraryHooks(source: ts.SourceFile): Set<string> {
  const hooks = new Set<string>();
  for (const statement of source.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !statement.moduleSpecifier.text.startsWith('components/')
    ) {
      continue;
    }
    const bindings = statement.importClause?.namedBindings;
    if (bindings == null || !ts.isNamedImports(bindings)) {
      continue;
    }
    for (const element of bindings.elements) {
      if (!element.isTypeOnly && /^use[A-Z]/.test(element.name.text)) {
        hooks.add(element.name.text);
      }
    }
  }
  return hooks;
}

function referencesLibraryApi(
  node: ts.Node,
  publicComponentNames: ReadonlySet<string>,
  libraryHooks: ReadonlySet<string>,
): boolean {
  let found = false;
  function visit(child: ts.Node): void {
    if (found) {
      return;
    }
    const tagName = jsxTagName(child);
    if (tagName != null && publicComponentNames.has(tagName)) {
      found = true;
      return;
    }
    if (
      ts.isCallExpression(child) &&
      ts.isIdentifier(child.expression) &&
      libraryHooks.has(child.expression.text)
    ) {
      found = true;
      return;
    }
    ts.forEachChild(child, visit);
  }
  visit(node);
  return found;
}

/**
 * Expands local story components referenced by a render. Keeping their
 * declarations preserves state and event handling, while the invocation
 * preserves story-specific props.
 */
function usefulRenderSnippet(
  render: ts.Expression,
  source: ts.SourceFile,
  publicComponentNames: ReadonlySet<string>,
): string | undefined {
  const rendered = snippetNode(render);
  const libraryHooks = importedLibraryHooks(source);
  const definitions = localComponentDefinitions(source);
  const expanded: ts.Node[] = [];
  const seen = new Set<string>();
  let hasLibraryApi = referencesLibraryApi(
    rendered,
    publicComponentNames,
    libraryHooks,
  );

  function expand(node: ts.Node): void {
    if (referencesLibraryApi(node, publicComponentNames, libraryHooks)) {
      hasLibraryApi = true;
    }
    for (const name of referencedComponents(node)) {
      const definition = definitions.get(name);
      if (definition == null || seen.has(name)) {
        continue;
      }
      seen.add(name);
      expanded.push(definition);
      expand(definition);
    }
  }

  expand(rendered);
  if (!hasLibraryApi) {
    return undefined;
  }
  if (expanded.length === 0) {
    return renderSnippet(render);
  }
  return `${expanded.map(node => dedent(node.getText())).join('\n\n')}\n\n${renderSnippet(render)}`;
}

function mergedArgs(
  metaArgs: ts.Expression | undefined,
  storyArgs: ts.Expression | undefined,
): Map<string, ts.Expression> {
  const merged = new Map<string, ts.Expression>();
  for (const source of [metaArgs, storyArgs]) {
    if (source != null && ts.isObjectLiteralExpression(source)) {
      for (const property of source.properties) {
        if (
          ts.isPropertyAssignment(property) &&
          (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
        ) {
          merged.set(property.name.text, property.initializer);
        }
      }
    }
  }
  return merged;
}

function displayNameOf(
  exportName: string,
  story: ts.ObjectLiteralExpression,
): string {
  const nameProperty = objectProperty(story, 'name');
  if (nameProperty != null && ts.isStringLiteralLike(nameProperty)) {
    return nameProperty.text;
  }
  return exportName.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

/**
 * Statically extracts the stories of one `<component>/<file>.stories.tsx`:
 * story export names plus a code snippet per story — the render function's
 * JSX for `render:` stories, synthesized JSX from merged meta + story args
 * otherwise.
 */
export function extractStoriesFile(
  componentName: string,
  file: string,
  publicComponentNames: ReadonlySet<string>,
): StoriesFileDoc {
  const path = join(
    repoRoot,
    'src/components',
    componentName,
    `${file}.stories.tsx`,
  );
  return extractStoriesSource(
    componentName,
    file,
    path,
    readFileSync(path, 'utf-8'),
    publicComponentNames,
  );
}

export function extractStoriesSource(
  componentName: string,
  file: string,
  path: string,
  sourceText: string,
  publicComponentNames: ReadonlySet<string>,
): StoriesFileDoc {
  const source = ts.createSourceFile(
    path,
    sourceText,
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TSX,
  );

  let componentIdentifier = componentName;
  let metaArgs: ts.Expression | undefined;
  const stories: StoryDoc[] = [];

  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }
    const isExported =
      statement.modifiers?.some(
        modifier => modifier.kind === ts.SyntaxKind.ExportKeyword,
      ) ?? false;

    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.initializer == null
      ) {
        continue;
      }
      const initializer = unwrapSatisfies(declaration.initializer);
      if (!ts.isObjectLiteralExpression(initializer)) {
        continue;
      }
      if (declaration.name.text === 'meta') {
        const component = objectProperty(initializer, 'component');
        if (component != null) {
          componentIdentifier = unwrapComponentExpression(component).getText();
        }
        metaArgs = objectProperty(initializer, 'args');
        continue;
      }
      // Stories are exactly the exported consts annotated `: Story`.
      if (
        !isExported ||
        declaration.type == null ||
        declaration.type.getText() !== 'Story'
      ) {
        continue;
      }
      const exportName = declaration.name.text;
      const render = objectProperty(initializer, 'render');
      const snippet =
        render == null
          ? publicComponentNames.has(componentIdentifier)
            ? synthesizeJsx(
                componentIdentifier,
                mergedArgs(metaArgs, objectProperty(initializer, 'args')),
              )
            : undefined
          : usefulRenderSnippet(render, source, publicComponentNames);
      if (snippet == null) {
        throw new Error(
          `docgen: ${componentName}/${file}#${exportName}: code snippet does not explicitly use a silver-ui component or hook`,
        );
      }
      stories.push({
        exportName,
        displayName: displayNameOf(exportName, initializer),
        snippet,
      });
    }
  }

  return {file, stories};
}
