import {Temporal} from '@js-temporal/polyfill';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {createEventFromISO} from './CalendarEvent';
import {createScheduleDayView} from './DayView';
import {createScheduleListView} from './ListView';
import {createScheduleMonthlyView} from './MonthlyView';
import {Schedule} from './Schedule';
import {createScheduleWeeklyView} from './WeeklyView';
import type {Instant, ScheduleView} from './types';

const events = [
  createEventFromISO({
    category: 'Planning',
    end: '2026-05-13',
    id: 'offsite',
    start: '2026-05-13',
    title: 'Planning offsite',
  }),
  createEventFromISO({
    category: 'Sync',
    end: '2026-05-13T16:30:00.000Z',
    id: 'sync',
    start: '2026-05-13T16:00:00.000Z',
    title: 'Team sync',
  }),
  createEventFromISO({
    category: 'Design',
    end: '2026-05-14T18:00:00.000Z',
    id: 'design',
    start: '2026-05-14T17:00:00.000Z',
    title: 'Design review',
  }),
];

const categories = [
  {color: 'blue' as const, label: 'Sync'},
  {color: 'purple' as const, label: 'Design'},
  {color: 'pink' as const, label: 'Planning'},
];

const meta: Meta<typeof Schedule> = {
  title: 'Components/Schedule',
  component: Schedule,
};

export default meta;
type Story = StoryObj<typeof meta>;

function instantUTC(year: number, monthIndex: number, day: number): Instant {
  return Temporal.PlainDateTime.from({
    day,
    month: monthIndex + 1,
    year,
  }).toZonedDateTime('UTC').epochMilliseconds;
}

function ScheduleStory({view}: {view: ScheduleView}) {
  const [viewDate, setViewDate] = useState<Instant>(() =>
    instantUTC(2026, 4, 13),
  );
  return (
    <Schedule
      categories={categories}
      events={events}
      highlightDate={instantUTC(2026, 4, 13)}
      onViewDateChange={setViewDate}
      timezoneID="UTC"
      view={view}
      viewDate={viewDate}
    />
  );
}

export const Month: Story = {
  render: () => <ScheduleStory view={createScheduleMonthlyView()} />,
};

export const Week: Story = {
  render: () => (
    <ScheduleStory view={createScheduleWeeklyView({maxHour: 18, minHour: 8})} />
  ),
};

export const Day: Story = {
  render: () => (
    <ScheduleStory view={createScheduleDayView({maxHour: 18, minHour: 8})} />
  ),
};

export const ListView: Story = {
  render: () => <ScheduleStory view={createScheduleListView({days: 7})} />,
};
