import {existsSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {
  findDeclarationFiles,
  isRelativeSpecifier,
  specifierPattern,
} from './rewrite-declaration-aliases.mjs';

/**
 * The `require` condition serves `dist/index.cjs`, but a `.d.ts` next to a
 * `"type": "module"` package.json is always ESM-flavored, so node16 CJS
 * consumers saw types masquerading as ESM. This emits a `.d.cts` sibling
 * for every `.d.ts`, with in-dist `./x.js` specifiers switched to
 * `./x.cjs` so they resolve to the `.d.cts` copies. Runs after
 * rewrite-declaration-aliases.mjs, which guarantees every in-dist relative
 * specifier is already fully specified.
 */

const sourceMappingPattern = /^\/\/# sourceMappingURL=.*$\n?/m;

export async function emitCjsDeclarations(distDir) {
  const declarationFiles = await findDeclarationFiles(distDir);

  for (const file of declarationFiles) {
    const source = await readFile(file, 'utf8');
    const rewritten = source
      .replace(specifierPattern, (match, prefix, specifier, suffix) => {
        if (!isRelativeSpecifier(specifier) || !specifier.endsWith('.js')) {
          return match;
        }
        return `${prefix}${specifier.slice(0, -'.js'.length)}.cjs${suffix}`;
      })
      // The copy has no matching .d.cts.map; drop the stale reference.
      .replace(sourceMappingPattern, '');

    await writeFile(toCjsDeclarationPath(file), rewritten);
  }

  await verifyCjsDeclarations(distDir);

  return declarationFiles.length;
}

function toCjsDeclarationPath(declarationFile) {
  return `${declarationFile.slice(0, -'.d.ts'.length)}.d.cts`;
}

async function verifyCjsDeclarations(distDir) {
  const problems = [];

  for (const file of await findDeclarationFiles(distDir, '.d.cts')) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(specifierPattern)) {
      const specifier = match[2];
      if (!isRelativeSpecifier(specifier)) {
        continue;
      }
      const base = resolve(dirname(file), specifier);
      if (!specifier.endsWith('.cjs')) {
        problems.push(
          `${file}: relative specifier "${specifier}" does not use the .cjs extension`,
        );
        continue;
      }
      if (!existsSync(`${base.slice(0, -'.cjs'.length)}.d.cts`)) {
        problems.push(
          `${file}: specifier "${specifier}" has no matching CJS declaration file`,
        );
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid CJS declaration specifiers in dist:\n${problems
        .map(problem => `  - ${problem}`)
        .join('\n')}`,
    );
  }
}

async function main() {
  const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
  const emitCount = await emitCjsDeclarations(join(rootDir, 'dist'));
  process.stdout.write(`Emitted ${emitCount} CJS declaration file(s).\n`);
}

// Run the dist transform only when invoked directly, not when imported by tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
