import type {Meta, StoryObj} from '@storybook/react-vite';
import {Check} from 'lucide-react';
import {Avatar, AvatarStatusDot} from '.';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    name: 'Ada Lovelace',
  },
  argTypes: {
    size: {
      control: {type: 'select'},
      options: ['tiny', 'xsmall', 'small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const Image: Story = {
  args: {
    alt: 'Ada Lovelace',
    src: 'https://i.pravatar.cc/256?img=47',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <Avatar name="Ada Lovelace" size="tiny" />
      <Avatar name="Ada Lovelace" size="xsmall" />
      <Avatar name="Ada Lovelace" size="small" />
      <Avatar name="Ada Lovelace" size="medium" />
      <Avatar name="Ada Lovelace" size="large" />
    </div>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <Avatar name="Ada Lovelace" status={<AvatarStatusDot label="Online" />} />
      <Avatar
        name="Grace Hopper"
        size="medium"
        status={<AvatarStatusDot icon={<Check />} label="Verified" />}
      />
      <Avatar
        name="Katherine Johnson"
        size="large"
        status={
          <AvatarStatusDot
            icon={<Check />}
            label="Unavailable"
            variant="error"
          />
        }
      />
    </div>
  ),
};

export const FallbackSrc: Story = {
  args: {
    src: 'https://broken.example.com/missing.png',
    fallbackSrc: 'https://i.pravatar.cc/256?img=47',
  },
};

export const NumericSizes: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <Avatar name="Ada Lovelace" size={16} />
      <Avatar name="Ada Lovelace" size={24} />
      <Avatar name="Ada Lovelace" size={48} />
      <Avatar name="Ada Lovelace" size={96} />
      <Avatar name="Ada Lovelace" size={144} />
    </div>
  ),
};
