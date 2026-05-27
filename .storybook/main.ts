import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import type {StorybookConfig} from '@storybook/react-vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {},
  viteFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'styled-system': resolve(__dirname, '../styled-system'),
    };
    return config;
  },
};

export default config;
