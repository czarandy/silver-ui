import type {Meta, StoryObj} from '@storybook/react-vite';
import {Check, X} from 'lucide-react';
import {Avatar, AvatarStatusDot} from 'components/Avatar';
import {css} from 'styled-system/css';
import {StatusDot} from '.';

const meta: Meta<typeof StatusDot> = {
  title: 'Components/StatusDot',
  component: StatusDot,
  args: {
    label: 'Online',
  },
  argTypes: {
    hasRing: {control: 'boolean'},
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: {type: 'select'},
      options: ['success', 'neutral', 'error'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <StatusDot label="Online" variant="success" />
      <StatusDot label="Away" variant="neutral" />
      <StatusDot label="Offline" variant="error" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <StatusDot label="Online" size="sm" />
      <StatusDot label="Online" size="md" />
      <StatusDot label="Online" size="lg" />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <StatusDot icon={<Check />} label="Verified" size="md" />
      <StatusDot icon={<X />} label="Unavailable" size="lg" variant="error" />
    </div>
  ),
};

export const WithRing: Story = {
  render: () => (
    <div
      className={css({bg: 'surface.blue', borderRadius: 'md'})}
      style={{display: 'flex', alignItems: 'center', gap: 16, padding: 24}}>
      <StatusDot hasRing label="Online" size="md" />
      <StatusDot label="Online" size="md" />
    </div>
  ),
};

export const InAListRow: Story = {
  render: () => (
    <ul style={{display: 'grid', gap: 8, listStyle: 'none', margin: 0}}>
      {(
        [
          ['eu-west-1', 'success', 'Connected'],
          ['us-east-2', 'neutral', 'Standby'],
          ['ap-south-1', 'error', 'Unreachable'],
        ] as const
      ).map(([server, variant, label]) => (
        <li
          key={server}
          style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <StatusDot label={label} size="sm" variant={variant} />
          <span>{server}</span>
        </li>
      ))}
    </ul>
  ),
};

export const OnAvatar: Story = {
  render: () => (
    <Avatar
      name="Ada Lovelace"
      size="medium"
      status={<AvatarStatusDot icon={<Check />} label="Verified" />}
    />
  ),
};
