import type {Meta, StoryObj} from '@storybook/react-vite';
import {Card} from '../Card';
import {HStack} from './HStack';
import {VStack} from './VStack';

const meta: Meta<typeof HStack> = {
  title: 'Components/Stack',
  component: HStack,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <HStack align="center" gap={3}>
      <Card>One</Card>
      <Card>Two</Card>
      <Card>Three</Card>
    </HStack>
  ),
};

export const Vertical: Story = {
  render: () => (
    <VStack gap={3}>
      <Card>One</Card>
      <Card>Two</Card>
      <Card>Three</Card>
    </VStack>
  ),
};
