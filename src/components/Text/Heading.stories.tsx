import type {Meta, StoryObj} from '@storybook/react-vite';
import {Heading} from './Heading';

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  argTypes: {
    level: {
      control: {type: 'select'},
      options: [1, 2, 3, 4, 5, 6],
    },
    type: {
      control: {type: 'select'},
      options: ['display-1', 'display-2', 'display-3'],
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
    hasCapsize: {control: 'boolean'},
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

export const LevelTwo: Story = {};

export const Display: Story = {
  args: {
    level: 1,
    type: 'display-1',
    children: 'Dashboard overview',
  },
};

export const Muted: Story = {
  args: {
    level: 3,
    color: 'secondary',
    children: 'Secondary heading',
  },
};

export const Truncated: Story = {
  args: {
    level: 2,
    maxLines: 1,
    children:
      'A long heading that can be clamped to a single line in constrained layouts',
  },
};
