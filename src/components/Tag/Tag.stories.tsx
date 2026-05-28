import type {Meta, StoryObj} from '@storybook/react-vite';
import {TagIcon} from 'lucide-react';
import {HStack} from '../Stack';
import {Tag, type TagColor} from './Tag';

const colors: TagColor[] = [
  'default',
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithIcon: Story = {
  args: {icon: <TagIcon />, label: 'Design'},
};
export const Removable: Story = {
  args: {label: 'Removable', onRemove: () => undefined},
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
