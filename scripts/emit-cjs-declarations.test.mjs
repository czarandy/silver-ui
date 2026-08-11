import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {emitCjsDeclarations} from './emit-cjs-declarations.mjs';

let fixtureDir;
let distDir;

beforeEach(async () => {
  fixtureDir = await mkdtemp(join(tmpdir(), 'silver-ui-cjs-declarations-'));
  distDir = join(fixtureDir, 'dist');
});

afterEach(async () => {
  await rm(fixtureDir, {force: true, recursive: true});
});

async function writeDeclaration(relativePath, source) {
  const path = join(distDir, relativePath);
  await mkdir(dirname(path), {recursive: true});
  await writeFile(path, source);
  return path;
}

async function readDeclaration(relativePath) {
  return readFile(join(distDir, relativePath), 'utf8');
}

describe('emitCjsDeclarations', () => {
  it('emits a .d.cts sibling with .cjs specifiers for every .d.ts', async () => {
    await writeDeclaration('components/Button/index.d.ts', 'export {};\n');
    await writeDeclaration(
      'index.d.ts',
      "export { Button } from './components/Button/index.js';\n",
    );

    const emitted = await emitCjsDeclarations(distDir);

    expect(emitted).toBe(2);
    expect(await readDeclaration('index.d.cts')).toBe(
      "export { Button } from './components/Button/index.cjs';\n",
    );
    expect(await readDeclaration('components/Button/index.d.cts')).toBe(
      'export {};\n',
    );
  });

  it('rewrites dynamic type import specifiers', async () => {
    await writeDeclaration('utils/cx.d.ts', 'export {};\n');
    await writeDeclaration(
      'components/Button/Button.d.ts',
      "export declare const cx: typeof import('../../utils/cx.js').cx;\n",
    );

    await emitCjsDeclarations(distDir);

    expect(await readDeclaration('components/Button/Button.d.cts')).toBe(
      "export declare const cx: typeof import('../../utils/cx.cjs').cx;\n",
    );
  });

  it('leaves bare package specifiers untouched', async () => {
    const source = [
      "import { ReactNode } from 'react';",
      "import { css } from 'styled-system/css';",
      '',
    ].join('\n');
    await writeDeclaration('components/Button/Button.d.ts', source);

    await emitCjsDeclarations(distDir);

    expect(await readDeclaration('components/Button/Button.d.cts')).toBe(
      source,
    );
  });

  it('leaves relative specifiers that escape dist untouched', async () => {
    const source =
      "export declare const recipe: import('../../../styled-system/types.js').RecipeDefinition;\n";
    await writeDeclaration('components/Timeline/Timeline.recipe.d.ts', source);

    await emitCjsDeclarations(distDir);

    expect(
      await readDeclaration('components/Timeline/Timeline.recipe.d.cts'),
    ).toBe(source);
  });

  it('drops the declaration map reference from the copy', async () => {
    await writeDeclaration(
      'index.d.ts',
      'export {};\n//# sourceMappingURL=index.d.ts.map\n',
    );

    await emitCjsDeclarations(distDir);

    expect(await readDeclaration('index.d.cts')).toBe('export {};\n');
    // The ESM original keeps its map reference.
    expect(await readDeclaration('index.d.ts')).toContain('sourceMappingURL');
  });

  it('does not emit copies of .d.cts files themselves on a second run', async () => {
    await writeDeclaration('index.d.ts', 'export {};\n');

    await emitCjsDeclarations(distDir);
    await emitCjsDeclarations(distDir);

    expect(existsSync(join(distDir, 'index.d.cts'))).toBe(true);
    expect(existsSync(join(distDir, 'index.d.cts.d.cts'))).toBe(false);
  });

  it('throws when a specifier has no matching CJS declaration', async () => {
    // `./Missing.js` slips past the specifier rewrite (the .d.ts side is
    // validated by rewrite-declaration-aliases.mjs, not here), so the
    // post-emit verification must catch the dangling .cjs reference.
    await writeDeclaration(
      'index.d.ts',
      "export { Missing } from './Missing.js';\n",
    );

    await expect(emitCjsDeclarations(distDir)).rejects.toThrow(
      /has no matching CJS declaration file/,
    );
  });
});
