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
  'purple',
  'teal',
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
  args: {icon: <CheckCircle2 />, label: 'Verified', variant: 'success'},
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
