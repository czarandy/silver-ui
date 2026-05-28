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
    variant: 'elevated',
  },
  argTypes: {
    height: {
      control: {type: 'select'},
      options: ['fill', 'auto'],
    },
    variant: {
      control: {type: 'select'},
      options: ['wash', 'surface', 'section', 'elevated'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sideNav = (
  <SideNav header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
    <SideNavSection title="Main">
      <SideNavItem href="/" icon={<Home />} isSelected label="Home" />
      <SideNavItem href="/settings" icon={<Settings />} label="Settings" />
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
