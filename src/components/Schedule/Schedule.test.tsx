import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {createEventFromISO} from './CalendarEvent';
import {createScheduleDayView} from './DayView';
import {createScheduleListView} from './ListView';
import {createScheduleMonthlyView} from './MonthlyView';
import {Schedule} from './Schedule';
import {createScheduleWeeklyView} from './WeeklyView';
import {sortEvents} from './dateMath';
import {useScheduleViewSelectorPlugin} from './plugins/ViewSelectorPlugin';
import type {
  CalendarEvent,
  Instant,
  ScheduleCategory,
  SchedulePlugin,
} from './types';

describe('createEventFromISO', () => {
  it('creates all-day PlainDate events from date-only ISO strings', () => {
    const event = createEventFromISO({
      category: 'Planning',
      end: '2026-05-14',
      id: 'planning',
      start: '2026-05-13',
      title: 'Planning offsite',
    });

    expect(event.start.toString()).toBe('2026-05-13');
    expect(event.end.toString()).toBe('2026-05-14');
  });

  it('creates instant events from date-time ISO strings', () => {
    const event = createEventFromISO({
      end: '2026-05-13T16:30:00.000Z',
      id: 'standup',
      start: '2026-05-13T16:00:00.000Z',
      title: 'Standup',
    });

    expect(typeof event.start).toBe('number');
    expect(event.start).toBe(Date.parse('2026-05-13T16:00:00.000Z'));
  });
});

