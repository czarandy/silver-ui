'use client';

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {scheduleEventRecipe} from 'components/Schedule/ScheduleEvent.recipe';
import {useScheduleContext} from 'components/Schedule/context';
import {
  instantFromDateAndMinutes,
  isDayEvent,
} from 'components/Schedule/dateMath';
import {
  formatTimeRange,
  getCategory,
  getTimedEventBlockStyle,
} from 'components/Schedule/shared';
import type {
  CalendarEvent,
  PlainDate,
  ScheduleEventPropsRenderProps,
  SchedulePlugin,
  SchedulePluginElementProps,
} from 'components/Schedule/types';
import useConstant from 'hooks/useConstant';
import useHotkey from 'hooks/useHotkey';
import {plainDateIsEqual} from 'internal/plainDate';
import {Temporal} from 'internal/temporal';
import useLatest from 'internal/useLatest';
import {cx, sva} from 'styled-system/css';

const DEFAULT_SNAP_MINUTES = 15;
const MINUTES_PER_HOUR = 60;
const MILLISECONDS_PER_MINUTE = 60_000;
/**
 * How far the pointer must travel before a press becomes a move. Shorter
 * presses stay clicks, so event popovers keep working on movable events.
 */
const DRAG_THRESHOLD_PX = 4;
/**
 * Distance from the time grid's visible edge at which dragging scrolls it.
 */
const AUTO_SCROLL_EDGE_PX = 48;
const AUTO_SCROLL_MAX_STEP_PX = 16;
/**
 * Above every timed event (`level + 1`) and the current-time indicator (`20`),
 * matching the create plugin's ghost.
 */
const SILHOUETTE_Z_INDEX = 21;

/**
 * Cell coordinates the drag hit-tests against. The dragged event captures the
 * pointer, so cells never see the gesture's pointer events; the plugin finds
 * the cell under the pointer and reads these instead.
 */
const DATE_ATTRIBUTE = 'data-schedule-move-date';
const HOUR_ATTRIBUTE = 'data-schedule-move-hour';
const MIN_HOUR_ATTRIBUTE = 'data-schedule-move-min-hour';
const MAX_HOUR_ATTRIBUTE = 'data-schedule-move-max-hour';
const SOURCE_ATTRIBUTE = 'data-schedule-move-source';
const TARGET_ATTRIBUTE = 'data-schedule-move-target';

// Source and target styles are keyed on the plugin's attributes so they outrank
// the event and cell recipes' own cursor and background regardless of atomic
// class order.
const moveRecipe = sva({
  slots: ['silhouette', 'source', 'targetCell'],
  base: {
    silhouette: {
      pointerEvents: 'none',
      boxShadow: 'overlay',
      outlineWidth: 'focus',
      outlineStyle: 'dashed',
      outlineColor: 'var(--schedule-event-dot)',
      outlineOffset: '1px',
      '&[data-state="saving"]': {
        opacity: 0.7,
      },
    },
    source: {
      [`&[${SOURCE_ATTRIBUTE}]`]: {
        cursor: 'grabbing',
        opacity: 0.4,
      },
    },
    targetCell: {
      [`&[${TARGET_ATTRIBUTE}]`]: {
        bg: 'bg.hover',
        outlineWidth: 'focus',
        outlineStyle: 'dashed',
        outlineColor: 'primary',
        outlineOffset: '-2px',
      },
    },
  },
});

const moveClasses = moveRecipe();

export interface ScheduleEventMoveChange<TAuxiliaryData = unknown> {
  end: CalendarEvent<TAuxiliaryData>['end'];
  event: CalendarEvent<TAuxiliaryData>;
  start: CalendarEvent<TAuxiliaryData>['start'];
}

