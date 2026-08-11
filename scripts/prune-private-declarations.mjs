import {rm} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {findDeclarationFiles} from './rewrite-declaration-aliases.mjs';

/**
 * Panda recipe modules (and Field's inputStyles) are imported by components
 * only for their runtime className values, so their imports are elided from
 * every public declaration — but tsc still emits .d.ts files for them, and
 * those reference the unpublished styled-system directory. This deletes the
 * private declarations (plus their maps) right after the tsc pass, before
 * specifier rewriting. If a public declaration ever starts referencing a
 * pruned module, rewrite-declaration-aliases.mjs fails the build on the
 * dangling specifier.
 */

const privateDeclarationPattern = /(\.recipe\.d\.ts|[/\\]inputStyles\.d\.ts)$/;

export async function prunePrivateDeclarations(distDir) {
  const pruned = [];

  for (const file of await findDeclarationFiles(distDir)) {
    if (!privateDeclarationPattern.test(file)) {
      continue;
    }

    await rm(file);
    await rm(`${file}.map`, {force: true});
    pruned.push(file);
  }

  return pruned;
}

async function main() {
  const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
  const pruned = await prunePrivateDeclarations(join(rootDir, 'dist'));
  process.stdout.write(
    `Pruned ${pruned.length} private declaration file(s).\n`,
  );
}

// Run the dist transform only when invoked directly, not when imported by tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
