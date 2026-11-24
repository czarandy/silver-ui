'use client';

import {
  startTransition,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type Ref,
} from 'react';
import {scheduleRecipe} from 'components/Schedule/Schedule.recipe';
import {ScheduleContext} from 'components/Schedule/context';
import {
  eventOverlapsRange,
  getScheduleRange,
  sortEvents,
} from 'components/Schedule/dateMath';
import {
  createScheduleInteractionState,
  ScheduleInteractionContext,
  type ScheduleInteractionState,
} from 'components/Schedule/interaction';
import {defaultSchedulePlugins} from 'components/Schedule/plugins';
import {createScheduleZonedInstant} from 'components/Schedule/scheduleZonedInstant';
import {createCategoryMap} from 'components/Schedule/shared';
import type {
  CalendarEvent,
  Instant,
  ScheduleCategory,
  ScheduleEventBorderStyle,
  ScheduleEventSource,
  ScheduleHandle,
  ScheduleHeight,
  SchedulePlugin,
  ScheduleRange,
  ScheduleView,
  ScheduleViewOptions,
  ScheduleZonedInstant,
} from 'components/Schedule/types';
import {getBrowserTimezoneID, nowEpochMilliseconds} from 'internal/time';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';
import {cx} from 'utils/cx';

const EMPTY_CATEGORIES: ReadonlyArray<ScheduleCategory> = [];

export type {
  ScheduleEventBorderStyle,
  ScheduleHeight,
} from 'components/Schedule/types';

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
   * Border treatment applied to event pills. `border` renders the default
   * border, `none` removes it, and `left` renders a square pill with only a
   * 3px left border.
   * @default 'border'
   */
  eventBorderStyle?: ScheduleEventBorderStyle;
  /**
   * Static events or an async event loader.
   */
  events: ScheduleEventSource;
  /**
   * Imperative handle for opening an event's popover from code.
   */
  handleRef?: Ref<ScheduleHandle>;
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
  return useMemo(
    () => getScheduleRange(view, date.instant, date.timezoneID),
    [date.instant, date.timezoneID, view],
  );
}

interface PendingEventPopover {
  eventID: string;
  /**
   * `document.activeElement` when the call was made.
   */
  focusedElement: Element | null;
  /**
   * The range of the first commit after the call; null until then.
   */
  rangeKey: string | null;
  /**
   * Calls waiting for this event, which all get its result.
   */
  resolvers: ((isOpened: boolean) => void)[];
}

/**
 * Implements `ScheduleHandle`. A call waits for a commit it requests (in a
 * transition, so it commits with navigation the caller started in the same
 * event) and, on the range that commit shows, for that range's events to load.
 * Rendered beside the view so the requested commit re-renders only this.
 */
function ScheduleEventPopoverHandle({
  handleRef,
  interactionState,
  isLoading,
  range,
}: {
  handleRef: Ref<ScheduleHandle> | undefined;
  interactionState: ScheduleInteractionState;
  isLoading: boolean;
  range: ScheduleRange;
}): null {
  const pendingRef = useRef<PendingEventPopover | null>(null);
  const isConnectedRef = useRef(false);
  const [commitRequest, requestCommit] = useReducer(
    (count: number) => count + 1,
    0,
  );
  const settle = useCallback((isOpened: boolean) => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    pending?.resolvers.forEach(resolve => {
      resolve(isOpened);
    });
  }, []);
  useImperativeHandle(
    handleRef,
    () => ({
      openEventPopover: async eventID =>
        new Promise<boolean>(resolve => {
          // Unmounted, or hidden by <Activity>.
          if (!isConnectedRef.current) {
            resolve(false);
            return;
          }
          const resolvers: PendingEventPopover['resolvers'] = [resolve];
          const waiting = pendingRef.current;
          if (waiting?.eventID === eventID) {
            resolvers.push(...waiting.resolvers);
          } else {
            settle(false);
          }
          pendingRef.current = {
            eventID,
            focusedElement: document.activeElement,
            rangeKey: null,
            resolvers,
          };
          startTransition(() => {
            requestCommit();
          });
        }),
    }),
    [settle],
  );
  useIsomorphicLayoutEffect(() => {
    isConnectedRef.current = true;
    return () => {
      isConnectedRef.current = false;
      // Deferred, so StrictMode's simulated unmount and remount doesn't
      // settle a waiting call.
      queueMicrotask(() => {
        if (!isConnectedRef.current) {
          settle(false);
        }
      });
    };
  }, [settle]);
  const rangeKey = `${range.start}:${range.end}`;
  // Runs after the commit a call requests and after any range or loading
  // change, once pills have registered from their refs.
  useEffect(() => {
    const pending = pendingRef.current;
    if (pending == null) {
      return;
    }
    pending.rangeKey ??= rangeKey;
    if (pending.rangeKey !== rangeKey) {
      // The user paged away before the events loaded.
      settle(false);
      return;
    }
    // Opens after the hide reports that pills removed in this commit defer to
    // a microtask, so plugins see the old popover hide before this one shows.
    queueMicrotask(() => {
      if (pendingRef.current !== pending || !isConnectedRef.current) {
        return;
      }
      const focusedElement = document.activeElement;
      if (
        focusedElement !== pending.focusedElement &&
        focusedElement != null &&
        focusedElement !== document.body
      ) {
        // Focus moved on while the call waited; don't take it back.
        settle(false);
        return;
      }
      const isOpened = interactionState.openEventPopover(pending.eventID);
      if (isOpened != null || !isLoading) {
        settle(isOpened ?? false);
      }
    });
  }, [commitRequest, interactionState, isLoading, rangeKey, settle]);
  return null;
}

