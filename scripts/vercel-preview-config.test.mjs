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

test('a successful release deploys the docs to Vercel production', async () => {
  const workflow = await readFile('.github/workflows/publish.yml', 'utf8');
  const deployJob = workflow.slice(workflow.indexOf('  deploy-docs:'));

  expect(workflow).toMatch(/^\s*release:\s*$/m);
  expect(deployJob).toMatch(/^ {2}deploy-docs:\s*$/m);
  expect(deployJob).toMatch(/^ {4}needs: publish\s*$/m);
  expect(deployJob).toMatch(
    /VERCEL_ORG_ID: \$\{\{ secrets\.VERCEL_ORG_ID \}\}/,
  );
  expect(deployJob).toMatch(
    /VERCEL_PROJECT_ID: \$\{\{ secrets\.VERCEL_PROJECT_ID \}\}/,
  );
  expect(deployJob).toMatch(
    /vercel@latest deploy --prod --yes --token="\$\{\{ secrets\.VERCEL_TOKEN \}\}"/,
  );
});
