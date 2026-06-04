import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {PasswordInput, type PasswordInputProps} from './PasswordInput';

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  args: {
    label: 'Password',
    onChange: () => {},
    placeholder: 'Enter your password',
    value: '',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type ControlledPasswordInputProps = Omit<
  PasswordInputProps,
  'isOptional' | 'isRequired' | 'onChange' | 'value'
> & {
  isOptional?: boolean;
  isRequired?: boolean;
  value?: string;
};

function ControlledPasswordInput({
  isOptional,
  isRequired,
  value: initialValue = '',
  ...args
}: ControlledPasswordInputProps): React.JSX.Element {
  const [value, setValue] = useState(initialValue);
  const props = {
    ...args,
    onChange: setValue,
    value,
  };

  if (isOptional === true) {
    return <PasswordInput {...props} isOptional />;
  }

  return <PasswordInput {...props} isRequired={isRequired} />;
}

export const Default: Story = {
  render: args => <ControlledPasswordInput {...args} />,
};

export const WithValue: Story = {
  args: {value: 'supersecret'},
  render: args => <ControlledPasswordInput {...args} />,
};

export const Disabled: Story = {
  args: {isDisabled: true, value: 'supersecret'},
  render: args => <ControlledPasswordInput {...args} />,
};

export const WithStatus: Story = {
  args: {
    status: {type: 'error', message: 'Password is too short'},
    value: 'abc',
  },
  render: args => <ControlledPasswordInput {...args} />,
};

export const Required: Story = {
  args: {isRequired: true},
  render: args => <ControlledPasswordInput {...args} />,
};

export const Optional: Story = {
  args: {isOptional: true},
  render: args => <ControlledPasswordInput {...args} />,
};

export const WithDescription: Story = {
  args: {
    description: 'Must be at least 8 characters with a number and symbol.',
  },
  render: args => <ControlledPasswordInput {...args} />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <ControlledPasswordInput label="Small" placeholder="Password" size="sm" />
      <ControlledPasswordInput
        label="Medium"
        placeholder="Password"
        size="md"
      />
      <ControlledPasswordInput label="Large" placeholder="Password" size="lg" />
    </div>
  ),
};

export const Loading: Story = {
  args: {isLoading: true, value: 'supersecret'},
  render: args => <ControlledPasswordInput {...args} />,
};

export const HiddenLabel: Story = {
  args: {isLabelHidden: true},
  render: args => <ControlledPasswordInput {...args} />,
};

export const WithLabelTooltip: Story = {
  args: {labelTooltip: 'Your account password. Never share this with anyone.'},
  render: args => <ControlledPasswordInput {...args} />,
};
