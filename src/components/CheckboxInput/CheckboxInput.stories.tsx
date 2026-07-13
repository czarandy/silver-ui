import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell} from 'lucide-react';
import {useState} from 'react';
import {Badge} from 'components/Badge';
import {
  CheckboxInput,
  type CheckboxInputProps,
} from 'components/CheckboxInput/CheckboxInput';
import {Icon} from 'components/Icon';
import {Link} from 'components/Link';

function CheckboxStory(args: CheckboxInputProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <CheckboxInput
      {...args}
      onChange={checked => setValue(checked)}
      value={value}
    />
  );
}

const meta = {
  title: 'Components/CheckboxInput',
  component: CheckboxInput,
  args: {label: 'Accept terms', value: false},
  render: (args: CheckboxInputProps): React.JSX.Element => (
    <CheckboxStory {...args} />
  ),
} satisfies Meta<CheckboxInputProps>;

export default meta;
type Story = StoryObj<CheckboxInputProps>;

export const Default: Story = {};

export const Checked: Story = {args: {value: true}};

export const Indeterminate: Story = {args: {value: 'indeterminate'}};

export const WithDescription: Story = {
  args: {
    label: 'Subscribe to newsletter',
    description: 'Receive weekly product updates and announcements.',
  },
};

export const WithLinkInLabel: Story = {
  args: {
    label: (
      <>
        I agree to the <Link href="/terms">terms and conditions</Link>
      </>
    ),
  },
};

export const Small: Story = {args: {size: 'sm'}};

export const Large: Story = {args: {size: 'lg'}};

export const Disabled: Story = {args: {isDisabled: true, value: true}};

export const ReadOnly: Story = {args: {isReadOnly: true, value: true}};

export const Loading: Story = {args: {isLoading: true, value: true}};

export const Required: Story = {args: {isRequired: true}};

export const Error: Story = {
  args: {
    status: {message: 'You must accept the terms to continue.', type: 'error'},
  },
};

export const Warning: Story = {
  args: {
    status: {message: 'This setting may affect performance.', type: 'warning'},
    value: true,
  },
};

export const Success: Story = {
  args: {
    status: {message: 'Preference saved.', type: 'success'},
    value: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Enable notifications',
    startContent: <Icon color="secondary" icon={Bell} size="sm" />,
  },
};

export const EndContentInline: Story = {
  args: {
    label: 'Beta features',
    endContent: <Badge color="blue" label="New" />,
    endContentPosition: 'inline',
  },
};

export const EndContentEnd: Story = {
  args: {
    label: 'Beta features',
    endContent: <Badge color="blue" label="New" />,
    endContentPosition: 'end',
  },
};
