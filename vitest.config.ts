import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      components: resolve(__dirname, 'src/components'),
      hooks: resolve(__dirname, 'src/hooks'),
      internal: resolve(__dirname, 'src/internal'),
      // Resolve the published package specifier to library source so the site
      // tests run without a prior library build (CI does not build dist).
      'silver-ui': resolve(__dirname, 'src/index.ts'),
      'styled-system': resolve(__dirname, 'styled-system'),
      themes: resolve(__dirname, 'src/themes'),
      utils: resolve(__dirname, 'src/utils'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      'site/src/**/*.test.{ts,tsx}',
      'site/scripts/**/*.test.ts',
      'eslint/**/*.test.{js,ts}',
      'scripts/**/*.test.{js,mjs,ts}',
    ],
    css: true,
    testTimeout: 20000,
  },
});
