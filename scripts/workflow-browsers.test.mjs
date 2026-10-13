import {readFile} from 'node:fs/promises';
import {expect, test} from 'vitest';

import vitestConfig from '../vitest.config.ts';

test.each(['ci', 'publish'])(
  '%s installs every Vitest browser before running tests',
  async workflowName => {
    const workflow = await readFile(
      `.github/workflows/${workflowName}.yml`,
      'utf8',
    );
    const install = workflow.match(
      /^\s+- run: pnpm exec playwright install (.+)$/m,
    );

    expect(install).not.toBeNull();
    const args = install[1].trim().split(/\s+/);
    expect(args).toContain('--with-deps');

    for (const project of vitestConfig.test.projects) {
      for (const instance of project.test.browser?.instances ?? []) {
        const browser = instance.browser;
        const installed =
          args.includes(browser) ||
          (browser === 'chromium' && args.includes('chromium-headless-shell'));

        expect(installed, `${workflowName} must install ${browser}`).toBe(true);
      }
    }

    expect(workflow.indexOf(install[0])).toBeLessThan(
      workflow.indexOf('- run: pnpm test'),
    );
  },
);
