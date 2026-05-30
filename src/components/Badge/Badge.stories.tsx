import type {Meta, StoryObj} from '@storybook/react-vite';
import {CheckCircle2} from 'lucide-react';
import {HStack} from '../Stack';
import {Badge, type BadgeVariant} from './Badge';

const variants: BadgeVariant[] = [
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
  args: {label: 'Active', variant: 'neutral'},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {icon: CheckCircle2, label: 'Verified', variant: 'success'},
};

export const Count: Story = {
  args: {label: 42, variant: 'info'},
};

export const Sizes: Story = {
  render: () => (
    <HStack align="center" gap={2}>
      <Badge icon={CheckCircle2} label="Small" size="sm" variant="info" />
      <Badge icon={CheckCircle2} label="Medium" size="md" variant="info" />
      <Badge icon={CheckCircle2} label="Large" size="lg" variant="info" />
    </HStack>
  ),
};

export const Variants: Story = {
  render: () => (
    <HStack gap={2} wrap="wrap">
      {variants.map(variant => (
        <Badge key={variant} label={variant} variant={variant} />
      ))}
    </HStack>
  ),
};
