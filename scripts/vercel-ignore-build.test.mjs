import {readFile} from 'node:fs/promises';
import {expect, test} from 'vitest';

import {shouldBuild} from './vercel-ignore-build.mjs';

test('production deployments always build', () => {
  expect(
    shouldBuild({
      VERCEL_ENV: 'production',
      VERCEL_PROJECT_PRODUCTION_URL: 'silver-ui.com',
    }),
  ).toBe(true);
  expect(
    shouldBuild({
      VERCEL_ENV: 'production',
      VERCEL_PROJECT_PRODUCTION_URL: 'storybook.silver-ui.com',
    }),
  ).toBe(true);
});

test('docs site previews build', () => {
  expect(
    shouldBuild({
      VERCEL_ENV: 'preview',
      VERCEL_PROJECT_PRODUCTION_URL: 'silver-ui.com',
    }),
  ).toBe(true);
});

test('storybook previews are skipped', () => {
  expect(
    shouldBuild({
      VERCEL_ENV: 'preview',
      VERCEL_PROJECT_PRODUCTION_URL: 'storybook.silver-ui.com',
    }),
  ).toBe(false);
});

test('previews build when the project cannot be identified', () => {
  expect(shouldBuild({VERCEL_ENV: 'preview'})).toBe(true);
});

test('vercel.json delegates to the ignore script and re-enables git deployments', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));

  expect(config.ignoreCommand).toBe('node scripts/vercel-ignore-build.mjs');
  expect(config.git).toBeUndefined();
});

test('the release workflow no longer deploys docs explicitly', async () => {
  const workflow = await readFile('.github/workflows/publish.yml', 'utf8');

  expect(workflow).not.toMatch(/vercel/i);
});
