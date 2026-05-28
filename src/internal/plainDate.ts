import {Temporal} from '@js-temporal/polyfill';
import type {ISODateString, PlainDate} from './dateTypes';

export type {PlainDate} from './dateTypes';

export const DATE_FORMAT_WITH_WEEKDAY: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
  year: 'numeric',
};

export const DATE_FORMAT_LONG: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export const DATE_FORMAT_MONTH_YEAR: Intl.DateTimeFormatOptions = {
  month: 'long',
  year: 'numeric',
};

export const DATE_FORMAT_SHORT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
};

export const DATE_FORMAT_SHORT_WITH_YEAR: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

export function getDaysInMonth(year: number, month: number): number {
  return Temporal.PlainDate.from({year, month, day: 1}).daysInMonth;
}

export function plainDateCreate(
  year: number,
  month: number,
  day: number,
): PlainDate {
  if (!Number.isInteger(year) || year < 1) {
    throw new RangeError(`year must be a positive integer, got ${year}`);
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`month must be 1-12, got ${month}`);
  }

  const maxDay = getDaysInMonth(year, month);
  if (!Number.isInteger(day) || day < 1 || day > maxDay) {
    throw new RangeError(`day must be 1-${maxDay}, got ${day}`);
  }

  return Temporal.PlainDate.from({year, month, day});
}

export function plainDateFromISO(value: ISODateString): PlainDate {
  return Temporal.PlainDate.from(value);
}

export function plainDateToISO(date: PlainDate): ISODateString {
  return date.toString() as ISODateString;
}

export function plainDateToDate(date: PlainDate): Date {
  return new Date(date.year, date.month - 1, date.day);
}

export function plainDateFromDate(date: Date): PlainDate {
  return Temporal.PlainDate.from({
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  });
}

export function plainDateFromInstant(
  instant: number,
  timezoneID = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
): PlainDate {
  return Temporal.Instant.fromEpochMilliseconds(instant)
    .toZonedDateTimeISO(timezoneID)
    .toPlainDate();
}

export function plainDateToInstant(
  date: PlainDate,
  timezoneID = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
): number {
  return date.toZonedDateTime(timezoneID).epochMilliseconds;
}

export function plainDateToday(): PlainDate {
  return plainDateFromDate(new Date());
}

export function plainDateDayOfWeek(date: PlainDate): number {
  return date.dayOfWeek % 7;
}

export function plainDateAddDays(date: PlainDate, days: number): PlainDate {
  return date.add({days});
}

export function plainDateAddMonths(date: PlainDate, months: number): PlainDate {
  return date.add({months});
}

function comparePlainDates(a: PlainDate, b: PlainDate): number {
  return Temporal.PlainDate.compare(a, b);
}

export function plainDateIsBefore(a: PlainDate, b: PlainDate): boolean {
  return comparePlainDates(a, b) < 0;
}

export function plainDateIsAfter(a: PlainDate, b: PlainDate): boolean {
  return comparePlainDates(a, b) > 0;
}

export function plainDateIsEqual(a: PlainDate, b: PlainDate): boolean {
  return comparePlainDates(a, b) === 0;
}

export function plainDateIsInRange(
  date: PlainDate,
  range: [PlainDate, PlainDate],
): boolean {
  return (
    comparePlainDates(date, range[0]) >= 0 &&
    comparePlainDates(date, range[1]) <= 0
  );
}

export function plainDateSetFirstOfMonth(date: PlainDate): PlainDate {
  return date.with({day: 1});
}

export function plainDateSetStartOfWeek(date: PlainDate): PlainDate {
  return plainDateAddDays(date, -(date.dayOfWeek % 7));
}

export function plainDateGetWeekNumber(date: PlainDate): number {
  const nativeDate = plainDateToDate(date);
  const dayNumber = nativeDate.getDay() || 7;
  nativeDate.setDate(nativeDate.getDate() + 4 - dayNumber);
  const yearStart = new Date(nativeDate.getFullYear(), 0, 1);
  return Math.ceil(
    ((nativeDate.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
}

export function plainDateFormat(
  date: PlainDate,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(undefined, options).format(
    plainDateToDate(date),
  );
}
