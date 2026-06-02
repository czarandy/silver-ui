import type {Meta, StoryObj} from '@storybook/react-vite';
import {PasswordInput} from './PasswordInput';

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {value: 'supersecret'},
};

export const Disabled: Story = {
  args: {isDisabled: true, value: 'supersecret'},
};

export const WithStatus: Story = {
  args: {
    status: {type: 'error', message: 'Password is too short'},
    value: 'abc',
  },
};

export const Required: Story = {
  args: {isRequired: true},
};

export const Optional: Story = {
  args: {isOptional: true},
};

export const WithDescription: Story = {
  args: {
    description: 'Must be at least 8 characters with a number and symbol.',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <PasswordInput
        label="Small"
        onChange={() => {}}
        placeholder="Password"
        size="sm"
        value=""
      />
      <PasswordInput
        label="Medium"
        onChange={() => {}}
        placeholder="Password"
        size="md"
        value=""
      />
      <PasswordInput
        label="Large"
        onChange={() => {}}
        placeholder="Password"
        size="lg"
        value=""
      />
    </div>
  ),
};

export const Loading: Story = {
  args: {isLoading: true, value: 'supersecret'},
};

export const HiddenLabel: Story = {
  args: {isLabelHidden: true},
};

export const WithLabelTooltip: Story = {
  args: {labelTooltip: 'Your account password. Never share this with anyone.'},
};
