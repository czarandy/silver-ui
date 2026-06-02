import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';
import type {JSX} from 'react';
import {Heading} from './Heading';

const constrainWidth =
  (maxWidth: number): Decorator =>
  (Story): JSX.Element => (
    <div style={{maxWidth}}>
      <Story />
    </div>
  );

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  argTypes: {
    level: {
      control: {type: 'select'},
      options: [1, 2, 3, 4, 5, 6],
    },
    accessibilityLevel: {
      control: {type: 'select'},
      options: [1, 2, 3, 4, 5, 6],
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
    display: {
      control: {type: 'select'},
      options: ['inline', 'block'],
    },
    hasStrikethrough: {control: 'boolean'},
    children: {control: 'text'},
  },
  args: {
    level: 2,
    children: 'Section heading',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Levels: Story = {
  render: (): JSX.Element => (
    <div>
      <Heading level={1}>Heading level 1</Heading>
      <Heading level={2}>Heading level 2</Heading>
      <Heading level={3}>Heading level 3</Heading>
      <Heading level={4}>Heading level 4</Heading>
      <Heading level={5}>Heading level 5</Heading>
      <Heading level={6}>Heading level 6</Heading>
    </div>
  ),
};

export const Muted: Story = {
  args: {
    level: 3,
    color: 'secondary',
    children: 'Secondary heading',
  },
};

export const AccessibilityLevel: Story = {
  args: {
    level: 2,
    accessibilityLevel: 4,
    children: 'Visually h2, announced as level 4',
  },
};

export const TruncatedSingleLine: Story = {
  args: {
    level: 2,
    maxLines: 1,
    children:
      'A long heading that can be clamped to a single line in constrained layouts when the content is too wide',
  },
  decorators: [constrainWidth(480)],
};

export const TruncatedMultiLine: Story = {
  args: {
    level: 3,
    maxLines: 2,
    children:
      'A heading that wraps to multiple lines but is clamped after two lines when the content is long enough to exceed the available space in the container, which triggers the truncation tooltip on hover.',
  },
  decorators: [constrainWidth(400)],
};
