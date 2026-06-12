/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import {Temporal} from '@js-temporal/polyfill';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {
  TimeInput,
  type PlainTime,
  type TimeInputProps,
} from 'components/TimeInput/TimeInput';

function time(value: string): PlainTime {
  return Temporal.PlainTime.from(value);
}

const TIME_0900 = time('09:00');
const TIME_090030 = time('09:00:30');
const TIME_1000 = time('10:00');
const TIME_1200 = time('12:00');
const TIME_1430 = time('14:30');
const TIME_1700 = time('17:00');
const TIME_2200 = time('22:00');

const meta = {
  title: 'Components/TimeInput',
  component: TimeInput,
  args: {label: 'Start time'},
} satisfies Meta<TimeInputProps>;

export default meta;
type Story = StoryObj<TimeInputProps>;

export const Default: Story = {
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(TIME_0900);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};

export const WithSeconds: Story = {
  args: {hasSeconds: true},
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(TIME_090030);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};

export const WithClear: Story = {
  args: {hasClear: true},
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(TIME_1430);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};

export const WithConstraints: Story = {
  args: {max: TIME_1700, min: TIME_0900},
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(TIME_1200);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};

export const Disabled: Story = {
  args: {isDisabled: true},
  render: (args: TimeInputProps) => (
    <TimeInput {...args} onChange={() => {}} value={TIME_0900} />
  ),
};

export const Loading: Story = {
  args: {isLoading: true},
  render: (args: TimeInputProps) => (
    <TimeInput {...args} onChange={() => {}} value={TIME_0900} />
  ),
};

export const ErrorStatus: Story = {
  args: {status: {message: 'Time is required', type: 'error'}},
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(null);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};

export const WarningStatus: Story = {
  args: {status: {message: 'Outside business hours', type: 'warning'}},
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(TIME_2200);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};

export const SuccessStatus: Story = {
  args: {status: {message: 'Time slot available', type: 'success'}},
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(TIME_1000);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};

export const Sizes: Story = {
  render: () => {
    const [sm, setSm] = useState<PlainTime | null>(TIME_0900);
    const [md, setMd] = useState<PlainTime | null>(TIME_0900);
    const [lg, setLg] = useState<PlainTime | null>(TIME_0900);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <TimeInput label="Small" onChange={setSm} size="sm" value={sm} />
        <TimeInput label="Medium" onChange={setMd} size="md" value={md} />
        <TimeInput label="Large" onChange={setLg} size="lg" value={lg} />
      </div>
    );
  },
};

export const Required: Story = {
  args: {isRequired: true},
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(TIME_0900);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};

export const Optional: Story = {
  args: {isOptional: true},
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(TIME_0900);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};

export const WithDescription: Story = {
  args: {description: 'Select a time in your local timezone.'},
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(TIME_0900);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};

export const HiddenLabel: Story = {
  args: {isLabelHidden: true},
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(TIME_0900);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};

export const WithLabelTooltip: Story = {
  args: {labelTooltip: 'Times are shown in your local timezone.'},
  render: (args: TimeInputProps) => {
    const [value, setValue] = useState<PlainTime | null>(TIME_0900);
    return <TimeInput {...args} onChange={setValue} value={value} />;
  },
};
