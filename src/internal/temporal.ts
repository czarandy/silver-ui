/**
 * The one place silver-ui reads `Temporal` from. silver-ui does not bundle a
 * Temporal polyfill: it uses the global `Temporal`, which is native in modern
 * Chromium and Firefox and must be installed by the app elsewhere (see the
 * README's "Temporal" section).
 *
 * `Temporal` here is resolved on every property access rather than when this
 * module loads, so an app can install a polyfill after importing silver-ui as
 * long as it does so before rendering. Import it like the polyfill:
 * `import {Temporal} from 'internal/temporal'` — both for values
 * (`Temporal.Now.instant()`) and types (`Temporal.Instant`).
 */

export const TEMPORAL_DOCS_URL =
  'https://github.com/czarandy/silver-ui#temporal';

type TemporalNamespace = typeof globalThis.Temporal;

/**
 * Returns the global `Temporal`, or throws an error explaining how to install
 * it.
 */
export function getTemporal(): TemporalNamespace {
  const temporal = (globalThis as {Temporal?: TemporalNamespace}).Temporal;
  if (temporal == null) {
    throw new Error(
      'silver-ui needs the Temporal API, which this browser does not provide ' +
        'natively (e.g. Safari). Install @js-temporal/polyfill as the global ' +
        `Temporal before rendering silver-ui; see ${TEMPORAL_DOCS_URL}`,
    );
  }
  return temporal;
}

const handler: ProxyHandler<object> = {
  get(_target, key): TemporalNamespace[keyof TemporalNamespace] {
    return Reflect.get(
      getTemporal(),
      key,
    ) as TemporalNamespace[keyof TemporalNamespace];
  },
  has(_target, key): boolean {
    return Reflect.has(getTemporal(), key);
  },
};

const Temporal = new Proxy(
  Object.create(null) as object,
  handler,
) as TemporalNamespace;

// Type-side aliases, so `Temporal.Instant` etc. keep working in type
// positions for code importing `Temporal` from this module. Merging this
// types-only namespace with the value above is intentional.
// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-redeclare
declare namespace Temporal {
  export type Duration = globalThis.Temporal.Duration;
  export type DurationLike = globalThis.Temporal.DurationLike;
  export type Instant = globalThis.Temporal.Instant;
  export type PlainDate = globalThis.Temporal.PlainDate;
  export type PlainDateLike = globalThis.Temporal.PlainDateLike;
  export type PlainDateTime = globalThis.Temporal.PlainDateTime;
  export type PlainDateTimeLike = globalThis.Temporal.PlainDateTimeLike;
  export type PlainMonthDay = globalThis.Temporal.PlainMonthDay;
  export type PlainTime = globalThis.Temporal.PlainTime;
  export type PlainTimeLike = globalThis.Temporal.PlainTimeLike;
  export type PlainYearMonth = globalThis.Temporal.PlainYearMonth;
  export type ZonedDateTime = globalThis.Temporal.ZonedDateTime;
  export type ZonedDateTimeLike = globalThis.Temporal.ZonedDateTimeLike;
}

export {Temporal};
