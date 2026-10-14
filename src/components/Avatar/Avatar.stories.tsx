import type {Meta, StoryObj} from '@storybook/react-vite';
import {Check, Home, Settings} from 'lucide-react';
import {SideNav, SideNavItem} from 'components/SideNav';
import {HStack, VStack} from 'components/Stack';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';
import type {AvatarColor, AvatarShape} from '.';
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

const shapes: AvatarShape[] = ['circle', 'rounded', 'square'];
const organizationLogo = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="#30777a"/><path d="M26 28h44v12H38v10h26v12H38v8H26z" fill="white"/></svg>')}`;

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
    shape: {
      control: {type: 'select'},
      options: shapes,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const Shapes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Each row compares a person photo, person initials, and the default icon with an organization logo and organization initials. Rounded avatars use the theme’s large corner radius.',
      },
    },
  },
  render: () => (
    <VStack align="start" gap={6}>
      {shapes.map(shape => (
        <VStack align="start" gap={3} key={shape}>
          <Text weight="semibold">{shape}</Text>
          <HStack align="center" gap={4}>
            <Avatar
              name="Ada Lovelace"
              shape={shape}
              size="medium"
              src="https://i.pravatar.cc/256?img=47"
            />
            <Avatar name="Grace Hopper" shape={shape} size="medium" />
            <Avatar alt="Person placeholder" shape={shape} size="medium" />
            <Avatar
              alt="Silver organization logo"
              shape={shape}
              size="medium"
              src={organizationLogo}
            />
            <Avatar name="Silver Labs" shape={shape} size="medium" />
          </HStack>
        </VStack>
      ))}
    </VStack>
  ),
};

export const ShapesWithStatus: Story = {
  render: () => (
    <HStack align="center" gap={6}>
      {shapes.map(shape => (
        <Avatar
          key={shape}
          name="Ada Lovelace"
          shape={shape}
          size="medium"
          status={<AvatarStatusDot label="Online" />}
        />
      ))}
    </HStack>
  ),
};

export const UnicodeInitials: Story = {
  render: () => (
    <div className={css({display: 'flex', alignItems: 'center', gap: 4})}>
      <Avatar name="😀 Rivera" size="medium" />
      <Avatar name="🧑‍🚀 Alice Smith" size="medium" />
      <Avatar name={'N\u0303oño'} size="medium" />
    </div>
  ),
};

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
          <AvatarStatusDot color="error" icon={<Check />} label="Unavailable" />
        }
      />
    </div>
  ),
};

export const WithTooltip: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <Avatar hasTooltip name="Ada Lovelace" size="medium" />
      <Avatar
        alt="Grace Hopper"
        hasTooltip
        name="Grace Hopper"
        size="medium"
        src="https://i.pravatar.cc/256?img=32"
      />
      <Avatar hasTooltip name="Katherine Johnson" size="medium" />
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

export const ForwardedProps: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <Avatar
        aria-describedby="ada-tooltip"
        data-analytics="avatar-ada"
        id="avatar-ada"
        name="Ada Lovelace"
        onMouseEnter={() => undefined}
        size="medium"
        tabIndex={0}
        title="Ada Lovelace"
      />
      <span id="ada-tooltip">
        Unrecognized props (<code>id</code>, <code>tabIndex</code>,{' '}
        <code>title</code>, <code>data-*</code>, <code>aria-*</code>, event
        handlers) are forwarded to the root element — hover, focus, or inspect
        the avatar.
      </span>
    </div>
  ),
};

export const OnNav: Story = {
  render: () => (
    <div
      className={css({bg: 'bg.subtle'})}
      style={{width: 260, height: 320, padding: 12}}>
      <SideNav
        footer={{
          content: (
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <Avatar name="Ada Lovelace" size="small" />
              <span>Ada Lovelace</span>
            </div>
          ),
        }}>
        <SideNavItem href="/home" icon={Home} label="Home" />
        <SideNavItem href="/settings" icon={Settings} label="Settings" />
      </SideNav>
    </div>
  ),
};
