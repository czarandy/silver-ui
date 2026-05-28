import type {Meta, StoryObj} from '@storybook/react-vite';
import {Home, Settings} from 'lucide-react';
import {SideNav} from './SideNav';
import {SideNavHeading} from './SideNavHeading';
import {SideNavItem} from './SideNavItem';
import {SideNavSection} from './SideNavSection';

const meta: Meta<typeof SideNav> = {
  title: 'Components/SideNav',
  component: SideNav,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
        <SideNavSection title="Main">
          <SideNavItem href="/" icon={<Home />} isSelected label="Home" />
          <SideNavItem href="/settings" icon={<Settings />} label="Settings" />
        </SideNavSection>
      </SideNav>
    </div>
  ),
};
