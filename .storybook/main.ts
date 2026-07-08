import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import type {StorybookConfig} from '@storybook/react-vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-themes', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {defaultName: 'Docs'},
  viteFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      components: resolve(__dirname, '../src/components'),
      internal: resolve(__dirname, '../src/internal'),
      'styled-system': resolve(__dirname, '../styled-system'),
      themes: resolve(__dirname, '../src/themes'),
      utils: resolve(__dirname, '../src/utils'),
    };
    config.build = {
      ...config.build,
      chunkSizeWarningLimit: 1000,
    };
    return config;
  },
};

export default config;
