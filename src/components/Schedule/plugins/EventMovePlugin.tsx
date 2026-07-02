'use client';

import {Temporal} from '@js-temporal/polyfill';
import {
  useCallback,
  useMemo,
  useRef,
  type DragEvent,
  type RefObject,
} from 'react';
import {isDayEvent} from 'components/Schedule/dateMath';
import type {
  CalendarEvent,
  Instant,
  PlainDate,
  ScheduleEventPropsRenderProps,
  ScheduleMonthCellPropsRenderProps,
  SchedulePlugin,
  ScheduleTimeGridCellPropsRenderProps,
} from 'components/Schedule/types';
import useLatest from 'internal/useLatest';

const DEFAULT_SNAP_MINUTES = 15;
const MILLISECONDS_PER_MINUTE = 60_000;
const MINUTES_PER_DAY = 24 * 60;

export interface ScheduleEventMoveChange<TAuxiliaryData = unknown> {
  end: CalendarEvent<TAuxiliaryData>['end'];
  event: CalendarEvent<TAuxiliaryData>;
  start: CalendarEvent<TAuxiliaryData>['start'];
}

export interface ScheduleEventMovePluginOptions<TAuxiliaryData = unknown> {
  /**
   * Called when the user drops an event on a new date or time.
   */
  onMove: (change: ScheduleEventMoveChange<TAuxiliaryData>) => void;
  /**
   * Snap interval, in minutes, applied to time-grid drops.
   * @default 15
   */
  snapMinutes?: number;
}

interface DragState<TAuxiliaryData> {
  event: CalendarEvent<TAuxiliaryData>;
  initialOpacity: string;
  offsetMinutes: number;
  previewElement: HTMLElement;
  sourceElement: HTMLElement;
  sourceRect: DOMRect;
}

function getSnappedMinutes(minutes: number, snapMinutes: number): number {
  return Math.round(minutes / snapMinutes) * snapMinutes;
}

function getTimeGridStartMinutes<TAuxiliaryData>({
  drag,
  hour,
  pointerOffsetMinutes,
  snapMinutes,
}: {
  drag: DragState<TAuxiliaryData>;
  hour: number;
  pointerOffsetMinutes: number;
  snapMinutes: number;
}): number {
  return getSnappedMinutes(
    hour * 60 + pointerOffsetMinutes - drag.offsetMinutes,
    snapMinutes,
  );
}

function instantFromDateAndMinutes(
  date: PlainDate,
  minutes: number,
  timezoneID: string,
): Instant {
  const clampedMinutes = Math.round(
    Math.max(0, Math.min(MINUTES_PER_DAY - 1, minutes)),
  );
  const hour = Math.floor(clampedMinutes / 60);
  const minute = clampedMinutes % 60;
  return date
    .toPlainDateTime(Temporal.PlainTime.from({hour, minute}))
    .toZonedDateTime(timezoneID).epochMilliseconds;
}

