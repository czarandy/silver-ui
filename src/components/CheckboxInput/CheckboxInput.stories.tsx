import type {Meta, StoryObj} from '@storybook/react-vite';
import {CheckboxInput, type CheckboxInputProps} from './CheckboxInput';

const meta = {
  title: 'Components/CheckboxInput',
  component: CheckboxInput,
  args: {label: 'Accept terms', value: false},
} satisfies Meta<CheckboxInputProps>;

export default meta;
type Story = StoryObj<CheckboxInputProps>;

export const Default: Story = {};
export const Checked: Story = {args: {value: true}};
export const Indeterminate: Story = {args: {value: 'indeterminate'}};
