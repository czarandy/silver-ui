import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {version} from 'utils/version';

describe('version', () => {
  it('matches package.json (regenerate with scripts/generate-version.mjs)', () => {
    // Vitest runs with the repository root as its working directory.
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      version: string;
    };

    expect(version).toBe(packageJson.version);
  });
});