export interface ScheduleEventMovePluginOptions<TAuxiliaryData = unknown> {
  /**
   * Whether the user may move an event. Rejected events keep their normal
   * click behavior and never start a move. Memoize it: the plugin is rebuilt
   * whenever it changes.
   * @default every event is movable
   */
  getIsMovable?: (event: CalendarEvent<TAuxiliaryData>) => boolean;
  /**
   * Called when the user drops an event on a new date or time. Return a promise
   * to keep the drop silhouette on screen until it settles, for example while
   * the change saves or a confirmation dialog is open, and resolve it once
   * `events` holds the moved event so the event never flashes back to its old
   * slot. The plugin ignores the outcome, so report failures from the callback.
   * No other move can start while a returned promise is pending.
   */
  onMove: (change: ScheduleEventMoveChange<TAuxiliaryData>) => unknown;
  /**
   * Snap interval, in minutes, applied to time-grid drops.
   * @default 15
   */
  snapMinutes?: number;
}

type MoveLayout = 'month' | 'timeGrid';

/**
 * Where a drop would land. Month cells carry only a date.
 */
interface MoveTarget {
  date: PlainDate;
  startMinutes: number | null;
}

interface ActiveMove {
  event: CalendarEvent;
  layout: MoveLayout;
  phase: 'dragging' | 'saving';
}

interface PressState {
  clientX: number;
  clientY: number;
  event: CalendarEvent;
  /**
   * Distance from the event's top edge to the pointer, so the event keeps the
   * same grip as it moves rather than jumping its start to the pointer.
   */
  grabOffsetPx: number;
  isCanceled: boolean;
  isDragging: boolean;
  layout: MoveLayout;
  originX: number;
  originY: number;
  pointerId: number;
  scroller: HTMLElement | null;
  source: HTMLElement;
  timezoneID: string;
}

interface MoveTargetStore {
  get: () => MoveTarget | null;
  getMonthTarget: () => MoveTarget | null;
  set: (target: MoveTarget | null) => void;
  subscribe: (listener: () => void) => () => void;
}

interface MoveController {
  cancel: () => void;
  dispose: () => void;
  press: (
    pointerEvent: PointerEvent<HTMLElement>,
    event: CalendarEvent,
    layout: MoveLayout,
    timezoneID: string,
  ) => void;
}

function normalizeSnapMinutes(snapMinutes: number | undefined): number {
  return snapMinutes != null && Number.isFinite(snapMinutes) && snapMinutes > 0
    ? Math.max(1, Math.floor(snapMinutes))
    : DEFAULT_SNAP_MINUTES;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isSameTarget(a: MoveTarget | null, b: MoveTarget | null): boolean {
  if (a == null || b == null) {
    return a === b;
  }
  return a.startMinutes === b.startMinutes && plainDateIsEqual(a.date, b.date);
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value != null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as {then?: unknown}).then === 'function'
  );
}

function preventDefault(event: Event): void {
  event.preventDefault();
}

/**
 * The dragged event holds pointer capture, so releasing the pointer fires a
 * click on it that would open its popover. Swallow that click, and drop the
 * listener once the release has finished dispatching if no click came.
 */
function suppressNextClick(): void {
  const suppress = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  };
  window.addEventListener('click', suppress, {capture: true, once: true});
  setTimeout(() => {
    window.removeEventListener('click', suppress, {capture: true});
  }, 0);
}

