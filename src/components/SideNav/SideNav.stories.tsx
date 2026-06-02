import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  Archive,
  Bell,
  Box,
  ChevronDown,
  File,
  Folder,
  HelpCircle,
  Home,
  Inbox,
  Plus,
  Search,
  Settings,
  Star,
  Trash,
  Users,
} from 'lucide-react';
import {useState} from 'react';
import {Badge} from '../Badge';
import {Button} from '../Button';
import {NavIcon} from '../NavIcon';
import {TextInput} from '../TextInput';
import {SideNav} from './SideNav';
import {SideNavHeading} from './SideNavHeading';
import {SideNavItem} from './SideNavItem';
import {SideNavSection} from './SideNavSection';

const logo = <NavIcon icon={<Box style={{width: 16, height: 16}} />} />;

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
          <SideNavItem href="/" icon={Home} isSelected label="Home" />
          <SideNavItem href="/settings" icon={Settings} label="Settings" />
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const Collapsible: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        header={
          <SideNavHeading heading="Silver" logo={logo} subheading="Workspace" />
        }
        isCollapsible>
        <SideNavSection title="Main">
          <SideNavItem href="/" icon={Home} isSelected label="Home" />
          <SideNavItem href="/inbox" icon={Inbox} label="Inbox" />
          <SideNavItem href="/settings" icon={Settings} label="Settings" />
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const CollapsibleWithFooter: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        footerIcons={
          <>
            <Button
              icon={Bell}
              isIconOnly
              label="Notifications"
              size="sm"
              variant="ghost"
            />
            <Button
              icon={HelpCircle}
              isIconOnly
              label="Help"
              size="sm"
              variant="ghost"
            />
          </>
        }
        header={
          <SideNavHeading heading="Silver" logo={logo} subheading="Workspace" />
        }
        isCollapsible>
        <SideNavSection title="Main">
          <SideNavItem href="/" icon={Home} isSelected label="Home" />
          <SideNavItem href="/inbox" icon={Inbox} label="Inbox" />
          <SideNavItem href="/settings" icon={Settings} label="Settings" />
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        footerIcons={
          <>
            <Button
              icon={Bell}
              isIconOnly
              label="Notifications"
              size="sm"
              variant="ghost"
            />
            <Button
              icon={HelpCircle}
              isIconOnly
              label="Help"
              size="sm"
              variant="ghost"
            />
          </>
        }
        header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
        <SideNavSection title="Main">
          <SideNavItem href="/" icon={Home} isSelected label="Home" />
          <SideNavItem href="/inbox" icon={Inbox} label="Inbox" />
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const WithTopContent: Story = {
  render: function WithTopContent() {
    const [search, setSearch] = useState('');

    return (
      <div style={{height: 420}}>
        <SideNav
          header={<SideNavHeading heading="Silver" subheading="Workspace" />}
          topContent={
            <TextInput
              isLabelHidden
              label="Search"
              onChange={setSearch}
              placeholder="Search..."
              size="sm"
              value={search}
            />
          }>
          <SideNavSection title="Main">
            <SideNavItem href="/" icon={Home} isSelected label="Home" />
            <SideNavItem href="/inbox" icon={Inbox} label="Inbox" />
            <SideNavItem href="/settings" icon={Settings} label="Settings" />
          </SideNavSection>
        </SideNav>
      </div>
    );
  },
};

export const DisabledItems: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
        <SideNavSection title="Main">
          <SideNavItem href="/" icon={Home} isSelected label="Home" />
          <SideNavItem href="/inbox" icon={Inbox} label="Inbox" />
          <SideNavItem
            href="/settings"
            icon={Settings}
            isDisabled
            label="Settings"
          />
          <SideNavItem icon={Archive} isDisabled label="Archive" />
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const WithEndContent: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
        <SideNavSection endContent={<Plus size={14} />} title="Projects">
          <SideNavItem
            endContent={<Badge label="3" />}
            href="/inbox"
            icon={Inbox}
            isSelected
            label="Inbox"
          />
          <SideNavItem
            endContent={<Badge label="12" />}
            href="/starred"
            icon={Star}
            label="Starred"
          />
          <SideNavItem href="/trash" icon={Trash} label="Trash" />
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const ButtonItems: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
        <SideNavSection title="Actions">
          <SideNavItem icon={Home} isSelected label="Home" onClick={() => {}} />
          <SideNavItem icon={Search} label="Search" onClick={() => {}} />
          <SideNavItem icon={Settings} label="Settings" onClick={() => {}} />
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const MultipleSections: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
        <SideNavSection isHeaderHidden title="Primary">
          <SideNavItem href="/" icon={Home} isSelected label="Home" />
          <SideNavItem href="/inbox" icon={Inbox} label="Inbox" />
        </SideNavSection>
        <SideNavSection subtitle="Personal files" title="Documents">
          <SideNavItem href="/files" icon={File} label="All files" />
          <SideNavItem href="/folders" icon={Folder} label="Folders" />
          <SideNavItem href="/starred" icon={Star} label="Starred" />
        </SideNavSection>
        <SideNavSection title="Team">
          <SideNavItem href="/members" icon={Users} label="Members" />
          <SideNavItem href="/settings" icon={Settings} label="Settings" />
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const WithLogo: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        header={
          <SideNavHeading
            headerEndContent={<ChevronDown size={16} />}
            heading="Silver"
            headingHref="/"
            logo={logo}
            subheading="Design System"
            superheading="Acme Corp"
          />
        }>
        <SideNavSection title="Main">
          <SideNavItem href="/" icon={Home} isSelected label="Home" />
          <SideNavItem href="/settings" icon={Settings} label="Settings" />
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const CollapsibleItems: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
        <SideNavSection title="Main">
          <SideNavItem href="/" icon={Home} isSelected label="Home" />
          <SideNavItem href="/inbox" icon={Inbox} label="Inbox" />
          <SideNavItem icon={Settings} isCollapsible label="Settings">
            <SideNavItem href="/general" label="General" />
            <SideNavItem href="/security" label="Security" />
            <SideNavItem href="/notifications" label="Notifications" />
          </SideNavItem>
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const CollapsibleWithLinks: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
        <SideNavSection title="Main">
          <SideNavItem href="/" icon={Home} isSelected label="Home" />
          <SideNavItem
            href="/settings"
            icon={Settings}
            isCollapsible
            label="Settings">
            <SideNavItem href="/general" label="General" />
            <SideNavItem href="/security" label="Security" />
          </SideNavItem>
          <SideNavItem href="/team" icon={Users} isCollapsible label="Team">
            <SideNavItem href="/members" label="Members" />
            <SideNavItem href="/roles" label="Roles" />
          </SideNavItem>
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const Scrollable: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        footer={<SideNavItem icon={Settings} label="Settings" />}
        header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
        <SideNavSection title="Pages">
          {Array.from({length: 20}, (_, i) => (
            <SideNavItem
              href={`/page-${i + 1}`}
              icon={File}
              isSelected={i === 0}
              key={i}
              label={`Page ${i + 1}`}
            />
          ))}
        </SideNavSection>
      </SideNav>
    </div>
  ),
};
