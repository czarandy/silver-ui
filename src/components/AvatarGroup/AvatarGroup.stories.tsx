import type {Meta, StoryObj} from '@storybook/react-vite';
import {Avatar} from '../Avatar';
import {AvatarGroup} from './AvatarGroup';
import {AvatarGroupOverflow} from './AvatarGroupOverflow';

const meta: Meta<typeof AvatarGroup> = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  args: {
    'aria-label': 'Project members',
    size: 'small',
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

export const Basic: Story = {
  render: args => (
    <AvatarGroup {...args}>
      <Avatar name="Ada Lovelace" src="https://i.pravatar.cc/256?img=47" />
      <Avatar name="Grace Hopper" src="https://i.pravatar.cc/256?img=32" />
      <Avatar name="Katherine Johnson" />
    </AvatarGroup>
  ),
};

export const WithOverflow: Story = {
  render: args => (
    <AvatarGroup {...args}>
      <Avatar name="Ada Lovelace" src="https://i.pravatar.cc/256?img=47" />
      <Avatar name="Grace Hopper" src="https://i.pravatar.cc/256?img=32" />
      <Avatar name="Katherine Johnson" />
      <AvatarGroupOverflow count={4} />
    </AvatarGroup>
  ),
};

export const ClickableOverflow: Story = {
  render: args => (
    <AvatarGroup {...args}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <AvatarGroupOverflow count={8} onClick={() => undefined} />
    </AvatarGroup>
  ),
};
