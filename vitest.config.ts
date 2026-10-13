import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      components: resolve(__dirname, 'src/components'),
      hooks: resolve(__dirname, 'src/hooks'),
      internal: resolve(__dirname, 'src/internal'),
      relay: resolve(__dirname, 'src/relay'),
      // Resolve the published package specifier to library source so the site
      // tests run without a prior library build (CI does not build dist).
      'silver-ui': resolve(__dirname, 'src/index.ts'),
      'styled-system': resolve(__dirname, 'styled-system'),
      themes: resolve(__dirname, 'src/themes'),
      utils: resolve(__dirname, 'src/utils'),
    },
  },
  test: {
    testTimeout: 20000,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
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
          exclude: ['**/node_modules/**', 'src/**/*.browser.test.{ts,tsx}'],
          css: true,
        },
      },
      {
        // Layout-dependent behavior that jsdom cannot compute runs in real
        // Chromium, with checkbox hit-area regressions also covered in WebKit.
        extends: true,
        // Pre-bundle up front: dependencies discovered mid-run make Vite
        // reload the page, which can load a second copy of React.
        optimizeDeps: {
          include: [
            '@js-temporal/polyfill',
            '@storybook/react',
            '@testing-library/react',
            'lucide-react',
            'react',
            'react-dom',
            'react-dom/client',
            'react/jsx-dev-runtime',
            'react/jsx-runtime',
          ],
        },
        test: {
          name: 'browser',
          globals: true,
          include: ['src/**/*.browser.test.{ts,tsx}'],
          setupFiles: ['./vitest.browser-setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              {browser: 'chromium'},
              {
                browser: 'webkit',
                name: 'browser-webkit',
                include: [
                  'src/components/CheckboxInput/CheckboxInput.browser.test.tsx',
                ],
              },
            ],
            viewport: {width: 1280, height: 720},
            screenshotFailures: false,
          },
        },
      },
    ],
  },
});
