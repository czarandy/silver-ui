import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {rewriteDeclarationSpecifiers} from './rewrite-declaration-aliases.mjs';

let fixtureDir;
let distDir;

beforeEach(async () => {
  fixtureDir = await mkdtemp(join(tmpdir(), 'silver-ui-declaration-rewrite-'));
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

describe('rewriteDeclarationSpecifiers', () => {
  it('rewrites a barrel alias to a fully specified index.js specifier', async () => {
    await writeDeclaration('components/Button/index.d.ts', 'export {};\n');
    await writeDeclaration(
      'index.d.ts',
      "export { Button } from 'components/Button';\n",
    );

    await rewriteDeclarationSpecifiers(distDir);

    expect(await readDeclaration('index.d.ts')).toBe(
      "export { Button } from './components/Button/index.js';\n",
    );
  });

  it('rewrites a file alias to a .js specifier', async () => {
    await writeDeclaration(
      'components/Button/Button.types.d.ts',
      'export {};\n',
    );
    await writeDeclaration(
      'components/Button/Button.d.ts',
      "import type { ButtonSize } from 'components/Button/Button.types';\n",
    );

    await rewriteDeclarationSpecifiers(distDir);

    expect(await readDeclaration('components/Button/Button.d.ts')).toBe(
      "import type { ButtonSize } from './Button.types.js';\n",
    );
  });

  it('rewrites the bare internal alias to the internal barrel', async () => {
    await writeDeclaration('internal/index.d.ts', 'export {};\n');
    await writeDeclaration(
      'components/Field/Field.d.ts',
      "import { StatusMessage } from 'internal';\n",
    );

    await rewriteDeclarationSpecifiers(distDir);

    expect(await readDeclaration('components/Field/Field.d.ts')).toBe(
      "import { StatusMessage } from '../../internal/index.js';\n",
    );
  });

  it('appends .js to extensionless relative specifiers', async () => {
    await writeDeclaration(
      'components/Accordion/Accordion.d.ts',
      'export {};\n',
    );
    await writeDeclaration('components/Icon/index.d.ts', 'export {};\n');
    await writeDeclaration(
      'components/Accordion/index.d.ts',
      [
        "export { Accordion } from './Accordion';",
        "import { Icon } from '../Icon';",
        '',
      ].join('\n'),
    );

    await rewriteDeclarationSpecifiers(distDir);

    expect(await readDeclaration('components/Accordion/index.d.ts')).toBe(
      [
        "export { Accordion } from './Accordion.js';",
        "import { Icon } from '../Icon/index.js';",
        '',
      ].join('\n'),
    );
  });

  it('rewrites dynamic type import specifiers', async () => {
    await writeDeclaration('utils/cx.d.ts', 'export {};\n');
    await writeDeclaration(
      'components/Button/Button.d.ts',
      "export declare const cx: typeof import('../../utils/cx').cx;\n",
    );

    await rewriteDeclarationSpecifiers(distDir);

    expect(await readDeclaration('components/Button/Button.d.ts')).toBe(
      "export declare const cx: typeof import('../../utils/cx.js').cx;\n",
    );
  });

  it('leaves bare package specifiers untouched', async () => {
    const source = [
      "import { ReactNode } from 'react';",
      "import { Temporal } from '@js-temporal/polyfill';",
      '',
    ].join('\n');
    await writeDeclaration('components/Button/Button.d.ts', source);

    await rewriteDeclarationSpecifiers(distDir);

    expect(await readDeclaration('components/Button/Button.d.ts')).toBe(source);
  });

  it('throws for a relative specifier that escapes dist', async () => {
    // prune-private-declarations.mjs removes the recipe declarations that
    // used to carry these; anything left pointing outside dist is broken
    // for consumers and must fail the build.
    await writeDeclaration(
      'components/Timeline/Timeline.d.ts',
      "export declare const recipe: import('../../../styled-system/types').RecipeDefinition;\n",
    );

    await expect(rewriteDeclarationSpecifiers(distDir)).rejects.toThrow(
      /Could not resolve relative declaration specifier "\.\.\/\.\.\/\.\.\/styled-system\/types"/,
    );
  });

  it('fails verification when a bare styled-system specifier leaks', async () => {
    await writeDeclaration(
      'components/Button/Button.d.ts',
      "import { RecipeVariantProps } from 'styled-system/css';\nexport declare const x: RecipeVariantProps;\n",
    );

    await expect(rewriteDeclarationSpecifiers(distDir)).rejects.toThrow(
      /declaration alias "styled-system\/css" leaked/,
    );
  });

  it('is idempotent', async () => {
    await writeDeclaration('components/Button/index.d.ts', 'export {};\n');
    await writeDeclaration(
      'index.d.ts',
      "export { Button } from 'components/Button';\n",
    );

    const firstRun = await rewriteDeclarationSpecifiers(distDir);
    const afterFirst = await readDeclaration('index.d.ts');
    const secondRun = await rewriteDeclarationSpecifiers(distDir);

    expect(firstRun).toBe(1);
    expect(secondRun).toBe(0);
    expect(await readDeclaration('index.d.ts')).toBe(afterFirst);
  });

  it('throws for an alias that resolves to nothing', async () => {
    await writeDeclaration(
      'index.d.ts',
      "export { Missing } from 'components/Missing';\n",
    );

    await expect(rewriteDeclarationSpecifiers(distDir)).rejects.toThrow(
      /Could not resolve declaration alias "components\/Missing"/,
    );
  });

  it('throws for an in-dist relative specifier that resolves to nothing', async () => {
    await writeDeclaration(
      'components/Button/index.d.ts',
      "export { Button } from './Missing';\n",
    );

    await expect(rewriteDeclarationSpecifiers(distDir)).rejects.toThrow(
      /Could not resolve relative declaration specifier "\.\/Missing"/,
    );
  });

  it('throws for a .js specifier with no matching declaration', async () => {
    await writeDeclaration(
      'components/Button/index.d.ts',
      "export { Button } from './Button.js';\n",
    );

    await expect(rewriteDeclarationSpecifiers(distDir)).rejects.toThrow(
      /Could not resolve relative declaration specifier "\.\/Button\.js"/,
    );
  });
});
