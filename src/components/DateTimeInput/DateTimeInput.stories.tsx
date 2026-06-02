import type {Meta, StoryObj} from '@storybook/react-vite';
import {DateTimeInput, type DateTimeInputProps} from './DateTimeInput';

const meta = {
  title: 'Components/DateTimeInput',
  component: DateTimeInput,
  args: {label: 'Meeting', value: '2026-05-21T09:00', onChange: () => {}},
} satisfies Meta<DateTimeInputProps>;

export default meta;
type Story = StoryObj<DateTimeInputProps>;

export const Default: Story = {};
