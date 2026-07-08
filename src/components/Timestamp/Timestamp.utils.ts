import {Temporal} from '@js-temporal/polyfill';
import {getBrowserTimezoneID, nowEpochMilliseconds} from 'internal/time';

export type TimestampValue =
  | Temporal.Instant
  | Temporal.ZonedDateTime
  | number
  | string;

export type TimestampFormat =
  | 'auto'
  | 'relative'
  | 'date'
  | 'time'
  | 'dateTime'
  | 'systemDate'
  | 'systemTime'
  | 'systemDateTime';

/**
 * An absolute format — every `TimestampFormat` except the ones whose output
 * depends on the current time.
 */
type AbsoluteFormat = Exclude<TimestampFormat, 'auto' | 'relative'>;

/**
 * The fixed, locale-independent formats.
 */
type SystemFormat = 'systemDate' | 'systemTime' | 'systemDateTime';

interface ResolvedInstant {
  /**
   * The moment in time to display.
   */
  instant: Temporal.Instant;
  /**
   * Timezone used for absolute/system formatting. Taken from a
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

const LOCALE_OPTIONS: Record<AbsoluteFormat, Intl.DateTimeFormatOptions> = {
  date: {year: 'numeric', month: 'short', day: 'numeric'},
  time: {hour: 'numeric', minute: '2-digit'},
  dateTime: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },
  // System formats are handled separately (see `formatSystem`).
  systemDate: {},
  systemTime: {},
  systemDateTime: {},
};

const SYSTEM_FORMATS: ReadonlySet<AbsoluteFormat> = new Set<SystemFormat>([
  'systemDate',
  'systemTime',
  'systemDateTime',
]);

function isSystemFormat(format: AbsoluteFormat): format is SystemFormat {
  return SYSTEM_FORMATS.has(format);
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Fixed, locale-independent formats (`YYYY-MM-DD`, `HH:mm:ss`) derived from the
 * wall-clock fields in the display timezone.
 */
function formatSystem(
  instant: Temporal.Instant,
  format: SystemFormat,
  timeZone: string,
): string {
  const zdt = instant.toZonedDateTimeISO(timeZone);
  const date = `${zdt.year}-${pad2(zdt.month)}-${pad2(zdt.day)}`;
  const time = `${pad2(zdt.hour)}:${pad2(zdt.minute)}:${pad2(zdt.second)}`;
  switch (format) {
    case 'systemDate':
      return date;
    case 'systemTime':
      return time;
    case 'systemDateTime':
      return `${date} ${time}`;
  }
}

/**
 * Renders an absolute format. Locale formats use `Intl.DateTimeFormat` (via
 * `Instant.toLocaleString`); system formats use fixed ISO-like strings.
 * `isTimezoneShown` appends the timezone abbreviation to locale formats.
 */
export function formatAbsolute(
  instant: Temporal.Instant,
  format: AbsoluteFormat,
  timeZone: string,
  isTimezoneShown: boolean,
): string {
  if (isSystemFormat(format)) {
    return formatSystem(instant, format, timeZone);
  }
  const options: Intl.DateTimeFormatOptions = {
    ...LOCALE_OPTIONS[format],
    timeZone,
    ...(isTimezoneShown ? {timeZoneName: 'short'} : {}),
  };
  return instant.toLocaleString(undefined, options);
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
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  // Unreachable: values under a minute are handled by the "now" window above.
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
  const absoluteLabel = formatAbsolute(instant, 'dateTime', timeZone, true);

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
    text: formatAbsolute(instant, effective, timeZone, isTimezoneShown),
  };
}
