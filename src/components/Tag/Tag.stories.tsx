import type {Meta, StoryObj} from '@storybook/react-vite';
import {Star, TagIcon} from 'lucide-react';
import {Badge} from 'components/Badge';
import {HStack} from 'components/Stack';
import {Tag, type TagColor} from 'components/Tag/Tag';

const colors: TagColor[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'purple',
  'pink',
  'gray',
];

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  args: {label: 'Design'},
  argTypes: {
    color: {
      control: {type: 'select'},
      options: colors,
    },
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
    isDisabled: {control: 'boolean'},
    isLabelHidden: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {icon: TagIcon, label: 'Design'},
};

export const Removable: Story = {
  args: {label: 'Removable', onRemove: () => undefined},
};

export const Sizes: Story = {
  render: () => (
    <HStack align="center" gap={2}>
      <Tag icon={TagIcon} label="Small" size="sm" />
      <Tag icon={TagIcon} label="Medium" size="md" />
      <Tag icon={TagIcon} label="Large" size="lg" />
    </HStack>
  ),
};

export const Colors: Story = {
  render: () => (
    <HStack gap={2} wrap="wrap">
      {colors.map(color => (
        <Tag color={color} key={color} label={color} />
      ))}
    </HStack>
  ),
};

export const Clickable: Story = {
  args: {label: 'Click me', onClick: () => undefined},
};

export const ClickableRemovable: Story = {
  args: {
    label: 'Editable',
    onClick: () => undefined,
    onRemove: () => undefined,
  },
};

export const LinkTag: Story = {
  args: {href: '#', label: 'Link tag'},
};

export const RemovableLink: Story = {
  args: {href: '#', label: 'Link', onRemove: () => undefined},
};

export const Disabled: Story = {
  render: () => (
    <HStack gap={2}>
      <Tag isDisabled label="Disabled" />
      <Tag isDisabled label="Disabled" onClick={() => undefined} />
      <Tag isDisabled label="Disabled" onRemove={() => undefined} />
    </HStack>
  ),
};

export const HiddenLabel: Story = {
  args: {icon: Star, isLabelHidden: true, label: 'Starred'},
};

export const WithEndContent: Story = {
  args: {
    endContent: <Badge color="info" label={3} size="sm" />,
    label: 'Issues',
  },
};

export const WithDescription: Story = {
  args: {
    description: 'High priority design task',
    label: 'Design',
  },
};

export const WithTooltip: Story = {
  args: {label: 'Design', tooltip: 'Design category'},
};
