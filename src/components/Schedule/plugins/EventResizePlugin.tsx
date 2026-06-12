import {
  useCallback,
  useMemo,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import {isDayEvent} from 'components/Schedule/dateMath';
import type {
  CalendarInstantEvent,
  Instant,
  SchedulePlugin,
  ScheduleTimeGridEventRenderProps,
} from 'components/Schedule/types';
import useLatest from 'internal/useLatest';
import {cva} from 'styled-system/css';

const MIN_DURATION_MINUTES = 15;
const DEFAULT_SNAP_MINUTES = 15;
const MILLISECONDS_PER_MINUTE = 60_000;

type ResizeEdge = 'start' | 'end';

const resizeHandle = cva({
  base: {
    position: 'absolute',
    insetInline: 0,
    h: '3',
    cursor: 'ns-resize',
    touchAction: 'none',
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: '-2px',
    },
  },
  variants: {
    edge: {
      start: {
        insetBlockStart: 0,
      },
      end: {
        insetBlockEnd: 0,
      },
    },
  },
});

const resizeHandleClassNames = {
  end: resizeHandle({edge: 'end'}),
  start: resizeHandle({edge: 'start'}),
};

export interface ScheduleEventResizeChange<TAuxiliaryData = unknown> {
  end: Instant;
  event: CalendarInstantEvent<TAuxiliaryData>;
  start: Instant;
}

export interface ScheduleEventResizePluginOptions<TAuxiliaryData = unknown> {
  /**
   * Called when the user finishes dragging an event's resize handle.
   */
  onResize: (change: ScheduleEventResizeChange<TAuxiliaryData>) => void;
  /**
   * Snap interval, in minutes, applied to resize deltas.
   * @default 15
   */
  snapMinutes?: number;
}

interface ResizeState<TAuxiliaryData> {
  edge: ResizeEdge;
  event: CalendarInstantEvent<TAuxiliaryData>;
  eventElement: HTMLElement;
  hourHeight: number;
  initialHeight: string;
  initialPointerY: number;
  initialTop: string;
  onResize: (change: ScheduleEventResizeChange<TAuxiliaryData>) => void;
  snapMinutes: number;
}

function getDurationMinutes(start: Instant, end: Instant): number {
  return (end - start) / MILLISECONDS_PER_MINUTE;
}

function getSnappedDeltaMinutes(
  deltaPixels: number,
  hourHeight: number,
  snapMinutes: number,
): number {
  const rawMinutes = (deltaPixels / hourHeight) * 60;
  return Math.round(rawMinutes / snapMinutes) * snapMinutes;
}

function getResizeRange<TAuxiliaryData>(
  state: ResizeState<TAuxiliaryData>,
  clientY: number,
): {end: Instant; start: Instant} {
  const deltaMinutes = getSnappedDeltaMinutes(
    clientY - state.initialPointerY,
    state.hourHeight,
    state.snapMinutes,
  );
  const delta = deltaMinutes * MILLISECONDS_PER_MINUTE;
  const minDuration = MIN_DURATION_MINUTES * MILLISECONDS_PER_MINUTE;

  if (state.edge === 'start') {
    return {
      end: state.event.end,
      start: Math.min(state.event.end - minDuration, state.event.start + delta),
    };
  }

  return {
    end: Math.max(state.event.start + minDuration, state.event.end + delta),
    start: state.event.start,
  };
}

function getPreviewHeight<TAuxiliaryData>(
  state: ResizeState<TAuxiliaryData>,
  range: {end: Instant; start: Instant},
): string {
  return `${Math.max(
    36,
    (getDurationMinutes(range.start, range.end) / 60) * state.hourHeight - 5,
  )}px`;
}

function getPreviewTop<TAuxiliaryData>(
  state: ResizeState<TAuxiliaryData>,
  range: {end: Instant; start: Instant},
): string {
  const initialTop = Number.parseFloat(state.initialTop || '0');
  if (state.edge === 'end') {
    return state.initialTop;
  }

  const deltaMinutes = getDurationMinutes(state.event.start, range.start);
  return `${initialTop + (deltaMinutes / 60) * state.hourHeight}px`;
}

