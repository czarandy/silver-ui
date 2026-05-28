import type {ISODateString, PlainDate} from '../../internal/dateTypes';
import {plainDateFromISO} from '../../internal/plainDate';
import type {TagColor} from '../Tag';
import type {Instant} from './types';

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

function toISODateString(value: string): ISODateString {
  return value as ISODateString;
}

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
      end: plainDateFromISO(toISODateString(end)),
      id,
      start: plainDateFromISO(toISODateString(start)),
      title,
    };
  }

  return {
    category,
    end: Date.parse(end),
    id,
    start: Date.parse(start),
    title,
  };
}
