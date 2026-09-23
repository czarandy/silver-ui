import {Temporal} from '@js-temporal/polyfill';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {Text} from 'components/Text';
import {Timestamp} from 'components/Timestamp/Timestamp';

const SAMPLE = Temporal.Instant.from('2025-03-21T14:51:53Z');

const meta: Meta<typeof Timestamp> = {
  title: 'Components/Timestamp',
  component: Timestamp,
  args: {
    format: 'auto',
    value: SAMPLE,
  },
  argTypes: {
    format: {
      control: {type: 'select'},
      options: [
        'auto',
        'relative',
        'date',
        'time',
        'dateTime',
        'weekdayDateTime',
        'isoDate',
        'isoTime',
        'isoDateTime',
      ],
    },
    hasTooltip: {control: 'boolean'},
    isTimezoneShown: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

const formats = [
  'relative',
  'date',
  'time',
  'dateTime',
  'weekdayDateTime',
  'isoDate',
  'isoTime',
  'isoDateTime',
] as const;

export const AllFormats: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '0.75rem',
        gridTemplateColumns: 'auto 1fr',
      }}>
      {formats.map(format => (
        <div key={format} style={{display: 'contents'}}>
          <Text color="secondary" size="sm">
            {format}
          </Text>
          <Timestamp format={format} value={SAMPLE} />
        </div>
      ))}
    </div>
  ),
};

/**
 * `weekdayDateTime` is the friendly, human-readable format. It omits the year
 * for moments in the current year and includes it otherwise, so recent
 * timestamps stay short without making older ones ambiguous.
 */
export const WeekdayDateTime: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '0.75rem',
        gridTemplateColumns: 'auto 1fr',
      }}>
      <Text color="secondary" size="sm">
        this year
      </Text>
      <Timestamp
        format="weekdayDateTime"
        value={Temporal.Now.instant().subtract({hours: 30})}
      />
      <Text color="secondary" size="sm">
        an earlier year
      </Text>
      <Timestamp format="weekdayDateTime" value={SAMPLE} />
      <Text color="secondary" size="sm">
        with timezone
      </Text>
      <Timestamp
        format="weekdayDateTime"
        isTimezoneShown
        value={Temporal.Now.instant().subtract({hours: 30})}
      />
    </div>
  ),
};

export const Relative: Story = {
  args: {
    format: 'relative',
    value: Temporal.Now.instant().subtract({hours: 2}),
  },
};

export const WithTimezone: Story = {
  args: {
    isTimezoneShown: true,
  },
  argTypes: {
    format: {control: false},
  },
  render: args => (
    <div
      style={{
        display: 'grid',
        gap: '0.75rem',
        gridTemplateColumns: 'auto 1fr',
      }}>
      {formats.map(format => (
        <div key={format} style={{display: 'contents'}}>
          <Text color="secondary" size="sm">
            {format}
          </Text>
          <Timestamp {...args} format={format} />
        </div>
      ))}
    </div>
  ),
};

export const TooltipOnHover: Story = {
  args: {
    format: 'relative',
    value: Temporal.Now.instant().subtract({hours: 72}),
  },
};
