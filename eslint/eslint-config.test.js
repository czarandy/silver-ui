import {describe, expect, it} from 'vitest';
import eslintConfig from '../eslint.config.js';

describe('ESLint config', () => {
  it('ignores repository-local worktrees', () => {
    const ignoredPaths = eslintConfig.flatMap(config => config.ignores ?? []);

    expect(ignoredPaths).toContain('.worktrees/');
  });
});
