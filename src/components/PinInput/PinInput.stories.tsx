import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {getNecessity} from 'components/Field';
import {InputGroup} from 'components/InputGroup';
import {InputGroupText} from 'components/InputGroup/InputGroupText';
import {PinInput, type PinInputProps} from 'components/PinInput/PinInput';

const meta = {
  title: 'Components/PinInput',
  component: PinInput,
  args: {
    label: 'Verification code',
    onChange: () => {},
    value: '',
  },
  argTypes: {
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: {type: 'select'},
      options: ['numeric', 'alphanumeric'],
    },
  },
} satisfies Meta<typeof PinInput>;

export default meta;
type Story = StoryObj<typeof meta>;

type ControlledPinInputProps = Omit<
  PinInputProps,
  'isOptional' | 'isRequired' | 'onChange' | 'value'
> & {
  isOptional?: boolean;
  isRequired?: boolean;
  value?: string;
};

function ControlledPinInput({
  isOptional,
  isRequired,
  value: initialValue = '',
  ...props
}: ControlledPinInputProps): React.JSX.Element {
  const [value, setValue] = useState(initialValue);
  return (
    <PinInput
      {...props}
      {...getNecessity(isOptional, isRequired)}
      onChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: args => <ControlledPinInput {...args} />,
};

export const FourDigit: Story = {
  args: {label: 'Four-digit PIN', length: 4},
  render: args => <ControlledPinInput {...args} />,
};

export const Alphanumeric: Story = {
  args: {label: 'Recovery code', type: 'alphanumeric'},
  render: args => <ControlledPinInput {...args} />,
};

export const Masked: Story = {
  args: {hasMask: true, label: 'Secret PIN', length: 4},
  render: args => <ControlledPinInput {...args} />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <ControlledPinInput label="Small code" size="sm" />
      <ControlledPinInput label="Medium code" size="md" />
      <ControlledPinInput label="Large code" size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {isDisabled: true, value: '123'},
  render: args => <ControlledPinInput {...args} />,
};

export const Required: Story = {
  args: {isRequired: true},
  render: args => <ControlledPinInput {...args} />,
};

export const WithDescription: Story = {
  args: {description: 'Enter the code sent to your phone.'},
  render: args => <ControlledPinInput {...args} />,
};

export const ErrorStatus: Story = {
  args: {status: {message: 'That code has expired.', type: 'error'}},
  render: args => <ControlledPinInput {...args} />,
};

export const InInputGroup: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <InputGroup label="Large authentication control" size="lg">
        <InputGroupText>OTP</InputGroupText>
        <ControlledPinInput label="Verification code" size="sm" />
      </InputGroup>
      <InputGroup
        label="Invalid authentication control"
        status={{message: 'Check the supplied code.', type: 'error'}}>
        <InputGroupText>OTP</InputGroupText>
        <ControlledPinInput label="Verification code" />
      </InputGroup>
      <InputGroup isDisabled label="Disabled authentication control">
        <InputGroupText>OTP</InputGroupText>
        <ControlledPinInput label="Verification code" />
      </InputGroup>
    </div>
  ),
};
