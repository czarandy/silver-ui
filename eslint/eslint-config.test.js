import {describe, expect, it} from 'vitest';
import eslintConfig from '../eslint.config.js';

describe('ESLint config', () => {
  it('requires useMergeRefs in source components and hooks', () => {
    expect(
      eslintConfig.some(
        config =>
          config.files?.includes('src/**/*.{ts,tsx}') &&
          config.rules?.['silver-ui/no-raw-merge-refs'] === 'error',
      ),
    ).toBe(true);
    expect(
      eslintConfig.some(
        config =>
          config.files?.includes('src/hooks/useMergeRefs.ts') &&
          config.rules?.['silver-ui/no-raw-merge-refs'] === 'off',
      ),
    ).toBe(true);
  });

  it('ignores repository-local worktrees', () => {
    const ignoredPaths = eslintConfig.flatMap(config => config.ignores ?? []);

    expect(ignoredPaths).toContain('.worktrees/');
  });
});
