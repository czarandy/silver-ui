import type {Meta, StoryObj} from '@storybook/react-vite';
import {CheckboxInput} from './CheckboxInput';

const meta: Meta<typeof CheckboxInput> = {
  title: 'Components/CheckboxInput',
  component: CheckboxInput,
  args: {label: 'Accept terms', value: false},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = {args: {value: true}};
export const Indeterminate: Story = {args: {value: 'indeterminate'}};
