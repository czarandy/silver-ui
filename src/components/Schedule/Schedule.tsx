import {
  Suspense,
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import {cx} from '../../internal/cx';
import {plainDateFromInstant} from '../../internal/plainDate';
import {getBrowserTimezoneID, nowEpochMilliseconds} from '../../internal/time';
import {ScheduleContext} from './context';
import {eventOverlapsRange, sortEvents} from './dateMath';
import {defaultSchedulePlugins} from './plugins';
import {styles} from './shared';
import type {
  CalendarEvent,
  Instant,
  ScheduleCategory,
  ScheduleEventSource,
  SchedulePlugin,
  ScheduleRange,
  ScheduleView,
  ScheduleViewOptions,
  ZonedDateTime,
  ZonedDateTimeRange,
} from './types';
import {createZonedDateTime} from './zonedDateTime';

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
   * Called by navigation plugins when the visible date changes.
   */
  onViewDateChange?: (date: Instant) => void;
  /**
   * Header/rendering plugins. Defaults to pagination controls.
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

const eventLoaderCache = new WeakMap<
  Exclude<ScheduleEventSource, ReadonlyArray<CalendarEvent>>,
  Map<string, EventRecord>
>();

function readAsyncEvents(
  loader: Exclude<ScheduleEventSource, ReadonlyArray<CalendarEvent>>,
  start: Instant,
  end: Instant,
): ReadonlyArray<CalendarEvent> {
  let loaderCache = eventLoaderCache.get(loader);
  if (loaderCache == null) {
    loaderCache = new Map();
    eventLoaderCache.set(loader, loaderCache);
  }

  const key = `${start}:${end}`;
  let record = loaderCache.get(key);
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
    loaderCache.set(key, record);
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
): ReadonlyArray<CalendarEvent> {
  const events =
    typeof eventSource === 'function'
      ? readAsyncEvents(eventSource, range.start, range.end)
      : eventSource;
  return sortEvents(
    events.filter(event => eventOverlapsRange(event, range, timezoneID)),
    timezoneID,
  );
}

function getRange<Options extends ScheduleViewOptions>(
  view: ScheduleView<Options>,
  date: ZonedDateTime,
): ScheduleRange {
  const [start, end] = view.getDateRange(date);
  return {
    end: end.instant,
    endDate: plainDateFromInstant(end.instant, end.timezoneID),
    start: start.instant,
    startDate: plainDateFromInstant(start.instant, start.timezoneID),
  };
}

function ScheduleViewContent<Options extends ScheduleViewOptions>({
  categories,
  eventSource,
  highlightDate,
  isLoading,
  nextDateLabel,
  onNextDate,
  onPreviousDate,
  onToday,
  plugins,
  previousDateLabel,
  view,
  viewDate,
}: {
  categories: ReadonlyArray<ScheduleCategory>;
  eventSource: ScheduleEventSource;
  highlightDate: ZonedDateTime;
  isLoading: boolean;
  nextDateLabel: string;
  onNextDate: () => void;
  onPreviousDate: () => void;
  onToday: () => void;
  plugins: ReadonlyArray<SchedulePlugin>;
  previousDateLabel: string;
  view: ScheduleView<Options>;
  viewDate: ZonedDateTime;
}): React.JSX.Element {
  const Component = view.component;
  const range = getRange(view, viewDate);
  const contextValue = useMemo(() => {
    const events = isLoading
      ? []
      : resolveEvents(eventSource, range, viewDate.timezoneID);
    return {
      categories,
      events,
      highlightDate,
      isLoading,
      nextDateLabel,
      onNextDate,
      onPreviousDate,
      onToday,
      plugins,
      previousDateLabel,
      range,
      timezoneID: viewDate.timezoneID,
      view,
      viewDate,
    };
  }, [
    categories,
    eventSource,
    highlightDate,
    isLoading,
    nextDateLabel,
    onNextDate,
    onPreviousDate,
    onToday,
    plugins,
    previousDateLabel,
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
  onViewDateChange,
  plugins = defaultSchedulePlugins,
  ref,
  style,
  timezoneID: timezoneIDFromProps,
  view,
  viewDate,
}: ScheduleProps): React.JSX.Element {
  const timezoneID = timezoneIDFromProps ?? getBrowserTimezoneID();
  const [internalHighlightDate] = useState<Instant>(() =>
    nowEpochMilliseconds(),
  );
  const highlightDate = highlightDateFromProps ?? internalHighlightDate;
  const zonedDateTime = useMemo(
    () => createZonedDateTime(viewDate, timezoneID),
    [viewDate, timezoneID],
  );
  const highlightZonedDateTime = useMemo(
    () => createZonedDateTime(highlightDate, timezoneID),
    [highlightDate, timezoneID],
  );
  const updateViewDate = useCallback(
    (nextViewDate: Instant) => {
      onViewDateChange?.(nextViewDate);
    },
    [onViewDateChange],
  );
  const shiftToRange = useCallback(
    (nextRange: ZonedDateTimeRange) => {
      const currentRange = view.getDateRange(zonedDateTime);
      updateViewDate(
        zonedDateTime.instant + nextRange[0].instant - currentRange[0].instant,
      );
    },
    [updateViewDate, view, zonedDateTime],
  );
  const previousDateRange = useMemo(
    () => view.getPreviousDateRange(zonedDateTime),
    [view, zonedDateTime],
  );
  const nextDateRange = useMemo(
    () => view.getNextDateRange(zonedDateTime),
    [view, zonedDateTime],
  );
  const onPreviousDate = useCallback(() => {
    shiftToRange(previousDateRange.range);
  }, [previousDateRange, shiftToRange]);
  const onToday = useCallback(() => {
    updateViewDate(nowEpochMilliseconds());
  }, [updateViewDate]);
  const onNextDate = useCallback(() => {
    shiftToRange(nextDateRange.range);
  }, [nextDateRange, shiftToRange]);

  return (
    <div
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <Suspense
        fallback={
          <ScheduleViewContent
            categories={categories}
            eventSource={[]}
            highlightDate={highlightZonedDateTime}
            isLoading
            nextDateLabel={nextDateRange.label}
            onNextDate={onNextDate}
            onPreviousDate={onPreviousDate}
            onToday={onToday}
            plugins={plugins}
            previousDateLabel={previousDateRange.label}
            view={view}
            viewDate={zonedDateTime}
          />
        }>
        <ScheduleViewContent
          categories={categories}
          eventSource={events}
          highlightDate={highlightZonedDateTime}
          isLoading={false}
          nextDateLabel={nextDateRange.label}
          onNextDate={onNextDate}
          onPreviousDate={onPreviousDate}
          onToday={onToday}
          plugins={plugins}
          previousDateLabel={previousDateRange.label}
          view={view}
          viewDate={zonedDateTime}
        />
      </Suspense>
    </div>
  );
}

Schedule.displayName = 'Schedule';
