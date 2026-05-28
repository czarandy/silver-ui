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
