import type {Meta, StoryObj} from '@storybook/react-vite';
import {Calendar, type CalendarProps} from './Calendar';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  argTypes: {
    mode: {
      control: {type: 'select'},
      options: ['single', 'range'],
    },
    numberOfMonths: {
      control: {type: 'select'},
      options: [1, 2],
    },
    hasOutsideDays: {control: 'boolean'},
    hasVariableRowCount: {control: 'boolean'},
    hasWeekNumbers: {control: 'boolean'},
    weekStartsOn: {
      control: {type: 'select'},
      options: [0, 1, 2, 3, 4, 5, 6],
    },
  },
  args: {
    focusDate: '2026-05-01',
    hasOutsideDays: true,
    mode: 'single',
    numberOfMonths: 1,
    value: '2026-05-21',
  },
};

export default meta;
type Story = StoryObj<CalendarProps>;

export const Single: Story = {};

export const Range: Story = {
  args: {
    mode: 'range',
    value: {start: '2026-05-10', end: '2026-05-16'},
  },
};

export const TwoMonths: Story = {
  args: {
    numberOfMonths: 2,
  },
};

export const WithConstraints: Story = {
  args: {
    max: '2026-05-24',
    min: '2026-05-08',
  },
};

export const WeekNumbers: Story = {
  args: {
    hasWeekNumbers: true,
    weekStartsOn: 1,
  },
};
