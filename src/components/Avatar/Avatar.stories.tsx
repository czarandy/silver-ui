import type {Meta, StoryObj} from '@storybook/react-vite';
import {Check, Home, Settings} from 'lucide-react';
import {SideNav, SideNavItem} from 'components/SideNav';
import {css} from 'styled-system/css';
import type {AvatarColor} from '.';
import {Avatar, AvatarStatusDot} from '.';

const colors: AvatarColor[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'purple',
  'pink',
  'gray',
];

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    name: 'Ada Lovelace',
  },
  argTypes: {
    color: {
      control: {type: 'select'},
      options: colors,
    },
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

export const DefaultIcon: Story = {
  args: {
    name: undefined,
    src: undefined,
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

export const Colors: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
      {colors.map(color => (
        <Avatar color={color} key={color} name={color} size="medium" />
      ))}
    </div>
  ),
};

export const AutoColorFromName: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
      <Avatar name="Ada Lovelace" size="medium" />
      <Avatar name="Grace Hopper" size="medium" />
      <Avatar name="Katherine Johnson" size="medium" />
      <Avatar name="Alan Turing" size="medium" />
      <Avatar name="Barbara Liskov" size="medium" />
      <Avatar name="Dennis Ritchie" size="medium" />
    </div>
  ),
};

export const OnNav: Story = {
  render: () => (
    <div
      className={css({bg: 'bg.subtle'})}
      style={{width: 260, height: 320, padding: 12}}>
      <SideNav
        footer={
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <Avatar name="Ada Lovelace" size="small" />
            <span>Ada Lovelace</span>
          </div>
        }>
        <SideNavItem href="/home" icon={Home} label="Home" />
        <SideNavItem href="/settings" icon={Settings} label="Settings" />
      </SideNav>
    </div>
  ),
};
