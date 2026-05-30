import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, ChevronRight, User} from 'lucide-react';
import {Badge} from '../Badge';
import {Icon} from '../Icon';
import {Item} from './Item';

const meta: Meta<typeof Item> = {
  title: 'Components/Item',
  component: Item,
  args: {
    description: 'Supporting text',
    label: 'Item label',
  },
  argTypes: {
    align: {control: {type: 'select'}, options: ['center', 'start']},
    density: {control: {type: 'select'}, options: ['default', 'compact']},
    isDisabled: {control: 'boolean'},
    isHighlighted: {control: 'boolean'},
    isSelected: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSlots: Story = {
  render: args => (
    <Item
      {...args}
      endContent={<Badge label="Admin" />}
      startContent={<Icon color="secondary" icon={User} size="sm" />}
    />
  ),
};

export const Interactive: Story = {
  args: {
    onClick: () => {},
    endContent: <Icon icon={ChevronRight} size="sm" />,
  },
};

export const Compact: Story = {
  args: {
    density: 'compact',
    startContent: <Icon color="accent" icon={Bell} size="sm" />,
  },
};
