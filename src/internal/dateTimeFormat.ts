import {Intl as TemporalIntl} from '@js-temporal/polyfill';

const formatterCache = new Map<string, TemporalIntl.DateTimeFormat>();

function getCacheKey(options: Intl.DateTimeFormatOptions): string {
  return Object.keys(options)
    .sort()
    .map(
      key =>
        `${key}:${String(options[key as keyof Intl.DateTimeFormatOptions])}`,
    )
    .join('|');
}

/**
 * Returns a shared `Intl.DateTimeFormat` for the browser locale and the given
 * options, creating it on first use. Constructing a formatter is hundreds of
 * times more expensive than formatting with an existing one, which makes
 * per-call construction (the `toLocaleString` path) the dominant cost anywhere
 * dates are formatted in a loop, like the schedule grids.
 *
 * The cache is keyed by the option values, so it stays bounded by the small
 * set of formats the library uses (times a handful of timezone IDs).
 *
 * The returned formatter is the Temporal polyfill's wrapper, so `format`
 * accepts Temporal objects (`PlainDate`, `PlainTime`, `Instant`) as well as
 * epoch milliseconds.
 */
export function getCachedDateTimeFormat(
  options: Intl.DateTimeFormatOptions,
): TemporalIntl.DateTimeFormat {
  const key = getCacheKey(options);
  let formatter = formatterCache.get(key);
  if (formatter == null) {
    formatter = new TemporalIntl.DateTimeFormat(undefined, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}