function moveEventToDate<TAuxiliaryData>(
  event: CalendarEvent<TAuxiliaryData>,
  date: PlainDate,
  timezoneID: string,
): ScheduleEventMoveChange<TAuxiliaryData> {
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

function moveEventToDateTime<TAuxiliaryData>({
  date,
  drag,
  hour,
  pointerOffsetMinutes,
  snapMinutes,
  timezoneID,
}: {
  date: PlainDate;
  drag: DragState<TAuxiliaryData>;
  hour: number;
  pointerOffsetMinutes: number;
  snapMinutes: number;
  timezoneID: string;
}): ScheduleEventMoveChange<TAuxiliaryData> | null {
  if (isDayEvent(drag.event)) {
    return null;
  }

  const startMinutes = getTimeGridStartMinutes({
    drag,
    hour,
    pointerOffsetMinutes,
    snapMinutes,
  });
  const start = instantFromDateAndMinutes(date, startMinutes, timezoneID);
  return {
    end: start + (drag.event.end - drag.event.start),
    event: drag.event,
    start,
  };
}

function hasChanged<TAuxiliaryData>({
  end,
  event,
  start,
}: ScheduleEventMoveChange<TAuxiliaryData>): boolean {
  return event.start !== start || event.end !== end;
}

function getDragEventClientY(
  dragEvent: DragEvent<HTMLElement>,
  fallback: number,
): number {
  return Number.isFinite(dragEvent.clientY) ? dragEvent.clientY : fallback;
}

function applyDragPreview<TAuxiliaryData>(
  drag: DragState<TAuxiliaryData>,
  targetLeft: number,
  targetTop: number,
): void {
  drag.previewElement.style.left = `${targetLeft}px`;
  drag.previewElement.style.top = `${targetTop}px`;
}

function resetDragPreview<TAuxiliaryData>(
  drag: DragState<TAuxiliaryData>,
): void {
  drag.sourceElement.style.opacity = drag.initialOpacity;
  drag.previewElement.remove();
}

function createDragPreviewElement(
  event: CalendarEvent,
  sourceElement: HTMLElement,
  sourceRect: DOMRect,
): HTMLElement {
  const preview = sourceElement.cloneNode(true);
  if (!(preview instanceof HTMLElement)) {
    throw new Error('Schedule event preview must be an HTMLElement.');
  }

  preview.setAttribute('aria-hidden', 'true');
  preview.setAttribute(
    'data-testid',
    `schedule-event-move-preview-${event.id}`,
  );
  preview.style.position = 'fixed';
  preview.style.inset = 'auto';
  preview.style.left = `${sourceRect.left}px`;
  preview.style.top = `${sourceRect.top}px`;
  preview.style.width = `${sourceRect.width}px`;
  preview.style.height = `${sourceRect.height}px`;
  preview.style.margin = '0';
  preview.style.opacity = '0.45';
  preview.style.pointerEvents = 'none';
  preview.style.transform = 'none';
  preview.style.zIndex = '1000';
  document.body.append(preview);
  return preview;
}

function createScheduleEventMovePlugin<TAuxiliaryData>({
  dragRef,
  onMove,
  snapMinutes = DEFAULT_SNAP_MINUTES,
}: ScheduleEventMovePluginOptions<TAuxiliaryData> & {
  dragRef: RefObject<DragState<TAuxiliaryData> | null>;
}): SchedulePlugin {
  const normalizedSnapMinutes =
    Number.isFinite(snapMinutes) && snapMinutes > 0
      ? Math.max(1, Math.floor(snapMinutes))
      : DEFAULT_SNAP_MINUTES;

  return {
    getEventProps({
      event,
      layout,
      timezoneID,
    }: ScheduleEventPropsRenderProps): React.HTMLAttributes<HTMLElement> {
      if (layout !== 'month' && (layout !== 'timeGrid' || isDayEvent(event))) {
        return {};
      }

      return {
        draggable: true,
        onDragEnd: () => {
          if (dragRef.current != null) {
            resetDragPreview(dragRef.current);
          }
          dragRef.current = null;
        },
        onDragStart: dragEvent => {
          const element = dragEvent.currentTarget;
          const sourceRect = element.getBoundingClientRect();
          const isTimedTimeGridEvent =
            layout === 'timeGrid' && !isDayEvent(event);
          const eventStartTime = isDayEvent(event)
            ? null
            : Temporal.Instant.fromEpochMilliseconds(event.start)
                .toZonedDateTimeISO(timezoneID)
                .toPlainTime();
          const eventStartMinutes =
            eventStartTime == null
              ? 0
              : eventStartTime.hour * 60 + eventStartTime.minute;
          let offsetMinutes = eventStartMinutes;
          if (isTimedTimeGridEvent) {
            const durationMinutes = Math.max(
              15,
              (event.end - event.start) / MILLISECONDS_PER_MINUTE,
            );
            offsetMinutes = Math.max(
              0,
              ((getDragEventClientY(dragEvent, sourceRect.top) -
                sourceRect.top) /
                Math.max(1, sourceRect.height)) *
                durationMinutes,
            );
          }

          dragEvent.dataTransfer.setData('text/plain', event.id);
          dragEvent.dataTransfer.setDragImage(element, 0, 0);
          dragRef.current = {
            event: event as CalendarEvent<TAuxiliaryData>,
            initialOpacity: element.style.opacity,
            offsetMinutes,
            previewElement: createDragPreviewElement(
              event,
              element,
              sourceRect,
            ),
            sourceElement: element,
            sourceRect,
          };
          element.style.opacity = '0.25';
        },
      };
    },
    getMonthCellProps({
      date,
      timezoneID,
    }: ScheduleMonthCellPropsRenderProps): React.HTMLAttributes<HTMLElement> {
      return {
        onDragOver: dragEvent => {
          if (dragRef.current != null) {
            dragEvent.preventDefault();
            const rect = dragEvent.currentTarget.getBoundingClientRect();
            applyDragPreview(dragRef.current, rect.left + 4, rect.top + 30);
          }
        },
        onDrop: dragEvent => {
          const drag = dragRef.current;
          if (drag == null) {
            return;
          }

          dragEvent.preventDefault();
          const change = moveEventToDate(drag.event, date, timezoneID);
          if (hasChanged(change)) {
            onMove(change);
          }
          resetDragPreview(drag);
          dragRef.current = null;
        },
      };
    },
    getTimeGridCellProps({
      date,
      hour,
      hourHeight,
      timezoneID,
    }: ScheduleTimeGridCellPropsRenderProps): React.HTMLAttributes<HTMLElement> {
      return {
        onDragOver: dragEvent => {
          if (dragRef.current != null && !isDayEvent(dragRef.current.event)) {
            dragEvent.preventDefault();
            const rect = dragEvent.currentTarget.getBoundingClientRect();
            const pointerOffsetMinutes =
              ((getDragEventClientY(dragEvent, rect.top) - rect.top) /
                Math.max(1, hourHeight)) *
              60;
            const startMinutes = getTimeGridStartMinutes({
              drag: dragRef.current,
              hour,
              pointerOffsetMinutes,
              snapMinutes: normalizedSnapMinutes,
            });
            const top =
              rect.top + ((startMinutes - hour * 60) / 60) * hourHeight + 2;
            applyDragPreview(dragRef.current, rect.left + 2, top);
          }
        },
        onDrop: dragEvent => {
          const drag = dragRef.current;
          if (drag == null || isDayEvent(drag.event)) {
            return;
          }

          dragEvent.preventDefault();
          const rect = dragEvent.currentTarget.getBoundingClientRect();
          const pointerOffsetMinutes =
            ((getDragEventClientY(dragEvent, rect.top) - rect.top) /
              Math.max(1, hourHeight)) *
            60;
          const change = moveEventToDateTime({
            date,
            drag,
            hour,
            pointerOffsetMinutes,
            snapMinutes: normalizedSnapMinutes,
            timezoneID,
          });
          if (change != null && hasChanged(change)) {
            onMove(change);
          }
          resetDragPreview(drag);
          dragRef.current = null;
        },
      };
    },
  };
}

/**
 * Makes month-view events and time-grid timed events draggable. Month drops
 * change only the date. Time-grid drops change both date and time.
 */
export function useScheduleEventMovePlugin<TAuxiliaryData = unknown>(
  options: ScheduleEventMovePluginOptions<TAuxiliaryData>,
): SchedulePlugin {
  const optionsRef = useLatest(options);
  const dragRef = useRef<DragState<TAuxiliaryData> | null>(null);
  const onMove = useCallback(
    (change: ScheduleEventMoveChange<TAuxiliaryData>) => {
      optionsRef.current.onMove(change);
    },
    [optionsRef],
  );

  return useMemo(() => {
    return createScheduleEventMovePlugin<TAuxiliaryData>({
      dragRef,
      onMove,
      snapMinutes: options.snapMinutes,
    });
  }, [dragRef, onMove, options.snapMinutes]);
}
