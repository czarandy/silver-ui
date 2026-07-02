// esbuild strips the top-level `'use client'` directive during code splitting,
// and tsup's tree-shaking (rollup) pass strips it again even if a plugin
// re-adds it in memory. This runs dead-last in the build, after everything
// else has written its output, so nothing can undo it.
//
// It reads the metafiles tsup emits (see tsup.config.ts), and for every output
// JS chunk whose bundled source inputs include a file that starts with a
// `'use client'` directive, it prepends the directive to that chunk on disk.
// The directive lands on the chunk that actually contains the client component
// code — barrel entry files that merely re-export it resolve the client
// boundary through that chunk, which is correct for React Server Components.

import {readFile, writeFile, rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const metafiles = ['dist/metafile-esm.json', 'dist/metafile-cjs.json'];

// Cache directive lookups so each source file is read at most once.
const sourceDirectiveCache = new Map();

async function sourceHasUseClient(source) {
  if (sourceDirectiveCache.has(source)) {
    return sourceDirectiveCache.get(source);
  }

  const absolutePath = join(rootDir, source);
  let hasDirective = false;
  // Only real source modules can carry the directive; skip generated helpers
  // (e.g. styled-system/*) and anything that no longer exists on disk.
  if (source.startsWith('src/') && existsSync(absolutePath)) {
    const contents = await readFile(absolutePath, 'utf8');
    hasDirective = startsWithUseClientDirective(contents);
  }

  sourceDirectiveCache.set(source, hasDirective);
  return hasDirective;
}

// True if the first *statement* is a `use client` directive. Skips a shebang and
// any leading comments/whitespace first, so a directive placed below a license
// header or `/* eslint-disable */` comment is still detected.
function startsWithUseClientDirective(contents) {
  let i = 0;
  const n = contents.length;

  if (contents.startsWith('#!')) {
    const newline = contents.indexOf('\n');
    i = newline === -1 ? n : newline + 1;
  }

  while (i < n) {
    const char = contents[i];
    if (char === ' ' || char === '\t' || char === '\r' || char === '\n') {
      i += 1;
    } else if (contents.startsWith('//', i)) {
      const newline = contents.indexOf('\n', i);
      i = newline === -1 ? n : newline + 1;
    } else if (contents.startsWith('/*', i)) {
      const end = contents.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
    } else {
      break;
    }
  }

  const rest = contents.slice(i);
  return rest.startsWith(`'use client'`) || rest.startsWith(`"use client"`);
}

let stampedCount = 0;

for (const metafile of metafiles) {
  const metafilePath = join(rootDir, metafile);
  if (!existsSync(metafilePath)) {
    throw new Error(
      `Expected tsup to emit ${metafile}. Is 'metafile: true' still set in ` +
        `tsup.config.ts?`,
    );
  }

  const {outputs} = JSON.parse(await readFile(metafilePath, 'utf8'));

  for (const [outputPath, meta] of Object.entries(outputs)) {
    if (!/\.(js|cjs)$/.test(outputPath)) {
      continue;
    }

    let needsDirective = false;
    for (const input of Object.keys(meta.inputs)) {
      if (await sourceHasUseClient(input)) {
        needsDirective = true;
        break;
      }
    }
    if (!needsDirective) {
      continue;
    }

    const chunkPath = join(rootDir, outputPath);
    const code = await readFile(chunkPath, 'utf8');
    const alreadyStamped =
      code.trimStart().startsWith(`'use client'`) ||
      code.trimStart().startsWith(`"use client"`);
    if (alreadyStamped) {
      continue;
    }

    await writeFile(chunkPath, `'use client';\n${code}`);
    stampedCount += 1;
  }

  // The metafile is a build artifact, not something we want to publish.
  await rm(metafilePath);
}

process.stdout.write(
  `preserve-use-client: added 'use client' to ${stampedCount} chunk(s).\n`,
);
