import {readFile} from 'node:fs/promises';
import {expect, test} from 'vitest';

test('automatic Vercel deployments are disabled', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));

  expect(config.git.deploymentEnabled).toBe(false);
});

test('Vercel previews require a trusted #vercel pull request comment', async () => {
  const workflow = await readFile(
    '.github/workflows/vercel-preview.yml',
    'utf8',
  );

  expect(workflow).toMatch(/^\s*issue_comment:\s*$/m);
  expect(workflow).toMatch(
    /contains\(github\.event\.comment\.body, '#vercel'\)/,
  );
  expect(workflow).toMatch(/github\.event\.comment\.author_association/);
  expect(workflow).toMatch(/github\.event\.issue\.pull_request/);
  expect(workflow).toMatch(/ref: \$\{\{ steps\.pr\.outputs\.sha \}\}/);
  expect(workflow).toMatch(/vercel@latest deploy --yes/);
  expect(workflow).not.toMatch(/pnpm install|vercel build/);
});
