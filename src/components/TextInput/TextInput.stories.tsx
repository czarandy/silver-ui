import type {Meta, StoryObj} from '@storybook/react-vite';
import {Mail, Phone, Search} from 'lucide-react';
import {useState} from 'react';
import {Badge} from 'components/Badge';
import {getNecessity} from 'components/Field';
import {TextInput, type TextInputProps} from 'components/TextInput/TextInput';

const meta = {
  title: 'Components/TextInput',
  component: TextInput,
  args: {
    label: 'Name',
    onChange: () => {},
    placeholder: 'Enter a name',
    value: '',
  },
  argTypes: {
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

type ControlledTextInputProps = Omit<
  TextInputProps,
  'isOptional' | 'isRequired' | 'onChange' | 'value'
> & {
  isOptional?: boolean;
  isRequired?: boolean;
  value?: string;
};

function ControlledTextInput({
  isOptional,
  isRequired,
  value: initialValue = '',
  ...args
}: ControlledTextInputProps): React.JSX.Element {
  const [value, setValue] = useState(initialValue);

  return (
    <TextInput
      {...args}
      {...getNecessity(isOptional, isRequired)}
      onChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: args => <ControlledTextInput {...args} />,
};

export const WithIconAndClear: Story = {
  args: {hasClear: true, startIcon: Search, value: 'Ada'},
  render: args => <ControlledTextInput {...args} />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <ControlledTextInput label="Small" placeholder="Small input" size="sm" />
      <ControlledTextInput
        label="Medium"
        placeholder="Medium input"
        size="md"
      />
      <ControlledTextInput label="Large" placeholder="Large input" size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {isDisabled: true, value: 'Disabled value'},
  render: args => <ControlledTextInput {...args} />,
};

export const Loading: Story = {
  args: {isLoading: true, value: 'Searching...'},
  render: args => <ControlledTextInput {...args} />,
};

export const WithDescription: Story = {
  args: {description: 'Enter your legal first and last name'},
  render: args => <ControlledTextInput {...args} />,
};

export const LabelHidden: Story = {
  args: {isLabelHidden: true, placeholder: 'Search...', startIcon: Search},
  render: args => <ControlledTextInput {...args} />,
};

export const Required: Story = {
  args: {isRequired: true},
  render: args => <ControlledTextInput {...args} />,
};

export const Optional: Story = {
  args: {isOptional: true},
  render: args => <ControlledTextInput {...args} />,
};

export const WithLabelTooltip: Story = {
  args: {
    labelTooltip: 'Your full legal name as it appears on official documents',
  },
  render: args => <ControlledTextInput {...args} />,
};

export const WithEndContent: Story = {
  args: {
    endContent: <Badge color="info" label="USD" size="sm" />,
    label: 'Amount',
    placeholder: '0.00',
  },
  render: args => <ControlledTextInput {...args} />,
};

export const StatusVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <ControlledTextInput
        label="Error"
        status={{message: 'This field is required', type: 'error'}}
        value=""
      />
      <ControlledTextInput
        label="Warning"
        status={{message: 'This name is already taken', type: 'warning'}}
        value="admin"
      />
      <ControlledTextInput
        label="Success"
        status={{message: 'Username is available', type: 'success'}}
        value="ada_lovelace"
      />
    </div>
  ),
};

export const EmailType: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    startIcon: Mail,
    type: 'email',
  },
  render: args => <ControlledTextInput {...args} />,
};

export const PhoneType: Story = {
  args: {
    autoComplete: 'tel',
    description: 'For international numbers, include the country code.',
    label: 'Phone number',
    placeholder: '(555) 123-4567',
    startIcon: Phone,
    type: 'tel',
  },
  render: args => <ControlledTextInput {...args} />,
};
