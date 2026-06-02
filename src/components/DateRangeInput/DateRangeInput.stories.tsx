import type {Meta, StoryObj} from '@storybook/react-vite';
import {DateRangeInput, type DateRangeInputProps} from './DateRangeInput';

const meta = {
  title: 'Components/DateRangeInput',
  component: DateRangeInput,
  args: {
    label: 'Window',
    value: {start: '2026-05-10', end: '2026-05-12'},
  },
} satisfies Meta<DateRangeInputProps>;

export default meta;
type Story = StoryObj<DateRangeInputProps>;

export const Default: Story = {};