function createMoveTargetStore(): MoveTargetStore {
  let target: MoveTarget | null = null;
  const listeners = new Set<() => void>();
  return {
    get: () => target,
    getMonthTarget: () => (target?.startMinutes === null ? target : null),
    set: next => {
      if (isSameTarget(target, next)) {
        return;
      }
      target = next;
      listeners.forEach(listener => listener());
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function getNoTarget(): null {
  return null;
}

function getDurationMinutes(event: CalendarEvent): number {
  return isDayEvent(event)
    ? 0
    : (event.end - event.start) / MILLISECONDS_PER_MINUTE;
}

function getTimeGridStartMinutes(
  press: PressState,
  cell: Element,
  snapMinutes: number,
): number {
  const rect = cell.getBoundingClientRect();
  const hourHeight = Math.max(1, rect.height);
  const hour = Number(cell.getAttribute(HOUR_ATTRIBUTE));
  const minMinutes =
    Number(cell.getAttribute(MIN_HOUR_ATTRIBUTE)) * MINUTES_PER_HOUR;
  const maxMinutes =
    Number(cell.getAttribute(MAX_HOUR_ATTRIBUTE)) * MINUTES_PER_HOUR;
  const durationMinutes = getDurationMinutes(press.event);
  const grabMinutes = clamp(
    (press.grabOffsetPx / hourHeight) * MINUTES_PER_HOUR,
    0,
    durationMinutes,
  );
  const pointerMinutes =
    hour * MINUTES_PER_HOUR +
    ((press.clientY - rect.top) / hourHeight) * MINUTES_PER_HOUR;
  const snappedMinutes =
    Math.round((pointerMinutes - grabMinutes) / snapMinutes) * snapMinutes;
  return clamp(
    snappedMinutes,
    minMinutes,
    Math.max(minMinutes, maxMinutes - durationMinutes),
  );
}

/**
 * Finds the cell under the pointer. `elementsFromPoint` also reaches cells
 * beneath the month event pills and the dimmed source that sit above them.
 */
function findMoveTarget(
  press: PressState,
  snapMinutes: number,
): MoveTarget | null {
  for (const element of document.elementsFromPoint(
    press.clientX,
    press.clientY,
  )) {
    const date = element.getAttribute(DATE_ATTRIBUTE);
    if (date == null) {
      continue;
    }
    const isTimeGridCell = element.hasAttribute(HOUR_ATTRIBUTE);
    if (isTimeGridCell !== (press.layout === 'timeGrid')) {
      return null;
    }
    return {
      date: Temporal.PlainDate.from(date),
      startMinutes: isTimeGridCell
        ? getTimeGridStartMinutes(press, element, snapMinutes)
        : null,
    };
  }
  return null;
}

function moveEventToDate(
  event: CalendarEvent,
  date: PlainDate,
  timezoneID: string,
): ScheduleEventMoveChange {
  if (isDayEvent(event)) {
    const durationDays = event.start.until(event.end).days;
    return {
      end: date.add({days: durationDays}),
      event,
      start: date,
    };
  }

  const startTime = Temporal.Instant.fromEpochMilliseconds(event.start)
    .toZonedDateTimeISO(timezoneID)
    .toPlainTime();
  const start = date
    .toPlainDateTime(startTime)
    .toZonedDateTime(timezoneID).epochMilliseconds;
  return {
    end: start + (event.end - event.start),
    event,
    start,
  };
}

function getMoveChange(
  press: PressState,
  target: MoveTarget,
): ScheduleEventMoveChange | null {
  const {event, timezoneID} = press;
  if (target.startMinutes == null) {
    return moveEventToDate(event, target.date, timezoneID);
  }
  if (isDayEvent(event)) {
    return null;
  }
  const start = instantFromDateAndMinutes(
    target.date,
    target.startMinutes,
    timezoneID,
  );
  return {end: start + (event.end - event.start), event, start};
}

/**
 * Moves preserve duration, so comparing the start is enough.
 */
function hasChanged({event, start}: ScheduleEventMoveChange): boolean {
  return isDayEvent(event) && typeof start !== 'number'
    ? !plainDateIsEqual(event.start, start)
    : event.start !== start;
}

/**
 * Scroll step for a pointer near the time grid's visible edges. The sticky
 * header rows cover the top of the scroller, so the top edge is measured from
 * their bottom.
 */
function getAutoScrollDelta(
  scroller: HTMLElement,
  clientX: number,
  clientY: number,
): number {
  const rect = scroller.getBoundingClientRect();
  if (
    scroller.scrollHeight <= scroller.clientHeight ||
    clientX < rect.left ||
    clientX > rect.right
  ) {
    return 0;
  }
  const header = scroller.querySelector('[role="rowgroup"]');
  const top = Math.max(
    rect.top,
    header?.getBoundingClientRect().bottom ?? rect.top,
  );
  const getStep = (distance: number): number =>
    Math.ceil(
      Math.min(1, distance / AUTO_SCROLL_EDGE_PX) * AUTO_SCROLL_MAX_STEP_PX,
    );
  if (clientY < top + AUTO_SCROLL_EDGE_PX && scroller.scrollTop > 0) {
    return -getStep(top + AUTO_SCROLL_EDGE_PX - clientY);
  }
  if (
    clientY > rect.bottom - AUTO_SCROLL_EDGE_PX &&
    scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight
  ) {
    return getStep(clientY - (rect.bottom - AUTO_SCROLL_EDGE_PX));
  }
  return 0;
}

/**
 * Owns one gesture at a time: the press, the drag that follows once the
 * pointer passes the threshold, and the save that follows the drop. The drop
 * target lives in `targetStore` rather than React state so dragging re-renders
 * only the silhouette, never the schedule.
 */
function createMoveController({
  getOptions,
  onActiveMoveChange,
  targetStore,
}: {
  getOptions: () => ScheduleEventMovePluginOptions;
  onActiveMoveChange: (move: ActiveMove | null) => void;
  targetStore: MoveTargetStore;
}): MoveController {
  let activeMove: ActiveMove | null = null;
  let press: PressState | null = null;
  let autoScrollFrame: number | null = null;

  const setActiveMove = (move: ActiveMove | null): void => {
    activeMove = move;
    onActiveMoveChange(move);
  };

  const updateTarget = (currentPress: PressState): void => {
    targetStore.set(
      findMoveTarget(
        currentPress,
        normalizeSnapMinutes(getOptions().snapMinutes),
      ),
    );
  };

  const stopAutoScroll = (): void => {
    if (autoScrollFrame != null) {
      cancelAnimationFrame(autoScrollFrame);
      autoScrollFrame = null;
    }
  };

  const autoScroll = (): void => {
    autoScrollFrame = null;
    if (press?.scroller == null || !press.isDragging || press.isCanceled) {
      return;
    }
    const delta = getAutoScrollDelta(
      press.scroller,
      press.clientX,
      press.clientY,
    );
    if (delta !== 0) {
      press.scroller.scrollTop += delta;
      updateTarget(press);
    }
    autoScrollFrame = requestAnimationFrame(autoScroll);
  };

  const finish = (): void => {
    stopAutoScroll();
    targetStore.set(null);
    setActiveMove(null);
  };

  const commit = (currentPress: PressState): void => {
    const target = targetStore.get();
    const change = target == null ? null : getMoveChange(currentPress, target);
    if (change == null || !hasChanged(change)) {
      finish();
      return;
    }

    let result: unknown;
    try {
      result = getOptions().onMove(change);
    } catch (error) {
      finish();
      throw error;
    }
    if (!isPromiseLike(result)) {
      finish();
      return;
    }
    setActiveMove({
      event: currentPress.event,
      layout: currentPress.layout,
      phase: 'saving',
    });
    result.then(finish, finish);
  };

  const handlePointerMove = (pointerEvent: globalThis.PointerEvent): void => {
    if (press?.pointerId !== pointerEvent.pointerId || press.isCanceled) {
      return;
    }
    press.clientX = pointerEvent.clientX;
    press.clientY = pointerEvent.clientY;
    if (!press.isDragging) {
      if (
        Math.hypot(
          press.clientX - press.originX,
          press.clientY - press.originY,
        ) < DRAG_THRESHOLD_PX
      ) {
        return;
      }
      press.isDragging = true;
      // Capture keeps the grabbing cursor and stops other events reacting to
      // hover while one is dragged across them.
      if (typeof press.source.setPointerCapture === 'function') {
        press.source.setPointerCapture(press.pointerId);
      }
      setActiveMove({
        event: press.event,
        layout: press.layout,
        phase: 'dragging',
      });
      if (press.scroller != null) {
        autoScrollFrame = requestAnimationFrame(autoScroll);
      }
    }
    updateTarget(press);
  };

  const removeListeners = (): void => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerCancel);
    document.removeEventListener('selectstart', preventDefault);
  };

  const endPress = (): PressState | null => {
    const endedPress = press;
    press = null;
    removeListeners();
    return endedPress;
  };

  function handlePointerUp(pointerEvent: globalThis.PointerEvent): void {
    if (press?.pointerId !== pointerEvent.pointerId) {
      return;
    }
    const endedPress = endPress();
    if (endedPress?.isDragging !== true) {
      return;
    }
    suppressNextClick();
    if (endedPress.isCanceled) {
      return;
    }
    stopAutoScroll();
    endedPress.clientX = pointerEvent.clientX;
    endedPress.clientY = pointerEvent.clientY;
    updateTarget(endedPress);
    commit(endedPress);
  }

  function handlePointerCancel(pointerEvent: globalThis.PointerEvent): void {
    if (press?.pointerId !== pointerEvent.pointerId) {
      return;
    }
    const endedPress = endPress();
    if (endedPress?.isDragging === true && !endedPress.isCanceled) {
      finish();
    }
  }

  return {
    // Escape abandons the drag but keeps listening until the release, so the
    // click that follows it is still swallowed.
    cancel: () => {
      if (press?.isDragging !== true || press.isCanceled) {
        return;
      }
      press.isCanceled = true;
      finish();
    },
    dispose: () => {
      endPress();
      stopAutoScroll();
    },
    press: (pointerEvent, event, layout, timezoneID) => {
      // Touch is excluded: the grid needs touch gestures for scrolling.
      if (
        pointerEvent.button !== 0 ||
        pointerEvent.pointerType === 'touch' ||
        press != null ||
        activeMove != null
      ) {
        return;
      }

      const source = pointerEvent.currentTarget;
      press = {
        clientX: pointerEvent.clientX,
        clientY: pointerEvent.clientY,
        event,
        grabOffsetPx: pointerEvent.clientY - source.getBoundingClientRect().top,
        isCanceled: false,
        isDragging: false,
        layout,
        originX: pointerEvent.clientX,
        originY: pointerEvent.clientY,
        pointerId: pointerEvent.pointerId,
        scroller:
          layout === 'timeGrid'
            ? source.closest<HTMLElement>('[role="grid"]')
            : null,
        source,
        timezoneID,
      };
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerCancel);
      // Dragging a static event pill would otherwise select text across the
      // grid.
      document.addEventListener('selectstart', preventDefault);
    },
  };
}

