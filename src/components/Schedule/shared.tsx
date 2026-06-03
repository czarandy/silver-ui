import {Temporal} from '@js-temporal/polyfill';
import type {ReactNode} from 'react';
import {css, cx} from 'styled-system/css';
import {
  DATE_FORMAT_MONTH_YEAR,
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateFormat,
  plainDateFromInstant,
  plainDateIsBefore,
  plainDateIsEqual,
  type PlainDate,
} from '../../internal/plainDate';
import {Spinner} from '../Spinner';
import {Heading} from '../Text';
import {useScheduleContext} from './context';
import {isDayEvent} from './dateMath';
import type {
  CalendarEvent,
  ScheduleCategory,
  ScheduleEventColor,
  ScheduleHeaderContent,
} from './types';

export const styles = {
  root: css({
    color: 'fg',
    fontFamily: 'body',
    w: 'full',
  }),
  frame: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    w: 'full',
  }),
  header: css({
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: '3',
  }),
  headerSlotStart: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '2',
  }),
  headerSlotCenter: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2',
    textAlign: 'center',
  }),
  headerSlotEnd: css({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '2',
  }),
  headerTitleContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
  }),
  surface: css({
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'border',
    borderRadius: 'md',
    overflow: 'hidden',
    bg: 'bg',
  }),
  event: css({
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '1',
    maxW: 'full',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'var(--schedule-event-border)',
    borderRadius: 'sm',
    px: '1',
    py: '0.5',
    fontSize: 'xs',
    fontWeight: 'medium',
    lineHeight: 'tight',
    bg: 'var(--schedule-event-bg)',
    color: 'var(--schedule-event-fg)',
    _hover: {
      bg: 'var(--schedule-event-bg-hover)',
    },
  }),
  eventPast: css({
    '--schedule-event-bg':
      'color-mix(in srgb, var(--schedule-event-dot) 10%, token(colors.bg))',
    '--schedule-event-bg-hover':
      'color-mix(in srgb, var(--schedule-event-dot) 14%, token(colors.bg))',
    '--schedule-event-border':
      'color-mix(in srgb, var(--schedule-event-dot) 48%, token(colors.border))',
    '--schedule-event-fg':
      'color-mix(in srgb, var(--schedule-event-fg-base) 52%, token(colors.fg.muted))',
  }),
  eventDot: css({
    display: 'inline-block',
    w: '2',
    h: '2',
    borderRadius: 'full',
    bg: 'var(--schedule-event-dot)',
    flexShrink: 0,
  }),
  eventTime: css({
    flexShrink: 0,
    fontWeight: 'normal',
  }),
  eventTitle: css({
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
} as const;

const categoryFallback: ScheduleCategory = {label: 'Event', color: 'blue'};

const colorStyles = {
  blue: css({
    '--schedule-event-bg': 'token(colors.surface.blue)',
    '--schedule-event-bg-hover': 'token(colors.surface.blue.hover)',
    '--schedule-event-border': 'token(colors.surface.blue.accent)',
    '--schedule-event-fg': 'token(colors.surface.blue.fg)',
    '--schedule-event-fg-base': 'token(colors.surface.blue.fg)',
    '--schedule-event-dot': 'token(colors.surface.blue.accent)',
  }),
  cyan: css({
    '--schedule-event-bg': 'token(colors.surface.cyan)',
    '--schedule-event-bg-hover': 'token(colors.surface.cyan.hover)',
    '--schedule-event-border': 'token(colors.surface.cyan.accent)',
    '--schedule-event-fg': 'token(colors.surface.cyan.fg)',
    '--schedule-event-fg-base': 'token(colors.surface.cyan.fg)',
    '--schedule-event-dot': 'token(colors.surface.cyan.accent)',
  }),
  gray: css({
    '--schedule-event-bg': 'token(colors.surface.gray)',
    '--schedule-event-bg-hover': 'token(colors.surface.gray.hover)',
    '--schedule-event-border': 'token(colors.surface.gray.accent)',
    '--schedule-event-fg': 'token(colors.surface.gray.fg)',
    '--schedule-event-fg-base': 'token(colors.surface.gray.fg)',
    '--schedule-event-dot': 'token(colors.surface.gray.accent)',
  }),
  green: css({
    '--schedule-event-bg': 'token(colors.surface.green)',
    '--schedule-event-bg-hover': 'token(colors.surface.green.hover)',
    '--schedule-event-border': 'token(colors.surface.green.accent)',
    '--schedule-event-fg': 'token(colors.surface.green.fg)',
    '--schedule-event-fg-base': 'token(colors.surface.green.fg)',
    '--schedule-event-dot': 'token(colors.surface.green.accent)',
  }),
  orange: css({
    '--schedule-event-bg': 'token(colors.surface.orange)',
    '--schedule-event-bg-hover': 'token(colors.surface.orange.hover)',
    '--schedule-event-border': 'token(colors.surface.orange.accent)',
    '--schedule-event-fg': 'token(colors.surface.orange.fg)',
    '--schedule-event-fg-base': 'token(colors.surface.orange.fg)',
    '--schedule-event-dot': 'token(colors.surface.orange.accent)',
  }),
  pink: css({
    '--schedule-event-bg': 'token(colors.surface.pink)',
    '--schedule-event-bg-hover': 'token(colors.surface.pink.hover)',
    '--schedule-event-border': 'token(colors.surface.pink.accent)',
    '--schedule-event-fg': 'token(colors.surface.pink.fg)',
    '--schedule-event-fg-base': 'token(colors.surface.pink.fg)',
    '--schedule-event-dot': 'token(colors.surface.pink.accent)',
  }),
  purple: css({
    '--schedule-event-bg': 'token(colors.surface.purple)',
    '--schedule-event-bg-hover': 'token(colors.surface.purple.hover)',
    '--schedule-event-border': 'token(colors.surface.purple.accent)',
    '--schedule-event-fg': 'token(colors.surface.purple.fg)',
    '--schedule-event-fg-base': 'token(colors.surface.purple.fg)',
    '--schedule-event-dot': 'token(colors.surface.purple.accent)',
  }),
  red: css({
    '--schedule-event-bg': 'token(colors.surface.red)',
    '--schedule-event-bg-hover': 'token(colors.surface.red.hover)',
    '--schedule-event-border': 'token(colors.surface.red.accent)',
    '--schedule-event-fg': 'token(colors.surface.red.fg)',
    '--schedule-event-fg-base': 'token(colors.surface.red.fg)',
    '--schedule-event-dot': 'token(colors.surface.red.accent)',
  }),
  teal: css({
    '--schedule-event-bg': 'token(colors.surface.teal)',
    '--schedule-event-bg-hover': 'token(colors.surface.teal.hover)',
    '--schedule-event-border': 'token(colors.surface.teal.accent)',
    '--schedule-event-fg': 'token(colors.surface.teal.fg)',
    '--schedule-event-fg-base': 'token(colors.surface.teal.fg)',
    '--schedule-event-dot': 'token(colors.surface.teal.accent)',
  }),
  yellow: css({
    '--schedule-event-bg': 'token(colors.surface.yellow)',
    '--schedule-event-bg-hover': 'token(colors.surface.yellow.hover)',
    '--schedule-event-border': 'token(colors.surface.yellow.accent)',
    '--schedule-event-fg': 'token(colors.surface.yellow.fg)',
    '--schedule-event-fg-base': 'token(colors.surface.yellow.fg)',
    '--schedule-event-dot': 'token(colors.surface.yellow.accent)',
  }),
} satisfies Record<ScheduleEventColor, string>;

export function getCategory(
  categories: ReadonlyArray<ScheduleCategory>,
  event: CalendarEvent,
): ScheduleCategory {
  return (
    categories.find(category => category.label === event.category) ??
    (event.category != null
      ? {label: event.category, color: categoryFallback.color}
      : categoryFallback)
  );
}

export function eventColorClassName(
  color: ScheduleEventColor | undefined,
): string {
  return colorStyles[color ?? categoryFallback.color];
}

export function formatDate(date: PlainDate): string {
  return plainDateFormat(date, DATE_FORMAT_WITH_WEEKDAY);
}

export function formatMonthTitle(date: PlainDate): string {
  return plainDateFormat(date, DATE_FORMAT_MONTH_YEAR);
}

export function formatWeekTitle(start: PlainDate, end: PlainDate): string {
  if (start.year === end.year && start.month === end.month) {
    return formatMonthTitle(start);
  }

  const startMonth = plainDateFormat(start, {month: 'long'});
  const endMonth = plainDateFormat(end, {month: 'long'});
  return start.year === end.year
    ? `${startMonth} - ${endMonth} ${end.year}`
    : `${startMonth} ${start.year} - ${endMonth} ${end.year}`;
}

export function formatListRangeTitle(start: PlainDate, end: PlainDate): string {
  return plainDateIsEqual(start, end)
    ? formatDate(start)
    : formatWeekTitle(start, end);
}

export function formatTime(instant: number, timezoneID: string): string {
  return Temporal.Instant.fromEpochMilliseconds(instant)
    .toZonedDateTimeISO(timezoneID)
    .toLocaleString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
}

export function formatTimezoneAbbreviation(
  date: PlainDate,
  timezoneID: string,
): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    timeZone: timezoneID,
    timeZoneName: 'short',
  });
  const parts = formatter.formatToParts(
    date.toZonedDateTime(timezoneID).epochMilliseconds,
  );
  return parts.find(part => part.type === 'timeZoneName')?.value ?? timezoneID;
}

