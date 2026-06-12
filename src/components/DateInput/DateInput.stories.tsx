/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {DateInput, type DateInputProps} from 'components/DateInput/DateInput';
import {plainDateCreate, type PlainDate} from 'internal/plainDate';

const meta = {
  title: 'Components/DateInput',
  component: DateInput,
  argTypes: {
    getIsDateDisabled: {control: false},
    max: {control: false},
    min: {control: false},
    value: {control: false},
  },
  args: {label: 'Due date'},
} satisfies Meta<DateInputProps>;

export default meta;
type Story = StoryObj<DateInputProps>;

export const Default: Story = {
  render: (args: DateInputProps) => {
    const [value, setValue] = useState<PlainDate | null>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return <DateInput {...args} onChange={setValue} value={value} />;
  },
};

export const Placeholder: Story = {
  render: (args: DateInputProps) => {
    const [value, setValue] = useState<PlainDate | null>(null);
    return <DateInput {...args} onChange={setValue} value={value} />;
  },
};

export const WithConstraints: Story = {
  args: {hasClear: true},
  render: (args: DateInputProps) => {
    const [value, setValue] = useState<PlainDate | null>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return (
      <DateInput
        {...args}
        max={plainDateCreate(2026, 5, 28)}
        min={plainDateCreate(2026, 5, 10)}
        onChange={setValue}
        value={value}
      />
    );
  },
};

export const Disabled: Story = {
  args: {isDisabled: true},
  render: (args: DateInputProps) => (
    <DateInput
      {...args}
      onChange={() => {}}
      value={plainDateCreate(2026, 5, 21)}
    />
  ),
};

export const Loading: Story = {
  args: {isLoading: true},
  render: (args: DateInputProps) => (
    <DateInput
      {...args}
      onChange={() => {}}
      value={plainDateCreate(2026, 5, 21)}
    />
  ),
};

export const WithDescription: Story = {
  args: {description: 'Choose the date this task is due.'},
  render: (args: DateInputProps) => {
    const [value, setValue] = useState<PlainDate | null>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return <DateInput {...args} onChange={setValue} value={value} />;
  },
};

export const Required: Story = {
  args: {isRequired: true},
  render: (args: DateInputProps) => {
    const [value, setValue] = useState<PlainDate | null>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return <DateInput {...args} onChange={setValue} value={value} />;
  },
};

export const Optional: Story = {
  args: {isOptional: true},
  render: (args: DateInputProps) => {
    const [value, setValue] = useState<PlainDate | null>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return <DateInput {...args} onChange={setValue} value={value} />;
  },
};

export const HiddenLabel: Story = {
  args: {isLabelHidden: true},
  render: (args: DateInputProps) => {
    const [value, setValue] = useState<PlainDate | null>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return <DateInput {...args} onChange={setValue} value={value} />;
  },
};

export const ErrorStatus: Story = {
  args: {status: {message: 'Date is required', type: 'error'}},
  render: (args: DateInputProps) => {
    const [value, setValue] = useState<PlainDate | null>(null);
    return <DateInput {...args} onChange={setValue} value={value} />;
  },
};

export const WarningStatus: Story = {
  args: {status: {message: 'Date is in the past', type: 'warning'}},
  render: (args: DateInputProps) => {
    const [value, setValue] = useState<PlainDate | null>(() =>
      plainDateCreate(2024, 1, 15),
    );
    return <DateInput {...args} onChange={setValue} value={value} />;
  },
};

export const SuccessStatus: Story = {
  args: {status: {message: 'Date is available', type: 'success'}},
  render: (args: DateInputProps) => {
    const [value, setValue] = useState<PlainDate | null>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return <DateInput {...args} onChange={setValue} value={value} />;
  },
};

export const Sizes: Story = {
  render: () => {
    const [sm, setSm] = useState<PlainDate | null>(() =>
      plainDateCreate(2026, 5, 21),
    );
    const [md, setMd] = useState<PlainDate | null>(() =>
      plainDateCreate(2026, 5, 21),
    );
    const [lg, setLg] = useState<PlainDate | null>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <DateInput label="Small" onChange={setSm} size="sm" value={sm} />
        <DateInput label="Medium" onChange={setMd} size="md" value={md} />
        <DateInput label="Large" onChange={setLg} size="lg" value={lg} />
      </div>
    );
  },
};

export const WithLabelTooltip: Story = {
  args: {labelTooltip: 'The date by which this task should be completed.'},
  render: (args: DateInputProps) => {
    const [value, setValue] = useState<PlainDate | null>(() =>
      plainDateCreate(2026, 5, 21),
    );
    return <DateInput {...args} onChange={setValue} value={value} />;
  },
};
