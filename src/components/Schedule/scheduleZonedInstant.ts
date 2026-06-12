import type {
  Instant,
  ScheduleDate,
  ScheduleRange,
} from 'components/Schedule/types';
import {
  plainDateFromInstant,
  plainDateToInstant,
  type PlainDate,
} from 'internal/plainDate';

export interface ScheduleZonedInstant {
  addDays: (days: number) => ScheduleZonedInstant;
  instant: Instant;
  startOfDay: () => ScheduleZonedInstant;
  timezoneID: string;
  toPlainDate: () => PlainDate;
}

export type ScheduleZonedInstantRange = [
  ScheduleZonedInstant,
  ScheduleZonedInstant,
];

export function createScheduleZonedInstant(
  date: ScheduleDate,
  timezoneID: string,
): ScheduleZonedInstant {
  return scheduleZonedInstantFromInstant(date, timezoneID);
}

export function scheduleZonedInstantFromInstant(
  instant: Instant,
  timezoneID: string,
): ScheduleZonedInstant {
  return {
    addDays: days => {
      const date = plainDateFromInstant(instant, timezoneID).add({days});
      return scheduleZonedInstantFromInstant(
        plainDateToInstant(date, timezoneID),
        timezoneID,
      );
    },
    instant,
    startOfDay: () => {
      const date = plainDateFromInstant(instant, timezoneID);
      return scheduleZonedInstantFromInstant(
        plainDateToInstant(date, timezoneID),
        timezoneID,
      );
    },
    timezoneID,
    toPlainDate: () => plainDateFromInstant(instant, timezoneID),
  };
}

export function scheduleRangeToScheduleZonedInstantRange(
  range: ScheduleRange,
  timezoneID: string,
): ScheduleZonedInstantRange {
  return [
    scheduleZonedInstantFromInstant(range.start, timezoneID),
    scheduleZonedInstantFromInstant(range.end, timezoneID),
  ];
}
