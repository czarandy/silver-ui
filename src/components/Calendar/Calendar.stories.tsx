/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Calendar, type CalendarProps} from 'components/Calendar/Calendar';
import type {DateRange} from 'internal/dateTypes';
import {plainDateCreate, type PlainDate} from 'internal/plainDate';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  argTypes: {
    defaultValue: {control: false},
    getIsDateDisabled: {control: false},
    max: {control: false},
    min: {control: false},
    mode: {
      control: {type: 'select'},
      options: ['single', 'range'],
    },
    numberOfMonths: {
      control: {type: 'select'},
      options: [1, 2],
    },
    onChange: {control: false},
    onViewDateChange: {control: false},
    value: {control: false},
    viewDate: {control: false},
    hasOutsideDays: {control: 'boolean'},
    hasVariableRowCount: {control: 'boolean'},
    hasWeekNumbers: {control: 'boolean'},
    weekStartsOn: {
      control: {type: 'select'},
      options: [0, 1, 2, 3, 4, 5, 6],
    },
  },
};

export default meta;
type Story = StoryObj<CalendarProps>;

export const Single: Story = {
  render: () => {
    const [value, setValue] = useState<PlainDate | undefined>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return <Calendar onChange={setValue} value={value} />;
  },
};

export const Range: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(() => ({
      start: plainDateCreate(2026, 5, 10),
      end: plainDateCreate(2026, 5, 16),
    }));
    return (
      <Calendar
        mode="range"
        onChange={setValue}
        value={value}
        viewDate={plainDateCreate(2026, 5, 1)}
      />
    );
  },
};

export const TwoMonths: Story = {
  render: () => {
    const [value, setValue] = useState<PlainDate | undefined>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return (
      <Calendar
        numberOfMonths={2}
        onChange={setValue}
        value={value}
        viewDate={plainDateCreate(2026, 5, 1)}
      />
    );
  },
};

export const WithConstraints: Story = {
  render: () => {
    const [value, setValue] = useState<PlainDate | undefined>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return (
      <Calendar
        max={plainDateCreate(2026, 5, 24)}
        min={plainDateCreate(2026, 5, 8)}
        onChange={setValue}
        value={value}
        viewDate={plainDateCreate(2026, 5, 1)}
      />
    );
  },
};

export const WeekNumbers: Story = {
  render: () => {
    const [value, setValue] = useState<PlainDate | undefined>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return (
      <Calendar
        hasWeekNumbers
        onChange={setValue}
        value={value}
        viewDate={plainDateCreate(2026, 5, 1)}
        weekStartsOn={1}
      />
    );
  },
};

export const DisabledWeekends: Story = {
  render: () => {
    const [value, setValue] = useState<PlainDate | undefined>();
    return (
      <Calendar
        getIsDateDisabled={date => date.dayOfWeek === 6 || date.dayOfWeek === 7}
        onChange={setValue}
        value={value}
        viewDate={plainDateCreate(2026, 5, 1)}
      />
    );
  },
};

export const HideOutsideDays: Story = {
  render: () => {
    const [value, setValue] = useState<PlainDate | undefined>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return (
      <Calendar
        hasOutsideDays={false}
        onChange={setValue}
        value={value}
        viewDate={plainDateCreate(2026, 5, 1)}
      />
    );
  },
};

export const VariableRowCount: Story = {
  render: () => {
    const [value, setValue] = useState<PlainDate | undefined>();
    return (
      <Calendar
        hasVariableRowCount
        onChange={setValue}
        value={value}
        viewDate={plainDateCreate(2026, 2, 1)}
      />
    );
  },
};

export const RangeInteractive: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>();
    return (
      <Calendar
        mode="range"
        onChange={setValue}
        value={value}
        viewDate={plainDateCreate(2026, 5, 1)}
      />
    );
  },
};
