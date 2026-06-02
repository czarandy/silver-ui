import {
  plainDateFromInstant,
  plainDateToInstant,
  type PlainDate,
} from '../../internal/plainDate';
import type {Instant, ScheduleDate, ScheduleRange} from './types';

export interface ZonedDateTime {
  addDays: (days: number) => ZonedDateTime;
  instant: Instant;
  startOfDay: () => ZonedDateTime;
  timezoneID: string;
  toPlainDate: () => PlainDate;
}

export type ZonedDateTimeRange = [ZonedDateTime, ZonedDateTime];

export function createZonedDateTime(
  date: ScheduleDate,
  timezoneID: string,
): ZonedDateTime {
  return zonedDateTimeFromInstant(date, timezoneID);
}

export function zonedDateTimeFromInstant(
  instant: Instant,
  timezoneID: string,
): ZonedDateTime {
  return {
    addDays: days => {
      const date = plainDateFromInstant(instant, timezoneID).add({days});
      return zonedDateTimeFromInstant(
        plainDateToInstant(date, timezoneID),
        timezoneID,
      );
    },
    instant,
    startOfDay: () => {
      const date = plainDateFromInstant(instant, timezoneID);
      return zonedDateTimeFromInstant(
        plainDateToInstant(date, timezoneID),
        timezoneID,
      );
    },
    timezoneID,
    toPlainDate: () => plainDateFromInstant(instant, timezoneID),
  };
}

export function scheduleRangeToZonedDateTimeRange(
  range: ScheduleRange,
  timezoneID: string,
): ZonedDateTimeRange {
  return [
    zonedDateTimeFromInstant(range.start, timezoneID),
    zonedDateTimeFromInstant(range.end, timezoneID),
  ];
}