function ScheduleViewContent<Options extends ScheduleViewOptions>({
  categories,
  eventBorderStyle,
  eventSource,
  handleRef,
  height,
  highlightDate,
  interactionState,
  plugins,
  view,
  viewDate,
}: {
  categories: ReadonlyArray<ScheduleCategory>;
  eventBorderStyle: ScheduleEventBorderStyle;
  eventSource: ScheduleEventSource;
  handleRef: Ref<ScheduleHandle> | undefined;
  height: ScheduleHeight;
  highlightDate: ScheduleZonedInstant;
  interactionState: ScheduleInteractionState;
  plugins: ReadonlyArray<SchedulePlugin>;
  view: ScheduleView<Options>;
  viewDate: ScheduleZonedInstant;
}): React.JSX.Element {
  const Component = view.component;
  const range = useRange(view, viewDate);
  const {events: rangeEvents, isLoading} = useAsyncEvents(eventSource, range);
  // `events` and `categoryMap` are memoized apart from the context value so
  // their identities survive unrelated context changes (e.g. a plugin updating
  // as its popover opens); the views' expensive layout memos key on them.
  const categoryMap = useMemo(
    () => createCategoryMap(categories),
    [categories],
  );
  const events = useMemo(
    () =>
      sortEvents(
        rangeEvents.filter(event =>
          eventOverlapsRange(event, range, viewDate.timezoneID),
        ),
        viewDate.timezoneID,
      ),
    [range, rangeEvents, viewDate.timezoneID],
  );
  const contextValue = useMemo(
    () => ({
      categoryMap,
      categories,
      eventBorderStyle,
      events,
      highlightDate,
      isLoading,
      plugins,
      range,
      timezoneID: viewDate.timezoneID,
      view,
      viewDate,
    }),
    [
      categories,
      categoryMap,
      eventBorderStyle,
      events,
      highlightDate,
      isLoading,
      plugins,
      range,
      view,
      viewDate,
    ],
  );

  return (
    <ScheduleInteractionContext value={interactionState}>
      <ScheduleContext value={contextValue}>
        <Component height={height} options={view.options} />
      </ScheduleContext>
      <ScheduleEventPopoverHandle
        handleRef={handleRef}
        interactionState={interactionState}
        isLoading={isLoading}
        range={range}
      />
    </ScheduleInteractionContext>
  );
}

/**
 * Read-only schedule shell for day, week, month, and list views.
 */
export function Schedule({
  categories = EMPTY_CATEGORIES,
  className,
  'data-testid': dataTestId,
  eventBorderStyle = 'border',
  events,
  handleRef,
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
  const interactionState = useMemo(() => createScheduleInteractionState(), []);
  useEffect(() => () => interactionState.dispose(), [interactionState]);
  const handlePointerDownCapture = (event: PointerEvent<HTMLDivElement>) => {
    interactionState.markPointerDown(event.nativeEvent);
  };
  const classes = scheduleRecipe({height});

  return (
    <div
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      onPointerDownCapture={handlePointerDownCapture}
      ref={ref}
      style={style}>
      <ScheduleViewContent
        categories={categories}
        eventBorderStyle={eventBorderStyle}
        eventSource={events}
        handleRef={handleRef}
        height={height}
        highlightDate={highlightScheduleZonedInstant}
        interactionState={interactionState}
        plugins={plugins}
        view={view}
        viewDate={scheduleZonedInstant}
      />
    </div>
  );
}

Schedule.displayName = 'Schedule';
