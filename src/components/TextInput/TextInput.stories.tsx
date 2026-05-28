import type {Meta, StoryObj} from '@storybook/react-vite';
import {Search} from 'lucide-react';
import {TextInput} from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  args: {label: 'Name', value: '', placeholder: 'Enter a name'},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithStatus: Story = {
  args: {status: {type: 'error', message: 'Name is required'}},
};
export const WithIconAndClear: Story = {
  args: {hasClear: true, startIcon: <Search />, value: 'Ada'},
};
