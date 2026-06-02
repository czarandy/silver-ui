import type {Meta, StoryObj} from '@storybook/react-vite';
import {TimeInput, type TimeInputProps} from './TimeInput';

const meta = {
  title: 'Components/TimeInput',
  component: TimeInput,
  args: {label: 'Start time', value: '09:00'},
} satisfies Meta<TimeInputProps>;

export default meta;
type Story = StoryObj<TimeInputProps>;

export const Default: Story = {};
export const WithSeconds: Story = {
  args: {hasSeconds: true, value: '09:00:30'},
};
