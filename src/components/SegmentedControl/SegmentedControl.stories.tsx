import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, Calendar, Home, List, Settings, Users} from 'lucide-react';
import {useState} from 'react';
import {SegmentedControl, type SegmentedControlProps} from './SegmentedControl';
import {SegmentedControlItem} from './SegmentedControlItem';

function SegmentedControlStory(args: SegmentedControlProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <SegmentedControl {...args} onChange={setValue} value={value}>
      <SegmentedControlItem label="Day" value="day" />
      <SegmentedControlItem label="Week" value="week" />
      <SegmentedControlItem label="Month" value="month" />
    </SegmentedControl>
  );
}

function SizesStory(args: SegmentedControlProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <div style={{display: 'grid', gap: 16, justifyItems: 'start'}}>
      <SegmentedControl {...args} onChange={setValue} size="sm" value={value}>
        <SegmentedControlItem label="Day" value="day" />
        <SegmentedControlItem label="Week" value="week" />
        <SegmentedControlItem label="Month" value="month" />
      </SegmentedControl>
      <SegmentedControl {...args} onChange={setValue} size="md" value={value}>
        <SegmentedControlItem label="Day" value="day" />
        <SegmentedControlItem label="Week" value="week" />
        <SegmentedControlItem label="Month" value="month" />
      </SegmentedControl>
      <SegmentedControl {...args} onChange={setValue} size="lg" value={value}>
        <SegmentedControlItem label="Day" value="day" />
        <SegmentedControlItem label="Week" value="week" />
        <SegmentedControlItem label="Month" value="month" />
      </SegmentedControl>
    </div>
  );
}

function FillLayoutStory(args: SegmentedControlProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <div style={{maxWidth: 480}}>
      <SegmentedControl
        {...args}
        layout="fill"
        onChange={setValue}
        value={value}>
        <SegmentedControlItem label="Overview" value="overview" />
        <SegmentedControlItem label="Activity" value="activity" />
        <SegmentedControlItem label="Settings" value="settings" />
      </SegmentedControl>
    </div>
  );
}

function DisabledItemStory(args: SegmentedControlProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <SegmentedControl {...args} onChange={setValue} value={value}>
      <SegmentedControlItem label="Day" value="day" />
      <SegmentedControlItem isDisabled label="Week" value="week" />
      <SegmentedControlItem label="Month" value="month" />
    </SegmentedControl>
  );
}

function IconOnlyStory(args: SegmentedControlProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <SegmentedControl {...args} onChange={setValue} value={value}>
      <SegmentedControlItem
        icon={Home}
        isLabelHidden
        label="Home"
        value="home"
      />
      <SegmentedControlItem
        icon={Bell}
        isLabelHidden
        label="Notifications"
        value="notifications"
      />
      <SegmentedControlItem
        icon={Settings}
        isLabelHidden
        label="Settings"
        value="settings"
      />
    </SegmentedControl>
  );
}

function IconWithLabelStory(args: SegmentedControlProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <SegmentedControl {...args} onChange={setValue} value={value}>
      <SegmentedControlItem icon={Calendar} label="Calendar" value="calendar" />
      <SegmentedControlItem icon={List} label="List" value="list" />
      <SegmentedControlItem icon={Users} label="Team" value="team" />
    </SegmentedControl>
  );
}

function ManyItemsStory(args: SegmentedControlProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <SegmentedControl {...args} onChange={setValue} value={value}>
      <SegmentedControlItem label="Overview" value="overview" />
      <SegmentedControlItem label="Activity" value="activity" />
      <SegmentedControlItem label="Members" value="members" />
      <SegmentedControlItem label="Files" value="files" />
      <SegmentedControlItem label="Billing" value="billing" />
      <SegmentedControlItem label="Security" value="security" />
    </SegmentedControl>
  );
}

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    docs: {
      description: {
        component:
          'Use **SegmentedControl** to pick one value from a small set — it is a ' +
          'styled radio group (`role="radiogroup"`), suited to filters, settings, and ' +
          'view modes whose content you render yourself. If selecting an option should ' +
          'show or hide associated content panels, use **Tabs** instead.',
      },
    },
  },
  args: {
    label: 'Date range',
    layout: 'hug',
    size: 'md',
    value: 'day',
  },
  argTypes: {
    isDisabled: {control: 'boolean'},
    layout: {
      control: {type: 'select'},
      options: ['hug', 'fill'],
    },
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
  },
  render: (args: SegmentedControlProps): React.JSX.Element => (
    <SegmentedControlStory {...args} />
  ),
} satisfies Meta<SegmentedControlProps>;

export default meta;
type Story = StoryObj<SegmentedControlProps>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args: SegmentedControlProps): React.JSX.Element => (
    <SizesStory {...args} />
  ),
};

export const FillLayout: Story = {
  args: {
    label: 'Project section',
    value: 'overview',
  },
  render: (args: SegmentedControlProps): React.JSX.Element => (
    <FillLayoutStory {...args} />
  ),
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
};

export const DisabledItem: Story = {
  render: (args: SegmentedControlProps): React.JSX.Element => (
    <DisabledItemStory {...args} />
  ),
};

export const IconOnly: Story = {
  args: {
    label: 'Primary navigation',
    value: 'home',
  },
  render: (args: SegmentedControlProps): React.JSX.Element => (
    <IconOnlyStory {...args} />
  ),
};

export const IconWithLabel: Story = {
  args: {
    label: 'View mode',
    value: 'calendar',
  },
  render: (args: SegmentedControlProps): React.JSX.Element => (
    <IconWithLabelStory {...args} />
  ),
};

export const ManyItems: Story = {
  args: {
    label: 'Project section',
    value: 'overview',
  },
  render: (args: SegmentedControlProps): React.JSX.Element => (
    <ManyItemsStory {...args} />
  ),
};
