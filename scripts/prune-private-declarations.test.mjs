import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {prunePrivateDeclarations} from './prune-private-declarations.mjs';

let fixtureDir;
let distDir;

beforeEach(async () => {
  fixtureDir = await mkdtemp(join(tmpdir(), 'silver-ui-prune-declarations-'));
  distDir = join(fixtureDir, 'dist');
});

afterEach(async () => {
  await rm(fixtureDir, {force: true, recursive: true});
});

async function writeDeclaration(relativePath, source = 'export {};\n') {
  const path = join(distDir, relativePath);
  await mkdir(dirname(path), {recursive: true});
  await writeFile(path, source);
  return path;
}

describe('prunePrivateDeclarations', () => {
  it('removes recipe and inputStyles declarations with their maps', async () => {
    await writeDeclaration('components/Button/Button.recipe.d.ts');
    await writeDeclaration('components/Button/Button.recipe.d.ts.map');
    await writeDeclaration('components/Field/inputStyles.d.ts');
    await writeDeclaration('components/Button/Button.d.ts');
    await writeDeclaration('index.d.ts');

    const pruned = await prunePrivateDeclarations(distDir);

    expect(pruned).toHaveLength(2);
    expect(
      existsSync(join(distDir, 'components/Button/Button.recipe.d.ts')),
    ).toBe(false);
    expect(
      existsSync(join(distDir, 'components/Button/Button.recipe.d.ts.map')),
    ).toBe(false);
    expect(existsSync(join(distDir, 'components/Field/inputStyles.d.ts'))).toBe(
      false,
    );
    expect(existsSync(join(distDir, 'components/Button/Button.d.ts'))).toBe(
      true,
    );
    expect(existsSync(join(distDir, 'index.d.ts'))).toBe(true);
  });

  it('does not remove component files whose names merely contain "recipe"', async () => {
    await writeDeclaration('components/RecipeCard/RecipeCard.d.ts');
    await writeDeclaration('components/RecipeCard/index.d.ts');

    const pruned = await prunePrivateDeclarations(distDir);

    expect(pruned).toHaveLength(0);
    expect(
      existsSync(join(distDir, 'components/RecipeCard/RecipeCard.d.ts')),
    ).toBe(true);
  });
});
