import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, Home, Search, Settings} from 'lucide-react';
import {Avatar} from '../Avatar';
import {Badge} from '../Badge';
import {Button} from '../Button';
import {TopNav} from './TopNav';
import {TopNavHeading} from './TopNavHeading';
import {TopNavItem} from './TopNavItem';

const meta: Meta<typeof TopNav> = {
  title: 'Components/TopNav',
  component: TopNav,
  args: {
    label: 'Main navigation',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: args => (
    <TopNav
      {...args}
      endContent={<Button label="Create" size="sm" variant="primary" />}
      heading={<TopNavHeading heading="Silver UI" />}>
      <TopNavItem href="/docs" isSelected label="Docs" />
      <TopNavItem href="/components" label="Components" />
    </TopNav>
  ),
};

export const WithCenterContent: Story = {
  render: args => (
    <TopNav
      {...args}
      centerContent={
        <>
          <TopNavItem href="/docs" isSelected label="Docs" />
          <TopNavItem href="/components" label="Components" />
          <TopNavItem href="/guides" label="Guides" />
        </>
      }
      endContent={<Button label="Sign in" size="sm" />}
      heading={<TopNavHeading heading="Silver UI" />}
    />
  ),
};

export const WithStartContent: Story = {
  render: args => (
    <TopNav
      {...args}
      endContent={<Button label="Sign in" size="sm" />}
      heading={<TopNavHeading heading="Silver UI" />}
      startContent={
        <>
          <TopNavItem href="/docs" isSelected label="Docs" />
          <TopNavItem href="/components" label="Components" />
        </>
      }
    />
  ),
};

export const WithoutHeading: Story = {
  render: args => (
    <TopNav {...args} endContent={<Button label="Sign in" size="sm" />}>
      <TopNavItem href="/home" isSelected label="Home" />
      <TopNavItem href="/about" label="About" />
      <TopNavItem href="/contact" label="Contact" />
    </TopNav>
  ),
};

export const DisabledItems: Story = {
  render: args => (
    <TopNav {...args} heading={<TopNavHeading heading="Silver UI" />}>
      <TopNavItem href="/docs" label="Docs" />
      <TopNavItem href="/admin" isDisabled label="Admin" />
      <TopNavItem href="/settings" isDisabled label="Settings" />
    </TopNav>
  ),
};

export const IconOnlyItems: Story = {
  render: args => (
    <TopNav
      {...args}
      endContent={
        <>
          <TopNavItem href="/search" icon={Search} isIconOnly label="Search" />
          <TopNavItem
            href="/notifications"
            icon={Bell}
            isIconOnly
            label="Notifications"
          />
          <TopNavItem
            href="/settings"
            icon={Settings}
            isIconOnly
            label="Settings"
          />
        </>
      }
      heading={<TopNavHeading heading="Silver UI" />}>
      <TopNavItem href="/docs" isSelected label="Docs" />
      <TopNavItem href="/components" label="Components" />
    </TopNav>
  ),
};

export const ItemsWithIcons: Story = {
  render: args => (
    <TopNav {...args} heading={<TopNavHeading heading="Silver UI" />}>
      <TopNavItem href="/home" icon={Home} isSelected label="Home" />
      <TopNavItem href="/search" icon={Search} label="Search" />
      <TopNavItem href="/settings" icon={Settings} label="Settings" />
    </TopNav>
  ),
};

export const HeadingVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <TopNav
        heading={<TopNavHeading heading="Silver UI" />}
        label="With heading only">
        <TopNavItem href="/docs" label="Docs" />
      </TopNav>
      <TopNav
        heading={
          <TopNavHeading
            heading="Silver UI"
            logo={<Avatar name="S" size="xsmall" />}
          />
        }
        label="With logo">
        <TopNavItem href="/docs" label="Docs" />
      </TopNav>
      <TopNav
        heading={
          <TopNavHeading
            heading="Silver UI"
            subheading="Design System"
            superheading="Acme Corp"
          />
        }
        label="With super and subheading">
        <TopNavItem href="/docs" label="Docs" />
      </TopNav>
      <TopNav
        heading={
          <TopNavHeading
            headerEndContent={<Badge color="info" label="Beta" size="sm" />}
            heading="Silver UI"
          />
        }
        label="With end content">
        <TopNavItem href="/docs" label="Docs" />
      </TopNav>
      <TopNav
        heading={<TopNavHeading heading="Silver UI" headingHref="/" />}
        label="With linked heading">
        <TopNavItem href="/docs" label="Docs" />
      </TopNav>
    </div>
  ),
};
