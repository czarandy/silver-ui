import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  Archive,
  Bell,
  Box,
  ChevronDown,
  Edit,
  MoreVertical,
  File,
  Folder,
  HelpCircle,
  Home,
  Inbox,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Star,
  Trash,
  Users,
} from 'lucide-react';
import {useState} from 'react';
import {Avatar} from 'components/Avatar';
import {Badge} from 'components/Badge';
import {Button} from 'components/Button';
import {DropdownMenu} from 'components/DropdownMenu';
import {NavIcon} from 'components/NavIcon';
import {SideNav} from 'components/SideNav/SideNav';
import {SideNavHeading} from 'components/SideNav/SideNavHeading';
import {SideNavItem} from 'components/SideNav/SideNavItem';
import {SideNavSection} from 'components/SideNav/SideNavSection';
import {TextInput} from 'components/TextInput';

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
  parameters: {
    docs: {
      description: {
        story:
          'The collapse control stays in the footer: trailing while expanded and bottom-anchored when collapsed. Collapsed items show their labels in tooltips.',
      },
    },
  },
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        collapseBreakpoint="none"
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

export const ResponsiveInitialCollapse: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'At 1024px or narrower, reload the story to see the SideNav start collapsed. The collapse button controls it after mount.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'The inline footer keeps the avatar first and lower-priority collapse control inside the other actions. When collapsed, it becomes a bottom-anchored stack ordered collapse, actions, then avatar.',
      },
    },
  },
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        collapseBreakpoint="none"
        footer={{
          actions: (
            <>
              <Button
                icon={MessageSquare}
                isIconOnly
                label="Messages"
                size="sm"
                variant="ghost"
              />
              <Button
                icon={Bell}
                isIconOnly
                label="Notifications"
                size="sm"
                variant="ghost"
              />
            </>
          ),
          content: <Avatar name="Ada Lovelace" size="small" />,
        }}
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
        footer={{
          actions: (
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
          ),
          content: <Avatar name="Ada Lovelace" size="small" />,
        }}
        header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
        <SideNavSection title="Main">
          <SideNavItem href="/" icon={Home} isSelected label="Home" />
          <SideNavItem href="/inbox" icon={Inbox} label="Inbox" />
        </SideNavSection>
      </SideNav>
    </div>
  ),
};

export const FooterOnly: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        footer={{
          content: <Avatar name="Ada Lovelace" size="small" />,
        }}
        header={<SideNavHeading heading="Silver" logo={logo} />}>
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

export const WithBottomContent: Story = {
  render: () => (
    <div style={{height: 420}}>
      <SideNav
        bottomContent={
          <SideNavSection isHeaderHidden title="Support">
            <SideNavItem href="/help" icon={HelpCircle} label="Help center" />
          </SideNavSection>
        }
        header={
          <SideNavHeading heading="Silver" logo={logo} subheading="Workspace" />
        }>
        <SideNavSection title="Main">
          <SideNavItem href="/" icon={Home} isSelected label="Home" />
          <SideNavItem href="/inbox" icon={Inbox} label="Inbox" />
          <SideNavItem href="/settings" icon={Settings} label="Settings" />
        </SideNavSection>
      </SideNav>
    </div>
  ),
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
        collapseBreakpoint="none"
        footer={{
          content: <SideNavItem icon={Settings} label="Settings" />,
        }}
        header={
          <SideNavHeading heading="Silver" logo={logo} subheading="Workspace" />
        }
        isCollapsible>
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

export const WithActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Independent actions follow the primary target and expand/collapse toggle in tab order, before nested items. Actions own their disabled state and are hidden in the collapsed rail. Use compact buttons to preserve row sizing.',
      },
    },
  },
  render: function WithActions() {
    const [activity, setActivity] = useState(
      'Choose a navigation target or action',
    );
    return (
      <div style={{height: 420}}>
        <SideNav
          bottomContent={
            <p aria-label="Last action" role="status">
              {activity}
            </p>
          }
          collapseBreakpoint="none"
          isCollapsible>
          <SideNavItem
            actions={
              <Button
                icon={Edit}
                isIconOnly
                label="Edit projects"
                onClick={() => setActivity('Edit projects')}
                size="sm"
                variant="ghost"
              />
            }
            href="#projects"
            icon={Folder}
            isCollapsible
            label="Projects"
            onClick={event => {
              event.preventDefault();
              setActivity('Navigate to projects');
            }}>
            <SideNavItem
              label="Active projects"
              onClick={() => setActivity('Active projects')}
            />
          </SideNavItem>
          <SideNavItem
            actions={
              <DropdownMenu
                button={{
                  icon: MoreVertical,
                  isIconOnly: true,
                  label: 'Inbox actions',
                  size: 'sm',
                  variant: 'ghost',
                }}
                items={[
                  {
                    icon: Archive,
                    label: 'Archive inbox',
                    onClick: () => setActivity('Archive inbox'),
                  },
                ]}
              />
            }
            icon={Inbox}
            label="Inbox"
            onClick={() => setActivity('Open inbox')}
          />
          <SideNavItem
            actions={
              <Button
                icon={Edit}
                isIconOnly
                label="Edit archived projects"
                onClick={() => setActivity('Edit archived projects')}
                size="sm"
                variant="ghost"
              />
            }
            icon={Archive}
            isDisabled
            label="Archived projects"
          />
        </SideNav>
      </div>
    );
  },
};
