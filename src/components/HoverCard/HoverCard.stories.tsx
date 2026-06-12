import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from 'components/Button';
import {HoverCard} from 'components/HoverCard/HoverCard';
import {HStack, VStack} from 'components/Stack';
import {Text} from 'components/Text';

const meta: Meta<typeof HoverCard> = {
  title: 'Components/HoverCard',
  component: HoverCard,
  argTypes: {
    alignment: {
      control: {type: 'select'},
      options: ['start', 'center', 'end'],
    },
    placement: {
      control: {type: 'select'},
      options: ['above', 'below', 'start', 'end'],
    },
    delay: {control: 'number'},
    hideDelay: {control: 'number'},
    isEnabled: {control: 'boolean'},
    hasHoverIndication: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const previewContent = (
  <div style={{maxWidth: 240}}>
    <Text as="p">
      Hover cards can hold richer preview content than a tooltip.
    </Text>
  </div>
);

export const TextTrigger: Story = {
  render: args => (
    <HoverCard {...args} content={previewContent}>
      Account health
    </HoverCard>
  ),
};

export const ButtonTrigger: Story = {
  render: args => (
    <HoverCard
      {...args}
      content={
        <VStack gap={2} style={{maxWidth: 260}}>
          <Text as="p" type="label">
            Workspace
          </Text>
          <Text as="p" color="secondary">
            12 members, 4 pending invites
          </Text>
        </VStack>
      }>
      <Button label="Workspace" />
    </HoverCard>
  ),
};

export const Placements: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 24,
        justifyItems: 'center',
        padding: '80px',
      }}>
      <HoverCard content={previewContent} placement="above">
        Above
      </HoverCard>
      <HStack gap={6}>
        <HoverCard content={previewContent} placement="start">
          Start
        </HoverCard>
        <HoverCard content={previewContent} placement="end">
          End
        </HoverCard>
      </HStack>
      <HoverCard content={previewContent} placement="below">
        Below
      </HoverCard>
    </div>
  ),
};

export const Alignments: Story = {
  render: () => (
    <VStack gap={4} style={{padding: 40}}>
      <HoverCard alignment="start" content={previewContent} placement="below">
        Start aligned
      </HoverCard>
      <HoverCard alignment="center" content={previewContent} placement="below">
        Center aligned
      </HoverCard>
      <HoverCard alignment="end" content={previewContent} placement="below">
        End aligned
      </HoverCard>
    </VStack>
  ),
};

export const Disabled: Story = {
  render: args => (
    <HoverCard {...args} content={previewContent} isEnabled={false}>
      Hover me (disabled)
    </HoverCard>
  ),
};

export const InteractiveContent: Story = {
  render: args => (
    <HoverCard
      {...args}
      content={
        <VStack gap={3} style={{maxWidth: 280}}>
          <VStack gap={1}>
            <Text as="p" type="label">
              Jane Smith
            </Text>
            <Text as="p" color="secondary">
              Product Designer at Acme Corp
            </Text>
          </VStack>
          <HStack gap={2}>
            <Button label="View profile" size="sm" variant="secondary" />
            <Button label="Message" size="sm" variant="primary" />
          </HStack>
        </VStack>
      }>
      <Button label="Jane Smith" variant="ghost" />
    </HoverCard>
  ),
};

export const HoverIndication: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 16,
      }}>
      <HoverCard content={previewContent} hasHoverIndication={false}>
        No underline on hover
      </HoverCard>
      <HoverCard content={previewContent} hasHoverIndication>
        Always underline on hover
      </HoverCard>
      <HoverCard content={previewContent} hasHoverIndication="auto">
        Auto (text triggers only)
      </HoverCard>
    </div>
  ),
};

export const CustomDelay: Story = {
  render: args => (
    <HoverCard {...args} content={previewContent} delay={800} hideDelay={500}>
      Slow open (800ms), slow close (500ms)
    </HoverCard>
  ),
};
