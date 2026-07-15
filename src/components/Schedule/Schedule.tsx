'use client';

import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import {scheduleRecipe} from 'components/Schedule/Schedule.recipe';
import {ScheduleContext} from 'components/Schedule/context';
import {eventOverlapsRange, sortEvents} from 'components/Schedule/dateMath';
import {defaultSchedulePlugins} from 'components/Schedule/plugins';
import {createScheduleZonedInstant} from 'components/Schedule/scheduleZonedInstant';
import {createCategoryMap} from 'components/Schedule/shared';
import type {
  CalendarEvent,
  Instant,
  ScheduleCategory,
  ScheduleEventSource,
  ScheduleHeight,
  SchedulePlugin,
  ScheduleRange,
  ScheduleView,
  ScheduleViewOptions,
  ScheduleZonedInstant,
} from 'components/Schedule/types';
import {plainDateFromInstant} from 'internal/plainDate';
import {getBrowserTimezoneID, nowEpochMilliseconds} from 'internal/time';
import {cx} from 'utils/cx';

const EMPTY_CATEGORIES: ReadonlyArray<ScheduleCategory> = [];

export type {ScheduleHeight} from 'components/Schedule/types';

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
   * Height behavior. `auto` grows with the active view; `fill` occupies a
   * finite-height parent and scrolls the view below the fixed toolbar.
   * @default 'auto'
   */
  height?: ScheduleHeight;
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

const EMPTY_EVENTS: ReadonlyArray<CalendarEvent> = [];

interface EventRecord {
  error: unknown;
  status: 'fulfilled' | 'pending' | 'rejected';
  value: ReadonlyArray<CalendarEvent>;
}

/**
 * Resolves the event source for the visible range as plain React state.
 *
 * Async loading is deliberately NOT modeled with Suspense: a thrown-promise
 * loader needs a fallback tree, and swapping fallback → children on resolve
 * remounts the header, discarding open popover/selector state in plugin slots.
 * Resolving into state keeps a single tree mounted across the load.
 *
 * The cache is instance-scoped and keyed by date range, not loader identity,
 * so unstable (inline) loader references do not defeat caching or leak memory.
 */
function useAsyncEvents(
  eventSource: ScheduleEventSource,
  range: ScheduleRange,
): {events: ReadonlyArray<CalendarEvent>; isLoading: boolean} {
  const [cache] = useState(() => new Map<string, EventRecord>());
  const [, bumpVersion] = useReducer((version: number) => version + 1, 0);
  const loader = typeof eventSource === 'function' ? eventSource : null;
  const {start, end} = range;

  useEffect(() => {
    if (loader == null) {
      return;
    }
    const key = `${start}:${end}`;
    // The has-check also keeps StrictMode's double effect run to one fetch.
    if (cache.has(key)) {
      return;
    }
    const record: EventRecord = {error: null, status: 'pending', value: []};
    cache.set(key, record);
    void Promise.resolve()
      .then(async () => loader(start, end))
      .then(
        value => {
          record.status = 'fulfilled';
          record.value = value;
        },
        error => {
          record.status = 'rejected';
          record.error = error;
        },
      )
      .then(() => {
        bumpVersion();
      });
  }, [cache, end, loader, start]);

  if (typeof eventSource !== 'function') {
    return {events: eventSource, isLoading: false};
  }

  const record = cache.get(`${start}:${end}`);
  if (record == null || record.status === 'pending') {
    return {events: EMPTY_EVENTS, isLoading: true};
  }
  if (record.status === 'rejected') {
    throw record.error instanceof Error
      ? record.error
      : new Error(String(record.error));
  }
  return {events: record.value, isLoading: false};
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
  eventSource,
  height,
  highlightDate,
  plugins,
  view,
  viewDate,
}: {
  categories: ReadonlyArray<ScheduleCategory>;
  eventSource: ScheduleEventSource;
  height: ScheduleHeight;
  highlightDate: ScheduleZonedInstant;
  plugins: ReadonlyArray<SchedulePlugin>;
  view: ScheduleView<Options>;
  viewDate: ScheduleZonedInstant;
}): React.JSX.Element {
  const Component = view.component;
  const range = useRange(view, viewDate);
  const {events: rangeEvents, isLoading} = useAsyncEvents(eventSource, range);
  const contextValue = useMemo(() => {
    const categoryMap = createCategoryMap(categories);
    const events = sortEvents(
      rangeEvents.filter(event =>
        eventOverlapsRange(event, range, viewDate.timezoneID),
      ),
      viewDate.timezoneID,
    );
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
    highlightDate,
    isLoading,
    plugins,
    range,
    rangeEvents,
    view,
    viewDate,
  ]);

  return (
    <ScheduleContext value={contextValue}>
      <Component height={height} options={view.options} />
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
  height = 'auto',
  highlightDate: highlightDateFromProps,
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
  const scheduleZonedInstant = useMemo(
    () => createScheduleZonedInstant(viewDate, timezoneID),
    [viewDate, timezoneID],
  );
  const highlightScheduleZonedInstant = useMemo(
    () => createScheduleZonedInstant(highlightDate, timezoneID),
    [highlightDate, timezoneID],
  );
  const classes = scheduleRecipe({height});

  return (
    <div
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <ScheduleViewContent
        categories={categories}
        eventSource={events}
        height={height}
        highlightDate={highlightScheduleZonedInstant}
        plugins={plugins}
        view={view}
        viewDate={scheduleZonedInstant}
      />
    </div>
  );
}

Schedule.displayName = 'Schedule';
