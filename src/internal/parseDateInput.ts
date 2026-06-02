import {plainDateCreate, type PlainDate} from './plainDate';

const MONTH_NAMES: Partial<Record<string, number>> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

/**
 * Parses common date input formats into a PlainDate.
 * Supports: "2026-05-21", "05/21/2026", "May 21, 2026", "21 May 2026", etc.
 * Returns null if the input cannot be parsed.
 */
export function parseDateInput(input: string): PlainDate | null {
  const trimmed = input.trim();
  if (trimmed === '') {
    return null;
  }

  // ISO format: 2026-05-21
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (isoMatch != null) {
    return tryCreate(
      parseInt(isoMatch[1], 10),
      parseInt(isoMatch[2], 10),
      parseInt(isoMatch[3], 10),
    );
  }

  // US format: 05/21/2026, 5/21/2026, or 3/4/25 (2-digit year)
  const usMatch = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/.exec(trimmed);
  if (usMatch != null) {
    let year = parseInt(usMatch[3], 10);
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }
    return tryCreate(year, parseInt(usMatch[1], 10), parseInt(usMatch[2], 10));
  }

  // Named month: "May 21, 2026" or "May 21 2026"
  const namedMonthFirst = /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/.exec(trimmed);
  if (namedMonthFirst != null) {
    const month = MONTH_NAMES[namedMonthFirst[1].toLowerCase()];
    if (month != null) {
      return tryCreate(
        parseInt(namedMonthFirst[3], 10),
        month,
        parseInt(namedMonthFirst[2], 10),
      );
    }
  }

  // Named month reversed: "21 May 2026"
  const namedMonthLast = /^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/.exec(trimmed);
  if (namedMonthLast != null) {
    const month = MONTH_NAMES[namedMonthLast[2].toLowerCase()];
    if (month != null) {
      return tryCreate(
        parseInt(namedMonthLast[3], 10),
        month,
        parseInt(namedMonthLast[1], 10),
      );
    }
  }

  return null;
}

function tryCreate(year: number, month: number, day: number): PlainDate | null {
  try {
    return plainDateCreate(year, month, day);
  } catch {
    return null;
  }
}