/**
 * The dragged event drawn at its drop target in a time grid. One renders in
 * each visible day's first hour cell and positions itself within the day, so
 * moving between hours re-renders only this component.
 */
function ScheduleEventMoveSilhouette({
  date,
  event,
  hourHeight,
  minHour,
  phase,
  targetStore,
}: {
  date: PlainDate;
  event: CalendarEvent;
  hourHeight: number;
  minHour: number;
  phase: ActiveMove['phase'];
  targetStore: MoveTargetStore;
}): React.JSX.Element | null {
  const {categoryMap, eventBorderStyle, timezoneID} = useScheduleContext();
  const target = useSyncExternalStore(
    targetStore.subscribe,
    targetStore.get,
    getNoTarget,
  );
  if (
    target?.startMinutes == null ||
    isDayEvent(event) ||
    !plainDateIsEqual(target.date, date)
  ) {
    return null;
  }

  const start = instantFromDateAndMinutes(
    date,
    target.startMinutes,
    timezoneID,
  );
  const end = start + (event.end - event.start);
  const classes = scheduleEventRecipe({
    color: getCategory(categoryMap, event).color,
    eventBorderStyle,
    isCanceled: event.isCanceled,
    layout: 'block',
  });
  return (
    <div
      aria-hidden="true"
      className={cx(classes.event, moveClasses.silhouette)}
      data-state={phase}
      data-testid={`schedule-event-move-silhouette-${event.id}`}
      style={{
        ...getTimedEventBlockStyle({
          height: (getDurationMinutes(event) / MINUTES_PER_HOUR) * hourHeight,
          level: 0,
          top:
            ((target.startMinutes - minHour * MINUTES_PER_HOUR) /
              MINUTES_PER_HOUR) *
            hourHeight,
        }),
        zIndex: SILHOUETTE_Z_INDEX,
      }}>
      <span className={classes.title}>{event.title}</span>
      <span className={classes.time}>
        {formatTimeRange(start, end, timezoneID)}
      </span>
    </div>
  );
}

