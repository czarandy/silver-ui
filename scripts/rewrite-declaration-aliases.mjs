import {existsSync} from 'node:fs';
import {readdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, relative, resolve, sep} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

/**
 * tsc emits declarations with the source's bare path aliases intact
 * (`from 'components/Button'`) and, once rewritten, relative specifiers.
 * Node16/nodenext consumers require every relative specifier in an ESM
 * declaration file to be fully specified (`./Button/index.js`, `./x.js` —
 * TypeScript maps the `.js` back to the sibling `.d.ts`; no runtime file
 * needs to exist), so this rewrites both aliases and any relative
 * specifiers to that form, then re-scans and fails the build if anything
 * extensionless survives.
 */

export const specifierPattern =
  /\b(from\s*['"]|import\s*\(\s*['"])([^'"]+)(['"]\s*\)?)/g;

export async function rewriteDeclarationSpecifiers(distDir) {
  const aliases = [
    ['internal', join(distDir, 'internal', 'index')],
    ['components/', join(distDir, 'components')],
    ['hooks/', join(distDir, 'hooks')],
    ['internal/', join(distDir, 'internal')],
    ['themes/', join(distDir, 'themes')],
    ['utils/', join(distDir, 'utils')],
  ];

  const declarationFiles = await findDeclarationFiles(distDir);
  let rewriteCount = 0;

  for (const file of declarationFiles) {
    const source = await readFile(file, 'utf8');
    const rewritten = source.replace(
      specifierPattern,
      (match, prefix, specifier, suffix) => {
        const target = resolveSpecifier(specifier, file, distDir, aliases);
        if (target == null) {
          return match;
        }

        const relativeSpecifier = toDeclarationRelativeSpecifier(file, target);
        if (relativeSpecifier === specifier) {
          return match;
        }

        rewriteCount += 1;
        return `${prefix}${relativeSpecifier}${suffix}`;
      },
    );

    if (rewritten !== source) {
      await writeFile(file, rewritten);
    }
  }

  await verifyDeclarationSpecifiers(distDir, declarationFiles);

  return rewriteCount;
}

/**
 * Resolve a specifier to the `.d.ts` file it refers to, or null when it
 * should be left untouched (bare package imports, and relative specifiers
 * that escape dist — the unpublished styled-system references, tracked
 * separately). Throws for alias or in-dist relative specifiers that
 * resolve to nothing, so a bad emit fails the build instead of shipping.
 */
function resolveSpecifier(specifier, file, distDir, aliases) {
  if (isRelativeSpecifier(specifier)) {
    const base = resolve(dirname(file), specifier);
    if (!isInside(distDir, base)) {
      return null;
    }

    const withoutJs = specifier.endsWith('.js')
      ? base.slice(0, -'.js'.length)
      : base;
    const target = resolveDeclarationTarget(withoutJs);
    if (target == null) {
      throw new Error(
        `Could not resolve relative declaration specifier "${specifier}" in ${file}.`,
      );
    }
    return target;
  }

  const aliasTarget = resolveAliasSpecifier(specifier, aliases);
  if (aliasTarget === undefined) {
    return null;
  }
  if (aliasTarget == null) {
    throw new Error(
      `Could not resolve declaration alias "${specifier}" in ${file}.`,
    );
  }
  return aliasTarget;
}

async function verifyDeclarationSpecifiers(distDir, declarationFiles) {
  const problems = [];

  for (const file of declarationFiles) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(specifierPattern)) {
      const specifier = match[2];
      if (isRelativeSpecifier(specifier)) {
        const base = resolve(dirname(file), specifier);
        if (!isInside(distDir, base)) {
          continue;
        }
        if (!specifier.endsWith('.js')) {
          problems.push(
            `${file}: relative specifier "${specifier}" is not fully specified`,
          );
          continue;
        }
        if (!existsSync(`${base.slice(0, -'.js'.length)}.d.ts`)) {
          problems.push(
            `${file}: specifier "${specifier}" has no matching declaration file`,
          );
        }
        continue;
      }

      if (
        /^(?:components|hooks|internal|themes|utils)(?:\/|$)/.test(specifier)
      ) {
        problems.push(`${file}: declaration alias "${specifier}" leaked`);
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid declaration specifiers in dist:\n${problems
        .map(problem => `  - ${problem}`)
        .join('\n')}`,
    );
  }
}

export async function findDeclarationFiles(directory, extension = '.d.ts') {
  const files = [];
  const entries = await readdir(directory, {withFileTypes: true});

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findDeclarationFiles(path, extension)));
      continue;
    }

    if (entry.isFile() && path.endsWith(extension)) {
      files.push(path);
    }
  }

  return files;
}

export function isRelativeSpecifier(specifier) {
  return specifier.startsWith('./') || specifier.startsWith('../');
}

export function isInside(directory, path) {
  return path === directory || path.startsWith(`${directory}${sep}`);
}

/**
 * Returns the target `.d.ts` for an alias specifier, null when the alias
 * matches but resolves to nothing, or undefined for non-alias specifiers.
 */
function resolveAliasSpecifier(specifier, aliases) {
  for (const [alias, directory] of aliases) {
    if (
      alias.endsWith('/') ? !specifier.startsWith(alias) : specifier !== alias
    ) {
      continue;
    }

    if (!alias.endsWith('/')) {
      return resolveDeclarationTarget(directory);
    }

    const relativeSpecifier = specifier.slice(alias.length);
    return resolveDeclarationTarget(join(directory, relativeSpecifier));
  }

  return undefined;
}

function resolveDeclarationTarget(pathWithoutExtension) {
  if (existsSync(`${pathWithoutExtension}.d.ts`)) {
    return `${pathWithoutExtension}.d.ts`;
  }

  const indexFile = join(pathWithoutExtension, 'index.d.ts');
  if (existsSync(indexFile)) {
    return indexFile;
  }

  return null;
}

function toDeclarationRelativeSpecifier(fromFile, targetFile) {
  const targetWithJsExtension = `${targetFile.slice(0, -'.d.ts'.length)}.js`;
  let specifier = relative(dirname(fromFile), targetWithJsExtension);
  specifier = toPosixPath(specifier);

  if (!specifier.startsWith('.')) {
    specifier = `./${specifier}`;
  }

  return specifier;
}

function toPosixPath(path) {
  return path.split(sep).join('/');
}

async function main() {
  const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
  const rewriteCount = await rewriteDeclarationSpecifiers(
    join(rootDir, 'dist'),
  );

  if (rewriteCount > 0) {
    process.stdout.write(`Rewrote ${rewriteCount} declaration specifier(s).\n`);
  }
}

// Run the dist transform only when invoked directly, not when imported by tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