describe('Schedule', () => {
  const categories: ScheduleCategory[] = [
    {color: 'blue', label: 'Sync'},
    {color: 'purple', label: 'Design'},
    {color: 'red', label: 'Blocked'},
    {color: 'pink', label: 'Migration'},
  ];
  const events: CalendarEvent[] = [
    createEventFromISO({
      category: 'Sync',
      end: '2026-05-13T16:30:00.000Z',
      id: 'visible',
      start: '2026-05-13T16:00:00.000Z',
      title: 'Visible sync',
    }),
    createEventFromISO({
      category: 'Design',
      end: '2026-05-13',
      id: 'all-day',
      start: '2026-05-13',
      title: 'Design review',
    }),
    createEventFromISO({
      category: 'Blocked',
      end: '2026-08-13',
      id: 'outside',
      start: '2026-08-13',
      title: 'Outside range',
    }),
  ];

  it('filters array events to the active view range', async () => {
    render(
      <Schedule
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        events={events}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
        view={createScheduleMonthlyView()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Visible sync, Sync, 4:00 PM - 4:30 PM'),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText('Design review, Design, all day'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Outside range')).not.toBeInTheDocument();
  });

  it('loads async events with instant range boundaries', async () => {
    const loader = vi.fn(async (_start: Instant, _end: Instant) => {
      await Promise.resolve();
      return [
        createEventFromISO({
          end: '2026-05-13T18:00:00.000Z',
          id: 'async',
          start: '2026-05-13T17:00:00.000Z',
          title: 'Loaded event',
        }),
      ] as CalendarEvent[];
    });

    render(
      <Schedule
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        events={loader}
        timezoneID="UTC"
        view={createScheduleDayView()}
      />,
    );

    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    const [start, end] = loader.mock.calls[0];
    expect(start).toBe(Date.UTC(2026, 4, 13));
    expect(end).toBe(Date.UTC(2026, 4, 14));
    expect(
      await screen.findByText('Loaded event, Event, 5:00 PM - 6:00 PM'),
    ).toBeInTheDocument();
  });

  it('renders list view grouped by localized day', () => {
    const listEvents = [
      ...events,
      createEventFromISO({
        category: 'Migration',
        end: '2026-05-14T02:00:00.000Z',
        id: 'overnight',
        start: '2026-05-13T23:00:00.000Z',
        title: 'Overnight migration',
      }),
    ];

    render(
      <Schedule
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        events={listEvents}
        timezoneID="UTC"
        view={createScheduleListView({days: 7})}
      />,
    );

    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText('Visible sync')).toBeInTheDocument();
    expect(screen.getByText('Design review')).toBeInTheDocument();
    expect(screen.getAllByText('11:00 PM - 2:00 AM')).toHaveLength(2);
  });

  it('renders weekly view with the same month title as monthly view', () => {
    render(
      <Schedule
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        events={events}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
        view={createScheduleWeeklyView()}
      />,
    );

    expect(screen.getByRole('region', {name: 'May 2026'})).toBeInTheDocument();
  });

  it('exposes monthly view as an ARIA grid', () => {
    render(
      <Schedule
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        events={events}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
        view={createScheduleMonthlyView()}
      />,
    );

    expect(screen.getByRole('grid', {name: 'May 2026'})).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'Wednesday'}),
    ).toHaveAttribute('aria-colindex', '4');
    expect(
      screen.getByRole('gridcell', {name: /Wednesday, May 13, 2026/}),
    ).toHaveAttribute('aria-current', 'date');
  });

  it('exposes time grid views as ARIA grids', () => {
    render(
      <Schedule
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        events={events}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 10, minHour: 8})}
      />,
    );

    expect(
      screen.getByRole('grid', {name: 'Schedule time grid'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'Wednesday, May 13, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 all day. Design review, Design, all day',
      }),
    ).toBeInTheDocument();
  });

  it('calls onChangeDate with the previous view date preserving time of day', () => {
    const onChangeDate = vi.fn();
    render(
      <Schedule
        categories={categories}
        date={Date.UTC(2026, 4, 13, 15, 6)}
        events={events}
        onChangeDate={onChangeDate}
        timezoneID="UTC"
        view={createScheduleDayView()}
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Previous day'}));
    expect(onChangeDate).toHaveBeenCalledWith(Date.UTC(2026, 4, 12, 15, 6));
  });

  it('allows plugins to customize header slots', () => {
    const plugin: SchedulePlugin = {
      renderHeader: (_startContent, centerContent, endContent) => ({
        centerContent,
        endContent,
        startContent: <span>Custom start</span>,
      }),
    };

    render(
      <Schedule
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        events={events}
        plugins={[plugin]}
        timezoneID="UTC"
        view={createScheduleDayView()}
      />,
    );

    expect(screen.getByText('Custom start')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Previous day'}),
    ).not.toBeInTheDocument();
  });

  it('renders a view selector plugin in the header end slot', () => {
    const onChangeView = vi.fn();
    const dayView = createScheduleDayView();
    const monthView = createScheduleMonthlyView();
    const viewOptions = [
      {label: 'Month', view: monthView},
      {label: 'Day', view: dayView},
    ];

    function ScheduleWithViewSelector() {
      const viewSelectorPlugin = useScheduleViewSelectorPlugin(viewOptions, {
        onChangeView,
      });
      return (
        <Schedule
          categories={categories}
          date={Date.UTC(2026, 4, 13)}
          events={events}
          plugins={[viewSelectorPlugin]}
          timezoneID="UTC"
          view={dayView}
        />
      );
    }

    render(<ScheduleWithViewSelector />);

    expect(screen.getByRole('button', {name: /Day/})).toBeInTheDocument();
  });
});

describe('sortEvents', () => {
  it('sorts mixed all-day and instant events by start time', () => {
    const sortedEvents = sortEvents(
      [
        createEventFromISO({
          end: '2026-05-14T17:00:00.000Z',
          id: 'instant-later',
          start: '2026-05-14T16:00:00.000Z',
          title: 'A later timed event',
        }),
        createEventFromISO({
          end: '2026-05-13',
          id: 'all-day-earlier',
          start: '2026-05-13',
          title: 'Z earlier all-day event',
        }),
        createEventFromISO({
          end: '2026-05-12T17:00:00.000Z',
          id: 'instant-earliest',
          start: '2026-05-12T16:00:00.000Z',
          title: 'Middle timed event',
        }),
      ],
      'UTC',
    );

    expect(sortedEvents.map(event => event.id)).toEqual([
      'instant-earliest',
      'all-day-earlier',
      'instant-later',
    ]);
  });
});