function applyPreview<TAuxiliaryData>(
  state: ResizeState<TAuxiliaryData>,
  range: {end: Instant; start: Instant},
): void {
  state.eventElement.style.height = getPreviewHeight(state, range);
  state.eventElement.style.top = getPreviewTop(state, range);
}

function ScheduleEventResizeHandle<TAuxiliaryData = unknown>({
  edge,
  event,
  hourHeight,
  onResize,
  snapMinutes,
}: {
  edge: ResizeEdge;
  event: CalendarInstantEvent<TAuxiliaryData>;
  hourHeight: number;
  onResize: (change: ScheduleEventResizeChange<TAuxiliaryData>) => void;
  snapMinutes: number;
}): React.JSX.Element {
  const resizeStateRef = useRef<ResizeState<TAuxiliaryData> | null>(null);
  const pointerListenersRef = useRef<{
    cancel: (event: globalThis.PointerEvent) => void;
    move: (event: globalThis.PointerEvent) => void;
    up: (event: globalThis.PointerEvent) => void;
  } | null>(null);

  const removePointerListeners = useCallback(() => {
    const listeners = pointerListenersRef.current;
    if (listeners == null) {
      return;
    }

    window.removeEventListener('pointermove', listeners.move);
    window.removeEventListener('pointerup', listeners.up);
    window.removeEventListener('pointercancel', listeners.cancel);
    pointerListenersRef.current = null;
  }, []);

  const finishResize = useCallback((clientY: number, isCommit: boolean) => {
    const state = resizeStateRef.current;
    if (state == null) {
      return;
    }

    const range = getResizeRange(state, clientY);
    if (isCommit) {
      if (range.start !== state.event.start || range.end !== state.event.end) {
        state.onResize({
          end: range.end,
          event: state.event,
          start: range.start,
        });
      }
    } else {
      state.eventElement.style.height = state.initialHeight;
      state.eventElement.style.top = state.initialTop;
    }
    resizeStateRef.current = null;
  }, []);

  const handlePointerMove = useCallback((event: globalThis.PointerEvent) => {
    const state = resizeStateRef.current;
    if (state == null) {
      return;
    }

    applyPreview(state, getResizeRange(state, event.clientY));
  }, []);

  const handlePointerUp = useCallback(
    (event: globalThis.PointerEvent) => {
      removePointerListeners();
      finishResize(event.clientY, true);
    },
    [finishResize, removePointerListeners],
  );

  const handlePointerCancel = useCallback(
    (event: globalThis.PointerEvent) => {
      removePointerListeners();
      finishResize(event.clientY, false);
    },
    [finishResize, removePointerListeners],
  );

  const handlePointerDown = useCallback(
    (pointerEvent: PointerEvent<HTMLSpanElement>) => {
      pointerEvent.preventDefault();
      pointerEvent.stopPropagation();

      const eventElement = pointerEvent.currentTarget.parentElement;
      if (!(eventElement instanceof HTMLElement)) {
        return;
      }

      resizeStateRef.current = {
        edge,
        event,
        eventElement,
        hourHeight,
        initialHeight: eventElement.style.height,
        initialPointerY: pointerEvent.clientY,
        initialTop: eventElement.style.top,
        onResize,
        snapMinutes,
      };

      pointerListenersRef.current = {
        cancel: handlePointerCancel,
        move: handlePointerMove,
        up: handlePointerUp,
      };
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerCancel);
    },
    [
      edge,
      event,
      handlePointerCancel,
      handlePointerMove,
      handlePointerUp,
      hourHeight,
      onResize,
      snapMinutes,
    ],
  );

  const handleKeyDown = useCallback(
    (keyEvent: KeyboardEvent<HTMLSpanElement>) => {
      const direction =
        keyEvent.key === 'ArrowDown' ? 1 : keyEvent.key === 'ArrowUp' ? -1 : 0;
      if (direction === 0) {
        return;
      }

      keyEvent.preventDefault();
      keyEvent.stopPropagation();

      const delta = direction * snapMinutes * MILLISECONDS_PER_MINUTE;
      const minDuration = MIN_DURATION_MINUTES * MILLISECONDS_PER_MINUTE;
      const range =
        edge === 'start'
          ? {
              end: event.end,
              start: Math.min(event.end - minDuration, event.start + delta),
            }
          : {
              end: Math.max(event.start + minDuration, event.end + delta),
              start: event.start,
            };

      if (range.start !== event.start || range.end !== event.end) {
        onResize({event, ...range});
      }
    },
    [edge, event, onResize, snapMinutes],
  );

  return (
    <span
      aria-label={`${edge === 'start' ? 'Resize start of' : 'Resize end of'} ${
        event.title
      }`}
      aria-orientation="vertical"
      aria-valuemax={event.end}
      aria-valuemin={event.start}
      aria-valuenow={edge === 'start' ? event.start : event.end}
      className={resizeHandleClassNames[edge]}
      data-testid={`schedule-event-resize-${edge}-handle-${event.id}`}
      onClick={event => event.stopPropagation()}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      role="slider"
      tabIndex={0}
    />
  );
}

