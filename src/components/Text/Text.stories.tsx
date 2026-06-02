import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';
import type {JSX} from 'react';
import {Text} from './Text';

const constrainWidth =
  (maxWidth: number): Decorator =>
  (Story): JSX.Element => (
    <div style={{maxWidth}}>
      <Story />
    </div>
  );

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
    size: {
      control: {type: 'select'},
      options: [
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
        '5xl',
        '6xl',
        'inherit',
      ],
    },
    display: {
      control: {type: 'select'},
      options: ['inline', 'block'],
    },
    as: {
      control: {type: 'select'},
      options: ['span', 'p', 'div', 'label'],
    },
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

export const Large: Story = {
  args: {
    type: 'large',
    children: 'Large text for introductory or emphasized paragraphs.',
  },
};

export const Label: Story = {
  args: {
    type: 'label',
    children: 'Field label',
  },
};

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

export const Bold: Story = {
  args: {
    weight: 'bold',
    children: 'Bold text for strong emphasis.',
  },
};

export const Strikethrough: Story = {
  args: {
    hasStrikethrough: true,
    children: 'This text has been struck through.',
  },
};

export const TabularNumbers: Story = {
  args: {
    hasTabularNumbers: true,
    display: 'block',
  },
  render: (args): JSX.Element => (
    <div style={{textAlign: 'right', width: 120}}>
      <Text {...args}>1,234.56</Text>
      <Text {...args}>78,901.23</Text>
      <Text {...args}>456.00</Text>
    </div>
  ),
};

export const TruncatedSingleLine: Story = {
  args: {
    as: 'p',
    maxLines: 1,
    children:
      'This text is clamped to a single line with an ellipsis, demonstrating how overflow is handled when the content exceeds the available horizontal space.',
  },
  decorators: [constrainWidth(320)],
};

export const Truncated: Story = {
  args: {
    as: 'p',
    maxLines: 2,
    children:
      'This paragraph is intentionally long enough to demonstrate multiline clamping while preserving the full text for a truncation tooltip when the content overflows its container. It continues with additional sentences to ensure the text reliably exceeds two lines across a range of viewport widths, including wider desktop screens where a single line can accommodate a significant amount of text before wrapping.',
  },
  decorators: [constrainWidth(480)],
};
