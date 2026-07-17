import {Temporal} from '@js-temporal/polyfill';
import {
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {Component, useState, type ErrorInfo, type ReactNode} from 'react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {buttonRecipe} from 'components/Button/Button.recipe';
import {createEventFromISO} from 'components/Schedule/CalendarEvent';
import {createScheduleDayView} from 'components/Schedule/DayView';
import {createScheduleListView} from 'components/Schedule/ListView';
import {createScheduleMonthlyView} from 'components/Schedule/MonthlyView';
import {scheduleMonthlyViewRecipe} from 'components/Schedule/MonthlyView.recipe';
import {Schedule} from 'components/Schedule/Schedule';
import {scheduleRecipe} from 'components/Schedule/Schedule.recipe';
import {scheduleEventRecipe} from 'components/Schedule/ScheduleEvent.recipe';
import {scheduleTimeGridViewRecipe} from 'components/Schedule/TimeGridView.recipe';
import {createScheduleWeeklyView} from 'components/Schedule/WeeklyView';
import {
  enumerateDates,
  eventOccursOnDate,
  eventOverlapsRange,
  getScheduleRangeFromDates,
  sortEvents,
} from 'components/Schedule/dateMath';
import {
  useScheduleEventCreatePlugin,
  type ScheduleEventDraft,
} from 'components/Schedule/plugins/EventCreatePlugin';
import {
  useScheduleEventMovePlugin,
  type ScheduleEventMoveChange,
} from 'components/Schedule/plugins/EventMovePlugin';
import {useScheduleEventPopoverPlugin} from 'components/Schedule/plugins/EventPopoverPlugin';
import {
  useScheduleEventResizePlugin,
  type ScheduleEventResizeChange,
} from 'components/Schedule/plugins/EventResizePlugin';
import {useSchedulePaginationPlugin} from 'components/Schedule/plugins/PaginationPlugin';
import {ScheduleEventPopoverContent} from 'components/Schedule/plugins/ScheduleEventPopoverContent';
import {useScheduleViewSelectorPlugin} from 'components/Schedule/plugins/ViewSelectorPlugin';
import {
  createScheduleZonedInstant,
  scheduleRangeToScheduleZonedInstantRange,
  scheduleZonedInstantFromInstant,
} from 'components/Schedule/scheduleZonedInstant';
import type {
  CalendarEvent,
  Instant,
  ScheduleCategory,
  ScheduleHeight,
  SchedulePlugin,
  ScheduleView,
} from 'components/Schedule/types';
import type {DayOfWeek} from 'internal/dateTypes';

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

function createDragDataTransfer(): Pick<
  DataTransfer,
  'setData' | 'setDragImage'
> {
  return {
    setData: vi.fn(),
    setDragImage: vi.fn(),
  };
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

  it('rejects invalid date-only ISO strings', () => {
    expect(() =>
      createEventFromISO({
        end: '2026-13-45',
        id: 'invalid-date',
        start: '2026-13-44',
        title: 'Invalid date',
      }),
    ).toThrow(RangeError);
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

  describe.each<ScheduleHeight>(['auto', 'fill'])('%s height', height => {
    it.each([
      {
        createView: () => createScheduleDayView({maxHour: 10, minHour: 8}),
        getFrame: () =>
          screen.getByRole('region', {
            name: 'Wednesday, May 13, 2026',
          }),
        getSurface: () =>
          screen.getByRole('grid', {name: 'Schedule time grid'}),
        name: 'day',
      },
      {
        createView: () => createScheduleWeeklyView({maxHour: 10, minHour: 8}),
        getFrame: () => screen.getByRole('region', {name: 'May 2026'}),
        getSurface: () =>
          screen.getByRole('grid', {name: 'Schedule time grid'}),
        name: 'week',
      },
      {
        createView: () => createScheduleMonthlyView(),
        getFrame: () => screen.getByRole('region', {name: 'May 2026'}),
        getSurface: () => screen.getByRole('grid', {name: 'May 2026'}),
        name: 'month',
      },
      {
        createView: () => createScheduleListView({days: 7}),
        getFrame: () => screen.getByRole('region', {name: 'May 2026'}),
        getSurface: () => screen.getByRole('region', {name: /events$/}),
        name: 'list',
      },
    ])(
      'applies the layout to the $name view',
      ({createView, getFrame, getSurface}) => {
        render(
          <Schedule
            data-testid="schedule"
            events={events}
            height={height}
            highlightDate={instantUTC(2026, 4, 13)}
            timezoneID="UTC"
            view={createView()}
            viewDate={instantUTC(2026, 4, 13)}
          />,
        );

        const classes = scheduleRecipe({height});
        const root = screen.getByTestId('schedule');
        const frame = getFrame();
        const surface = getSurface();
        const frameClasses = classes.frame?.split(' ') ?? [];
        const rootClasses = classes.root?.split(' ') ?? [];
        const surfaceClasses = classes.surface?.split(' ') ?? [];

        expect(rootClasses).not.toHaveLength(0);
        expect(frameClasses).not.toHaveLength(0);
        expect(surfaceClasses).not.toHaveLength(0);
        expect(root).toHaveClass(...rootClasses);
        expect(frame).toHaveClass(...frameClasses);
        expect(surface).toHaveClass(...surfaceClasses);
        expect(surface).toHaveAccessibleName();
        expect(surface).toHaveAttribute('tabindex', '0');
      },
    );
  });

  it('keeps time-grid headers and all-day events fixed above the scrolling hours', () => {
    render(
      <Schedule
        events={events}
        height="fill"
        highlightDate={instantUTC(2026, 4, 13)}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 10, minHour: 8})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    const fixedRows = screen.getByTestId('schedule-time-grid-fixed-rows');
    const timeRows = screen.getByTestId('schedule-time-grid-time-rows');
    const fillClasses = scheduleTimeGridViewRecipe({height: 'fill'});
    const fixedRowClasses = fillClasses.fixedRows?.split(' ') ?? [];
    const timeRowClasses = fillClasses.timeRows?.split(' ') ?? [];

    expect(fixedRowClasses).not.toHaveLength(0);
    expect(timeRowClasses).not.toHaveLength(0);
    expect(fixedRows).toHaveClass(...fixedRowClasses);
    expect(timeRows).toHaveClass(...timeRowClasses);
    expect(
      within(fixedRows).getByRole('columnheader', {
        name: 'Wednesday, May 13, 2026',
      }),
    ).toBeInTheDocument();
    expect(
      within(fixedRows).getByRole('rowheader', {name: 'UTC all day'}),
    ).toBeInTheDocument();
    expect(
      within(fixedRows).getByTestId('schedule-event-all-day'),
    ).toBeInTheDocument();
    expect(
      within(timeRows).getByTestId('schedule-time-grid-cell-2026-05-13-8'),
    ).toBeInTheDocument();
  });

  it('defaults to auto height behavior', () => {
    render(
      <Schedule
        data-testid="schedule"
        events={[]}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 10, minHour: 8})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    const autoClasses = scheduleRecipe({height: 'auto'});
    const rootClasses = autoClasses.root?.split(' ') ?? [];
    const surfaceClasses = autoClasses.surface?.split(' ') ?? [];

    expect(rootClasses).not.toHaveLength(0);
    expect(surfaceClasses).not.toHaveLength(0);
    expect(screen.getByTestId('schedule')).toHaveClass(...rootClasses);
    expect(screen.getByRole('grid', {name: 'Schedule time grid'})).toHaveClass(
      ...surfaceClasses,
    );
  });

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

  it('applies category colors from the categories prop', () => {
    render(
      <Schedule
        categories={[{color: 'yellow', label: 'Launch'}]}
        events={[
          createEventFromISO({
            category: 'Launch',
            end: '2026-05-13',
            id: 'category-color',
            start: '2026-05-13',
            title: 'Launch review',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 9, minHour: 8})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getByTestId('schedule-event-category-color')).toHaveClass(
      scheduleEventRecipe({color: 'yellow', isPast: true}).event as string,
    );
  });

  it.each([
    {isInteractive: false, tagName: 'DIV'},
    {isInteractive: true, tagName: 'BUTTON'},
  ])(
    'applies event plugin props to $tagName list event roots',
    ({isInteractive, tagName}) => {
      const getEventProps = vi.fn();
      const event = events[0];
      const plugin: SchedulePlugin = {
        getEventProps: props => {
          getEventProps(props);
          return {
            'aria-description': 'Example',
            'data-example': 'present',
          };
        },
        renderEventPopover: isInteractive
          ? () => <span>Details</span>
          : undefined,
      };

      render(
        <Schedule
          categories={categories}
          events={[event]}
          plugins={[plugin]}
          timezoneID="UTC"
          view={createScheduleListView({days: 7})}
          viewDate={instantUTC(2026, 4, 13)}
        />,
      );

      const eventRoot = screen.getByTestId('schedule-event-visible');
      expect(eventRoot.tagName).toBe(tagName);
      expect(eventRoot).toHaveAttribute('aria-description', 'Example');
      expect(eventRoot).toHaveAttribute('data-example', 'present');
      expect(getEventProps).toHaveBeenCalledWith({
        event,
        layout: 'inline',
        timezoneID: 'UTC',
      });
    },
  );

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

  it('keeps the header mounted across the initial async load', async () => {
    let resolveEvents: (events: CalendarEvent[]) => void = () => {};
    const eventsPromise = new Promise<CalendarEvent[]>(resolve => {
      resolveEvents = resolve;
    });
    const loader = vi.fn(async () => eventsPromise);
    const plugin: SchedulePlugin = {
      renderHeader: (startContent, centerContent, endContent) => ({
        centerContent,
        endContent: (
          <>
            {endContent}
            <button data-testid="header-plugin-button" type="button">
              Settings
            </button>
          </>
        ),
        startContent,
      }),
    };

    render(
      <Schedule
        events={loader}
        plugins={[plugin]}
        timezoneID="UTC"
        view={createScheduleDayView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    const button = screen.getByTestId('header-plugin-button');
    expect(
      screen.getByRole('status', {name: 'Loading events'}),
    ).toBeInTheDocument();

    resolveEvents([
      createEventFromISO({
        end: '2026-05-13T18:00:00.000Z',
        id: 'loaded',
        start: '2026-05-13T17:00:00.000Z',
        title: 'Loaded event',
      }),
    ]);

    expect(
      await screen.findByTestId('schedule-event-loaded'),
    ).toBeInTheDocument();
    // The same node, not a remounted copy: state held by header controls (an
    // open popover, focus) survives the load completing.
    expect(screen.getByTestId('header-plugin-button')).toBe(button);
    expect(
      screen.queryByRole('status', {name: 'Loading events'}),
    ).not.toBeInTheDocument();
  });

  it('throws loader rejection errors through the nearest error boundary', async () => {
    // The loader rejection is intentional and caught by the ErrorBoundary;
    // silence React's expected error logging for the thrown component tree.
    vi.spyOn(console, 'error').mockImplementation(() => {});
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

  it('hides weekend columns when hiddenDays is set', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({
          hiddenDays: [0, 6],
          maxHour: 8,
          minHour: 8,
        })}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('columnheader', {name: 'Monday, May 11, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
    expect(
      screen.getByRole('columnheader', {name: 'Friday, May 15, 2026'}),
    ).toHaveAttribute('aria-colindex', '6');
    expect(
      screen.queryByRole('columnheader', {name: 'Sunday, May 10, 2026'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', {name: 'Saturday, May 16, 2026'}),
    ).not.toBeInTheDocument();
  });

  it('drops an interior hidden day but keeps the surrounding columns', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({
          hiddenDays: [3],
          maxHour: 8,
          minHour: 8,
        })}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('columnheader', {name: 'Sunday, May 10, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
    expect(
      screen.getByRole('columnheader', {name: 'Saturday, May 16, 2026'}),
    ).toHaveAttribute('aria-colindex', '7');
    expect(
      screen.queryByRole('columnheader', {name: 'Wednesday, May 13, 2026'}),
    ).not.toBeInTheDocument();
  });

  it('renders the full week when hiddenDays is empty', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({
          hiddenDays: [],
          maxHour: 8,
          minHour: 8,
        })}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('columnheader', {name: 'Sunday, May 10, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
    expect(
      screen.getByRole('columnheader', {name: 'Saturday, May 16, 2026'}),
    ).toHaveAttribute('aria-colindex', '8');
  });

  it('ignores duplicate and out-of-range hiddenDays values', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({
          hiddenDays: [0, 0, 6, 9 as DayOfWeek, -1 as DayOfWeek],
          maxHour: 8,
          minHour: 8,
        })}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('columnheader', {name: 'Monday, May 11, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
    expect(
      screen.getByRole('columnheader', {name: 'Friday, May 15, 2026'}),
    ).toHaveAttribute('aria-colindex', '6');
    expect(
      screen.queryByRole('columnheader', {name: 'Sunday, May 10, 2026'}),
    ).not.toBeInTheDocument();
  });

  it('renders the full week when every day is hidden', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({
          hiddenDays: [0, 1, 2, 3, 4, 5, 6],
          maxHour: 8,
          minHour: 8,
        })}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByRole('columnheader', {name: 'Sunday, May 10, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
    expect(
      screen.getByRole('columnheader', {name: 'Saturday, May 16, 2026'}),
    ).toHaveAttribute('aria-colindex', '8');
  });

  it('loads async events with the trimmed hidden-day range', async () => {
    const loader = vi.fn(async (_start: Instant, _end: Instant) => {
      await Promise.resolve();
      return [] as CalendarEvent[];
    });

    render(
      <Schedule
        events={loader}
        timezoneID="UTC"
        view={createScheduleWeeklyView({
          hiddenDays: [0, 6],
          maxHour: 8,
          minHour: 8,
        })}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    const [start, end] = loader.mock.calls[0];
    expect(start).toBe(instantUTC(2026, 4, 11));
    expect(end).toBe(instantUTC(2026, 4, 16));
  });

  it('renders an all-day event spanning a hidden day as separate pills', () => {
    const spanningEvent = createEventFromISO({
      category: 'Design',
      end: '2026-05-18',
      id: 'spanning',
      start: '2026-05-15',
      title: 'Weekend retreat',
    });
    const weeklyView = createScheduleWeeklyView({
      hiddenDays: [0, 6],
      maxHour: 8,
      minHour: 8,
    });

    const {rerender} = render(
      <Schedule
        categories={categories}
        events={[spanningEvent]}
        timezoneID="UTC"
        view={weeklyView}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    // Friday May 15 is the only visible day this event covers in this week.
    expect(screen.getAllByTestId('schedule-event-spanning')).toHaveLength(1);
    expect(
      screen.queryByRole('columnheader', {name: 'Saturday, May 16, 2026'}),
    ).not.toBeInTheDocument();

    rerender(
      <Schedule
        categories={categories}
        events={[spanningEvent]}
        timezoneID="UTC"
        view={weeklyView}
        viewDate={instantUTC(2026, 4, 20)}
      />,
    );

    // The following week shows a second, unconnected pill on Monday May 18.
    expect(screen.getAllByTestId('schedule-event-spanning')).toHaveLength(1);
    expect(
      screen.getByRole('columnheader', {name: 'Monday, May 18, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
  });

  it('advances exactly one week at a time when days are hidden', () => {
    function Fixture(): React.JSX.Element {
      const [viewDate, setViewDate] = useState(() => instantUTC(2026, 4, 13));
      const paginationPlugin = useSchedulePaginationPlugin({
        onViewDateChange: setViewDate,
      });
      return (
        <Schedule
          events={[]}
          plugins={[paginationPlugin]}
          timezoneID="UTC"
          view={createScheduleWeeklyView({
            hiddenDays: [0, 6],
            maxHour: 8,
            minHour: 8,
          })}
          viewDate={viewDate}
        />
      );
    }

    render(<Fixture />);

    fireEvent.click(screen.getByRole('button', {name: 'Next week'}));
    expect(
      screen.getByRole('columnheader', {name: 'Monday, May 18, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
    expect(
      screen.getByRole('columnheader', {name: 'Friday, May 22, 2026'}),
    ).toHaveAttribute('aria-colindex', '6');

    fireEvent.click(screen.getByRole('button', {name: 'Next week'}));
    expect(
      screen.getByRole('columnheader', {name: 'Monday, May 25, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');

    fireEvent.click(screen.getByRole('button', {name: 'Previous week'}));
    expect(
      screen.getByRole('columnheader', {name: 'Monday, May 18, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
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

  it('nudges only two-digit today numbers to stay centered in the circle', () => {
    // The 1px end margin visually centers a tabular two-digit number inside the
    // today circle; single-digit numbers already center cleanly without it.
    const todayTextClasses = (isTwoDigit: boolean) =>
      (
        scheduleMonthlyViewRecipe({isToday: true, isTwoDigit}).todayText ?? ''
      ).split(' ');
    const singleDigitClasses = todayTextClasses(false);
    const marginClass = todayTextClasses(true).find(
      className => !singleDigitClasses.includes(className),
    );
    expect(marginClass).toBeDefined();

    const {container, unmount} = render(
      <Schedule
        events={[]}
        highlightDate={instantUTC(2026, 4, 13)}
        timezoneID="UTC"
        view={createScheduleMonthlyView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );
    const twoDigitCell = within(container).getByRole('gridcell', {
      name: /Wednesday, May 13, 2026/,
    });
    expect(within(twoDigitCell).getByText('13')).toHaveClass(marginClass!);
    unmount();

    render(
      <Schedule
        events={[]}
        highlightDate={instantUTC(2026, 4, 5)}
        timezoneID="UTC"
        view={createScheduleMonthlyView()}
        viewDate={instantUTC(2026, 4, 5)}
      />,
    );
    const oneDigitCell = screen.getByRole('gridcell', {
      name: /Tuesday, May 5, 2026/,
    });
    expect(within(oneDigitCell).getByText('5')).not.toHaveClass(marginClass!);
  });

  it('renders monthly view with a Monday-start week when configured', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleMonthlyView({weekStartsOn: 1})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(screen.getByRole('columnheader', {name: 'Monday'})).toHaveAttribute(
      'aria-colindex',
      '1',
    );
    expect(screen.getByRole('columnheader', {name: 'Sunday'})).toHaveAttribute(
      'aria-colindex',
      '7',
    );
    expect(
      screen.getByRole('gridcell', {name: /Monday, April 27, 2026/}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('gridcell', {name: /Sunday, April 26, 2026/}),
    ).not.toBeInTheDocument();
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

  it('visually spans month events against the configured week start', () => {
    render(
      <Schedule
        categories={categories}
        events={[
          createEventFromISO({
            category: 'Planning',
            end: '2026-05-15',
            id: 'monday-start-month',
            start: '2026-05-13',
            title: 'Launch window',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleMonthlyView({weekStartsOn: 1})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByTestId('schedule-event-span-monday-start-month'),
    ).toHaveStyle({
      gridColumn: '3 / 6',
    });
  });

  it('collapses month events that do not fit into a see-more popover', () => {
    const overflowEvents = Array.from({length: 5}, (_, index) =>
      createEventFromISO({
        category: 'Planning',
        end: '2026-05-13',
        id: `overflow-${index + 1}`,
        start: '2026-05-13',
        title: `Overflow ${index + 1}`,
      }),
    );

    render(
      <Schedule
        categories={categories}
        events={overflowEvents}
        timezoneID="UTC"
        view={createScheduleMonthlyView()}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByTestId('schedule-event-span-overflow-1'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('schedule-event-span-overflow-2'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('schedule-event-span-overflow-3'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('schedule-event-span-overflow-4'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('schedule-event-span-overflow-5'),
    ).not.toBeInTheDocument();

    const seeMore = screen.getByRole('button', {
      name: 'Show 2 more events for Wednesday, May 13, 2026',
    });
    expect(seeMore).toHaveTextContent('+2 more');

    fireEvent.click(seeMore);
    expect(seeMore).toHaveAttribute('aria-expanded', 'true');

    const popover = screen.getByTestId('schedule-month-see-more-2026-05-13');
    expect(
      within(popover).getByText('Wednesday, May 13, 2026'),
    ).toBeInTheDocument();
    expect(
      within(popover).getByTestId('schedule-event-overflow-1'),
    ).toHaveTextContent('Overflow 1');
    expect(
      within(popover).getByTestId('schedule-event-overflow-5'),
    ).toHaveTextContent('Overflow 5');
  });

  it('shows more month events before collapsing when row height is taller', () => {
    const overflowEvents = Array.from({length: 5}, (_, index) =>
      createEventFromISO({
        category: 'Planning',
        end: '2026-05-13',
        id: `tall-month-${index + 1}`,
        start: '2026-05-13',
        title: `Tall month ${index + 1}`,
      }),
    );

    render(
      <Schedule
        categories={categories}
        events={overflowEvents}
        timezoneID="UTC"
        view={createScheduleMonthlyView({monthRowHeight: 172})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    expect(
      screen.getByTestId('schedule-event-span-tall-month-1'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('schedule-event-span-tall-month-5'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Show 2 more events for Wednesday, May 13, 2026',
      }),
    ).not.toBeInTheDocument();
  });

  it('shows every month event and grows the week row when monthRowHeight is auto', () => {
    const overflowEvents = Array.from({length: 6}, (_, index) =>
      createEventFromISO({
        category: 'Planning',
        end: '2026-05-13',
        id: `auto-month-${index + 1}`,
        start: '2026-05-13',
        title: `Auto month ${index + 1}`,
      }),
    );

    render(
      <Schedule
        categories={categories}
        events={overflowEvents}
        timezoneID="UTC"
        view={createScheduleMonthlyView({monthRowHeight: 'auto'})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    // Every event is rendered, including ones that would overflow a fixed row.
    for (let index = 1; index <= 6; index += 1) {
      expect(
        screen.getByTestId(`schedule-event-span-auto-month-${index}`),
      ).toBeInTheDocument();
    }
    // No "+N more" collapse happens in auto mode.
    expect(
      screen.queryByRole('button', {name: /more events for/}),
    ).not.toBeInTheDocument();

    // The week row grows to fit the busy day via explicit per-week tracks. Six
    // stacked events (levels 0-5) need 30 + 5*22 + 20 + 4 = 164px.
    const cellGrid = screen.getByTestId('schedule-month-grid');
    expect(cellGrid.style.gridTemplateRows).toContain('164px');
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

    // The scrollable grid is a tab stop so keyboard-only users can scroll it
    // (axe `scrollable-region-focusable`).
    expect(
      screen.getByRole('grid', {name: 'Schedule time grid'}),
    ).toHaveAttribute('tabindex', '0');
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

  it('baseline-aligns the weekday and date number in time grid headers', () => {
    render(
      <Schedule
        events={[]}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 10, minHour: 8})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );
    const classes = scheduleTimeGridViewRecipe();

    // eslint-disable-next-line testing-library/no-node-access -- verifying the alignment class on the header content wrapper
    expect(screen.getByText('13').parentElement).toHaveClass(
      classes.dayHeaderContent ?? '',
    );
    expect(classes.dayHeaderContent).toContain('silver-ai_baseline');
  });

  it('collapses overflowing all-day time grid events into a see-more popover', () => {
    mockCurrentTime('2026-05-12T12:00:00Z');

    const overflowEvents = Array.from({length: 5}, (_, index) =>
      createEventFromISO({
        category: 'Sync',
        end: '2026-05-13',
        id: `all-day-overflow-${index + 1}`,
        start: '2026-05-13',
        title: `All-day overflow ${index + 1}`,
      }),
    );

    render(
      <Schedule
        categories={categories}
        events={overflowEvents}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 10, minHour: 8})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    const seeMore = screen.getByRole('button', {
      name: 'Show 2 more all-day events for Wednesday, May 13, 2026',
    });
    expect(seeMore).toHaveTextContent('+2 more');

    fireEvent.click(seeMore);
    expect(seeMore).toHaveAttribute('aria-expanded', 'true');

    const popover = screen.getByTestId('schedule-all-day-see-more-2026-05-13');
    expect(
      within(popover).getByText('Wednesday, May 13, 2026'),
    ).toBeInTheDocument();
    expect(
      within(popover).getByTestId('schedule-event-all-day-overflow-1'),
    ).toHaveTextContent('All-day overflow 1');
    expect(
      within(popover).getByTestId('schedule-event-all-day-overflow-5'),
    ).toHaveClass(
      scheduleEventRecipe({color: 'blue', isFullWidth: true}).event as string,
    );
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

  it('marks and styles the highlighted day in time grid views', async () => {
    expect(
      scheduleTimeGridViewRecipe.raw({isCurrentDay: true}).dayHeaderDayNumber,
    ).toMatchObject({
      height: '32px',
      marginBottom: '-1px',
      marginTop: '-1px',
      paddingRight: '1px',
      width: '32px',
    });
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

    const highlightedHeader = await screen.findByRole('columnheader', {
      name: 'Thursday, May 14, 2026',
    });
    expect(highlightedHeader).toHaveAttribute('aria-current', 'date');
    expect(within(highlightedHeader).getByText('14')).toHaveClass(
      scheduleTimeGridViewRecipe({isCurrentDay: true})
        .dayHeaderDayNumber as string,
    );
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
    expect(screen.getByTestId('schedule-list-current-time')).toHaveClass(
      'silver-bg_surface.orange.accent',
      'before:silver-bg_surface.orange.accent',
    );
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

  it('marks past list view event content from the mocked current time', async () => {
    mockCurrentTime('2026-05-13T09:30:00.000Z');

    render(
      <Schedule
        categories={categories}
        events={[
          createEventFromISO({
            category: 'Sync',
            end: '2026-05-13T08:30:00.000Z',
            id: 'past-list',
            start: '2026-05-13T08:00:00.000Z',
            title: 'Past list sync',
          }),
          createEventFromISO({
            category: 'Sync',
            end: '2026-05-13T10:30:00.000Z',
            id: 'current-list',
            start: '2026-05-13T09:00:00.000Z',
            title: 'Current list sync',
          }),
        ]}
        timezoneID="UTC"
        view={createScheduleListView({days: 1})}
        viewDate={instantUTC(2026, 4, 13)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('schedule-event-past-list')).toHaveAttribute(
        'data-state',
        'past',
      );
    });
    expect(
      screen.getByTestId('schedule-event-current-list'),
    ).not.toHaveAttribute('data-state');
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

  it('renders pagination controls with the default button size and variant', () => {
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
    }).root as string;
    const ghostIconButtonClassName = buttonRecipe({
      iconOnly: true,
      variant: 'ghost',
    }).root as string;
    const todayClassName = buttonRecipe({}).root as string;

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

  it('mirrors pagination chevrons in RTL', () => {
    function Fixture(): React.JSX.Element {
      const paginationPlugin = useSchedulePaginationPlugin({
        onViewDateChange: vi.fn(),
      });
      return (
        <div dir="rtl">
          <Schedule
            events={events}
            plugins={[paginationPlugin]}
            timezoneID="UTC"
            view={createScheduleDayView()}
            viewDate={instantUTC(2026, 4, 13)}
          />
        </div>
      );
    }

    render(<Fixture />);

    const previousButton = screen.getByRole('button', {name: 'Previous day'});
    const nextButton = screen.getByRole('button', {name: 'Next day'});
    // eslint-disable-next-line testing-library/no-node-access -- verifying the directional class on the rendered icon
    const previousIcon = previousButton.querySelector('svg');
    // eslint-disable-next-line testing-library/no-node-access -- verifying the directional class on the rendered icon
    const nextIcon = nextButton.querySelector('svg');

    expect(previousIcon).toHaveClass(
      'lucide-chevron-left',
      'rtl:silver-trf_scaleX(-1)',
    );
    expect(nextIcon).toHaveClass(
      'lucide-chevron-right',
      'rtl:silver-trf_scaleX(-1)',
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

  describe('event resize plugin', () => {
    function ScheduleWithEventResize({
      onResize,
      snapMinutes = 5,
    }: {
      onResize: (change: ScheduleEventResizeChange) => void;
      snapMinutes?: number;
    }) {
      const plugin = useScheduleEventResizePlugin({
        onResize,
        snapMinutes,
      });

      return (
        <Schedule
          categories={categories}
          events={events}
          highlightDate={instantUTC(2026, 4, 13)}
          plugins={[plugin]}
          timezoneID="UTC"
          view={createScheduleDayView({
            hourHeight: 60,
            maxHour: 18,
            minHour: 8,
          })}
          viewDate={instantUTC(2026, 4, 13)}
        />
      );
    }

    it('resizes timed event end times by dragging the bottom handle with custom minute snapping', () => {
      const onResize = vi.fn<(change: ScheduleEventResizeChange) => void>();
      render(<ScheduleWithEventResize onResize={onResize} snapMinutes={5} />);

      const event = screen.getByTestId('schedule-event-visible');
      const handle = screen.getByTestId(
        'schedule-event-resize-end-handle-visible',
      );
      expect(handle).toHaveAccessibleName('Resize end of Visible sync');

      fireEvent.pointerDown(handle, {clientY: 100, pointerId: 1});
      fireEvent.pointerMove(window, {clientY: 120, pointerId: 1});
      expect(event).toHaveStyle({height: '45px'});

      fireEvent.pointerUp(window, {clientY: 120, pointerId: 1});

      expect(onResize).toHaveBeenCalledTimes(1);
      expect(onResize.mock.calls[0]?.[0].event.id).toBe('visible');
      expect(onResize.mock.calls[0]?.[0].end).toBe(
        instantUTC(2026, 4, 13, 16, 50),
      );
      expect(onResize.mock.calls[0]?.[0].start).toBe(
        instantUTC(2026, 4, 13, 16),
      );
    });

    it('resizes timed event start times by dragging the top handle with custom minute snapping', () => {
      const onResize = vi.fn<(change: ScheduleEventResizeChange) => void>();
      render(<ScheduleWithEventResize onResize={onResize} snapMinutes={5} />);

      const event = screen.getByTestId('schedule-event-visible');
      const handle = screen.getByTestId(
        'schedule-event-resize-start-handle-visible',
      );
      expect(handle).toHaveAccessibleName('Resize start of Visible sync');

      fireEvent.pointerDown(handle, {clientY: 100, pointerId: 1});
      fireEvent.pointerMove(window, {clientY: 80, pointerId: 1});
      expect(event).toHaveStyle({height: '45px', top: '-18px'});

      fireEvent.pointerUp(window, {clientY: 80, pointerId: 1});

      expect(onResize).toHaveBeenCalledTimes(1);
      expect(onResize.mock.calls[0]?.[0].event.id).toBe('visible');
      expect(onResize.mock.calls[0]?.[0].end).toBe(
        instantUTC(2026, 4, 13, 16, 30),
      );
      expect(onResize.mock.calls[0]?.[0].start).toBe(
        instantUTC(2026, 4, 13, 15, 40),
      );
    });

    it('does not render resize handles for all-day events', () => {
      render(<ScheduleWithEventResize onResize={vi.fn()} />);

      expect(
        screen.queryByTestId('schedule-event-resize-end-handle-all-day'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('schedule-event-resize-start-handle-all-day'),
      ).not.toBeInTheDocument();
    });
  });

  describe('event move plugin', () => {
    function ScheduleWithEventMove({
      onMove,
      snapMinutes = 5,
      view,
    }: {
      onMove: (change: ScheduleEventMoveChange) => void;
      snapMinutes?: number;
      view: ScheduleView;
    }) {
      const plugin = useScheduleEventMovePlugin({
        onMove,
        snapMinutes,
      });

      return (
        <Schedule
          categories={categories}
          events={events}
          highlightDate={instantUTC(2026, 4, 13)}
          plugins={[plugin]}
          timezoneID="UTC"
          view={view}
          viewDate={instantUTC(2026, 4, 13)}
        />
      );
    }

    it('moves month events to a new date while preserving local time', () => {
      const onMove = vi.fn<(change: ScheduleEventMoveChange) => void>();
      render(
        <ScheduleWithEventMove
          onMove={onMove}
          view={createScheduleMonthlyView()}
        />,
      );

      const event = screen.getByTestId('schedule-event-visible');
      const targetCell = screen.getByTestId('schedule-month-cell-2026-05-14');
      Object.defineProperty(targetCell, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({height: 128, left: 300, top: 200, width: 160}),
      });

      fireEvent.dragStart(event, {dataTransfer: createDragDataTransfer()});
      fireEvent.dragOver(targetCell);
      const preview = screen.getByTestId('schedule-event-move-preview-visible');
      expect(event).toHaveStyle({opacity: '0.25'});
      expect(preview).toHaveStyle({
        left: '304px',
        opacity: '0.45',
        pointerEvents: 'none',
        top: '230px',
      });
      fireEvent.drop(targetCell);

      expect(onMove).toHaveBeenCalledTimes(1);
      expect(onMove.mock.calls[0]?.[0].event.id).toBe('visible');
      expect(onMove.mock.calls[0]?.[0].start).toBe(instantUTC(2026, 4, 14, 16));
      expect(onMove.mock.calls[0]?.[0].end).toBe(
        instantUTC(2026, 4, 14, 16, 30),
      );
    });

    it('moves time-grid events to a new date and snapped time', () => {
      const onMove = vi.fn<(change: ScheduleEventMoveChange) => void>();
      render(
        <ScheduleWithEventMove
          onMove={onMove}
          snapMinutes={5}
          view={createScheduleWeeklyView({
            hourHeight: 60,
            maxHour: 18,
            minHour: 8,
          })}
        />,
      );

      const event = screen.getByTestId('schedule-event-visible');
      Object.defineProperty(event, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({height: 30, left: 50, top: 100, width: 160}),
      });
      const targetCell = screen.getByTestId(
        'schedule-time-grid-cell-2026-05-14-10',
      );
      Object.defineProperty(targetCell, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({height: 60, left: 300, top: 200, width: 160}),
      });

      const dragStart = createEvent.dragStart(event);
      Object.defineProperty(dragStart, 'clientY', {value: 110});
      Object.defineProperty(dragStart, 'dataTransfer', {
        value: createDragDataTransfer(),
      });
      fireEvent(event, dragStart);
      const dragOver = createEvent.dragOver(targetCell);
      Object.defineProperty(dragOver, 'clientY', {value: 225});
      fireEvent(targetCell, dragOver);
      const preview = screen.getByTestId('schedule-event-move-preview-visible');
      expect(event).toHaveStyle({opacity: '0.25'});
      expect(event).not.toHaveStyle({pointerEvents: 'none'});
      expect(event).not.toHaveStyle({transform: 'translate(252px, 117px)'});
      expect(preview).toHaveStyle({
        left: '302px',
        opacity: '0.45',
        pointerEvents: 'none',
        top: '217px',
      });
      const drop = createEvent.drop(targetCell);
      Object.defineProperty(drop, 'clientY', {value: 225});
      fireEvent(targetCell, drop);

      expect(onMove).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByTestId('schedule-event-move-preview-visible'),
      ).not.toBeInTheDocument();
      expect(onMove.mock.calls[0]?.[0].event.id).toBe('visible');
      expect(onMove.mock.calls[0]?.[0].start).toBe(
        instantUTC(2026, 4, 14, 10, 15),
      );
      expect(onMove.mock.calls[0]?.[0].end).toBe(
        instantUTC(2026, 4, 14, 10, 45),
      );
    });
  });

  describe('event create plugin', () => {
    // Cells report a zero `top` in jsdom, so with `hourHeight: 60` the drafted
    // minute is simply `hour * 60 + clientY`.
    function ScheduleWithEventCreate({
      defaultDurationMinutes,
      onCreate,
      snapMinutes,
      withMovePlugin = false,
    }: {
      defaultDurationMinutes?: number;
      onCreate: (draft: ScheduleEventDraft) => void;
      snapMinutes?: number;
      withMovePlugin?: boolean;
    }) {
      const createPlugin = useScheduleEventCreatePlugin({
        defaultDurationMinutes,
        renderContent: ({close, draft}) => (
          <button
            data-testid="save-draft"
            onClick={() => {
              onCreate(draft);
              close();
            }}
            type="button">
            Save draft
          </button>
        ),
        snapMinutes,
      });
      const movePlugin = useScheduleEventMovePlugin({onMove: () => {}});

      return (
        <Schedule
          categories={categories}
          events={events}
          highlightDate={instantUTC(2026, 4, 13)}
          plugins={withMovePlugin ? [createPlugin, movePlugin] : [createPlugin]}
          timezoneID="UTC"
          view={createScheduleDayView({
            hourHeight: 60,
            maxHour: 18,
            minHour: 8,
          })}
          viewDate={instantUTC(2026, 4, 13)}
        />
      );
    }

    function getCell(hour: number): HTMLElement {
      return screen.getByTestId(`schedule-time-grid-cell-2026-05-13-${hour}`);
    }

    function saveDraft(): void {
      fireEvent.click(screen.getByTestId('save-draft'));
    }

    it('drafts a default-duration event when a cell is clicked without dragging', () => {
      const onCreate = vi.fn<(draft: ScheduleEventDraft) => void>();
      render(<ScheduleWithEventCreate onCreate={onCreate} />);

      fireEvent.pointerDown(getCell(10), {button: 0, clientY: 0, pointerId: 1});
      fireEvent.pointerUp(window, {clientY: 0, pointerId: 1});

      const ghost = screen.getByTestId('schedule-event-create-ghost');
      expect(ghost).toHaveAccessibleName('New event, 10:00 AM - 11:00 AM');
      expect(ghost).toHaveAttribute('aria-expanded', 'true');

      saveDraft();
      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onCreate.mock.calls[0]?.[0].start).toBe(
        instantUTC(2026, 4, 13, 10),
      );
      expect(onCreate.mock.calls[0]?.[0].end).toBe(instantUTC(2026, 4, 13, 11));
    });

    it('honors a custom click-to-create duration', () => {
      const onCreate = vi.fn<(draft: ScheduleEventDraft) => void>();
      render(
        <ScheduleWithEventCreate
          defaultDurationMinutes={30}
          onCreate={onCreate}
        />,
      );

      fireEvent.pointerDown(getCell(10), {button: 0, clientY: 0, pointerId: 1});
      fireEvent.pointerUp(window, {clientY: 0, pointerId: 1});
      saveDraft();

      expect(onCreate.mock.calls[0]?.[0].end).toBe(
        instantUTC(2026, 4, 13, 10, 30),
      );
    });

    it('shows no ghost until the gesture becomes a click or a drag', () => {
      render(<ScheduleWithEventCreate onCreate={vi.fn()} />);

      fireEvent.pointerDown(getCell(10), {button: 0, clientY: 0, pointerId: 1});
      expect(
        screen.queryByTestId('schedule-event-create-ghost'),
      ).not.toBeInTheDocument();

      // Still within the first snap step, so this is not yet a drag.
      fireEvent.pointerMove(window, {clientY: 5, pointerId: 1});
      expect(
        screen.queryByTestId('schedule-event-create-ghost'),
      ).not.toBeInTheDocument();

      fireEvent.pointerMove(window, {clientY: 30, pointerId: 1});
      expect(
        screen.getByTestId('schedule-event-create-ghost'),
      ).toBeInTheDocument();
    });

    it('drafts a time range when dragging downward and previews it while dragging', () => {
      const onCreate = vi.fn<(draft: ScheduleEventDraft) => void>();
      render(<ScheduleWithEventCreate onCreate={onCreate} />);

      fireEvent.pointerDown(getCell(10), {button: 0, clientY: 0, pointerId: 1});
      fireEvent.pointerMove(window, {clientY: 30, pointerId: 1});
      const ghost = screen.getByTestId('schedule-event-create-ghost');
      expect(ghost).toHaveAttribute('aria-expanded', 'false');
      expect(ghost).toHaveAccessibleName('New event, 10:00 AM - 10:30 AM');

      fireEvent.pointerMove(window, {clientY: 90, pointerId: 1});
      expect(ghost).toHaveStyle({height: '85px', top: '2px'});
      expect(ghost).toHaveAccessibleName('New event, 10:00 AM - 11:30 AM');
      expect(ghost).toHaveTextContent('10:00 AM - 11:30 AM');

      fireEvent.pointerUp(window, {clientY: 90, pointerId: 1});
      saveDraft();

      expect(onCreate.mock.calls[0]?.[0].start).toBe(
        instantUTC(2026, 4, 13, 10),
      );
      expect(onCreate.mock.calls[0]?.[0].end).toBe(
        instantUTC(2026, 4, 13, 11, 30),
      );
    });

    it('normalizes an upward drag so the draft starts before it ends', () => {
      const onCreate = vi.fn<(draft: ScheduleEventDraft) => void>();
      render(<ScheduleWithEventCreate onCreate={onCreate} />);

      fireEvent.pointerDown(getCell(12), {button: 0, clientY: 0, pointerId: 1});
      fireEvent.pointerMove(window, {clientY: -90, pointerId: 1});
      // The ghost mounts in the drag's start hour (10), not the anchor hour.
      expect(screen.getByTestId('schedule-event-create-ghost')).toHaveStyle({
        height: '85px',
        top: '32px',
      });
      fireEvent.pointerUp(window, {clientY: -90, pointerId: 1});
      saveDraft();

      expect(onCreate.mock.calls[0]?.[0].start).toBe(
        instantUTC(2026, 4, 13, 10, 30),
      );
      expect(onCreate.mock.calls[0]?.[0].end).toBe(instantUTC(2026, 4, 13, 12));
    });

    it('clamps a draft dragged past the last rendered hour', () => {
      const onCreate = vi.fn<(draft: ScheduleEventDraft) => void>();
      render(<ScheduleWithEventCreate onCreate={onCreate} />);

      fireEvent.pointerDown(getCell(17), {
        button: 0,
        clientY: 30,
        pointerId: 1,
      });
      fireEvent.pointerUp(window, {clientY: 300, pointerId: 1});
      saveDraft();

      expect(onCreate.mock.calls[0]?.[0].start).toBe(
        instantUTC(2026, 4, 13, 17, 30),
      );
      expect(onCreate.mock.calls[0]?.[0].end).toBe(instantUTC(2026, 4, 13, 18));
    });

    it('enforces a minimum duration for a drag shorter than the minimum', () => {
      const onCreate = vi.fn<(draft: ScheduleEventDraft) => void>();
      render(<ScheduleWithEventCreate onCreate={onCreate} snapMinutes={5} />);

      fireEvent.pointerDown(getCell(10), {button: 0, clientY: 0, pointerId: 1});
      fireEvent.pointerUp(window, {clientY: 5, pointerId: 1});
      saveDraft();

      expect(onCreate.mock.calls[0]?.[0].start).toBe(
        instantUTC(2026, 4, 13, 10),
      );
      expect(onCreate.mock.calls[0]?.[0].end).toBe(
        instantUTC(2026, 4, 13, 10, 15),
      );
    });

    it('ignores pointer downs that land on an existing event', () => {
      render(<ScheduleWithEventCreate onCreate={vi.fn()} />);

      fireEvent.pointerDown(screen.getByTestId('schedule-event-visible'), {
        button: 0,
        clientY: 0,
        pointerId: 1,
      });

      expect(
        screen.queryByTestId('schedule-event-create-ghost'),
      ).not.toBeInTheDocument();
    });

    it('ignores non-primary pointer buttons', () => {
      render(<ScheduleWithEventCreate onCreate={vi.fn()} />);

      fireEvent.pointerDown(getCell(10), {button: 2, clientY: 0, pointerId: 1});

      expect(
        screen.queryByTestId('schedule-event-create-ghost'),
      ).not.toBeInTheDocument();
    });

    it('discards the draft when the drag is cancelled', () => {
      render(<ScheduleWithEventCreate onCreate={vi.fn()} />);

      fireEvent.pointerDown(getCell(10), {button: 0, clientY: 0, pointerId: 1});
      fireEvent.pointerMove(window, {clientY: 30, pointerId: 1});
      expect(
        screen.getByTestId('schedule-event-create-ghost'),
      ).toBeInTheDocument();

      fireEvent.pointerCancel(window, {clientY: 30, pointerId: 1});

      expect(
        screen.queryByTestId('schedule-event-create-ghost'),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('save-draft')).not.toBeInTheDocument();
    });

    it('discards the draft when Escape is pressed mid-drag', () => {
      render(<ScheduleWithEventCreate onCreate={vi.fn()} />);

      fireEvent.keyDown(window, {key: 'Escape'});
      fireEvent.pointerDown(getCell(10), {button: 0, clientY: 0, pointerId: 1});
      fireEvent.pointerMove(window, {clientY: 30, pointerId: 1});
      fireEvent.keyDown(window, {isComposing: true, key: 'Escape'});
      expect(
        screen.getByTestId('schedule-event-create-ghost'),
      ).toBeInTheDocument();

      fireEvent.keyDown(window, {key: 'Escape'});

      expect(
        screen.queryByTestId('schedule-event-create-ghost'),
      ).not.toBeInTheDocument();
    });

    it('removes the ghost when the popover content closes', () => {
      const onCreate = vi.fn<(draft: ScheduleEventDraft) => void>();
      render(<ScheduleWithEventCreate onCreate={onCreate} />);

      fireEvent.pointerDown(getCell(10), {button: 0, clientY: 0, pointerId: 1});
      fireEvent.pointerUp(window, {clientY: 0, pointerId: 1});
      saveDraft();

      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByTestId('schedule-event-create-ghost'),
      ).not.toBeInTheDocument();
    });

    it('replaces an open draft when a new cell is pressed', () => {
      const onCreate = vi.fn<(draft: ScheduleEventDraft) => void>();
      render(<ScheduleWithEventCreate onCreate={onCreate} />);

      fireEvent.pointerDown(getCell(10), {button: 0, clientY: 0, pointerId: 1});
      fireEvent.pointerUp(window, {clientY: 0, pointerId: 1});
      fireEvent.pointerDown(getCell(14), {button: 0, clientY: 0, pointerId: 2});
      fireEvent.pointerUp(window, {clientY: 0, pointerId: 2});

      expect(screen.getAllByTestId('schedule-event-create-ghost')).toHaveLength(
        1,
      );
      saveDraft();
      expect(onCreate.mock.calls[0]?.[0].start).toBe(
        instantUTC(2026, 4, 13, 14),
      );
    });

    it('coexists with the event move plugin', () => {
      const onCreate = vi.fn<(draft: ScheduleEventDraft) => void>();
      render(<ScheduleWithEventCreate onCreate={onCreate} withMovePlugin />);

      expect(screen.getByTestId('schedule-event-visible')).toHaveAttribute(
        'draggable',
        'true',
      );

      fireEvent.pointerDown(getCell(10), {button: 0, clientY: 0, pointerId: 1});
      fireEvent.pointerUp(window, {clientY: 0, pointerId: 1});

      expect(
        screen.getByTestId('schedule-event-create-ghost'),
      ).toBeInTheDocument();
    });
  });

  describe('event popover plugin', () => {
    const popoverEvents: CalendarEvent[] = [
      createEventFromISO({
        category: 'Sync',
        end: '2026-05-13T16:30:00.000Z',
        id: 'visible',
        start: '2026-05-13T16:00:00.000Z',
        title: 'Visible sync',
      }),
    ];

    function ScheduleWithPopover({
      eventsList = popoverEvents,
      onDelete,
      onEdit,
      renderContent,
      view,
    }: {
      eventsList?: CalendarEvent[];
      onDelete?: (event: CalendarEvent) => void;
      onEdit?: (event: CalendarEvent) => void;
      renderContent?: (props: {
        close: () => void;
        event: CalendarEvent;
      }) => ReactNode;
      view: ScheduleView;
    }) {
      const plugin = useScheduleEventPopoverPlugin({
        renderContent:
          renderContent ??
          (onEdit != null || onDelete != null
            ? ({event, close}) => (
                <ScheduleEventPopoverContent
                  event={event}
                  onClose={close}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              )
            : undefined),
      });
      return (
        <Schedule
          categories={categories}
          events={eventsList}
          highlightDate={instantUTC(2026, 4, 13)}
          plugins={[plugin]}
          timezoneID="UTC"
          view={view}
          viewDate={instantUTC(2026, 4, 13)}
        />
      );
    }

    it('renders pills as buttons that toggle a popover in the month view', () => {
      render(<ScheduleWithPopover view={createScheduleMonthlyView()} />);

      const pill = screen.getByTestId('schedule-event-visible');
      expect(pill.tagName).toBe('BUTTON');
      expect(pill).toHaveAttribute('aria-haspopup', 'dialog');
      expect(pill).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(pill);
      expect(pill).toHaveAttribute('aria-expanded', 'true');

      const popover = screen.getByTestId('schedule-event-popover');
      expect(within(popover).getByText('Visible sync')).toBeInTheDocument();
      expect(within(popover).getByText('Sync')).toBeInTheDocument();
    });

    it('keeps pills non-interactive when no popover plugin is registered', () => {
      render(
        <Schedule
          categories={categories}
          events={popoverEvents}
          highlightDate={instantUTC(2026, 4, 13)}
          timezoneID="UTC"
          view={createScheduleMonthlyView()}
          viewDate={instantUTC(2026, 4, 13)}
        />,
      );

      const pill = screen.getByTestId('schedule-event-visible');
      expect(pill.tagName).toBe('SPAN');
      expect(pill).not.toHaveAttribute('aria-haspopup');
      expect(
        screen.queryByTestId('schedule-event-popover'),
      ).not.toBeInTheDocument();
    });

    it('opens popovers for timed and all-day events in the day view', () => {
      render(
        <ScheduleWithPopover
          eventsList={events}
          view={createScheduleDayView()}
        />,
      );

      const timed = screen.getByTestId('schedule-event-visible');
      const allDay = screen.getByTestId('schedule-event-all-day');
      expect(timed.tagName).toBe('BUTTON');
      expect(allDay.tagName).toBe('BUTTON');

      fireEvent.click(timed);
      expect(timed).toHaveAttribute('aria-expanded', 'true');
    });

    it('opens a popover in the list view', () => {
      render(
        <ScheduleWithPopover
          eventsList={events}
          view={createScheduleListView({days: 7})}
        />,
      );

      const pill = screen.getByTestId('schedule-event-visible');
      expect(pill.tagName).toBe('BUTTON');

      fireEvent.click(pill);
      expect(pill).toHaveAttribute('aria-expanded', 'true');
    });

    it('positions list view event popovers at inline end by default', () => {
      render(
        <ScheduleWithPopover
          eventsList={events}
          view={createScheduleListView({days: 7})}
        />,
      );

      const trigger = screen.getByTestId('schedule-event-visible');
      fireEvent.click(trigger);

      // The native popover layer does not expose an accessible role, so inspect
      // the exact generated layer referenced by the opened trigger.
      const layerId = trigger.getAttribute('aria-controls');
      expect(layerId).toBeTruthy();
      // eslint-disable-next-line testing-library/no-node-access
      const layer = document.getElementById(layerId ?? '');
      const style = layer?.getAttribute('style') ?? '';
      expect(layer?.style.positionArea).toBe('inline-end span-block-end');
      expect(style).toContain('margin-inline-start: 8px');
    });

    it('shows description, location, and category in the default content', () => {
      const detailed: CalendarEvent = {
        ...createEventFromISO({
          category: 'Sync',
          end: '2026-05-13T16:30:00.000Z',
          id: 'visible',
          start: '2026-05-13T16:00:00.000Z',
          title: 'Visible sync',
        }),
        description: 'Weekly team sync',
        location: 'Room 4',
      };

      render(
        <ScheduleWithPopover
          eventsList={[detailed]}
          view={createScheduleMonthlyView()}
        />,
      );
      fireEvent.click(screen.getByTestId('schedule-event-visible'));

      const popover = screen.getByTestId('schedule-event-popover');
      expect(within(popover).getByText('Weekly team sync')).toBeInTheDocument();
      expect(within(popover).getByText('Room 4')).toBeInTheDocument();
      expect(within(popover).getByText('Sync')).toBeInTheDocument();
    });

    it('renders edit and delete actions only when callbacks are provided', () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      render(
        <ScheduleWithPopover
          onDelete={onDelete}
          onEdit={onEdit}
          view={createScheduleMonthlyView()}
        />,
      );
      fireEvent.click(screen.getByTestId('schedule-event-visible'));

      const popover = screen.getByTestId('schedule-event-popover');
      fireEvent.click(
        within(popover).getByTestId('schedule-event-popover-edit'),
      );
      expect(onEdit).toHaveBeenCalledWith(
        expect.objectContaining({id: 'visible'}),
      );
      fireEvent.click(
        within(popover).getByTestId('schedule-event-popover-delete'),
      );
      expect(onDelete).toHaveBeenCalledWith(
        expect.objectContaining({id: 'visible'}),
      );
    });

    it('closes the popover from the header close button', () => {
      render(<ScheduleWithPopover view={createScheduleMonthlyView()} />);
      const pill = screen.getByTestId('schedule-event-visible');
      fireEvent.click(pill);
      expect(pill).toHaveAttribute('aria-expanded', 'true');

      const popover = screen.getByTestId('schedule-event-popover');
      fireEvent.click(
        within(popover).getByTestId('schedule-event-popover-close'),
      );
      expect(pill).toHaveAttribute('aria-expanded', 'false');
    });

    it('omits action buttons when no callbacks are provided', () => {
      render(<ScheduleWithPopover view={createScheduleMonthlyView()} />);
      fireEvent.click(screen.getByTestId('schedule-event-visible'));

      const popover = screen.getByTestId('schedule-event-popover');
      expect(
        within(popover).queryByTestId('schedule-event-popover-edit'),
      ).not.toBeInTheDocument();
      expect(
        within(popover).queryByTestId('schedule-event-popover-delete'),
      ).not.toBeInTheDocument();
    });

    it('replaces the default content with renderContent', () => {
      render(
        <ScheduleWithPopover
          renderContent={({event}) => (
            <div data-testid="custom-popover">Custom {event.title}</div>
          )}
          view={createScheduleMonthlyView()}
        />,
      );
      fireEvent.click(screen.getByTestId('schedule-event-visible'));

      expect(screen.getByTestId('custom-popover')).toHaveTextContent(
        'Custom Visible sync',
      );
      expect(
        screen.queryByTestId('schedule-event-popover'),
      ).not.toBeInTheDocument();
    });

    it('makes every segment of a multi-day month event an independent trigger', () => {
      const multiDay = createEventFromISO({
        category: 'Sync',
        end: '2026-05-20',
        id: 'multi',
        start: '2026-05-13',
        title: 'Conference',
      });

      render(
        <ScheduleWithPopover
          eventsList={[multiDay]}
          view={createScheduleMonthlyView()}
        />,
      );

      const segments = screen.getAllByTestId('schedule-event-multi');
      expect(segments.length).toBeGreaterThan(1);
      segments.forEach(segment => expect(segment.tagName).toBe('BUTTON'));

      fireEvent.click(segments[0]);
      expect(segments[0]).toHaveAttribute('aria-expanded', 'true');
      expect(segments[1]).toHaveAttribute('aria-expanded', 'false');
    });

    it('exposes interactive month pills to assistive technology', () => {
      render(
        <ScheduleWithPopover
          eventsList={events}
          view={createScheduleMonthlyView()}
        />,
      );

      // Role queries ignore aria-hidden subtrees, so finding the pill by role
      // proves the decorative overlay's aria-hidden was dropped when the event
      // became an interactive trigger.
      expect(
        screen.getByRole('button', {name: /Design review/}),
      ).toBeInTheDocument();
    });
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

  it('composes pagination, view selector, and custom header plugins', () => {
    const onViewDateChange = vi.fn();
    const onChangeView = vi.fn();
    const dayView = createScheduleDayView();
    const monthView = createScheduleMonthlyView();
    const viewOptions: {label: string; view: ScheduleView}[] = [
      {label: 'Month', view: monthView},
      {label: 'Day', view: dayView},
    ];
    const customPlugin: SchedulePlugin = {
      renderHeader: (startContent, centerContent, endContent) => ({
        centerContent,
        endContent: (
          <>
            {endContent}
            <span data-testid="composed-end">Composed end</span>
          </>
        ),
        startContent: (
          <>
            {startContent}
            <span data-testid="composed-start">Composed start</span>
          </>
        ),
      }),
    };

    function ScheduleWithComposedPlugins() {
      const paginationPlugin = useSchedulePaginationPlugin({onViewDateChange});
      const viewSelectorPlugin = useScheduleViewSelectorPlugin(viewOptions, {
        onChangeView,
      });
      return (
        <Schedule
          categories={categories}
          events={events}
          plugins={[paginationPlugin, viewSelectorPlugin, customPlugin]}
          timezoneID="UTC"
          view={dayView}
          viewDate={instantUTC(2026, 4, 13)}
        />
      );
    }

    render(<ScheduleWithComposedPlugins />);

    const previousButton = screen.getByRole('button', {name: 'Previous day'});
    const selectorButton = screen.getByRole('button', {name: /Day/});
    expect(previousButton).toBeEnabled();
    expect(selectorButton).toBeEnabled();
    expect(screen.getByTestId('composed-start')).toBeInTheDocument();
    expect(screen.getByTestId('composed-end')).toBeInTheDocument();
    expect(previousButton.compareDocumentPosition(selectorButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    fireEvent.click(previousButton);
    expect(onViewDateChange).toHaveBeenCalledWith(instantUTC(2026, 4, 12));

    fireEvent.click(selectorButton);
    fireEvent.click(
      screen.getByRole('menuitem', {hidden: true, name: 'Month'}),
    );
    expect(onChangeView).toHaveBeenCalledWith(monthView);
  });

  it('renders an enabled view selector plugin and calls the change handler', () => {
    const onChangeView = vi.fn();
    const dayView = createScheduleDayView();
    const monthView = createScheduleMonthlyView();
    const viewOptions: {
      hotkey: string;
      label: string;
      view: ScheduleView;
    }[] = [
      {hotkey: 'm', label: 'Month', view: monthView},
      {hotkey: 'd', label: 'Day', view: dayView},
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
    const defaultButtonClassName = buttonRecipe({}).root as string;
    expect(selectorButton).toBeEnabled();
    expect(selectorButton).toHaveClass(defaultButtonClassName);

    fireEvent.click(selectorButton);

    const selectedItem = screen.getByRole('menuitem', {
      hidden: true,
      name: 'Day',
    });
    const unselectedItem = screen.getByRole('menuitem', {
      hidden: true,
      name: 'Month',
    });
    expect(selectedItem).toHaveAttribute('aria-keyshortcuts', 'd');
    expect(unselectedItem).toHaveAttribute('aria-keyshortcuts', 'm');
    expect(within(selectedItem).getByLabelText('D')).toBeInTheDocument();
    expect(within(unselectedItem).getByLabelText('M')).toBeInTheDocument();
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

  it('changes views with unmodified hotkeys outside editable controls', () => {
    const onChangeView = vi.fn();
    const dayView = createScheduleDayView();
    const monthView = createScheduleMonthlyView();
    const viewOptions = [
      {hotkey: 'm', label: 'Month', view: monthView},
      {hotkey: 'd', label: 'Day', view: dayView},
    ];

    function ScheduleWithViewSelector() {
      const viewSelectorPlugin = useScheduleViewSelectorPlugin(viewOptions, {
        onChangeView,
      });
      return (
        <>
          <input aria-label="Event title" />
          <Schedule
            categories={categories}
            events={events}
            plugins={[viewSelectorPlugin]}
            timezoneID="UTC"
            view={dayView}
            viewDate={instantUTC(2026, 4, 13)}
          />
        </>
      );
    }

    render(<ScheduleWithViewSelector />);

    const input = screen.getByRole('textbox', {name: 'Event title'});
    fireEvent.keyDown(input, {
      key: 'm',
    });
    fireEvent.keyDown(document, {ctrlKey: true, key: 'm'});
    fireEvent.keyDown(document, {key: 'm', repeat: true});
    fireEvent.keyDown(document, {isComposing: true, key: 'm'});
    const prevented = createEvent.keyDown(document, {key: 'm'});
    prevented.preventDefault();
    fireEvent(document, prevented);
    expect(onChangeView).not.toHaveBeenCalled();

    fireEvent.keyDown(document, {key: 'M'});
    fireEvent.keyDown(document, {key: 'd'});
    expect(onChangeView.mock.calls).toEqual([[monthView], [dayView]]);
  });

  it('uses the first configured view when hotkey descriptors collide', () => {
    const onChangeView = vi.fn();
    const dayView = createScheduleDayView();
    const firstMonthView = createScheduleMonthlyView();
    const secondMonthView = createScheduleMonthlyView();
    const viewOptions = [
      {hotkey: 'm', label: 'First month', view: firstMonthView},
      {hotkey: 'm', label: 'Second month', view: secondMonthView},
      {hotkey: 'd', label: 'Day', view: dayView},
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
    fireEvent.keyDown(document, {key: 'm'});

    expect(onChangeView).toHaveBeenCalledExactlyOnceWith(firstMonthView);
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

describe('scheduleZonedInstant', () => {
  it('creates schedule zoned instants from instants', () => {
    const instant = instantUTC(2026, 4, 13, 7);
    const zoned = createScheduleZonedInstant(instant, 'America/Los_Angeles');

    expect(zoned.instant).toBe(instant);
    expect(zoned.timezoneID).toBe('America/Los_Angeles');
    expect(zoned.toPlainDate().toString()).toBe('2026-05-13');
  });

  it('adds days and starts the day in the configured timezone', () => {
    const zoned = scheduleZonedInstantFromInstant(
      instantUTC(2026, 2, 8, 12),
      'America/Los_Angeles',
    );

    expect(zoned.startOfDay().toPlainDate().toString()).toBe('2026-03-08');
    expect(zoned.addDays(1).toPlainDate().toString()).toBe('2026-03-09');
  });

  it('converts schedule ranges to schedule zoned instant ranges', () => {
    const range = getScheduleRangeFromDates({
      endDate: Temporal.PlainDate.from('2026-05-14'),
      startDate: Temporal.PlainDate.from('2026-05-13'),
      timezoneID: 'UTC',
    });
    const [start, end] = scheduleRangeToScheduleZonedInstantRange(
      range,
      'America/Los_Angeles',
    );

    expect(start.timezoneID).toBe('America/Los_Angeles');
    expect(end.timezoneID).toBe('America/Los_Angeles');
    expect(start.instant).toBe(range.start);
    expect(end.instant).toBe(range.end);
  });
});
