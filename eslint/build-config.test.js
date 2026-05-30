import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {getComponentEntries} from '../build/componentEntries.mjs';

const repoRoot = process.cwd();

describe('build config', () => {
  it('discovers an entry point for every component barrel', () => {
    const entries = getComponentEntries(repoRoot);

    for (const [entryName, sourcePath] of Object.entries(entries)) {
      expect(entryName).toMatch(/^components\/[^/]+\/index$/);
      expect(existsSync(join(repoRoot, sourcePath))).toBe(true);
    }

    expect(entries).toHaveProperty(
      'components/Button/index',
      'src/components/Button/index.ts',
    );
    expect(entries).toHaveProperty(
      'components/SideNav/index',
      'src/components/SideNav/index.ts',
    );
  });

  it('exports component subpaths from the package', () => {
    const packageJson = JSON.parse(
      readFileSync(join(repoRoot, 'package.json'), 'utf8'),
    );

    expect(packageJson.exports).toHaveProperty('./*');
    expect(packageJson.exports).toHaveProperty('./styles.css');
    expect(packageJson.exports['./*']).toMatchObject({
      import: {
        types: './dist/components/*/index.d.ts',
        default: './dist/components/*/index.js',
      },
      require: {
        types: './dist/components/*/index.d.ts',
        default: './dist/components/*/index.cjs',
      },
    });
  });
});