function createScheduleEventMovePlugin({
  activeMove,
  controller,
  getIsMovable,
  monthTarget,
  targetStore,
}: {
  activeMove: ActiveMove | null;
  controller: MoveController;
  getIsMovable: ((event: CalendarEvent) => boolean) | undefined;
  monthTarget: MoveTarget | null;
  targetStore: MoveTargetStore;
}): SchedulePlugin {
  return {
    getEventProps({
      event,
      layout,
      timezoneID,
    }: ScheduleEventPropsRenderProps): SchedulePluginElementProps {
      if (
        layout === 'inline' ||
        (layout === 'timeGrid' && isDayEvent(event)) ||
        getIsMovable?.(event) === false
      ) {
        return {};
      }

      return {
        ...(activeMove?.event.id === event.id
          ? {className: moveClasses.source, [SOURCE_ATTRIBUTE]: ''}
          : {}),
        onPointerDown: pointerEvent => {
          controller.press(pointerEvent, event, layout, timezoneID);
        },
      };
    },
    getMonthCellProps({date}): SchedulePluginElementProps {
      return {
        [DATE_ATTRIBUTE]: date.toString(),
        ...(monthTarget != null && plainDateIsEqual(monthTarget.date, date)
          ? {className: moveClasses.targetCell, [TARGET_ATTRIBUTE]: ''}
          : {}),
      };
    },
    getTimeGridCellProps({
      date,
      hour,
      maxHour,
      minHour,
    }): SchedulePluginElementProps {
      return {
        [DATE_ATTRIBUTE]: date.toString(),
        [HOUR_ATTRIBUTE]: hour,
        [MAX_HOUR_ATTRIBUTE]: maxHour,
        [MIN_HOUR_ATTRIBUTE]: minHour,
      };
    },
    renderTimeGridCellContent({date, hour, hourHeight, minHour}): ReactNode {
      if (activeMove?.layout !== 'timeGrid' || hour !== minHour) {
        return null;
      }
      return (
        <ScheduleEventMoveSilhouette
          date={date}
          event={activeMove.event}
          hourHeight={hourHeight}
          minHour={minHour}
          phase={activeMove.phase}
          targetStore={targetStore}
        />
      );
    },
  };
}

