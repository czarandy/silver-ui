import {Suspense, useMemo, useState, type CSSProperties, type Ref} from 'react';
import {cx} from 'internal/cx';
import {plainDateFromInstant} from '../../internal/plainDate';
import {getBrowserTimezoneID, nowEpochMilliseconds} from '../../internal/time';
import {ScheduleContext} from './context';
import {eventOverlapsRange, sortEvents} from './dateMath';
import {defaultSchedulePlugins} from './plugins';
import {createScheduleZonedInstant} from './scheduleZonedInstant';
import {createCategoryMap, scheduleClasses} from './shared';
import type {
  CalendarEvent,
  Instant,
  ScheduleCategory,
  ScheduleEventSource,
  SchedulePlugin,
  ScheduleRange,
  ScheduleView,
  ScheduleViewOptions,
  ScheduleZonedInstant,
} from './types';

const EMPTY_CATEGORIES: ReadonlyArray<ScheduleCategory> = [];

export interface ScheduleProps<
  Options extends ScheduleViewOptions = ScheduleViewOptions,
> {
  /**
   * Category definitions used to style events by their `category` value.
   */
  categories?: ReadonlyArray<ScheduleCategory>;
  /**
   * Additional CSS class names applied to the schedule root.
   */
  className?: string;
  /**
   * Test ID applied to the schedule root.
   */
  'data-testid'?: string;
  /**
   * Static events or an async event loader.
   */
  events: ScheduleEventSource;
  /**
   * Instant highlighted as the current date. Defaults to mount time.
   */
  highlightDate?: Instant;
  /**
   * Header/rendering plugins.
   */
  plugins?: ReadonlyArray<SchedulePlugin>;
  /**
   * Ref forwarded to the schedule root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the schedule root.
   */
  style?: CSSProperties;
  /**
   * IANA timezone ID used for date math and rendering.
   */
  timezoneID?: string;
  /**
   * View object returned by a `createSchedule*View` factory.
   */
  view: ScheduleView<Options>;
  /**
   * Instant used to choose the rendered range.
   */
  viewDate: Instant;
}

interface EventRecord {
  error: unknown;
  promise: Promise<void>;
  status: 'fulfilled' | 'pending' | 'rejected';
  value: ReadonlyArray<CalendarEvent>;
}

function readAsyncEvents(
  loader: Exclude<ScheduleEventSource, ReadonlyArray<CalendarEvent>>,
  start: Instant,
  end: Instant,
  cache: Map<string, EventRecord>,
): ReadonlyArray<CalendarEvent> {
  const key = `${start}:${end}`;
  let record = cache.get(key);
  if (record == null) {
    record = {
      error: null,
      promise: Promise.resolve()
        .then(async () => loader(start, end))
        .then(
          value => {
            if (record != null) {
              record.status = 'fulfilled';
              record.value = value;
            }
          },
          error => {
            if (record != null) {
              record.status = 'rejected';
              record.error = error;
            }
          },
        ),
      status: 'pending',
      value: [],
    };
    cache.set(key, record);
  }

  if (record.status === 'pending') {
    // Suspense uses thrown promises to pause rendering until async events resolve.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw record.promise;
  }

  if (record.status === 'rejected') {
    throw record.error instanceof Error
      ? record.error
      : new Error(String(record.error));
  }

  return record.value;
}

function resolveEvents(
  eventSource: ScheduleEventSource,
  range: ScheduleRange,
  timezoneID: string,
  eventCache: Map<string, EventRecord>,
): ReadonlyArray<CalendarEvent> {
  const events =
    typeof eventSource === 'function'
      ? readAsyncEvents(eventSource, range.start, range.end, eventCache)
      : eventSource;
  return sortEvents(
    events.filter(event => eventOverlapsRange(event, range, timezoneID)),
    timezoneID,
  );
}

