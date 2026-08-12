import {Temporal} from '@js-temporal/polyfill';
import {describe, expect, it} from 'vitest';
import {getCachedDateTimeFormat} from 'internal/dateTimeFormat';

describe('getCachedDateTimeFormat', () => {
  it('returns the same formatter for equal options regardless of key order', () => {
    expect(getCachedDateTimeFormat({day: 'numeric', month: 'long'})).toBe(
      getCachedDateTimeFormat({month: 'long', day: 'numeric'}),
    );
  });

  it('returns distinct formatters for distinct options', () => {
    expect(getCachedDateTimeFormat({month: 'long'})).not.toBe(
      getCachedDateTimeFormat({month: 'short'}),
    );
    expect(
      getCachedDateTimeFormat({hour: 'numeric', timeZone: 'UTC'}),
    ).not.toBe(
      getCachedDateTimeFormat({hour: 'numeric', timeZone: 'America/New_York'}),
    );
  });

  it('formats Temporal values like their toLocaleString', () => {
    const date = Temporal.PlainDate.from('2026-05-13');
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    };
    expect(getCachedDateTimeFormat(options).format(date)).toBe(
      date.toLocaleString(undefined, options),
    );

    const time = Temporal.PlainTime.from({hour: 9});
    expect(getCachedDateTimeFormat({hour: 'numeric'}).format(time)).toBe(
      time.toLocaleString(undefined, {hour: 'numeric'}),
    );
  });

  it('formats instants in the timezone given by the options', () => {
    const instant = Temporal.Instant.from('2026-05-13T16:30:00Z');
    expect(
      getCachedDateTimeFormat({
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
      }).format(instant),
    ).toBe(
      instant.toZonedDateTimeISO('UTC').toLocaleString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    );
  });
});
