import type {Meta, StoryObj} from '@storybook/react-vite';
import {VStack} from '../Stack';
import {Skeleton} from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: {height: 20, radius: 3, width: 240},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ContentBlock: Story = {
  render: () => (
    <VStack gap={3}>
      <Skeleton height={40} radius="rounded" width={40} />
      <Skeleton height={20} index={0} width="80%" />
      <Skeleton height={20} index={1} width="60%" />
      <Skeleton height={80} index={2} width="100%" />
    </VStack>
  ),
};