function useRange<Options extends ScheduleViewOptions>(
  view: ScheduleView<Options>,
  date: ScheduleZonedInstant,
): ScheduleRange {
  const [start, end] = view.getDateRange(date);
  return useMemo(
    () => ({
      end: end.instant,
      endDate: plainDateFromInstant(end.instant, end.timezoneID),
      start: start.instant,
      startDate: plainDateFromInstant(start.instant, start.timezoneID),
    }),
    [start.instant, end.instant, start.timezoneID, end.timezoneID],
  );
}

function ScheduleViewContent<Options extends ScheduleViewOptions>({
  categories,
  eventCache,
  eventSource,
  highlightDate,
  isLoading,
  plugins,
  view,
  viewDate,
}: {
  categories: ReadonlyArray<ScheduleCategory>;
  eventCache: Map<string, EventRecord>;
  eventSource: ScheduleEventSource;
  highlightDate: ScheduleZonedInstant;
  isLoading: boolean;
  plugins: ReadonlyArray<SchedulePlugin>;
  view: ScheduleView<Options>;
  viewDate: ScheduleZonedInstant;
}): React.JSX.Element {
  const Component = view.component;
  const range = useRange(view, viewDate);
  const contextValue = useMemo(() => {
    const categoryMap = createCategoryMap(categories);
    const events = isLoading
      ? []
      : resolveEvents(eventSource, range, viewDate.timezoneID, eventCache);
    return {
      categoryMap,
      categories,
      events,
      highlightDate,
      isLoading,
      plugins,
      range,
      timezoneID: viewDate.timezoneID,
      view,
      viewDate,
    };
  }, [
    categories,
    eventCache,
    eventSource,
    highlightDate,
    isLoading,
    plugins,
    range,
    view,
    viewDate,
  ]);

  return (
    <ScheduleContext value={contextValue}>
      <Component options={view.options} />
    </ScheduleContext>
  );
}

/**
 * Read-only schedule shell for day, week, month, and list views.
 */
export function Schedule({
  categories = EMPTY_CATEGORIES,
  className,
  'data-testid': dataTestId,
  events,
  highlightDate: highlightDateFromProps,
  plugins = defaultSchedulePlugins,
  ref,
  style,
  timezoneID: timezoneIDFromProps,
  view,
  viewDate,
}: ScheduleProps): React.JSX.Element {
  const timezoneID = timezoneIDFromProps ?? getBrowserTimezoneID();
  // Instance-scoped cache for async event loading. Unlike the previous
  // module-level WeakMap keyed on loader function identity, this cache belongs
  // to each Schedule instance so unstable (inline) loader references do not
  // defeat caching or leak memory.
  const [eventCache] = useState(() => new Map<string, EventRecord>());
  const [internalHighlightDate] = useState<Instant>(() =>
    nowEpochMilliseconds(),
  );
  const highlightDate = highlightDateFromProps ?? internalHighlightDate;
  const scheduleZonedInstant = useMemo(
    () => createScheduleZonedInstant(viewDate, timezoneID),
    [viewDate, timezoneID],
  );
  const highlightScheduleZonedInstant = useMemo(
    () => createScheduleZonedInstant(highlightDate, timezoneID),
    [highlightDate, timezoneID],
  );

  return (
    <div
      className={cx(scheduleClasses.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <Suspense
        fallback={
          <ScheduleViewContent
            categories={categories}
            eventCache={eventCache}
            eventSource={[]}
            highlightDate={highlightScheduleZonedInstant}
            isLoading
            plugins={plugins}
            view={view}
            viewDate={scheduleZonedInstant}
          />
        }>
        <ScheduleViewContent
          categories={categories}
          eventCache={eventCache}
          eventSource={events}
          highlightDate={highlightScheduleZonedInstant}
          isLoading={false}
          plugins={plugins}
          view={view}
          viewDate={scheduleZonedInstant}
        />
      </Suspense>
    </div>
  );
}

Schedule.displayName = 'Schedule';
