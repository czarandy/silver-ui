'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type RefCallback,
} from 'react';
import {usePopover} from 'components/Popover/usePopover';
import {instantFromDateAndMinutes} from 'components/Schedule/dateMath';
import {
  formatTimeRange,
  getTimedEventBlockStyle,
} from 'components/Schedule/shared';
import type {
  Instant,
  PlainDate,
  SchedulePlugin,
  ScheduleTimeGridCellPropsRenderProps,
} from 'components/Schedule/types';
import useHotkey from 'hooks/useHotkey';
import {plainDateIsEqual} from 'internal/plainDate';
import useLatest from 'internal/useLatest';
import {sva} from 'styled-system/css';

const DEFAULT_DURATION_MINUTES = 60;
const DEFAULT_SNAP_MINUTES = 15;
const MIN_DURATION_MINUTES = 15;
const MINUTES_PER_HOUR = 60;
/**
 * Above every timed event (`level + 1`) and the current-time indicator (`20`),
 * so the draft is never hidden behind the events it overlaps.
 */
const GHOST_Z_INDEX = 21;
/**
 * Marks the ghost's time label so the drag preview can rewrite it in place.
 */
const GHOST_TIME_ATTRIBUTE = 'data-schedule-ghost-time';

const ghostRecipe = sva({
  slots: ['event', 'time', 'title'],
  base: {
    event: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      minW: 0,
      minH: '9',
      m: 0,
      px: '1',
      py: '0.5',
      appearance: 'none',
      borderWidth: 'default',
      borderStyle: 'dashed',
      borderColor: 'surface.blue.accent',
      borderRadius: 'sm',
      bg: 'surface.blue',
      color: 'surface.blue.fg',
      font: 'inherit',
      fontSize: 'xs',
      lineHeight: 'tight',
      overflow: 'hidden',
      textAlign: 'start',
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
      },
    },
    time: {
      flexShrink: 0,
      fontWeight: 'normal',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    title: {
      fontWeight: 'bold',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  variants: {
    // While the pointer is still down the ghost must not intercept the gesture
    // that is sizing it.
    isCommitted: {
      true: {event: {cursor: 'pointer'}},
      false: {event: {pointerEvents: 'none'}},
    },
  },
  defaultVariants: {isCommitted: false},
});

/**
 * The time range drafted by a create gesture, as epoch instants.
 */
export interface ScheduleEventDraft {
  end: Instant;
  start: Instant;
}

/**
 * Arguments passed to the create popover's `renderContent` callback.
 */
export interface ScheduleEventCreateRenderProps {
  /**
   * Dismisses the popover and removes the ghost event.
   */
  close: () => void;
  draft: ScheduleEventDraft;
  timezoneID: string;
}

export interface ScheduleEventCreatePluginOptions {
  /**
   * Duration, in minutes, of the draft created by a click without a drag.
   * @default 60
   */
  defaultDurationMinutes?: number;
  /**
   * Renders the popover content anchored to the ghost event. Receives the
   * drafted range and `close` so the content can dismiss itself after saving.
   */
  renderContent: (props: ScheduleEventCreateRenderProps) => ReactNode;
  /**
   * Snap interval, in minutes, applied to the drafted range.
   * @default 15
   */
  snapMinutes?: number;
}

interface DraftRange {
  endMinutes: number;
  startMinutes: number;
}

interface DraftState extends DraftRange {
  date: PlainDate;
  /**
   * Distinguishes successive drafts so a stale popover dismissal cannot clear
   * the draft that replaced it.
   */
  id: number;
  isCommitted: boolean;
}

interface CellGeometry {
  cellTop: number;
  hour: number;
  hourHeight: number;
  maxMinutes: number;
  minMinutes: number;
  snapMinutes: number;
}

interface DragState extends CellGeometry {
  anchorMinutes: number;
  date: PlainDate;
  defaultDurationMinutes: number;
  /**
   * Hour of the cell the ghost is mounted in, set when the ghost first appears.
   * The ghost stays in that cell for the rest of the gesture, so previews are
   * positioned relative to it even when the pointer moves into other hours.
   */
  ghostHour: number;
  /**
   * Whether the pointer has moved far enough to snap to a different minute.
   * Until it has, the gesture is still a click and no ghost is shown — showing
   * one on pointer down would paint a default-duration block that the first
   * drag step immediately collapses to the minimum duration.
   */
  hasDragged: boolean;
  id: number;
  previewedRange: DraftRange | null;
  timezoneID: string;
}

function normalizeMinutes(value: number | undefined, fallback: number): number {
  return value != null && Number.isFinite(value) && value > 0
    ? Math.max(1, Math.floor(value))
    : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getPointerMinutes(geometry: CellGeometry, clientY: number): number {
  const rawMinutes =
    geometry.hour * MINUTES_PER_HOUR +
    ((clientY - geometry.cellTop) / geometry.hourHeight) * MINUTES_PER_HOUR;
  const snappedMinutes =
    Math.round(rawMinutes / geometry.snapMinutes) * geometry.snapMinutes;
  return clamp(snappedMinutes, geometry.minMinutes, geometry.maxMinutes);
}

function getMinDurationMinutes(drag: DragState): number {
  return Math.min(
    Math.max(MIN_DURATION_MINUTES, drag.snapMinutes),
    drag.maxMinutes - drag.minMinutes,
  );
}

/**
 * Range for a click that never became a drag. Near the bottom of the grid the
 * range slides up rather than shrinking.
 */
function getDefaultRange(drag: DragState): DraftRange {
  const durationMinutes = Math.min(
    drag.defaultDurationMinutes,
    drag.maxMinutes - drag.minMinutes,
  );
  const endMinutes = Math.min(
    drag.maxMinutes,
    drag.anchorMinutes + durationMinutes,
  );
  return {
    endMinutes,
    startMinutes: Math.max(drag.minMinutes, endMinutes - durationMinutes),
  };
}

function getDragRange(drag: DragState, pointerMinutes: number): DraftRange {
  const startMinutes = Math.min(drag.anchorMinutes, pointerMinutes);
  const draggedEndMinutes = Math.max(drag.anchorMinutes, pointerMinutes);
  const minDurationMinutes = getMinDurationMinutes(drag);
  if (draggedEndMinutes - startMinutes >= minDurationMinutes) {
    return {endMinutes: draggedEndMinutes, startMinutes};
  }

  const endMinutes = Math.min(
    drag.maxMinutes,
    startMinutes + minDurationMinutes,
  );
  return {
    endMinutes,
    startMinutes: Math.max(drag.minMinutes, endMinutes - minDurationMinutes),
  };
}

function getGhostStyle({
  endMinutes,
  hour,
  hourHeight,
  startMinutes,
}: DraftRange & {hour: number; hourHeight: number}): CSSProperties {
  return {
    ...getTimedEventBlockStyle({
      height: ((endMinutes - startMinutes) / MINUTES_PER_HOUR) * hourHeight,
      level: 0,
      top:
        ((startMinutes - hour * MINUTES_PER_HOUR) / MINUTES_PER_HOUR) *
        hourHeight,
    }),
    zIndex: GHOST_Z_INDEX,
  };
}

function getRangeTimeLabel(drag: DragState, range: DraftRange): string {
  return formatTimeRange(
    instantFromDateAndMinutes(drag.date, range.startMinutes, drag.timezoneID),
    instantFromDateAndMinutes(drag.date, range.endMinutes, drag.timezoneID),
    drag.timezoneID,
  );
}

/**
 * Mutates the mounted ghost directly during the drag, mirroring the resize
 * plugin, so sizing the draft never re-renders the schedule. Snapping means the
 * range only changes every few pixels, so the label reformats rarely.
 */
function applyGhostPreview(
  ghostElement: HTMLElement,
  drag: DragState,
  range: DraftRange,
): void {
  if (
    drag.previewedRange?.startMinutes === range.startMinutes &&
    drag.previewedRange.endMinutes === range.endMinutes
  ) {
    return;
  }

  drag.previewedRange = range;
  const style = getGhostStyle({
    ...range,
    hour: drag.ghostHour,
    hourHeight: drag.hourHeight,
  });
  ghostElement.style.height = String(style.height);
  ghostElement.style.top = String(style.top);

  const timeLabel = getRangeTimeLabel(drag, range);
  ghostElement.setAttribute('aria-label', `New event, ${timeLabel}`);
  const timeElement = ghostElement.querySelector(`[${GHOST_TIME_ATTRIBUTE}]`);
  if (timeElement != null) {
    timeElement.textContent = timeLabel;
  }
}

function ScheduleEventCreateGhost({
  draft,
  hour,
  hourHeight,
  onDismiss,
  onGhostElement,
  renderContent,
  timezoneID,
}: {
  draft: DraftState;
  hour: number;
  hourHeight: number;
  onDismiss: (draftID: number) => void;
  onGhostElement: RefCallback<HTMLElement>;
  renderContent: (props: ScheduleEventCreateRenderProps) => ReactNode;
  timezoneID: string;
}): React.JSX.Element {
  const {date, endMinutes, id, isCommitted, startMinutes} = draft;
  const hasOpenedRef = useRef(false);
  const handleHide = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);
  const popover = usePopover({
    // The consumer's content renders its own dismiss affordance via `close`.
    hasCloseButton: false,
    label: 'Create event',
    onHide: handleHide,
    role: 'dialog',
  });
  const {hide, show, triggerRef} = popover;

  // Opening from an effect rather than a click keeps the popover clear of the
  // gesture that created it: binding `toggle` to the ghost would let the click
  // synthesized after the committing `pointerup` close it immediately.
  useEffect(() => {
    if (isCommitted && !hasOpenedRef.current) {
      hasOpenedRef.current = true;
      show();
    }
  }, [isCommitted, show]);

  const eventDraft = useMemo(
    (): ScheduleEventDraft => ({
      end: instantFromDateAndMinutes(date, endMinutes, timezoneID),
      start: instantFromDateAndMinutes(date, startMinutes, timezoneID),
    }),
    [date, endMinutes, startMinutes, timezoneID],
  );
  const close = useCallback(() => {
    hide();
    onDismiss(id);
  }, [hide, id, onDismiss]);
  const setGhostElement = useCallback<RefCallback<HTMLElement>>(
    element => {
      onGhostElement(element);
      triggerRef(element);
    },
    [onGhostElement, triggerRef],
  );

  const classes = ghostRecipe({isCommitted});
  const timeLabel = formatTimeRange(
    eventDraft.start,
    eventDraft.end,
    timezoneID,
  );
  return (
    <>
      <button
        aria-label={`New event, ${timeLabel}`}
        className={classes.event}
        data-testid="schedule-event-create-ghost"
        ref={setGhostElement}
        style={getGhostStyle({endMinutes, hour, hourHeight, startMinutes})}
        type="button"
        {...popover.triggerProps}>
        <span className={classes.title}>New event</span>
        <span {...{[GHOST_TIME_ATTRIBUTE]: ''}} className={classes.time}>
          {timeLabel}
        </span>
      </button>
      {popover.render(renderContent({close, draft: eventDraft, timezoneID}), {
        alignment: 'start',
        offsetX: 8,
        offsetY: -3,
        placement: 'end',
      })}
    </>
  );
}

function createScheduleEventCreatePlugin({
  draft,
  onDismiss,
  onGhostElement,
  onPointerDown,
  renderContent,
}: {
  draft: DraftState | null;
  onDismiss: (draftID: number) => void;
  onGhostElement: RefCallback<HTMLElement>;
  onPointerDown: (
    pointerEvent: PointerEvent<HTMLElement>,
    cell: ScheduleTimeGridCellPropsRenderProps,
  ) => void;
  renderContent: (props: ScheduleEventCreateRenderProps) => ReactNode;
}): SchedulePlugin {
  return {
    getTimeGridCellProps(
      cell: ScheduleTimeGridCellPropsRenderProps,
    ): React.HTMLAttributes<HTMLElement> {
      return {
        onPointerDown: pointerEvent => {
          onPointerDown(pointerEvent, cell);
        },
      };
    },
    renderTimeGridCellContent({
      date,
      hour,
      hourHeight,
      timezoneID,
    }: ScheduleTimeGridCellPropsRenderProps): ReactNode {
      if (
        draft == null ||
        !plainDateIsEqual(draft.date, date) ||
        Math.floor(draft.startMinutes / MINUTES_PER_HOUR) !== hour
      ) {
        return null;
      }

      return (
        <ScheduleEventCreateGhost
          draft={draft}
          hour={hour}
          hourHeight={hourHeight}
          // A new gesture must mount a fresh ghost so the previous popover
          // unmounts instead of lingering over the new draft.
          key={draft.id}
          onDismiss={onDismiss}
          onGhostElement={onGhostElement}
          renderContent={renderContent}
          timezoneID={timezoneID}
        />
      );
    },
  };
}

/**
 * Lets users draft a new event in the day/week time-grid views by clicking an
 * empty hour cell, or by pressing and dragging to sweep out a time range. The
 * draft renders as a ghost event and opens a popover whose content the consumer
 * supplies through `renderContent`.
 *
 * The plugin owns only the transient draft: it never creates an event. The
 * consumer's popover content is responsible for persisting the new event and
 * calling `close()`.
 *
 * Creation is a pointer gesture; there is no keyboard equivalent, matching the
 * event move plugin. Provide a header affordance (via a `renderHeader` plugin)
 * that renders the same form for keyboard-only users.
 */
export function useScheduleEventCreatePlugin(
  options: ScheduleEventCreatePluginOptions,
): SchedulePlugin {
  const optionsRef = useLatest(options);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const draftIDRef = useRef(0);
  const ghostElementRef = useRef<HTMLElement | null>(null);
  const listenersRef = useRef<{
    cancel: (event: globalThis.PointerEvent) => void;
    move: (event: globalThis.PointerEvent) => void;
    up: (event: globalThis.PointerEvent) => void;
  } | null>(null);

  const defaultDurationMinutes = normalizeMinutes(
    options.defaultDurationMinutes,
    DEFAULT_DURATION_MINUTES,
  );
  const snapMinutes = normalizeMinutes(
    options.snapMinutes,
    DEFAULT_SNAP_MINUTES,
  );

  const renderContent = useCallback(
    (props: ScheduleEventCreateRenderProps): ReactNode =>
      optionsRef.current.renderContent(props),
    [optionsRef],
  );

  const dismiss = useCallback((draftID: number) => {
    setDraft(current => (current?.id === draftID ? null : current));
  }, []);

  const setGhostElement = useCallback<RefCallback<HTMLElement>>(element => {
    ghostElementRef.current = element;
  }, []);

  const removeListeners = useCallback(() => {
    const listeners = listenersRef.current;
    if (listeners == null) {
      return;
    }

    window.removeEventListener('pointermove', listeners.move);
    window.removeEventListener('pointerup', listeners.up);
    window.removeEventListener('pointercancel', listeners.cancel);
    listenersRef.current = null;
  }, []);

  const endDrag = useCallback((): DragState | null => {
    const drag = dragRef.current;
    removeListeners();
    dragRef.current = null;
    return drag;
  }, [removeListeners]);

  const handlePointerMove = useCallback((event: globalThis.PointerEvent) => {
    const drag = dragRef.current;
    if (drag == null) {
      return;
    }

    const pointerMinutes = getPointerMinutes(drag, event.clientY);
    if (!drag.hasDragged && pointerMinutes === drag.anchorMinutes) {
      return;
    }

    const range = getDragRange(drag, pointerMinutes);
    const ghostElement = ghostElementRef.current;
    if (drag.hasDragged && ghostElement != null) {
      applyGhostPreview(ghostElement, drag, range);
      return;
    }

    // First drag step: mount the ghost from state. Later steps mutate it in
    // place so sizing the draft never re-renders the schedule.
    drag.hasDragged = true;
    drag.ghostHour = Math.floor(range.startMinutes / MINUTES_PER_HOUR);
    drag.previewedRange = range;
    setDraft({...range, date: drag.date, id: drag.id, isCommitted: false});
  }, []);

  const handlePointerUp = useCallback(
    (event: globalThis.PointerEvent) => {
      const drag = endDrag();
      if (drag == null) {
        return;
      }

      const pointerMinutes = getPointerMinutes(drag, event.clientY);
      const isDrag = drag.hasDragged || pointerMinutes !== drag.anchorMinutes;
      const range = isDrag
        ? getDragRange(drag, pointerMinutes)
        : getDefaultRange(drag);
      setDraft({...range, date: drag.date, id: drag.id, isCommitted: true});
    },
    [endDrag],
  );

  const handlePointerCancel = useCallback(() => {
    const drag = endDrag();
    if (drag != null) {
      dismiss(drag.id);
    }
  }, [dismiss, endDrag]);

  useHotkey('escape', handlePointerCancel, {
    enableOnFormElements: true,
    target: 'window',
  });

  const handlePointerDown = useCallback(
    (
      pointerEvent: PointerEvent<HTMLElement>,
      cell: ScheduleTimeGridCellPropsRenderProps,
    ) => {
      // Existing events and the ghost are children of the cell, so only a
      // pointer landing on the cell itself starts a draft. Touch is excluded:
      // the grid needs `touch-action` for scrolling.
      if (
        pointerEvent.button !== 0 ||
        pointerEvent.pointerType === 'touch' ||
        pointerEvent.target !== pointerEvent.currentTarget
      ) {
        return;
      }

      pointerEvent.preventDefault();
      removeListeners();

      const geometry: CellGeometry = {
        cellTop: pointerEvent.currentTarget.getBoundingClientRect().top,
        hour: cell.hour,
        hourHeight: cell.hourHeight,
        maxMinutes: cell.maxHour * MINUTES_PER_HOUR,
        minMinutes: cell.minHour * MINUTES_PER_HOUR,
        snapMinutes,
      };
      draftIDRef.current += 1;
      dragRef.current = {
        ...geometry,
        anchorMinutes: getPointerMinutes(geometry, pointerEvent.clientY),
        date: cell.date,
        defaultDurationMinutes,
        ghostHour: 0,
        hasDragged: false,
        id: draftIDRef.current,
        previewedRange: null,
        timezoneID: cell.timezoneID,
      };
      // Any draft already on screen belongs to a previous gesture; drop it now
      // rather than leaving it up until this one resolves.
      setDraft(null);

      listenersRef.current = {
        cancel: handlePointerCancel,
        move: handlePointerMove,
        up: handlePointerUp,
      };
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerCancel);
    },
    [
      defaultDurationMinutes,
      handlePointerCancel,
      handlePointerMove,
      handlePointerUp,
      removeListeners,
      snapMinutes,
    ],
  );

  useEffect(() => removeListeners, [removeListeners]);

  return useMemo(
    () =>
      createScheduleEventCreatePlugin({
        draft,
        onDismiss: dismiss,
        onGhostElement: setGhostElement,
        onPointerDown: handlePointerDown,
        renderContent,
      }),
    [dismiss, draft, handlePointerDown, renderContent, setGhostElement],
  );
}
