/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import type {DateRange} from '../../internal/dateTypes';
import {plainDateCreate} from '../../internal/plainDate';
import {DateRangeInput, type DateRangeInputProps} from './DateRangeInput';

const meta = {
  title: 'Components/DateRangeInput',
  component: DateRangeInput,
  argTypes: {
    getIsDateDisabled: {control: false},
    max: {control: false},
    min: {control: false},
    value: {control: false},
  },
  args: {label: 'Window'},
} satisfies Meta<DateRangeInputProps>;

export default meta;
type Story = StoryObj<DateRangeInputProps>;

const defaultRange: DateRange = {
  start: plainDateCreate(2026, 5, 10),
  end: plainDateCreate(2026, 5, 16),
};

export const Default: Story = {
  render: (args: DateRangeInputProps) => {
    const [value, setValue] = useState<DateRange | undefined>(
      () => defaultRange,
    );
    return <DateRangeInput {...args} onChange={setValue} value={value} />;
  },
};

export const Empty: Story = {
  render: (args: DateRangeInputProps) => {
    const [value, setValue] = useState<DateRange | undefined>();
    return <DateRangeInput {...args} onChange={setValue} value={value} />;
  },
};

export const WithClear: Story = {
  args: {hasClear: true},
  render: (args: DateRangeInputProps) => {
    const [value, setValue] = useState<DateRange | undefined>(
      () => defaultRange,
    );
    return <DateRangeInput {...args} onChange={setValue} value={value} />;
  },
};

export const WithConstraints: Story = {
  render: (args: DateRangeInputProps) => {
    const [value, setValue] = useState<DateRange | undefined>(
      () => defaultRange,
    );
    return (
      <DateRangeInput
        {...args}
        max={plainDateCreate(2026, 5, 28)}
        min={plainDateCreate(2026, 5, 5)}
        onChange={setValue}
        value={value}
      />
    );
  },
};

export const DisabledWeekends: Story = {
  render: (args: DateRangeInputProps) => {
    const [value, setValue] = useState<DateRange | undefined>(
      () => defaultRange,
    );
    return (
      <DateRangeInput
        {...args}
        getIsDateDisabled={date => date.dayOfWeek === 6 || date.dayOfWeek === 7}
        onChange={setValue}
        value={value}
      />
    );
  },
};

export const Disabled: Story = {
  args: {isDisabled: true},
  render: (args: DateRangeInputProps) => (
    <DateRangeInput {...args} onChange={() => {}} value={defaultRange} />
  ),
};

export const Loading: Story = {
  args: {isLoading: true},
  render: (args: DateRangeInputProps) => (
    <DateRangeInput {...args} onChange={() => {}} value={defaultRange} />
  ),
};

export const ErrorStatus: Story = {
  args: {status: {message: 'End date must be after start date', type: 'error'}},
  render: (args: DateRangeInputProps) => {
    const [value, setValue] = useState<DateRange | undefined>(
      () => defaultRange,
    );
    return <DateRangeInput {...args} onChange={setValue} value={value} />;
  },
};

export const WarningStatus: Story = {
  args: {status: {message: 'Range exceeds 7 days', type: 'warning'}},
  render: (args: DateRangeInputProps) => {
    const [value, setValue] = useState<DateRange | undefined>(
      () => defaultRange,
    );
    return <DateRangeInput {...args} onChange={setValue} value={value} />;
  },
};

export const SingleMonth: Story = {
  args: {numberOfMonths: 1},
  render: (args: DateRangeInputProps) => {
    const [value, setValue] = useState<DateRange | undefined>(
      () => defaultRange,
    );
    return <DateRangeInput {...args} onChange={setValue} value={value} />;
  },
};

export const WithDescription: Story = {
  args: {description: 'Select a check-in and check-out date.'},
  render: (args: DateRangeInputProps) => {
    const [value, setValue] = useState<DateRange | undefined>(
      () => defaultRange,
    );
    return <DateRangeInput {...args} onChange={setValue} value={value} />;
  },
};

export const Sizes: Story = {
  render: () => {
    const [sm, setSm] = useState<DateRange | undefined>(() => defaultRange);
    const [md, setMd] = useState<DateRange | undefined>(() => defaultRange);
    const [lg, setLg] = useState<DateRange | undefined>(() => defaultRange);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <DateRangeInput label="Small" onChange={setSm} size="sm" value={sm} />
        <DateRangeInput label="Medium" onChange={setMd} size="md" value={md} />
        <DateRangeInput label="Large" onChange={setLg} size="lg" value={lg} />
      </div>
    );
  },
};
