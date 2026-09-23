import {Temporal} from '@js-temporal/polyfill';
import {getCachedDateTimeFormat} from 'internal/dateTimeFormat';
import {getBrowserTimezoneID, nowEpochMilliseconds} from 'internal/time';

export type TimestampValue =
  Temporal.Instant | Temporal.ZonedDateTime | number | string;

export type TimestampFormat =
  | 'auto'
  | 'relative'
  | 'date'
  | 'time'
  | 'dateTime'
  | 'weekdayDateTime'
  | 'isoDate'
  | 'isoTime'
  | 'isoDateTime';

/**
 * An absolute format — every `TimestampFormat` except the ones that render a
 * relative string. `weekdayDateTime` still consults the current time, but only
 * to decide whether to include the year.
 */
type AbsoluteFormat = Exclude<TimestampFormat, 'auto' | 'relative'>;

/**
 * The fixed, locale-independent formats.
 */
type IsoFormat = 'isoDate' | 'isoTime' | 'isoDateTime';

type LocaleComponentFormat = 'date' | 'time';

interface ResolvedInstant {
  /**
   * The moment in time to display.
   */
  instant: Temporal.Instant;
  /**
   * Timezone used for absolute/ISO formatting. Taken from a
   * `ZonedDateTime` value when provided, otherwise the browser's zone.
   */
  timeZone: string;
}

/**
 * Normalizes the many accepted `value` shapes into a single `Temporal.Instant`
 * plus the timezone to display it in. `number` is interpreted as Unix epoch
 * **seconds** (matching the codebase's `toUnixSeconds` convention); `string` as
 * ISO 8601. Never touches the JS `Date` object.
 */
export function resolveInstant(value: TimestampValue): ResolvedInstant {
  if (value instanceof Temporal.ZonedDateTime) {
    return {instant: value.toInstant(), timeZone: value.timeZoneId};
  }
  if (value instanceof Temporal.Instant) {
    return {instant: value, timeZone: getBrowserTimezoneID()};
  }
  if (typeof value === 'number') {
    return {
      instant: Temporal.Instant.fromEpochMilliseconds(Math.round(value * 1000)),
      timeZone: getBrowserTimezoneID(),
    };
  }
  return {
    instant: Temporal.Instant.from(value),
    timeZone: getBrowserTimezoneID(),
  };
}

const LOCALE_OPTIONS: Record<
  LocaleComponentFormat,
  Intl.DateTimeFormatOptions
> = {
  date: {year: 'numeric', month: 'short', day: 'numeric'},
  time: {hour: 'numeric', minute: '2-digit'},
};

const ISO_FORMATS: ReadonlySet<AbsoluteFormat> = new Set<IsoFormat>([
  'isoDate',
  'isoTime',
  'isoDateTime',
]);