function ScheduleEventResizeHandles<TAuxiliaryData = unknown>({
  event,
  hourHeight,
  onResize,
  snapMinutes,
}: {
  event: CalendarInstantEvent<TAuxiliaryData>;
  hourHeight: number;
  onResize: (change: ScheduleEventResizeChange<TAuxiliaryData>) => void;
  snapMinutes: number;
}): React.JSX.Element {
  return (
    <>
      <ScheduleEventResizeHandle
        edge="start"
        event={event}
        hourHeight={hourHeight}
        onResize={onResize}
        snapMinutes={snapMinutes}
      />
      <ScheduleEventResizeHandle
        edge="end"
        event={event}
        hourHeight={hourHeight}
        onResize={onResize}
        snapMinutes={snapMinutes}
      />
    </>
  );
}

function createScheduleEventResizePlugin<TAuxiliaryData>({
  onResize,
  snapMinutes = DEFAULT_SNAP_MINUTES,
}: ScheduleEventResizePluginOptions<TAuxiliaryData>): SchedulePlugin {
  const normalizedSnapMinutes =
    Number.isFinite(snapMinutes) && snapMinutes > 0
      ? Math.max(1, Math.floor(snapMinutes))
      : DEFAULT_SNAP_MINUTES;

  return {
    renderTimeGridEventContent({
      event,
      hourHeight,
    }: ScheduleTimeGridEventRenderProps): React.ReactNode {
      if (isDayEvent(event)) {
        return null;
      }

      return (
        <ScheduleEventResizeHandles
          event={event as CalendarInstantEvent<TAuxiliaryData>}
          hourHeight={hourHeight}
          onResize={onResize}
          snapMinutes={normalizedSnapMinutes}
        />
      );
    },
  };
}

/**
 * Adds start and end resize handles to timed events in day/week time-grid
 * views. The plugin is controlled: it reports the resized range through
 * `onResize` and leaves event updates to the consumer.
 */
export function useScheduleEventResizePlugin<TAuxiliaryData = unknown>(
  options: ScheduleEventResizePluginOptions<TAuxiliaryData>,
): SchedulePlugin {
  const optionsRef = useLatest(options);
  const onResize = useCallback(
    (change: ScheduleEventResizeChange<TAuxiliaryData>) => {
      optionsRef.current.onResize(change);
    },
    [optionsRef],
  );

  return useMemo(
    () =>
      createScheduleEventResizePlugin<TAuxiliaryData>({
        onResize,
        snapMinutes: options.snapMinutes,
      }),
    [onResize, options.snapMinutes],
  );
}