export function formatHour(hour: number, _timezoneID: string): string {
  return Temporal.PlainTime.from({hour}).toLocaleString(undefined, {
    hour: 'numeric',
  });
}

export function getEventTimeLabel(
  event: CalendarEvent,
  timezoneID: string,
): string {
  if (isDayEvent(event)) {
    return 'all day';
  }

  return `${formatTime(event.start, timezoneID)} - ${formatTime(event.end, timezoneID)}`;
}

export function getEventStartTimeLabel(
  event: CalendarEvent,
  timezoneID: string,
): string | null {
  return isDayEvent(event) ? null : formatTime(event.start, timezoneID);
}

export function getEventAccessibleLabel(
  event: CalendarEvent,
  categories: ReadonlyArray<ScheduleCategory>,
  timezoneID: string,
): string {
  const category = getCategory(categories, event);
  return `${event.title}, ${category.label}, ${getEventTimeLabel(event, timezoneID)}`;
}

export function getMinutesSinceStartOfDay(
  instant: number,
  timezoneID: string,
): number {
  const zonedTime = Temporal.Instant.fromEpochMilliseconds(instant)
    .toZonedDateTimeISO(timezoneID)
    .toPlainTime();
  return zonedTime.hour * 60 + zonedTime.minute;
}

export function isEventInPast(
  event: CalendarEvent,
  currentTime: number,
  timezoneID: string,
): boolean {
  if (isDayEvent(event)) {
    return plainDateIsBefore(
      event.end,
      plainDateFromInstant(currentTime, timezoneID),
    );
  }

  return event.end <= currentTime;
}

