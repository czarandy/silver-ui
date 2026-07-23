import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  BarChart3,
  Bell,
  BellRing,
  FileText,
  Home,
  Settings,
  Users,
} from 'lucide-react';
import {useState, type ComponentPropsWithRef} from 'react';
import {Badge} from 'components/Badge';
import {Tab} from 'components/Tabs/Tab';
import {TabMenu} from 'components/Tabs/TabMenu';
import {Tabs} from 'components/Tabs/Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          'Use **Tabs** when selecting an option shows or hides associated content ' +
          'panels (`tablist` / `tabpanel` semantics). To pick a value without swapping ' +
          'panels — a styled radio group for filters, settings, or view modes — use ' +
          '**SegmentedControl** instead.\n\n' +
          'Tabbing into a tablist reveals an ephemeral "← → to navigate" hint, since ' +
          'the arrow keys are otherwise undiscoverable behind a single tab stop. It is ' +
          'shown only to keyboard users and dismisses on the first arrow press.',
      },
    },
  },
  args: {hasDivider: true, layout: 'hug', size: 'md', value: 'overview'},
};

export default meta;
type Story = StoryObj<typeof meta>;

function RouterLink({
  children,
  ref,
  to,
  ...props
}: ComponentPropsWithRef<'a'> & {to?: string}): React.JSX.Element {
  return (
    <a data-to={to} ref={ref} {...props}>
      {children}
    </a>
  );
}

function TabsStory(args: React.ComponentProps<typeof Tabs>) {
  const [value, setValue] = useState(args.value);
  return (
    <>
      <Tabs {...args} onChange={setValue} value={value}>
        <Tab
          controls="overview-panel"
          id="overview-tab"
          label="Overview"
          value="overview"
        />
        <Tab
          controls="activity-panel"
          endContent={<Badge color="info" label="3" />}
          id="activity-tab"
          label="Activity"
          value="activity"
        />
        <Tab
          controls="settings-panel"
          icon={Settings}
          id="settings-tab"
          label="Settings"
          value="settings"
        />
        <Tab isDisabled label="Disabled" value="disabled" />
        <TabMenu
          id="more-tabs-tab"
          label="More"
          options={[
            {
              icon: BarChart3,
              label: 'Analytics',
              value: 'analytics',
            },
            {label: 'Reports', value: 'reports'},
          ]}
        />
      </Tabs>
      <div
        aria-labelledby="overview-tab"
        hidden={value !== 'overview'}
        id="overview-panel"
        role="tabpanel">
        Overview content
      </div>
      <div
        aria-labelledby="activity-tab"
        hidden={value !== 'activity'}
        id="activity-panel"
        role="tabpanel">
        Activity content
      </div>
      <div
        aria-labelledby="settings-tab"
        hidden={value !== 'settings'}
        id="settings-panel"
        role="tabpanel">
        Settings content
      </div>
      <div
        aria-labelledby="more-tabs-tab"
        hidden={value !== 'analytics'}
        id="analytics-panel"
        role="tabpanel">
        Analytics content
      </div>
      <div
        aria-labelledby="more-tabs-tab"
        hidden={value !== 'reports'}
        id="reports-panel"
        role="tabpanel">
        Reports content
      </div>
    </>
  );
}

function SelectedIconStory(args: React.ComponentProps<typeof Tabs>) {
  const [value, setValue] = useState('notifications');
  return (
    <Tabs {...args} onChange={setValue} value={value}>
      <Tab icon={Home} label="Home" value="home" />
      <Tab
        icon={Bell}
        label="Notifications"
        selectedIcon={BellRing}
        value="notifications"
      />
      <Tab icon={Settings} label="Settings" value="settings" />
    </Tabs>
  );
}

function TabMenuOnlyStory(args: React.ComponentProps<typeof Tabs>) {
  const [value, setValue] = useState('analytics');
  return (
    <Tabs {...args} onChange={setValue} value={value}>
      <TabMenu
        label="Views"
        options={[
          {icon: BarChart3, label: 'Analytics', value: 'analytics'},
          {icon: FileText, label: 'Reports', value: 'reports'},
          {icon: Users, label: 'Audience', value: 'audience'},
        ]}
      />
    </Tabs>
  );
}

function ManyTabsStory(args: React.ComponentProps<typeof Tabs>) {
  const [value, setValue] = useState('overview');
  return (
    <Tabs {...args} onChange={setValue} value={value}>
      <Tab label="Overview" value="overview" />
      <Tab label="Activity" value="activity" />
      <Tab label="Members" value="members" />
      <Tab label="Files" value="files" />
      <Tab label="Billing" value="billing" />
      <Tab label="Security" value="security" />
      <TabMenu
        label="More"
        options={[
          {label: 'Analytics', value: 'analytics'},
          {label: 'Reports', value: 'reports'},
          {label: 'Integrations', value: 'integrations'},
        ]}
      />
    </Tabs>
  );
}