/**
 * Lets users move events by dragging them: month-view events to another day,
 * and day/week timed events to another day and snapped time. While dragging,
 * the event dims in place and a silhouette marks where it would land: a copy
 * of the event showing its new time in time grids, or a highlighted day cell
 * in the month view. Dragging near the top or bottom of a scrolling time grid
 * scrolls it, and Escape cancels the move.
 *
 * A press that never travels past a few pixels stays a click, so movable
 * events keep their popovers. Moving is a mouse and pen gesture: touch keeps
 * scrolling the grid, and there is no keyboard equivalent, so offer another
 * way to reschedule, such as an edit form in the event popover.
 */
export function useScheduleEventMovePlugin<TAuxiliaryData = unknown>(
  options: ScheduleEventMovePluginOptions<TAuxiliaryData>,
): SchedulePlugin {
  const optionsRef = useLatest(options);
  const [activeMove, setActiveMove] = useState<ActiveMove | null>(null);
  const targetStore = useConstant(createMoveTargetStore);
  const controller = useConstant(() =>
    createMoveController({
      getOptions: () => optionsRef.current as ScheduleEventMovePluginOptions,
      onActiveMoveChange: setActiveMove,
      targetStore,
    }),
  );
  // Only month targets reach React state, and only when the day changes; time
  // grid targets stay in the store for the silhouette.
  const monthTarget = useSyncExternalStore(
    targetStore.subscribe,
    targetStore.getMonthTarget,
    getNoTarget,
  );

  useHotkey('escape', controller.cancel, {
    isEnabled: activeMove?.phase === 'dragging',
    isEnabledOnFormElements: true,
    target: 'window',
  });

  useEffect(() => controller.dispose, [controller]);

  const {getIsMovable} = options;
  return useMemo(
    () =>
      createScheduleEventMovePlugin({
        activeMove,
        controller,
        getIsMovable: getIsMovable as
          ((event: CalendarEvent) => boolean) | undefined,
        monthTarget,
        targetStore,
      }),
    [activeMove, controller, getIsMovable, monthTarget, targetStore],
  );
}