function isIsoFormat(format: AbsoluteFormat): format is IsoFormat {
  return ISO_FORMATS.has(format);
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Fixed, locale-independent formats (`YYYY-MM-DD`, `HH:mm:ss`) derived from the
 * wall-clock fields in the display timezone.
 */
function formatIso(
  instant: Temporal.Instant,
  format: IsoFormat,
  timeZone: string,
): string {
  const zdt = instant.toZonedDateTimeISO(timeZone);
  const date = `${zdt.year}-${pad2(zdt.month)}-${pad2(zdt.day)}`;
  const time = `${pad2(zdt.hour)}:${pad2(zdt.minute)}:${pad2(zdt.second)}`;
  switch (format) {
    case 'isoDate':
      return date;
    case 'isoTime':
      return time;
    case 'isoDateTime':
      return `${date} ${time}`;
  }
}

/**
 * Whether the instant falls in the current calendar year. Both years are read
 * in the display timezone, since that is the wall clock the rendered string
 * describes — around New Year the same instant is "last year" in one zone and
 * "this year" in another, and the visible date should decide.
 */
function isCurrentYear(
  instant: Temporal.Instant,
  timeZone: string,
  nowMs: number,
): boolean {
  const nowYear =
    Temporal.Instant.fromEpochMilliseconds(nowMs).toZonedDateTimeISO(
      timeZone,
    ).year;
  return instant.toZonedDateTimeISO(timeZone).year === nowYear;
}

function formatDateTime(
  instant: Temporal.Instant,
  timeZone: string,
  isTimezoneShown: boolean,
): string {
  const date = getCachedDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(instant);
  const time = getCachedDateTimeFormat({
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(instant);
  return appendTimeZoneName(
    `${date} at ${time}`,
    instant,
    timeZone,
    isTimezoneShown,
  );
}

function appendTimeZoneName(
  formatted: string,
  instant: Temporal.Instant,
  timeZone: string,
  isTimezoneShown: boolean,
): string {
  if (!isTimezoneShown) {
    return formatted;
  }

  const timeZoneName = getCachedDateTimeFormat({
    timeZone,
    timeZoneName: 'short',
  })
    .formatToParts(instant)
    .find(part => part.type === 'timeZoneName')?.value;

  return timeZoneName == null ? formatted : `${formatted} ${timeZoneName}`;
}

function formatWeekdayDateTime(
  instant: Temporal.Instant,
  timeZone: string,
  isTimezoneShown: boolean,
  nowMs: number,
): string {
  const date = getCachedDateTimeFormat({
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone,
    ...(!isCurrentYear(instant, timeZone, nowMs) ? {year: 'numeric'} : {}),
  }).format(instant);
  const time = getCachedDateTimeFormat({
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(instant);

  return appendTimeZoneName(
    `${date} at ${time}`,
    instant,
    timeZone,
    isTimezoneShown,
  );
}

/**
 * Renders an absolute format. Locale formats use `Intl.DateTimeFormat`; ISO
 * formats use fixed, locale-independent strings.
 * `isTimezoneShown` appends the timezone abbreviation to locale formats.
 *
 * `weekdayDateTime` drops the year within the current year ("Sat, Jul 8 at 9:30
 * AM") and keeps it otherwise ("Sat, Jul 8, 2023 at 9:30 AM"), so the
 * common case stays short without making older moments ambiguous.
 */
export function formatAbsolute(
  instant: Temporal.Instant,
  format: AbsoluteFormat,
  timeZone: string,
  isTimezoneShown: boolean,
  nowMs: number = nowEpochMilliseconds(),
): string {
  if (isIsoFormat(format)) {
    return formatIso(instant, format, timeZone);
  }
  if (format === 'dateTime') {
    return formatDateTime(instant, timeZone, isTimezoneShown);
  }
  if (format === 'weekdayDateTime') {
    return formatWeekdayDateTime(instant, timeZone, isTimezoneShown, nowMs);
  }
  const options: Intl.DateTimeFormatOptions = {
    ...LOCALE_OPTIONS[format],
    timeZone,
    ...(isTimezoneShown ? {timeZoneName: 'short'} : {}),
  };
  return getCachedDateTimeFormat(options).format(instant);
}

// Thresholds (in seconds) for choosing the coarsest relative unit, largest
// first. Month/year use average lengths, which is fine for fuzzy display.
const RELATIVE_UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

// Anything within this many seconds of now reads as "now". The window is
// symmetric so small clock skew (a value slightly in the future) is tolerated.
const NOW_THRESHOLD_SECONDS = 45;

/**
 * Human-friendly relative string ("2 hours ago", "yesterday", "in 3 days",
 * "now"). Uses `Intl.RelativeTimeFormat` with `numeric: 'auto'` so single-unit
 * offsets render as "yesterday"/"tomorrow" where the locale supports it.
 */
export function formatRelative(
  instant: Temporal.Instant,
  nowMs: number = nowEpochMilliseconds(),
): string {
  const diffSeconds = (instant.epochMilliseconds - nowMs) / 1000;
  if (Math.abs(diffSeconds) < NOW_THRESHOLD_SECONDS) {
    return 'now';
  }
  const rtf = new Intl.RelativeTimeFormat(undefined, {numeric: 'auto'});
  for (const [unit, seconds] of RELATIVE_UNITS) {
    if (Math.abs(diffSeconds) >= seconds) {
      return rtf.format(Math.trunc(diffSeconds / seconds), unit);
    }
  }
  // Values between the "now" threshold and one minute also read as "now".
  return 'now';
}

/**
 * In `auto` mode, show a relative string while the instant is within
 * `autoThreshold` seconds of now (past or future), otherwise fall back to the
 * `dateTime` absolute format. Every other format passes through unchanged.
 */
export function resolveEffectiveFormat(
  format: TimestampFormat,
  instant: Temporal.Instant,
  nowMs: number,
  autoThreshold: number,
): 'relative' | AbsoluteFormat {
  if (format !== 'auto') {
    return format;
  }
  const diffSeconds = Math.abs((instant.epochMilliseconds - nowMs) / 1000);
  return diffSeconds <= autoThreshold ? 'relative' : 'dateTime';
}

export interface FormattedTimestamp {
  /**
   * Full absolute string (with timezone) for `aria-label` and the tooltip.
   */
  absoluteLabel: string;
  /**
   * ISO 8601 string for the `<time dateTime>` attribute.
   */
  dateTime: string;
  /**
   * Whether the visible text is a relative string.
   */
  isRelative: boolean;
  /**
   * The visible text.
   */
  text: string;
}

/**
 * Computes everything the component needs to render: the visible text, the ISO
 * `dateTime` attribute, an absolute label for accessibility/tooltip, and
 * whether the visible text is relative.
 */
export function formatTimestamp(
  value: TimestampValue,
  format: TimestampFormat,
  autoThreshold: number,
  isTimezoneShown: boolean,
  nowMs: number = nowEpochMilliseconds(),
): FormattedTimestamp {
  const {instant, timeZone} = resolveInstant(value);
  const effective = resolveEffectiveFormat(
    format,
    instant,
    nowMs,
    autoThreshold,
  );
  const absoluteLabel = formatAbsolute(
    instant,
    'dateTime',
    timeZone,
    true,
    nowMs,
  );

  if (effective === 'relative') {
    return {
      absoluteLabel,
      dateTime: instant.toString(),
      isRelative: true,
      text: formatRelative(instant, nowMs),
    };
  }

  return {
    absoluteLabel,
    dateTime: instant.toString(),
    isRelative: false,
    text: formatAbsolute(instant, effective, timeZone, isTimezoneShown, nowMs),
  };
}