function ControlledStory(args: React.ComponentProps<typeof Tabs>) {
  const [value, setValue] = useState(args.value);
  return (
    <Tabs {...args} onChange={setValue} value={value}>
      <Tab label="Overview" value="overview" />
      <Tab label="Activity" value="activity" />
      <Tab label="Settings" value="settings" />
    </Tabs>
  );
}

function PackageManagersStory(args: React.ComponentProps<typeof Tabs>) {
  const [value, setValue] = useState('yarn');
  return (
    <Tabs {...args} hasDivider onChange={setValue} value={value}>
      <Tab label="npm" value="npm" />
      <Tab label="pnpm" value="pnpm" />
      <Tab label="yarn" value="yarn" />
    </Tabs>
  );
}

function WithPanelsStory(args: React.ComponentProps<typeof Tabs>) {
  const [value, setValue] = useState('overview');
  return (
    <>
      <Tabs {...args} onChange={setValue} value={value}>
        <Tab
          controls="manual-overview-panel"
          id="manual-overview-tab"
          label="Overview"
          value="overview"
        />
        <Tab
          controls="manual-activity-panel"
          id="manual-activity-tab"
          label="Activity"
          value="activity"
        />
      </Tabs>
      <div
        aria-labelledby="manual-overview-tab"
        hidden={value !== 'overview'}
        id="manual-overview-panel"
        role="tabpanel">
        Overview content
      </div>
      <div
        aria-labelledby="manual-activity-tab"
        hidden={value !== 'activity'}
        id="manual-activity-panel"
        role="tabpanel">
        Activity content
      </div>
    </>
  );
}

export const Default: Story = {
  render: args => <TabsStory {...args} />,
};

export const ActiveHighlight: Story = {
  render: args => <PackageManagersStory {...args} />,
};

export const Fill: Story = {
  args: {layout: 'fill'},
  render: args => <TabsStory {...args} />,
};

export const Sizes: Story = {
  render: args => (
    <div style={{display: 'grid', gap: 16}}>
      <Tabs {...args} onChange={() => {}} size="sm" value="overview">
        <Tab label="Overview" value="overview" />
        <Tab label="Activity" value="activity" />
      </Tabs>
      <Tabs {...args} onChange={() => {}} size="lg" value="overview">
        <Tab label="Overview" value="overview" />
        <Tab label="Activity" value="activity" />
      </Tabs>
    </div>
  ),
};

export const Divider: Story = {
  render: args => (
    <div style={{display: 'grid', gap: 16}}>
      <Tabs {...args} hasDivider={false} onChange={() => {}} value="overview">
        <Tab label="Overview" value="overview" />
        <Tab label="Activity" value="activity" />
      </Tabs>
      <Tabs {...args} hasDivider onChange={() => {}} value="overview">
        <Tab label="Overview" value="overview" />
        <Tab label="Activity" value="activity" />
      </Tabs>
    </div>
  ),
};

export const LinkTabs: Story = {
  render: args => (
    <Tabs {...args} onChange={() => {}} value="overview">
      <Tab href="/overview" label="Overview" value="overview" />
      <Tab href="/activity" label="Activity" value="activity" />
      <Tab href="/settings" label="Settings" value="settings" />
    </Tabs>
  ),
};

export const CustomLink: Story = {
  render: args => (
    <Tabs {...args} onChange={() => {}} value="overview">
      <Tab as={RouterLink} href="/overview" label="Overview" value="overview" />
      <Tab as={RouterLink} href="/activity" label="Activity" value="activity" />
      <Tab as={RouterLink} href="/settings" label="Settings" value="settings" />
    </Tabs>
  ),
};

export const SelectedIcon: Story = {
  render: args => <SelectedIconStory {...args} />,
};

export const Disabled: Story = {
  render: args => (
    <Tabs {...args} onChange={() => {}} value="overview">
      <Tab label="Overview" value="overview" />
      <Tab isDisabled label="Activity" value="activity" />
      <TabMenu
        isDisabled
        label="More"
        options={[{label: 'Reports', value: 'reports'}]}
      />
    </Tabs>
  ),
};

export const TabMenuOnly: Story = {
  render: args => <TabMenuOnlyStory {...args} />,
};

export const ManyTabs: Story = {
  render: args => <ManyTabsStory {...args} />,
};

export const Controlled: Story = {
  args: {value: 'overview'},
  render: args => <ControlledStory {...args} />,
};

export const WithPanels: Story = {
  render: args => <WithPanelsStory {...args} />,
};

/**
 * Horizontal arrow keys follow visual direction: Left moves focus left and
 * Right moves it right, reversing DOM-order navigation under RTL.
 */
export const RTL: Story = {
  render: args => (
    <div dir="rtl">
      <Tabs {...args} onChange={() => {}} value="overview">
        <Tab label="Overview" value="overview" />
        <Tab label="Activity" value="activity" />
        <Tab label="Settings" value="settings" />
      </Tabs>
    </div>
  ),
};
