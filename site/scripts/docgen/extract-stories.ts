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

/**
 * The snippet for a `render:` story: the JSX the render function returns
 * (unwrapping parens); if the body isn't a plain return, the whole function
 * source is shown.
 */
function renderSnippet(render: ts.Expression): string {
  if (ts.isArrowFunction(render)) {
    let body: ts.Node = render.body;
    if (ts.isBlock(body)) {
      const returns = body.statements.find(ts.isReturnStatement);
      if (returns?.expression != null) {
        body = returns.expression;
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
): StoriesFileDoc {
  const path = join(
    repoRoot,
    'src/components',
    componentName,
    `${file}.stories.tsx`,
  );
  const source = ts.createSourceFile(
    path,
    readFileSync(path, 'utf-8'),
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
          componentIdentifier = component.getText();
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
        render != null
          ? renderSnippet(render)
          : synthesizeJsx(
              componentIdentifier,
              mergedArgs(metaArgs, objectProperty(initializer, 'args')),
            );
      stories.push({
        exportName,
        displayName: displayNameOf(exportName, initializer),
        snippet,
      });
    }
  }

  return {file, stories};
}
