import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, Mail, MessageSquare} from 'lucide-react';
import {useState} from 'react';
import {Badge} from 'components/Badge';
import {
  CheckboxGroup,
  type CheckboxGroupProps,
} from 'components/CheckboxGroup/CheckboxGroup';
import {CheckboxGroupItem} from 'components/CheckboxGroup/CheckboxGroupItem';
import {Icon} from 'components/Icon';

function CheckboxGroupStory(args: CheckboxGroupProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <CheckboxGroup {...args} onChange={setValue} value={value}>
      <CheckboxGroupItem
        description="Best for detailed updates."
        label="Email"
        value="email"
      />
      <CheckboxGroupItem label="SMS" value="sms" />
      <CheckboxGroupItem label="Push" value="push" />
    </CheckboxGroup>
  );
}

function ItemDisabledStory(args: CheckboxGroupProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <CheckboxGroup {...args} onChange={setValue} value={value}>
      <CheckboxGroupItem label="Email" value="email" />
      <CheckboxGroupItem isDisabled label="SMS" value="sms" />
      <CheckboxGroupItem label="Push" value="push" />
    </CheckboxGroup>
  );
}

function WithEndContentStory(args: CheckboxGroupProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <CheckboxGroup {...args} onChange={setValue} value={value}>
      <CheckboxGroupItem
        endContent={<Badge color="blue" label="Recommended" />}
        label="Email"
        value="email"
      />
      <CheckboxGroupItem label="SMS" value="sms" />
      <CheckboxGroupItem label="Push" value="push" />
    </CheckboxGroup>
  );
}

function WithIconsStory(args: CheckboxGroupProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <CheckboxGroup {...args} onChange={setValue} value={value}>
      <CheckboxGroupItem
        label="Email"
        startContent={<Icon color="secondary" icon={Mail} size="sm" />}
        value="email"
      />
      <CheckboxGroupItem
        label="SMS"
        startContent={<Icon color="secondary" icon={MessageSquare} size="sm" />}
        value="sms"
      />
      <CheckboxGroupItem
        label="Push"
        startContent={<Icon color="secondary" icon={Bell} size="sm" />}
        value="push"
      />
    </CheckboxGroup>
  );
}

function WrappingRowStory(args: CheckboxGroupProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <CheckboxGroup
      {...args}
      onChange={setValue}
      orientation="horizontal"
      style={{maxWidth: 420}}
      value={value}>
      <CheckboxGroupItem label="Design" value="design" />
      <CheckboxGroupItem label="Engineering" value="engineering" />
      <CheckboxGroupItem label="Marketing" value="marketing" />
      <CheckboxGroupItem label="Operations" value="operations" />
      <CheckboxGroupItem label="Support" value="support" />
    </CheckboxGroup>
  );
}

const meta = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  args: {
    description: 'Choose any channels that apply.',
    label: 'Notification channels',
    value: ['email', 'push'],
  },
  render: (args: CheckboxGroupProps): React.JSX.Element => (
    <CheckboxGroupStory {...args} />
  ),
} satisfies Meta<CheckboxGroupProps>;

export default meta;
type Story = StoryObj<CheckboxGroupProps>;

export const Default: Story = {};

export const Horizontal: Story = {args: {orientation: 'horizontal'}};

export const CustomGap: Story = {args: {gap: 6}};

export const WrappingRow: Story = {
  args: {
    description: 'Choose the teams that should receive access.',
    label: 'Teams',
    value: ['design', 'engineering', 'support'],
  },
  render: (args: CheckboxGroupProps): React.JSX.Element => (
    <WrappingRowStory {...args} />
  ),
};

export const Small: Story = {args: {size: 'sm'}};

export const Large: Story = {args: {size: 'lg'}};

export const Disabled: Story = {args: {isDisabled: true}};

export const ItemDisabled: Story = {
  render: (args: CheckboxGroupProps): React.JSX.Element => (
    <ItemDisabledStory {...args} />
  ),
};

export const Required: Story = {args: {isRequired: true}};

export const Optional: Story = {args: {isOptional: true}};

export const Error: Story = {
  args: {
    status: {
      message: 'Select at least one notification channel.',
      type: 'error',
    },
    value: [],
  },
};

export const WithEndContent: Story = {
  render: (args: CheckboxGroupProps): React.JSX.Element => (
    <WithEndContentStory {...args} />
  ),
};

export const WithIcons: Story = {
  render: (args: CheckboxGroupProps): React.JSX.Element => (
    <WithIconsStory {...args} />
  ),
};

export const Warning: Story = {
  args: {
    status: {message: 'SMS may incur carrier charges.', type: 'warning'},
  },
};

export const Success: Story = {
  args: {
    status: {message: 'Preferences saved.', type: 'success'},
  },
};
