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

export interface CalendarEventBase {
  category?: string;
  id: string;
  title: string;
}

export interface CalendarDayEvent extends CalendarEventBase {
  end: PlainDate;
  start: PlainDate;
}

export interface CalendarInstantEvent extends CalendarEventBase {
  end: Instant;
  start: Instant;
}

export type CalendarEvent = CalendarDayEvent | CalendarInstantEvent;

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
