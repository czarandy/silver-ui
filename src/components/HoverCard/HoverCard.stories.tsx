import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from '../Button';
import {Text} from '../Text';
import {HoverCard} from './HoverCard';

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

export const TextTrigger: Story = {
  render: args => (
    <HoverCard
      {...args}
      content={
        <div style={{maxWidth: 240}}>
          <Text as="p">
            Hover cards can hold richer preview content than a tooltip.
          </Text>
        </div>
      }>
      Account health
    </HoverCard>
  ),
};

export const ButtonTrigger: Story = {
  render: args => (
    <HoverCard
      {...args}
      content={
        <div style={{display: 'grid', gap: '0.5rem', maxWidth: 260}}>
          <Text as="p" type="label">
            Workspace
          </Text>
          <Text as="p" color="secondary">
            12 members, 4 pending invites
          </Text>
        </div>
      }>
      <Button label="Workspace" />
    </HoverCard>
  ),
};

export const DefaultOpen: Story = {
  args: {isDefaultOpen: true},
  render: args => (
    <HoverCard {...args} content={<Text as="p">Already visible.</Text>}>
      Default-open preview
    </HoverCard>
  ),
};
