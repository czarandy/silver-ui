import {existsSync} from 'node:fs';
import {readdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, extname, join, relative, sep} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(rootDir, 'dist');

const aliases = [
  ['internal', join(distDir, 'internal', 'index')],
  ['components/', join(distDir, 'components')],
  ['hooks/', join(distDir, 'hooks')],
  ['internal/', join(distDir, 'internal')],
  ['themes/', join(distDir, 'themes')],
];

const declarationFiles = await findDeclarationFiles(distDir);
let rewriteCount = 0;

for (const file of declarationFiles) {
  const source = await readFile(file, 'utf8');
  const rewritten = source.replace(
    /\b(from\s*['"]|import\s*\(\s*['"])(components\/[^'"]+|hooks\/[^'"]+|internal\/[^'"]+|internal|themes\/[^'"]+)(['"]\s*\)?)/g,
    (match, prefix, specifier, suffix) => {
      const target = resolveAliasSpecifier(specifier);
      if (target == null) {
        throw new Error(
          `Could not resolve declaration alias "${specifier}" in ${toPosixPath(
            relative(rootDir, file),
          )}.`,
        );
      }

      rewriteCount += 1;
      return `${prefix}${toDeclarationRelativeSpecifier(file, target)}${suffix}`;
    },
  );

  if (rewritten !== source) {
    await writeFile(file, rewritten);
  }
}

const leakedAliases = [];

for (const file of declarationFiles) {
  const source = await readFile(file, 'utf8');
  if (/\b(?:from\s*['"]|import\s*\(\s*['"])(?:components|hooks|internal|themes)\//.test(source)) {
    leakedAliases.push(toPosixPath(relative(rootDir, file)));
  }
}

if (leakedAliases.length > 0) {
  throw new Error(
    `Declaration aliases leaked into dist:\n${leakedAliases
      .map(file => `  - ${file}`)
      .join('\n')}`,
  );
}

if (rewriteCount > 0) {
  process.stdout.write(`Rewrote ${rewriteCount} declaration alias import(s).\n`);
}

async function findDeclarationFiles(directory) {
  const files = [];
  const entries = await readdir(directory, {withFileTypes: true});

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findDeclarationFiles(path)));
      continue;
    }

    if (entry.isFile() && path.endsWith('.d.ts')) {
      files.push(path);
    }
  }

  return files;
}

function resolveAliasSpecifier(specifier) {
  for (const [alias, directory] of aliases) {
    if (alias.endsWith('/') ? !specifier.startsWith(alias) : specifier !== alias) {
      continue;
    }

    if (!alias.endsWith('/')) {
      return resolveDeclarationTarget(directory);
    }

    const relativeSpecifier = specifier.slice(alias.length);
    return resolveDeclarationTarget(join(directory, relativeSpecifier));
  }

  return null;
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
  let specifier = relative(dirname(fromFile), stripDeclarationExtension(targetFile));
  specifier = toPosixPath(specifier);

  if (!specifier.startsWith('.')) {
    specifier = `./${specifier}`;
  }

  return specifier;
}

function stripDeclarationExtension(file) {
  if (file.endsWith(`${sep}index.d.ts`)) {
    return dirname(file);
  }

  if (extname(file) === '.ts' && file.endsWith('.d.ts')) {
    return file.slice(0, -'.d.ts'.length);
  }

  return file;
}

function toPosixPath(path) {
  return path.split(sep).join('/');
}
