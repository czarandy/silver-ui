import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, Mail, MessageSquare} from 'lucide-react';
import {useState} from 'react';
import {Badge} from 'components/Badge';
import {Icon} from 'components/Icon';
import {
  RadioGroup,
  type RadioGroupProps,
} from 'components/RadioGroup/RadioGroup';
import {RadioGroupItem} from 'components/RadioGroup/RadioGroupItem';
import {HStack} from 'components/Stack';

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

function RichLabelsStory(args: RadioGroupProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <RadioGroup {...args} onChange={setValue} value={value}>
      <RadioGroupItem
        description="Best for detailed updates."
        label={
          <HStack align="center" as="span" gap={2}>
            <strong>Email</strong> <Badge color="blue" label="Recommended" />
          </HStack>
        }
        value="email"
      />
      <RadioGroupItem
        label={
          <HStack align="center" as="span" gap={2}>
            <Icon icon={MessageSquare} size="sm" /> <em>SMS</em>
          </HStack>
        }
        value="sms"
      />
      <RadioGroupItem
        aria-label="Push notifications"
        description="Notifications on this device."
        label={<Icon icon={Bell} />}
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
    htmlName: 'notificationPreference',
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

export const Large: Story = {args: {size: 'lg'}};

export const Disabled: Story = {args: {isDisabled: true}};

export const ReadOnly: Story = {args: {isReadOnly: true}};

export const ItemDisabled: Story = {
  render: (args: RadioGroupProps): React.JSX.Element => (
    <ItemDisabledStory {...args} />
  ),
};

export const Required: Story = {args: {isRequired: true}};

export const Optional: Story = {args: {isOptional: true}};

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

export const RichLabels = {
  parameters: {
    docs: {
      description: {
        story:
          'Use noninteractive formatting, decorative icons, and badges in labels. Keep links and buttons in startContent or endContent. Label text supplies the accessible name; provide aria-label when useful text is absent, retaining any visible wording.',
      },
    },
  },
  render: (args: RadioGroupProps): React.JSX.Element => (
    <RichLabelsStory {...args} />
  ),
} satisfies Story;

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
