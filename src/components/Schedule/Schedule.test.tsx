import {Temporal} from '@js-temporal/polyfill';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {Component, useState, type ErrorInfo, type ReactNode} from 'react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {buttonRecipe} from '../Button/Button.recipe';
import {createEventFromISO} from './CalendarEvent';
import {createScheduleDayView} from './DayView';
import {createScheduleListView} from './ListView';
import {createScheduleMonthlyView} from './MonthlyView';
import {Schedule} from './Schedule';
import {createScheduleWeeklyView} from './WeeklyView';
import {
  enumerateDates,
  eventOccursOnDate,
  eventOverlapsRange,
  getScheduleRangeFromDates,
  sortEvents,
} from './dateMath';
import {useSchedulePaginationPlugin} from './plugins/PaginationPlugin';
import {useScheduleViewSelectorPlugin} from './plugins/ViewSelectorPlugin';
import type {
  CalendarEvent,
  Instant,
  ScheduleCategory,
  SchedulePlugin,
  ScheduleView,
} from './types';
import {
  createZonedDateTime,
  scheduleRangeToZonedDateTimeRange,
  zonedDateTimeFromInstant,
} from './zonedDateTime';

class ErrorBoundary extends Component<
  {children: ReactNode},
  {error: Error | null}
> {
  state: {error: Error | null} = {error: null};

  static getDerivedStateFromError(error: Error): {error: Error} {
    return {error};
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {}

  render(): ReactNode {
    return this.state.error == null ? (
      this.props.children
    ) : (
      <div role="alert">{this.state.error.message}</div>
    );
  }
}

function instantUTC(
  year: number,
  monthIndex: number,
  day: number,
  hour = 0,
  minute = 0,
): Instant {
  return Temporal.PlainDateTime.from({
    day,
    hour,
    minute,
    month: monthIndex + 1,
    year,
  }).toZonedDateTime('UTC').epochMilliseconds;
}

function mockCurrentTime(iso: string): void {
  vi.spyOn(Temporal.Now, 'instant').mockReturnValue(Temporal.Instant.from(iso));
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.setAttribute('popover-open', '');
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.removeAttribute('popover-open');
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

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
    expect(event.start).toBe(
      Temporal.Instant.from('2026-05-13T16:00:00.000Z').epochMilliseconds,
    );
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
        events={events}
        highlightDate={instantUTC(2026, 4, 13)}
        timezoneID="UTC"
        view={createScheduleMonthlyView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('schedule-event-visible')).toBeInTheDocument();
    });
    expect(screen.getByTestId('schedule-event-visible')).toHaveTextContent(
      '4:00 PMVisible sync',
    );
    expect(screen.getByTestId('schedule-event-all-day')).toHaveTextContent(
      'Design review',
    );
    expect(screen.getByTestId('schedule-event-all-day')).not.toHaveTextContent(
      'all day',
    );
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
        events={loader}
        timezoneID="UTC"
        view={createScheduleDayView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    const [start, end] = loader.mock.calls[0];
    expect(start).toBe(instantUTC(2026, 4, 13));
    expect(end).toBe(instantUTC(2026, 4, 14));
    expect(await screen.findByTestId('schedule-event-async')).toHaveTextContent(
      'Loaded event5:00 PM - 6:00 PM',
    );
  });

  it('does not re-fetch when an inline loader creates a new reference on re-render', async () => {
    const fetchFn = vi.fn(async (_start: Instant, _end: Instant) => {
      await Promise.resolve();
      return [
        createEventFromISO({
          end: '2026-05-13T18:00:00.000Z',
          id: 'inline-async',
          start: '2026-05-13T17:00:00.000Z',
          title: 'Inline event',
        }),
      ] as CalendarEvent[];
    });

    function Fixture({count}: {count: number}): React.JSX.Element {
      return (
        <Schedule
          categories={categories}
          data-testid={`schedule-${count}`}
          events={async (start, end) => fetchFn(start, end)}
          timezoneID="UTC"
          view={createScheduleDayView()}
          viewDate={instantUTC(2026, 4, 13)}
        />
      );
    }

    const {rerender} = render(<Fixture count={0} />);

    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByTestId('schedule-event-inline-async'),
    ).toBeInTheDocument();

    rerender(<Fixture count={1} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('schedule-event-inline-async'),
      ).toBeInTheDocument();
    });

    // Should still only have been called once since the cache is
    // instance-scoped and keyed by date range, not by function identity.
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('preserves unknown category labels while defaulting uncategorized events', () => {
    render(
      <Schedule
        categories={categories}
        events={[
          createEventFromISO({
            category: 'Incident',
            end: '2026-05-13T12:30:00.000Z',
            id: 'unknown-category',
            start: '2026-05-13T12:00:00.000Z',
            title: 'Incident review',
          }),
          createEventFromISO({
            end: '2026-05-13T13:30:00.000Z',
            id: 'missing-category',
            start: '2026-05-13T13:00:00.000Z',
            title: 'Open sync',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 14, minHour: 12})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByTestId('schedule-event-unknown-category'),
    ).toHaveTextContent('Incident review12:00 PM - 12:30 PM');
    expect(
      screen.getByTestId('schedule-event-missing-category'),
    ).toHaveTextContent('Open sync1:00 PM - 1:30 PM');
    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 12 PM. Incident review, Incident, 12:00 PM - 12:30 PM',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 1 PM. Open sync, Event, 1:00 PM - 1:30 PM',
      }),
    ).toBeInTheDocument();
  });

  it('renders loading state while async events are pending', () => {
    const pendingEvents = new Promise<CalendarEvent[]>(() => {});
    const loader = vi.fn(async () => pendingEvents);

    render(
      <Schedule
        events={loader}
        timezoneID="UTC"
        view={createScheduleDayView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('status', {name: 'Loading events'}),
    ).toBeInTheDocument();
  });

  it('throws loader rejection errors through the nearest error boundary', async () => {
    const loader = vi.fn(async () => Promise.reject('load failed'));

    render(
      <ErrorBoundary>
        <Schedule
          events={loader}
          timezoneID="UTC"
          view={createScheduleDayView()}
          viewDate={instantUTC(2026, 4, 13)}
        />
      </ErrorBoundary>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('load failed');
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
        events={listEvents}
        timezoneID="UTC"
        view={createScheduleListView({days: 7})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText('Visible sync')).toBeInTheDocument();
    expect(screen.getByText('Design review')).toBeInTheDocument();
    expect(screen.getAllByText('11:00 PM - 2:00 AM')).toHaveLength(2);
  });

  it('renders only the base day for an empty list range', () => {
    mockCurrentTime('2026-06-01T09:00:00.000Z');

    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleListView({days: 7})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 4,
        name: 'Wednesday, May 13, 2026',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        level: 4,
        name: 'Thursday, May 14, 2026',
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('No events')).not.toBeInTheDocument();
  });

  it('includes the current day in list view even when it has no events', () => {
    mockCurrentTime('2026-05-15T09:00:00.000Z');

    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleListView({days: 7})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 4,
        name: 'Wednesday, May 13, 2026',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 4,
        name: 'Friday, May 15, 2026',
      }),
    ).toHaveAttribute('aria-current', 'date');
    expect(
      screen.queryByRole('heading', {
        level: 4,
        name: 'Thursday, May 14, 2026',
      }),
    ).not.toBeInTheDocument();
  });

  it('includes days with list events and uses range-aware titles', () => {
    mockCurrentTime('2026-06-10T09:00:00.000Z');

    render(
      <Schedule
        events={[
          createEventFromISO({
            end: '2026-06-02T18:00:00.000Z',
            id: 'june-launch',
            start: '2026-06-02T17:00:00.000Z',
            title: 'June launch',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleListView({days: 7})}
        viewDate={instantUTC(2026, 4, 28)}
      />,
    );

    expect(
      screen.getByRole('region', {name: 'May - June 2026'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 4,
        name: 'Thursday, May 28, 2026',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 4,
        name: 'Tuesday, June 2, 2026',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('June launch')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        level: 4,
        name: 'Friday, May 29, 2026',
      }),
    ).not.toBeInTheDocument();
  });

  it('renders weekly view with the same month title as monthly view', () => {
    render(
      <Schedule
        categories={categories}
        events={events}
        highlightDate={instantUTC(2026, 4, 13)}
        timezoneID="UTC"
        view={createScheduleWeeklyView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getByRole('region', {name: 'May 2026'})).toBeInTheDocument();
  });

  it('uses a cross-month weekly range title and label', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({maxHour: 8, minHour: 8})}
        viewDate={instantUTC(2026, 5, 2)}
      />,
    );

    expect(
      screen.getByRole('region', {name: 'May - June 2026'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {level: 2, name: 'May - June 2026'}),
    ).toBeInTheDocument();
  });

  it('uses a cross-year weekly range title and label', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({maxHour: 8, minHour: 8})}
        viewDate={instantUTC(2026, 11, 30)}
      />,
    );

    expect(
      screen.getByRole('region', {name: 'December 2026 - January 2027'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'December 2026 - January 2027',
      }),
    ).toBeInTheDocument();
  });

  it('keeps day view labels specific while using the month title', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 8, minHour: 8})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('region', {name: 'Wednesday, May 13, 2026'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {level: 2, name: 'May 2026'}),
    ).toBeInTheDocument();
  });

  it('renders weekly view with a Sunday-start week by default', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({maxHour: 8, minHour: 8})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('columnheader', {name: 'Sunday, May 10, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
    expect(
      screen.getByRole('columnheader', {name: 'Saturday, May 16, 2026'}),
    ).toHaveAttribute('aria-colindex', '8');
    expect(
      screen.queryByRole('columnheader', {name: 'Sunday, May 17, 2026'}),
    ).not.toBeInTheDocument();
  });

  it('renders weekly view with a Monday-start week when configured', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({
          maxHour: 8,
          minHour: 8,
          weekStartsOn: 1,
        })}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('columnheader', {name: 'Monday, May 11, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
    expect(
      screen.getByRole('columnheader', {name: 'Sunday, May 17, 2026'}),
    ).toHaveAttribute('aria-colindex', '8');
    expect(
      screen.queryByRole('columnheader', {name: 'Sunday, May 10, 2026'}),
    ).not.toBeInTheDocument();
  });

  it('exposes monthly view as an ARIA grid', () => {
    render(
      <Schedule
        categories={categories}
        events={events}
        highlightDate={instantUTC(2026, 4, 13)}
        timezoneID="UTC"
        view={createScheduleMonthlyView()}
        viewDate={instantUTC(2026, 4, 13)}
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

  it('visually spans multi-day events in month view', () => {
    render(
      <Schedule
        categories={categories}
        events={[
          createEventFromISO({
            category: 'Planning',
            end: '2026-05-15',
            id: 'multi-day-month',
            start: '2026-05-13',
            title: 'Launch window',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleMonthlyView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByTestId('schedule-event-span-multi-day-month'),
    ).toHaveStyle({
      gridColumn: '4 / 7',
    });
  });

  it('includes month events in each covered day cell label', () => {
    render(
      <Schedule
        categories={categories}
        events={[
          createEventFromISO({
            category: 'Planning',
            end: '2026-05-15',
            id: 'multi-day-month',
            start: '2026-05-13',
            title: 'Launch window',
          }),
          createEventFromISO({
            category: 'Migration',
            end: '2026-05-14T02:00:00.000Z',
            id: 'overnight-month',
            start: '2026-05-13T23:00:00.000Z',
            title: 'Overnight migration',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleMonthlyView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('gridcell', {
        name: /Wednesday, May 13, 2026.*Launch window.*Overnight migration/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {
        name: /Thursday, May 14, 2026.*Launch window.*Overnight migration/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {
        name: /Friday, May 15, 2026.*Launch window/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('gridcell', {
        name: /Friday, May 15, 2026.*Overnight migration/,
      }),
    ).not.toBeInTheDocument();
  });

  it('exposes time grid views as ARIA grids', () => {
    render(
      <Schedule
        categories={categories}
        events={events}
        highlightDate={instantUTC(2026, 4, 13)}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 10, minHour: 8})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('grid', {name: 'Schedule time grid'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: 'Time'})).toHaveAttribute(
      'aria-colindex',
      '1',
    );
    expect(
      screen.getByRole('columnheader', {name: 'Wednesday, May 13, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
    expect(
      screen.getByRole('rowheader', {name: 'UTC all day'}),
    ).toHaveAttribute('aria-colindex', '1');
    expect(screen.getByRole('rowheader', {name: '8 AM'})).toHaveAttribute(
      'aria-colindex',
      '1',
    );
    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 all day. Design review, Design, all day',
      }),
    ).toHaveAttribute('aria-colindex', '2');
  });

  it('exposes timed events in accessible time grid cells', () => {
    render(
      <Schedule
        categories={categories}
        events={events}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 17, minHour: 16})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 4 PM. Visible sync, Sync, 4:00 PM - 4:30 PM',
      }),
    ).toBeInTheDocument();
  });

  it('exposes timed events in each overlapping time grid cell', () => {
    render(
      <Schedule
        categories={categories}
        events={[
          createEventFromISO({
            category: 'Migration',
            end: '2026-05-13T17:15:00.000Z',
            id: 'spanning',
            start: '2026-05-13T16:30:00.000Z',
            title: 'Spanning migration',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 18, minHour: 16})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 4 PM. Spanning migration, Migration, 4:30 PM - 5:15 PM',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 5 PM. Spanning migration, Migration, 4:30 PM - 5:15 PM',
      }),
    ).toBeInTheDocument();
  });

  it('sizes timed events by duration and renders time below the title', () => {
    render(
      <Schedule
        categories={categories}
        events={[
          createEventFromISO({
            category: 'Migration',
            end: '2026-05-13T10:30:00.000Z',
            id: 'duration',
            start: '2026-05-13T09:00:00.000Z',
            title: 'Duration migration',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleDayView({
          hourHeight: 100,
          maxHour: 11,
          minHour: 9,
        })}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    const event = screen.getByTestId('schedule-event-duration');
    expect(event).toHaveStyle({
      height: '145px',
      top: '2px',
    });
    expect(event).toHaveTextContent('Duration migration9:00 AM - 10:30 AM');
  });

  it('keeps short visible timed event slices tall enough for title and time', () => {
    render(
      <Schedule
        categories={categories}
        events={[
          createEventFromISO({
            category: 'Sync',
            end: '2026-05-13T00:15:00.000Z',
            id: 'short-slice',
            start: '2026-05-12T23:45:00.000Z',
            title: 'Midnight handoff',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleDayView({
          hourHeight: 100,
          maxHour: 1,
          minHour: 0,
        })}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getByTestId('schedule-event-short-slice')).toHaveStyle({
      height: '36px',
    });
    expect(screen.getByTestId('schedule-event-short-slice')).toHaveTextContent(
      'Midnight handoff11:45 PM - 12:15 AM',
    );
  });

  it('exposes all-day events in accessible all-day grid cells', () => {
    render(
      <Schedule
        categories={categories}
        events={events}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 10, minHour: 8})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 all day. Design review, Design, all day',
      }),
    ).toHaveAttribute('aria-colindex', '2');
  });

  it('renders default day time labels through the final hour', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleDayView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getByText('12 AM')).toBeInTheDocument();
    expect(screen.getByText('11 PM')).toBeInTheDocument();
  });

  it('renders default weekly time labels through the final hour', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getByText('12 AM')).toBeInTheDocument();
    expect(screen.getByText('11 PM')).toBeInTheDocument();
  });

  it('uses maxHour as an exclusive boundary for custom weekly ranges', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({maxHour: 10, minHour: 8})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getByText('8 AM')).toBeInTheDocument();
    expect(screen.getByText('9 AM')).toBeInTheDocument();
    expect(screen.queryByText('10 AM')).not.toBeInTheDocument();
  });

  it('applies compact hour heights to day view rows', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleDayView({
          hourHeight: 48,
          maxHour: 9,
          minHour: 8,
        })}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getByText('8 AM')).toHaveStyle({
      height: '48px',
      minHeight: '48px',
    });
    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 8 AM',
      }),
    ).toHaveStyle({height: '48px', minHeight: '48px'});
  });

  it('applies tall hour heights to weekly view rows', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({
          hourHeight: 132,
          maxHour: 9,
          minHour: 8,
        })}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getByText('8 AM')).toHaveStyle({
      height: '132px',
      minHeight: '132px',
    });
    expect(
      screen.getByRole('gridcell', {
        name: 'Sunday, May 10, 2026 8 AM',
      }),
    ).toHaveStyle({height: '132px', minHeight: '132px'});
  });

  it('marks the highlighted day in time grid views', async () => {
    mockCurrentTime('2026-05-13T09:30:00.000Z');

    render(
      <Schedule
        events={[]}
        highlightDate={instantUTC(2026, 4, 14)}
        timezoneID="UTC"
        view={createScheduleWeeklyView({maxHour: 10, minHour: 9})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('columnheader', {name: 'Thursday, May 14, 2026'}),
      ).toHaveAttribute('aria-current', 'date');
    });
  });

  it('renders the current-time line in the active time grid hour', async () => {
    mockCurrentTime('2026-05-13T09:30:00.000Z');

    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 10, minHour: 9})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(await screen.findByTestId('schedule-current-time-line')).toHaveStyle(
      {top: '50%'},
    );
  });

  it('renders the current-time marker in list view on the current day', async () => {
    mockCurrentTime('2026-05-13T09:30:00.000Z');

    render(
      <Schedule
        events={[
          createEventFromISO({
            end: '2026-05-13T09:00:00.000Z',
            id: 'before-now',
            start: '2026-05-13T08:30:00.000Z',
            title: 'Before now',
          }),
          createEventFromISO({
            end: '2026-05-13T11:00:00.000Z',
            id: 'after-now',
            start: '2026-05-13T10:30:00.000Z',
            title: 'After now',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleListView({days: 1})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 4,
          name: 'Wednesday, May 13, 2026',
        }),
      ).toHaveAttribute('aria-current', 'date');
    });
    expect(
      screen.getByTestId('schedule-list-current-time'),
    ).toBeInTheDocument();
  });

  it('marks past events from the mocked current time', async () => {
    mockCurrentTime('2026-05-13T09:30:00.000Z');

    render(
      <Schedule
        categories={categories}
        events={[
          createEventFromISO({
            category: 'Sync',
            end: '2026-05-13T08:30:00.000Z',
            id: 'past',
            start: '2026-05-13T08:00:00.000Z',
            title: 'Past sync',
          }),
          createEventFromISO({
            category: 'Sync',
            end: '2026-05-13T10:30:00.000Z',
            id: 'current',
            start: '2026-05-13T09:00:00.000Z',
            title: 'Current sync',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 11, minHour: 8})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('schedule-event-past')).toHaveAttribute(
        'data-state',
        'past',
      );
    });
    expect(screen.getByTestId('schedule-event-current')).not.toHaveAttribute(
      'data-state',
    );
  });

  it('calls onViewDateChange with the previous view date preserving time of day', () => {
    const onViewDateChange = vi.fn();

    function Fixture(): React.JSX.Element {
      const paginationPlugin = useSchedulePaginationPlugin({
        onViewDateChange,
      });
      return (
        <Schedule
          categories={categories}
          events={events}
          plugins={[paginationPlugin]}
          timezoneID="UTC"
          view={createScheduleDayView()}
          viewDate={instantUTC(2026, 4, 13, 15, 6)}
        />
      );
    }

    render(<Fixture />);

    fireEvent.click(screen.getByRole('button', {name: 'Previous day'}));
    expect(onViewDateChange).toHaveBeenCalledWith(
      instantUTC(2026, 4, 12, 15, 6),
    );
  });

  it('navigates monthly view across February and varying month lengths', () => {
    function Fixture(): React.JSX.Element {
      const [viewDate, setViewDate] = useState(() => instantUTC(2026, 1, 15));
      const paginationPlugin = useSchedulePaginationPlugin({
        onViewDateChange: setViewDate,
      });
      return (
        <Schedule
          events={events}
          highlightDate={instantUTC(2026, 1, 15)}
          plugins={[paginationPlugin]}
          timezoneID="UTC"
          view={createScheduleMonthlyView()}
          viewDate={viewDate}
        />
      );
    }

    render(<Fixture />);

    expect(
      screen.getByRole('grid', {name: 'February 2026'}),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Next month'}));
    expect(screen.getByRole('grid', {name: 'March 2026'})).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Previous month'}));
    expect(
      screen.getByRole('grid', {name: 'February 2026'}),
    ).toBeInTheDocument();
  });

  it('calls onViewDateChange with current time when Today is clicked', () => {
    const now = Temporal.Instant.from('2026-05-20T12:00:00Z');
    vi.spyOn(Temporal.Now, 'instant').mockReturnValue(now);
    const onViewDateChange = vi.fn();

    function Fixture(): React.JSX.Element {
      const paginationPlugin = useSchedulePaginationPlugin({
        onViewDateChange,
      });
      return (
        <Schedule
          events={events}
          plugins={[paginationPlugin]}
          timezoneID="UTC"
          view={createScheduleDayView()}
          viewDate={instantUTC(2026, 4, 13)}
        />
      );
    }

    render(<Fixture />);

    fireEvent.click(screen.getByRole('button', {name: 'Today'}));

    expect(onViewDateChange).toHaveBeenCalledWith(now.epochMilliseconds);
  });

  it('does not render pagination controls unless the pagination plugin is configured', () => {
    render(
      <Schedule
        events={events}
        timezoneID="UTC"
        view={createScheduleDayView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Previous day'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Today'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Next day'}),
    ).not.toBeInTheDocument();
  });

  it('renders pagination controls with the default button variant', () => {
    function Fixture(): React.JSX.Element {
      const paginationPlugin = useSchedulePaginationPlugin({
        onViewDateChange: vi.fn(),
      });
      return (
        <Schedule
          events={events}
          plugins={[paginationPlugin]}
          timezoneID="UTC"
          view={createScheduleDayView()}
          viewDate={instantUTC(2026, 4, 13)}
        />
      );
    }

    render(<Fixture />);

    const defaultIconButtonClassName = buttonRecipe({
      iconOnly: true,
      size: 'sm',
    }).root as string;
    const ghostIconButtonClassName = buttonRecipe({
      iconOnly: true,
      size: 'sm',
      variant: 'ghost',
    }).root as string;
    const todayClassName = buttonRecipe({size: 'sm'}).root as string;

    expect(screen.getByRole('button', {name: 'Previous day'})).toHaveClass(
      defaultIconButtonClassName,
    );
    expect(screen.getByRole('button', {name: 'Today'})).toHaveClass(
      todayClassName,
    );
    expect(screen.getByRole('button', {name: 'Next day'})).toHaveClass(
      defaultIconButtonClassName,
    );
    expect(screen.getByRole('button', {name: 'Previous day'})).not.toHaveClass(
      ghostIconButtonClassName,
    );
    expect(screen.getByRole('button', {name: 'Next day'})).not.toHaveClass(
      ghostIconButtonClassName,
    );
  });

  it('defaults highlightDate to current time at mount', () => {
    vi.spyOn(Temporal.Now, 'instant').mockReturnValue(
      Temporal.Instant.from('2026-05-14T12:00:00Z'),
    );

    render(
      <Schedule
        events={events}
        timezoneID="UTC"
        view={createScheduleMonthlyView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('gridcell', {name: /Thursday, May 14, 2026/}),
    ).toHaveAttribute('aria-current', 'date');
  });

  it('defaults timezoneID to the browser timezone', () => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const viewDate = instantUTC(2026, 4, 13, 1);
    const expectedMonth = Temporal.Instant.fromEpochMilliseconds(viewDate)
      .toZonedDateTimeISO(browserTimezone)
      .toPlainDate()
      .toLocaleString(undefined, {month: 'long', year: 'numeric'});

    render(
      <Schedule
        events={[]}
        view={createScheduleMonthlyView()}
        viewDate={viewDate}
      />,
    );

    expect(screen.getByRole('grid', {name: expectedMonth})).toBeInTheDocument();
  });

  it('renders multi-day day events on each covered list day', () => {
    render(
      <Schedule
        events={[
          createEventFromISO({
            category: 'Planning',
            end: '2026-05-15',
            id: 'multi-day',
            start: '2026-05-13',
            title: 'Launch window',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleListView({days: 4})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getAllByText('Launch window')).toHaveLength(3);
  });

  it('forwards ref, data-testid, className, and style to the root', () => {
    const ref = vi.fn();

    render(
      <Schedule
        className="custom-schedule"
        data-testid="schedule"
        events={[]}
        ref={ref}
        style={{color: 'red'}}
        timezoneID="UTC"
        view={createScheduleDayView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    const schedule = screen.getByTestId('schedule');
    expect(schedule).toHaveClass('custom-schedule');
    expect(schedule).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(schedule);
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
        events={events}
        plugins={[plugin]}
        timezoneID="UTC"
        view={createScheduleDayView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getByText('Custom start')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Previous day'}),
    ).not.toBeInTheDocument();
  });

  it('prepends pagination controls before existing start slot content', () => {
    const beforePaginationPlugin: SchedulePlugin = {
      renderHeader: (startContent, centerContent, endContent) => ({
        centerContent,
        endContent,
        startContent: (
          <>
            {startContent}
            <span data-testid="before-pagination">Before pagination</span>
          </>
        ),
      }),
    };
    const afterPaginationPlugin: SchedulePlugin = {
      renderHeader: (startContent, centerContent, endContent) => ({
        centerContent,
        endContent,
        startContent: (
          <>
            {startContent}
            <span data-testid="after-pagination">After pagination</span>
          </>
        ),
      }),
    };

    function ScheduleWithStartPlugins() {
      const paginationPlugin = useSchedulePaginationPlugin({
        onViewDateChange: vi.fn(),
      });
      return (
        <Schedule
          categories={categories}
          events={events}
          plugins={[
            beforePaginationPlugin,
            paginationPlugin,
            afterPaginationPlugin,
          ]}
          timezoneID="UTC"
          view={createScheduleDayView()}
          viewDate={instantUTC(2026, 4, 13)}
        />
      );
    }

    render(<ScheduleWithStartPlugins />);

    const previousButton = screen.getByRole('button', {name: 'Previous day'});
    const beforePagination = screen.getByTestId('before-pagination');
    const afterPagination = screen.getByTestId('after-pagination');
    expect(previousButton.compareDocumentPosition(beforePagination)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(beforePagination.compareDocumentPosition(afterPagination)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('renders an enabled view selector plugin and calls the change handler', () => {
    const onChangeView = vi.fn();
    const dayView = createScheduleDayView();
    const monthView = createScheduleMonthlyView();
    const viewOptions: {label: string; view: ScheduleView}[] = [
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
          events={events}
          plugins={[viewSelectorPlugin]}
          timezoneID="UTC"
          view={dayView}
          viewDate={instantUTC(2026, 4, 13)}
        />
      );
    }

    render(<ScheduleWithViewSelector />);

    const selectorButton = screen.getByRole('button', {name: /Day/});
    expect(selectorButton).toBeEnabled();

    fireEvent.click(selectorButton);

    const selectedItem = screen.getByRole('menuitem', {
      hidden: true,
      name: 'Day',
    });
    const unselectedItem = screen.getByRole('menuitem', {
      hidden: true,
      name: 'Month',
    });
    expect(
      within(selectedItem).getByTestId('schedule-view-selector-selected-icon'),
    ).toBeInTheDocument();
    expect(
      within(unselectedItem).queryByTestId(
        'schedule-view-selector-selected-icon',
      ),
    ).not.toBeInTheDocument();

    fireEvent.click(unselectedItem);
    expect(onChangeView).toHaveBeenCalledWith(monthView);
  });

  it('disables the view selector plugin when no change handler is provided', () => {
    const dayView = createScheduleDayView();
    const monthView = createScheduleMonthlyView();
    const viewOptions: {label: string; view: ScheduleView}[] = [
      {label: 'Month', view: monthView},
      {label: 'Day', view: dayView},
    ];

    function ScheduleWithViewSelector() {
      const viewSelectorPlugin = useScheduleViewSelectorPlugin(viewOptions);
      return (
        <Schedule
          categories={categories}
          events={events}
          plugins={[viewSelectorPlugin]}
          timezoneID="UTC"
          view={dayView}
          viewDate={instantUTC(2026, 4, 13)}
        />
      );
    }

    render(<ScheduleWithViewSelector />);

    expect(screen.getByRole('button', {name: /Day/})).toBeDisabled();
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

describe('dateMath', () => {
  it('enumerates dates in an exclusive range', () => {
    const start = Temporal.PlainDate.from('2026-03-07');
    const end = Temporal.PlainDate.from('2026-03-10');

    expect(enumerateDates(start, end).map(date => date.toString())).toEqual([
      '2026-03-07',
      '2026-03-08',
      '2026-03-09',
    ]);
  });

  it('creates schedule ranges from plain dates in a timezone', () => {
    const range = getScheduleRangeFromDates({
      endDate: Temporal.PlainDate.from('2026-03-09'),
      startDate: Temporal.PlainDate.from('2026-03-08'),
      timezoneID: 'America/Los_Angeles',
    });

    expect(range.start).toBe(
      Temporal.PlainDate.from('2026-03-08').toZonedDateTime(
        'America/Los_Angeles',
      ).epochMilliseconds,
    );
    expect(range.end).toBe(
      Temporal.PlainDate.from('2026-03-09').toZonedDateTime(
        'America/Los_Angeles',
      ).epochMilliseconds,
    );
  });

  it('checks day and instant event overlap against half-open ranges', () => {
    const range = getScheduleRangeFromDates({
      endDate: Temporal.PlainDate.from('2026-05-14'),
      startDate: Temporal.PlainDate.from('2026-05-13'),
      timezoneID: 'UTC',
    });
    const dayEvent = createEventFromISO({
      end: '2026-05-15',
      id: 'multi-day',
      start: '2026-05-10',
      title: 'Multi-day',
    });
    const boundaryEvent = createEventFromISO({
      end: '2026-05-14T01:00:00.000Z',
      id: 'boundary',
      start: '2026-05-14T00:00:00.000Z',
      title: 'Boundary',
    });

    expect(eventOverlapsRange(dayEvent, range, 'UTC')).toBe(true);
    expect(eventOverlapsRange(boundaryEvent, range, 'UTC')).toBe(false);
  });

  it('checks instant events across timezone day boundaries', () => {
    const event = createEventFromISO({
      end: '2026-05-14T02:00:00.000Z',
      id: 'overnight',
      start: '2026-05-13T23:00:00.000Z',
      title: 'Overnight',
    });

    expect(
      eventOccursOnDate(event, Temporal.PlainDate.from('2026-05-13'), 'UTC'),
    ).toBe(true);
    expect(
      eventOccursOnDate(event, Temporal.PlainDate.from('2026-05-14'), 'UTC'),
    ).toBe(true);
    expect(
      eventOccursOnDate(
        event,
        Temporal.PlainDate.from('2026-05-14'),
        'America/Los_Angeles',
      ),
    ).toBe(false);
  });
});

describe('zonedDateTime', () => {
  it('creates zoned date-times from instants', () => {
    const instant = instantUTC(2026, 4, 13, 7);
    const zoned = createZonedDateTime(instant, 'America/Los_Angeles');

    expect(zoned.instant).toBe(instant);
    expect(zoned.timezoneID).toBe('America/Los_Angeles');
    expect(zoned.toPlainDate().toString()).toBe('2026-05-13');
  });

  it('adds days and starts the day in the configured timezone', () => {
    const zoned = zonedDateTimeFromInstant(
      instantUTC(2026, 2, 8, 12),
      'America/Los_Angeles',
    );

    expect(zoned.startOfDay().toPlainDate().toString()).toBe('2026-03-08');
    expect(zoned.addDays(1).toPlainDate().toString()).toBe('2026-03-09');
  });

  it('converts schedule ranges to zoned date-time ranges', () => {
    const range = getScheduleRangeFromDates({
      endDate: Temporal.PlainDate.from('2026-05-14'),
      startDate: Temporal.PlainDate.from('2026-05-13'),
      timezoneID: 'UTC',
    });
    const [start, end] = scheduleRangeToZonedDateTimeRange(
      range,
      'America/Los_Angeles',
    );

    expect(start.timezoneID).toBe('America/Los_Angeles');
    expect(end.timezoneID).toBe('America/Los_Angeles');
    expect(start.instant).toBe(range.start);
    expect(end.instant).toBe(range.end);
  });
});
