import {existsSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import type {ExportDoc, PropDoc, PropsGroup} from './types';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * Creates one TypeScript program over the library source using the repo's own
 * tsconfig (so path aliases and compiler options match the real build).
 */
export function createLibraryProgram(componentNames: string[]): ts.Program {
  const configPath = join(repoRoot, 'tsconfig.json');
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, undefined, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: reportDiagnostic,
  });
  if (parsed == null) {
    throw new Error(`docgen: failed to parse ${configPath}`);
  }
  const rootNames = componentNames.map(name =>
    join(repoRoot, 'src/components', name, 'index.ts'),
  );
  return ts.createProgram({rootNames, options: parsed.options});
}

function reportDiagnostic(diagnostic: ts.Diagnostic): void {
  throw new Error(
    `docgen: tsconfig error: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
  );
}

export function componentIndexPath(name: string): string {
  return join(repoRoot, 'src/components', name, 'index.ts');
}

export function hasComponentIndex(name: string): boolean {
  return existsSync(componentIndexPath(name));
}

function docText(symbol: ts.Symbol, checker: ts.TypeChecker): string {
  return ts
    .displayPartsToString(symbol.getDocumentationComment(checker))
    .replace(/\{@link\s+([^}]+?)\s*\}/g, '$1');
}

function resolveAlias(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;
}

/**
 * A prop is library-owned if some declaration of it lives inside the repo.
 */
function isDeclaredInRepo(symbol: ts.Symbol): boolean {
  const declarations = symbol.getDeclarations() ?? [];
  return declarations.some(declaration => {
    const file = declaration.getSourceFile().fileName;
    return !file.includes('node_modules');
  });
}

const TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

/**
 * Prints union members, re-merging the `true | false` pair the checker
 * expands boolean into back to `boolean`.
 */
function unionText(members: ts.Type[], checker: ts.TypeChecker): string {
  const parts: string[] = [];
  let sawBooleanLiteral = false;
  for (const member of members) {
    if ((member.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
      const text = checker.typeToString(member, undefined, TYPE_FORMAT_FLAGS);
      const pairPresent = members.some(
        other =>
          other !== member &&
          (other.flags & ts.TypeFlags.BooleanLiteral) !== 0 &&
          checker.typeToString(other, undefined, TYPE_FORMAT_FLAGS) !== text,
      );
      if (pairPresent) {
        if (!sawBooleanLiteral) {
          parts.push('boolean');
          sawBooleanLiteral = true;
        }
        continue;
      }
    }
    parts.push(checker.typeToString(member, undefined, TYPE_FORMAT_FLAGS));
  }
  return parts.join(' | ');
}

/**
 * Prints a prop's type, dropping the `undefined` member optionality adds.
 */
function propTypeText(
  type: ts.Type,
  optional: boolean,
  checker: ts.TypeChecker,
): string {
  if (type.isUnion()) {
    const members = optional
      ? type.types.filter(
          member => (member.flags & ts.TypeFlags.Undefined) === 0,
        )
      : type.types;
    if (members.length > 0) {
      return unionText(members, checker);
    }
  }
  return checker.typeToString(type, undefined, TYPE_FORMAT_FLAGS);
}

/**
 * The type text the author wrote in the property's declaration (e.g.
 * `IconComponent`, `ReactNode`), which reads far better in a docs table than
 * the checker's expanded structural type. Multi-line annotations are
 * collapsed to one line.
 */
function declaredTypeText(symbol: ts.Symbol): string | undefined {
  for (const declaration of symbol.getDeclarations() ?? []) {
    if (
      (ts.isPropertySignature(declaration) ||
        ts.isPropertyDeclaration(declaration)) &&
      declaration.type != null
    ) {
      return declaration.type.getText().replace(/\s+/g, ' ');
    }
  }
  return undefined;
}

function extractProp(
  symbol: ts.Symbol,
  location: ts.Node,
  checker: ts.TypeChecker,
): PropDoc {
  const optional = (symbol.flags & ts.SymbolFlags.Optional) !== 0;
  const type = checker.getTypeOfSymbolAtLocation(symbol, location);
  const defaultTag = symbol
    .getJsDocTags(checker)
    .find(tag => tag.name === 'default');
  const defaultValue = defaultTag
    ? ts.displayPartsToString(defaultTag.text).trim()
    : undefined;
  const declared = declaredTypeText(symbol);
  const expanded = propTypeText(type, optional, checker);
  // Prefer the author's annotation (IconComponent, ReactNode) over the
  // checker's expansion — except for named aliases of plain literal unions
  // (ButtonSize), where the possible values are the useful information.
  const literalUnion =
    /^("[^"]*"|\d+(\.\d+)?|true|false|boolean)(\s\|\s("[^"]*"|\d+(\.\d+)?|true|false|boolean))*$/;
  const preferExpanded =
    declared == null ||
    (/^[A-Za-z_$][\w$]*$/.test(declared) && literalUnion.test(expanded));
  return {
    name: symbol.getName(),
    type: preferExpanded ? expanded : declared,
    required: !optional,
    description: docText(symbol, checker),
    ...(defaultValue != null && defaultValue !== '' ? {defaultValue} : {}),
  };
}

function extractGroup(
  type: ts.Type,
  location: ts.Node,
  checker: ts.TypeChecker,
): PropDoc[] {
  return checker
    .getPropertiesOfType(type)
    .filter(isDeclaredInRepo)
    .map(symbol => extractProp(symbol, location, checker));
}

/**
 * Labels a union branch by its discriminant props: props typed as a literal
 * in this branch that also exist on the other branches.
 */
function branchLabel(
  branch: ts.Type,
  allBranches: ts.Type[],
  index: number,
  location: ts.Node,
  checker: ts.TypeChecker,
): string {
  const discriminants: string[] = [];
  for (const symbol of checker.getPropertiesOfType(branch)) {
    const name = symbol.getName();
    const appearsElsewhere = allBranches.some(
      other =>
        other !== branch &&
        checker.getPropertiesOfType(other).some(p => p.getName() === name),
    );
    if (!appearsElsewhere) {
      continue;
    }
    const type = checker.getTypeOfSymbolAtLocation(symbol, location);
    const nonUndefined =
      type.isUnion() &&
      type.types.filter(t => (t.flags & ts.TypeFlags.Undefined) === 0);
    const effective =
      nonUndefined !== false && nonUndefined.length === 1
        ? nonUndefined[0]
        : type;
    if (
      effective.isLiteral() ||
      (effective.flags & ts.TypeFlags.BooleanLiteral) !== 0
    ) {
      discriminants.push(
        `${name}: ${checker.typeToString(effective, undefined, TYPE_FORMAT_FLAGS)}`,
      );
    }
  }
  return discriminants.length > 0
    ? discriminants.join(', ')
    : `Variant ${index + 1}`;
}

/**
 * Extracts documented exports from one component directory's barrel: every
 * exported component `X` that has a paired `XProps` type export. The
 * directory-named export comes first, the rest keep barrel order.
 */
export function extractComponentExports(
  program: ts.Program,
  componentName: string,
): ExportDoc[] {
  const checker = program.getTypeChecker();
  const indexFile = program.getSourceFile(componentIndexPath(componentName));
  if (indexFile == null) {
    throw new Error(
      `docgen: ${componentName}: index.ts is not part of the program`,
    );
  }
  const moduleSymbol = checker.getSymbolAtLocation(indexFile);
  if (moduleSymbol == null) {
    throw new Error(`docgen: ${componentName}: index.ts has no module symbol`);
  }
  const exports = checker.getExportsOfModule(moduleSymbol);
  const byName = new Map(exports.map(symbol => [symbol.getName(), symbol]));

  const docs: ExportDoc[] = [];
  for (const exportSymbol of exports) {
    const name = exportSymbol.getName();
    const propsSymbol = byName.get(`${name}Props`);
    if (propsSymbol == null || !/^[A-Z]/.test(name)) {
      continue;
    }
    const componentSymbol = resolveAlias(exportSymbol, checker);
    // Only document value exports (components), not types that happen to
    // have a Props-suffixed sibling.
    if ((componentSymbol.flags & ts.SymbolFlags.Value) === 0) {
      continue;
    }

    const resolvedProps = resolveAlias(propsSymbol, checker);
    const propsType = checker.getDeclaredTypeOfSymbol(resolvedProps);
    const location = indexFile;

    let groups: PropsGroup[];
    if (propsType.isUnion()) {
      groups = propsType.types.map((branch, index) => ({
        label: branchLabel(branch, propsType.types, index, location, checker),
        props: extractGroup(branch, location, checker),
      }));
    } else {
      groups = [{props: extractGroup(propsType, location, checker)}];
    }

    const description =
      docText(componentSymbol, checker) || docText(resolvedProps, checker);
    docs.push({name, description, groups});
  }

  docs.sort((a, b) => {
    if (a.name === componentName) {
      return -1;
    }
    if (b.name === componentName) {
      return 1;
    }
    return 0;
  });
  return docs;
}
