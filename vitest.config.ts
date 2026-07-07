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
      'styled-system': resolve(__dirname, 'styled-system'),
      themes: resolve(__dirname, 'src/themes'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'eslint/**/*.test.{js,ts}'],
    css: true,
    testTimeout: 20000,
  },
});
