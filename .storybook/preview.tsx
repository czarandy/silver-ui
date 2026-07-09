import type {ReactRenderer} from '@storybook/react-vite';
import type {DecoratorFunction, Preview} from 'storybook/internal/types';
import {css} from 'styled-system/css';
import '../src/index.css';

const canvasClassName = css({
  bg: 'bg',
  color: 'fg',
  padding: '6',
  minHeight: '100vh',
  transition: 'background-color 0.2s, color 0.2s',
});

const docsClassName = css({
  bg: 'bg',
  color: 'fg',
  padding: '6',
  transition: 'background-color 0.2s, color 0.2s',
});

const themeDecorator: DecoratorFunction<ReactRenderer> = (Story, context) => {
  const theme = context.globals.theme as string;
  const isDocs = context.viewMode === 'docs';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  return (
    <div className={isDocs ? docsClassName : canvasClassName}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
    options: {
      storySort: {
        order: ['Components', ['Theme']],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Color scheme for components',
      toolbar: {
        title: 'Theme',
        icon: 'moon',
        items: [
          {value: 'light', title: 'Light', icon: 'sun'},
          {value: 'dark', title: 'Dark', icon: 'moon'},
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [themeDecorator],
};

export default preview;
