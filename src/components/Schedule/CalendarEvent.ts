import {Temporal} from '@js-temporal/polyfill';
import type {Instant} from 'components/Schedule/types';
import type {TagColor} from 'components/Tag';
import type {PlainDate} from 'internal/dateTypes';

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

export type ScheduleEventColor = Exclude<TagColor, 'default'>;

export interface ScheduleCategory {
  color: ScheduleEventColor;
  label: string;
}

export interface CalendarEventBase<TAuxiliaryData = unknown> {
  /**
   * Arbitrary consumer-defined data carried alongside the event, mirroring the
   * `auxiliaryData` field of `SearchableItem`. Surfaced to plugin render
   * functions (e.g. the event popover's `renderContent`) for custom rendering.
   */
  auxiliaryData?: TAuxiliaryData;
  category?: string;
  /**
   * Optional longer-form description shown by the default event popover.
   */
  description?: string;
  id: string;
  /**
   * Optional location shown by the default event popover.
   */
  location?: string;
  title: string;
}

export interface CalendarDayEvent<
  TAuxiliaryData = unknown,
> extends CalendarEventBase<TAuxiliaryData> {
  end: PlainDate;
  start: PlainDate;
}

export interface CalendarInstantEvent<
  TAuxiliaryData = unknown,
> extends CalendarEventBase<TAuxiliaryData> {
  end: Instant;
  start: Instant;
}

export type CalendarEvent<TAuxiliaryData = unknown> =
  | CalendarDayEvent<TAuxiliaryData>
  | CalendarInstantEvent<TAuxiliaryData>;

export function createEventFromISO({
  category,
  end,
  id,
  start,
  title,
}: {
  category?: CalendarEvent['category'];
  end: string;
  id: string;
  start: string;
  title: string;
}): CalendarEvent {
  if (DATE_ONLY_RE.test(start) && DATE_ONLY_RE.test(end)) {
    return {
      category,
      end: Temporal.PlainDate.from(end),
      id,
      start: Temporal.PlainDate.from(start),
      title,
    };
  }

  return {
    category,
    end: Temporal.Instant.from(end).epochMilliseconds,
    id,
    start: Temporal.Instant.from(start).epochMilliseconds,
    title,
  };
}
