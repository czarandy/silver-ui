import {Temporal} from '@js-temporal/polyfill';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {
  DateTimeInput,
  type DateTimeInputProps,
  type PlainDateTime,
} from './DateTimeInput';

function DateTimeStory(args: DateTimeInputProps): React.JSX.Element {
  const [value, setValue] = useState<PlainDateTime | undefined>(args.value);
  return <DateTimeInput {...args} onChange={setValue} value={value} />;
}

const meta = {
  title: 'Components/DateTimeInput',
  component: DateTimeInput,
  argTypes: {
    getIsDateDisabled: {control: false},
    max: {control: false},
    min: {control: false},
    value: {control: false},
  },
  args: {label: 'Meeting'},
  render: (args: DateTimeInputProps): React.JSX.Element => (
    <DateTimeStory {...args} />
  ),
} satisfies Meta<DateTimeInputProps>;

export default meta;
type Story = StoryObj<DateTimeInputProps>;

export const Default: Story = {
  args: {value: Temporal.PlainDateTime.from('2026-05-21T09:00')},
};

export const Empty: Story = {};

export const WithSeconds: Story = {
  args: {
    hasSeconds: true,
    value: Temporal.PlainDateTime.from('2026-05-21T09:30:45'),
  },
};

export const WithConstraints: Story = {
  args: {
    min: Temporal.PlainDateTime.from('2026-05-01T08:00'),
    max: Temporal.PlainDateTime.from('2026-05-31T18:00'),
    value: Temporal.PlainDateTime.from('2026-05-15T12:00'),
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    value: Temporal.PlainDateTime.from('2026-05-21T09:00'),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    value: Temporal.PlainDateTime.from('2026-05-21T09:00'),
  },
};

export const Error: Story = {
  args: {
    status: {message: 'Please select a valid date and time.', type: 'error'},
    value: Temporal.PlainDateTime.from('2026-05-21T09:00'),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    value: Temporal.PlainDateTime.from('2026-05-21T09:00'),
  },
};
