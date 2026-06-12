import type {Meta, StoryObj} from '@storybook/react-vite';
import {CheckCircle2} from 'lucide-react';
import {Badge, type BadgeColor} from 'components/Badge/Badge';
import {HStack} from 'components/Stack';

const colors: BadgeColor[] = [
  'neutral',
  'info',
  'success',
  'warning',
  'error',
  'blue',
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
];

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: {label: 'Active', color: 'neutral'},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {icon: CheckCircle2, label: 'Verified', color: 'success'},
};

export const Count: Story = {
  args: {label: 42, color: 'info'},
};

export const LargeCount: Story = {
  render: () => (
    <HStack align="center" gap={2}>
      <Badge color="info" label={1} />
      <Badge color="info" label={42} />
      <Badge color="info" label={99} />
      <Badge color="error" label="99+" />
      <Badge color="error" label={1234} />
    </HStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack align="center" gap={2}>
      <Badge color="info" icon={CheckCircle2} label="Small" size="sm" />
      <Badge color="info" icon={CheckCircle2} label="Medium" size="md" />
      <Badge color="info" icon={CheckCircle2} label="Large" size="lg" />
    </HStack>
  ),
};

export const Colors: Story = {
  render: () => (
    <HStack gap={2} wrap="wrap">
      {colors.map(color => (
        <Badge color={color} key={color} label={color} />
      ))}
    </HStack>
  ),
};
