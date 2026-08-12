import {Temporal} from '@js-temporal/polyfill';
import {getCachedDateTimeFormat} from 'internal/dateTimeFormat';
import type {PlainDate} from 'internal/dateTypes';

export type {PlainDate} from 'internal/dateTypes';

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

export const DATE_FORMAT_SHORT_WITH_YEAR: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

/**
 * How a committed date is displayed. Named presets cover the common cases;
 * pass a function for full control over the displayed string.
 *
 * - `'long'` — full month name, e.g. "January 15, 2026"
 * - `'short'` — abbreviated month name, e.g. "Jan 15, 2026"
 * - `'iso'` — ISO 8601, e.g. "2026-01-15"
 */
export type DateFormat =
  'iso' | 'long' | 'short' | ((date: PlainDate) => string);

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

export function plainDateFromInstant(
  instant: number,
  timezoneID: string,
): PlainDate {
  return Temporal.Instant.fromEpochMilliseconds(instant)
    .toZonedDateTimeISO(timezoneID)
    .toPlainDate();
}

export function plainDateToInstant(
  date: PlainDate,
  timezoneID: string,
): number {
  return date.toZonedDateTime(timezoneID).epochMilliseconds;
}

export function plainDateFromUnixSeconds(
  unixSeconds: number,
  timezoneID: string,
): PlainDate {
  return plainDateFromInstant(unixSeconds * 1000, timezoneID);
}

export function plainDateToUnixSeconds(
  date: PlainDate,
  timezoneID: string,
): number {
  return Math.floor(plainDateToInstant(date, timezoneID) / 1000);
}

export function plainDateToday(timezoneID: string): PlainDate {
  return Temporal.Now.plainDateISO(timezoneID);
}

export function plainDateDayOfWeek(date: PlainDate): number {
  return date.dayOfWeek % 7;
}

export function plainDateIsBefore(a: PlainDate, b: PlainDate): boolean {
  return Temporal.PlainDate.compare(a, b) < 0;
}

export function plainDateIsAfter(a: PlainDate, b: PlainDate): boolean {
  return Temporal.PlainDate.compare(a, b) > 0;
}

export function plainDateIsEqual(a: PlainDate, b: PlainDate): boolean {
  return Temporal.PlainDate.compare(a, b) === 0;
}

export function plainDateIsInRange(
  date: PlainDate,
  range: [PlainDate, PlainDate],
): boolean {
  return (
    Temporal.PlainDate.compare(date, range[0]) >= 0 &&
    Temporal.PlainDate.compare(date, range[1]) <= 0
  );
}

export function plainDateSetStartOfWeek(date: PlainDate): PlainDate {
  return date.add({days: -(date.dayOfWeek % 7)});
}

export function plainDateGetWeekNumber(date: PlainDate): number {
  const thursday = date.add({days: 4 - date.dayOfWeek});
  const yearStart = plainDateCreate(thursday.year, 1, 1);
  return Math.ceil((yearStart.until(thursday).days + 1) / 7);
}

export function plainDateFormat(
  date: PlainDate,
  options: Intl.DateTimeFormatOptions,
): string {
  return getCachedDateTimeFormat(options).format(date);
}

/**
 * Formats a date using a named preset or a caller-supplied function.
 */
export function plainDateFormatWith(
  date: PlainDate,
  format: DateFormat,
): string {
  if (typeof format === 'function') {
    return format(date);
  }
  switch (format) {
    case 'iso':
      return date.toString();
    case 'short':
      return plainDateFormat(date, DATE_FORMAT_SHORT_WITH_YEAR);
    case 'long':
      return plainDateFormat(date, DATE_FORMAT_LONG);
  }
}
