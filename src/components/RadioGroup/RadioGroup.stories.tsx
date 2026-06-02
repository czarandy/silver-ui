import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, Mail, MessageSquare} from 'lucide-react';
import {useState} from 'react';
import {Badge} from '../Badge';
import {Icon} from '../Icon';
import {RadioGroup, type RadioGroupProps} from './RadioGroup';
import {RadioGroupItem} from './RadioGroupItem';

function RadioGroupStory(
  args: React.ComponentProps<typeof RadioGroup>,
): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <RadioGroup {...args} onChange={setValue} value={value}>
      <RadioGroupItem
        description="Best for detailed updates."
        label="Email"
        value="email"
      />
      <RadioGroupItem label="SMS" value="sms" />
      <RadioGroupItem label="Push" value="push" />
    </RadioGroup>
  );
}

function ItemDisabledStory(args: RadioGroupProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <RadioGroup {...args} onChange={setValue} value={value}>
      <RadioGroupItem label="Email" value="email" />
      <RadioGroupItem isDisabled label="SMS" value="sms" />
      <RadioGroupItem label="Push" value="push" />
    </RadioGroup>
  );
}

function WithEndContentStory(args: RadioGroupProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <RadioGroup {...args} onChange={setValue} value={value}>
      <RadioGroupItem
        endContent={<Badge color="blue" label="Recommended" />}
        label="Email"
        value="email"
      />
      <RadioGroupItem label="SMS" value="sms" />
      <RadioGroupItem label="Push" value="push" />
    </RadioGroup>
  );
}

function WithIconsStory(args: RadioGroupProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <RadioGroup {...args} onChange={setValue} value={value}>
      <RadioGroupItem
        label="Email"
        startContent={<Icon color="secondary" icon={Mail} size="sm" />}
        value="email"
      />
      <RadioGroupItem
        label="SMS"
        startContent={<Icon color="secondary" icon={MessageSquare} size="sm" />}
        value="sms"
      />
      <RadioGroupItem
        label="Push"
        startContent={<Icon color="secondary" icon={Bell} size="sm" />}
        value="push"
      />
    </RadioGroup>
  );
}

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Notification preference',
    description: 'Choose one delivery channel.',
    value: 'email',
  },
  render: (args: RadioGroupProps): React.JSX.Element => (
    <RadioGroupStory {...args} />
  ),
} satisfies Meta<RadioGroupProps>;

export default meta;
type Story = StoryObj<RadioGroupProps>;

export const Default: Story = {};

export const Horizontal: Story = {args: {orientation: 'horizontal'}};

export const Small: Story = {args: {size: 'sm'}};

export const Disabled: Story = {args: {isDisabled: true}};

export const ItemDisabled: Story = {
  render: (args: RadioGroupProps): React.JSX.Element => (
    <ItemDisabledStory {...args} />
  ),
};

export const Required: Story = {args: {isRequired: true}};

export const Error: Story = {
  args: {
    status: {message: 'Select a notification preference.', type: 'error'},
  },
};

export const WithEndContent: Story = {
  render: (args: RadioGroupProps): React.JSX.Element => (
    <WithEndContentStory {...args} />
  ),
};

export const WithIcons: Story = {
  render: (args: RadioGroupProps): React.JSX.Element => (
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
    status: {message: 'Preference saved.', type: 'success'},
  },
};
