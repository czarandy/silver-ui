import type {Meta, StoryObj} from '@storybook/react-vite';
import {Home, Settings} from 'lucide-react';
import {Button} from '../Button';
import {SideNav, SideNavHeading, SideNavItem, SideNavSection} from '../SideNav';
import {TopNav, TopNavHeading, TopNavItem} from '../TopNav';
import {AppShell} from './AppShell';

const meta: Meta<typeof AppShell> = {
  title: 'Components/AppShell',
  component: AppShell,
  args: {
    contentPadding: 4,
    height: 'fill',
    variant: 'default',
  },
  argTypes: {
    height: {
      control: {type: 'select'},
      options: ['fill', 'auto'],
    },
    variant: {
      control: {type: 'select'},
      options: ['default', 'section'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sideNav = (
  <SideNav header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
    <SideNavSection title="Main">
      <SideNavItem href="/" icon={Home} isSelected label="Home" />
      <SideNavItem href="/settings" icon={Settings} label="Settings" />
    </SideNavSection>
  </SideNav>
);

const topNav = (
  <TopNav
    endContent={<Button label="Create" size="sm" variant="primary" />}
    heading={<TopNavHeading heading="Silver UI" />}
    label="Main navigation">
    <TopNavItem href="/docs" label="Docs" />
    <TopNavItem href="/components" label="Components" />
  </TopNav>
);

const longContent = (
  <div>
    <h2>Dashboard</h2>
    {Array.from({length: 20}, (_, i) => (
      <p key={i}>
        Content paragraph {i + 1}. This content is long enough to trigger
        scrolling behavior within the shell.
      </p>
    ))}
  </div>
);

export const Basic: Story = {
  render: args => (
    <AppShell {...args} sideNav={sideNav} topNav={topNav}>
      <div>
        <h2>Dashboard</h2>
        <p>Application content renders in the main region.</p>
      </div>
    </AppShell>
  ),
};

export const WithBanner: Story = {
  render: args => (
    <AppShell
      {...args}
      banner={
        <div style={{background: '#edf7ff', padding: 12}}>
          Scheduled maintenance begins at 6 PM.
        </div>
      }
      sideNav={sideNav}
      topNav={topNav}>
      <div>
        <h2>Settings</h2>
        <p>Banner content appears above the top navigation.</p>
      </div>
    </AppShell>
  ),
};

export const AutoHeight: Story = {
  args: {height: 'auto'},
  render: args => (
    <AppShell {...args} sideNav={sideNav} topNav={topNav}>
      {longContent}
    </AppShell>
  ),
};

export const SideNavOnly: Story = {
  render: args => (
    <AppShell {...args} sideNav={sideNav}>
      <div>
        <h2>Dashboard</h2>
        <p>
          This shell has a side nav but no top nav. On mobile, an auto-generated
          top bar with a toggle button appears.
        </p>
      </div>
    </AppShell>
  ),
};

export const ContentOnly: Story = {
  render: args => (
    <AppShell {...args}>
      <div>
        <h2>Minimal Shell</h2>
        <p>No side nav, top nav, or banner — just content in a layout shell.</p>
      </div>
    </AppShell>
  ),
};

export const VariantSection: Story = {
  args: {variant: 'section'},
  render: args => (
    <AppShell {...args} sideNav={sideNav} topNav={topNav}>
      <div>
        <h2>Section Variant</h2>
        <p>Dividers separate the navigation and content areas.</p>
      </div>
    </AppShell>
  ),
};

export const MobileNavDisabled: Story = {
  render: args => (
    <AppShell {...args} isMobileNavDisabled sideNav={sideNav} topNav={topNav}>
      <div>
        <h2>Mobile Nav Disabled</h2>
        <p>
          Resize the viewport below the breakpoint — no mobile toggle or drawer
          will appear.
        </p>
      </div>
    </AppShell>
  ),
};
