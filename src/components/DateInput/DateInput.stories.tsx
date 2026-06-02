import type {Meta, StoryObj} from '@storybook/react-vite';
import {DateInput, type DateInputProps} from './DateInput';

const meta = {
  title: 'Components/DateInput',
  component: DateInput,
  args: {label: 'Due date', value: '2026-05-21'},
} satisfies Meta<DateInputProps>;

export default meta;
type Story = StoryObj<DateInputProps>;

export const Default: Story = {};
export const WithConstraints: Story = {
  args: {min: '2026-05-10', max: '2026-05-28', hasClear: true},
};
