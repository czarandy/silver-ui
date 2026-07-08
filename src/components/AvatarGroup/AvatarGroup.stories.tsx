import type {Meta, StoryObj} from '@storybook/react-vite';
import {Avatar} from 'components/Avatar';
import {AvatarGroup} from 'components/AvatarGroup/AvatarGroup';
import {AvatarGroupOverflow} from 'components/AvatarGroup/AvatarGroupOverflow';

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

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {(['tiny', 'xsmall', 'small', 'medium', 'large'] as const).map(size => (
        <AvatarGroup aria-label={`${size} group`} key={size} size={size}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" />
          <Avatar name="Katherine Johnson" />
          <AvatarGroupOverflow count={4} />
        </AvatarGroup>
      ))}
    </div>
  ),
};

export const NumericSizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {([24, 48, 96] as const).map(size => (
        <AvatarGroup aria-label={`${size}px group`} key={size} size={size}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" />
          <AvatarGroupOverflow count={5} />
        </AvatarGroup>
      ))}
    </div>
  ),
};

export const CustomOverflowContent: Story = {
  render: args => (
    <AvatarGroup {...args}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <AvatarGroupOverflow count={12}>View all</AvatarGroupOverflow>
    </AvatarGroup>
  ),
};

export const ForwardedProps: Story = {
  render: args => (
    <AvatarGroup
      {...args}
      data-analytics="member-group"
      id="member-group"
      onMouseEnter={() => undefined}
      title="Project members">
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <AvatarGroupOverflow
        count={4}
        data-analytics="member-overflow"
        onClick={() => undefined}
        title="View all members"
      />
    </AvatarGroup>
  ),
};
