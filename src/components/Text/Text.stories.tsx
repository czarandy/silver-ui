import type {Meta, StoryObj} from '@storybook/react-vite';
import {Text} from './Text';

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  argTypes: {
    type: {
      control: {type: 'select'},
      options: [
        'body',
        'large',
        'label',
        'supporting',
        'code',
        'display-1',
        'display-2',
        'display-3',
        'inherit',
      ],
    },
    color: {
      control: {type: 'select'},
      options: [
        'primary',
        'secondary',
        'disabled',
        'placeholder',
        'active',
        'inherit',
      ],
    },
    weight: {
      control: {type: 'select'},
      options: ['normal', 'medium', 'semibold', 'bold', 'inherit'],
    },
    display: {
      control: {type: 'select'},
      options: ['inline', 'block'],
    },
    as: {
      control: {type: 'select'},
      options: ['span', 'p', 'div', 'label', 'h1', 'h2', 'h3'],
    },
    hasCapsize: {control: 'boolean'},
    hasStrikethrough: {control: 'boolean'},
    hasTabularNumbers: {control: 'boolean'},
    children: {control: 'text'},
  },
  args: {
    children: 'Silver UI text follows the system font and local color tokens.',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = {};

export const Supporting: Story = {
  args: {
    type: 'supporting',
    children: 'Supporting copy uses the muted foreground token by default.',
  },
};

export const Code: Story = {
  args: {
    type: 'code',
    children: 'const status = "ready";',
  },
};

export const Truncated: Story = {
  args: {
    as: 'p',
    maxLines: 2,
    children:
      'This paragraph is intentionally long enough to demonstrate multiline clamping while preserving the full text for a truncation tooltip when the content overflows its container.',
  },
};