/**
 * Renders a colored pill displaying an event's accessible label.
 */
export function CalendarEventPill({
  event,
  isPast = false,
}: {
  event: CalendarEvent;
  isPast?: boolean;
}): React.JSX.Element {
  const {categories, timezoneID} = useScheduleContext();
  const category = getCategory(categories, event);
  return (
    <span
      className={cx(
        styles.event,
        eventColorClassName(category.color),
        isPast && styles.eventPast,
      )}
      data-state={isPast ? 'past' : undefined}
      data-testid={`schedule-event-${event.id}`}>
      <span className={styles.eventTitle}>
        {isDayEvent(event)
          ? event.title
          : getEventAccessibleLabel(event, categories, timezoneID)}
      </span>
    </span>
  );
}

export function CalendarMonthEventPill({
  event,
  isPast = false,
}: {
  event: CalendarEvent;
  isPast?: boolean;
}): React.JSX.Element {
  const {categories, timezoneID} = useScheduleContext();
  const category = getCategory(categories, event);
  const startTimeLabel = getEventStartTimeLabel(event, timezoneID);
  return (
    <span
      className={cx(
        styles.event,
        css({w: 'full'}),
        eventColorClassName(category.color),
        isPast && styles.eventPast,
      )}
      data-state={isPast ? 'past' : undefined}
      data-testid={`schedule-event-${event.id}`}>
      {startTimeLabel != null ? (
        <span className={styles.eventTime}>{startTimeLabel}</span>
      ) : null}
      <span className={styles.eventTitle}>{event.title}</span>
    </span>
  );
}

/**
 * Layout wrapper that renders the schedule header (with plugin slots) and body.
 */
export function ScheduleFrame({
  children,
  title,
  titleLabel,
}: {
  /**
   * View content rendered below the header.
   */
  children: ReactNode;
  /**
   * Title displayed in the header center slot.
   */
  title: ReactNode;
  /**
   * Accessible label for the enclosing section.
   */
  titleLabel: string;
}): React.JSX.Element {
  const {isLoading, plugins} = useScheduleContext();
  const initialHeader: ScheduleHeaderContent = {
    startContent: null,
    centerContent: (
      <span className={styles.headerTitleContent}>
        <Heading level={2}>{title}</Heading>
        {isLoading ? <Spinner aria-label="Loading events" size="sm" /> : null}
      </span>
    ),
    endContent: null,
  };
  const header = plugins.reduce(
    (content, plugin) =>
      plugin.renderHeader?.(
        content.startContent,
        content.centerContent,
        content.endContent,
      ) ?? content,
    initialHeader,
  );

  return (
    <section aria-label={titleLabel} className={styles.frame}>
      <div className={styles.header}>
        <div className={styles.headerSlotStart}>{header.startContent}</div>
        <div className={styles.headerSlotCenter}>{header.centerContent}</div>
        <div className={styles.headerSlotEnd}>{header.endContent}</div>
      </div>
      {children}
    </section>
  );
}

export function plainDateFromEventStart(
  event: CalendarEvent,
  timezoneID: string,
): PlainDate {
  return isDayEvent(event)
    ? event.start
    : plainDateFromInstant(event.start, timezoneID);
}
