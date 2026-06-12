import type {Meta, StoryObj} from '@storybook/react-vite';
import {Card} from 'components/Card';
import {Skeleton} from 'components/Skeleton/Skeleton';
import {HStack, VStack} from 'components/Stack';
import {Text} from 'components/Text';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: {height: 20, radius: 3, width: 240},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RadiusVariants: Story = {
  render: () => (
    <HStack gap={4}>
      <VStack align="center" gap={1}>
        <Skeleton height={40} radius={0} width={80} />
        <Text as="span" color="secondary" type="supporting">
          0
        </Text>
      </VStack>
      <VStack align="center" gap={1}>
        <Skeleton height={40} radius={1} width={80} />
        <Text as="span" color="secondary" type="supporting">
          1
        </Text>
      </VStack>
      <VStack align="center" gap={1}>
        <Skeleton height={40} radius={2} width={80} />
        <Text as="span" color="secondary" type="supporting">
          2
        </Text>
      </VStack>
      <VStack align="center" gap={1}>
        <Skeleton height={40} radius={3} width={80} />
        <Text as="span" color="secondary" type="supporting">
          3
        </Text>
      </VStack>
      <VStack align="center" gap={1}>
        <Skeleton height={40} radius={4} width={80} />
        <Text as="span" color="secondary" type="supporting">
          4
        </Text>
      </VStack>
      <VStack align="center" gap={1}>
        <Skeleton height={40} radius="none" width={80} />
        <Text as="span" color="secondary" type="supporting">
          none
        </Text>
      </VStack>
      <VStack align="center" gap={1}>
        <Skeleton height={40} radius="rounded" width={40} />
        <Text as="span" color="secondary" type="supporting">
          rounded
        </Text>
      </VStack>
    </HStack>
  ),
};

export const StringDimensions: Story = {
  render: () => (
    <VStack gap={3}>
      <Skeleton height="2rem" width="50%" />
      <Skeleton height="1.5rem" width="75%" />
      <Skeleton height="1rem" width="100%" />
    </VStack>
  ),
};

export const Staggered: Story = {
  render: () => (
    <VStack gap={2}>
      <Skeleton height={16} staggerIndex={0} width="90%" />
      <Skeleton height={16} staggerIndex={1} width="70%" />
      <Skeleton height={16} staggerIndex={2} width="80%" />
      <Skeleton height={16} staggerIndex={3} width="60%" />
    </VStack>
  ),
};

export const ContentBlock: Story = {
  render: () => (
    <VStack gap={3}>
      <Skeleton height={40} radius="rounded" width={40} />
      <Skeleton height={20} staggerIndex={0} width="80%" />
      <Skeleton height={20} staggerIndex={1} width="60%" />
      <Skeleton height={80} staggerIndex={2} width="100%" />
    </VStack>
  ),
};

export const CardLoading: Story = {
  render: () => (
    <Card padding={4} style={{maxWidth: 320}}>
      <VStack gap={3}>
        <HStack gap={3}>
          <Skeleton height={48} radius="rounded" width={48} />
          <VStack gap={2} style={{flex: 1}}>
            <Skeleton height={16} staggerIndex={0} width="60%" />
            <Skeleton height={12} staggerIndex={1} width="40%" />
          </VStack>
        </HStack>
        <Skeleton height={14} staggerIndex={2} width="100%" />
        <Skeleton height={14} staggerIndex={3} width="90%" />
        <Skeleton height={14} staggerIndex={4} width="70%" />
      </VStack>
    </Card>
  ),
};

export const ListLoading: Story = {
  render: () => (
    <VStack gap={4}>
      {[0, 1, 2, 3].map(i => (
        <HStack gap={3} key={i}>
          <Skeleton height={40} radius="rounded" staggerIndex={i} width={40} />
          <VStack gap={2} style={{flex: 1}}>
            <Skeleton height={14} staggerIndex={i} width="50%" />
            <Skeleton height={12} staggerIndex={i + 1} width="30%" />
          </VStack>
        </HStack>
      ))}
    </VStack>
  ),
};
