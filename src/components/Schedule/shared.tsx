import {Temporal} from '@js-temporal/polyfill';
import type {ReactNode} from 'react';
import {css, cx} from 'styled-system/css';
import {
  DATE_FORMAT_MONTH_YEAR,
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateFormat,
  plainDateFromInstant,
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
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderRadius: 'sm',
    px: '1',
    py: '0.5',
    fontSize: 'xs',
    lineHeight: 'tight',
    bg: 'var(--schedule-event-bg)',
    color: 'var(--schedule-event-fg)',
  }),
  eventDot: css({
    display: 'inline-block',
    w: '2',
    h: '2',
    borderRadius: 'full',
    bg: 'var(--schedule-event-dot)',
    flexShrink: 0,
  }),
} as const;

const categoryFallback: ScheduleCategory = {label: 'Event', color: 'blue'};

const colorStyles = {
  blue: css({
    '--schedule-event-bg': 'token(colors.surface.blue)',
    '--schedule-event-fg': 'token(colors.surface.blue.fg)',
    '--schedule-event-dot': 'token(colors.surface.blue.accent)',
  }),
  cyan: css({
    '--schedule-event-bg': 'token(colors.surface.cyan)',
    '--schedule-event-fg': 'token(colors.surface.cyan.fg)',
    '--schedule-event-dot': 'token(colors.surface.cyan.accent)',
  }),
  gray: css({
    '--schedule-event-bg': 'token(colors.surface.gray)',
    '--schedule-event-fg': 'token(colors.surface.gray.fg)',
    '--schedule-event-dot': 'token(colors.surface.gray.accent)',
  }),
  green: css({
    '--schedule-event-bg': 'token(colors.surface.green)',
    '--schedule-event-fg': 'token(colors.surface.green.fg)',
    '--schedule-event-dot': 'token(colors.surface.green.accent)',
  }),
  orange: css({
    '--schedule-event-bg': 'token(colors.surface.orange)',
    '--schedule-event-fg': 'token(colors.surface.orange.fg)',
    '--schedule-event-dot': 'token(colors.surface.orange.accent)',
  }),
  pink: css({
    '--schedule-event-bg': 'token(colors.surface.pink)',
    '--schedule-event-fg': 'token(colors.surface.pink.fg)',
    '--schedule-event-dot': 'token(colors.surface.pink.accent)',
  }),
  purple: css({
    '--schedule-event-bg': 'token(colors.surface.purple)',
    '--schedule-event-fg': 'token(colors.surface.purple.fg)',
    '--schedule-event-dot': 'token(colors.surface.purple.accent)',
  }),
  red: css({
    '--schedule-event-bg': 'token(colors.surface.red)',
    '--schedule-event-fg': 'token(colors.surface.red.fg)',
    '--schedule-event-dot': 'token(colors.surface.red.accent)',
  }),
  teal: css({
    '--schedule-event-bg': 'token(colors.surface.teal)',
    '--schedule-event-fg': 'token(colors.surface.teal.fg)',
    '--schedule-event-dot': 'token(colors.surface.teal.accent)',
  }),
  yellow: css({
    '--schedule-event-bg': 'token(colors.surface.yellow)',
    '--schedule-event-fg': 'token(colors.surface.yellow.fg)',
    '--schedule-event-dot': 'token(colors.surface.yellow.accent)',
  }),
} satisfies Record<ScheduleEventColor, string>;

export function getCategory(
  categories: ReadonlyArray<ScheduleCategory>,
  event: CalendarEvent,
): ScheduleCategory {
  return (
    categories.find(category => category.label === event.category) ??
    categoryFallback
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

export function formatTime(instant: number, timezoneID: string): string {
  return Temporal.Instant.fromEpochMilliseconds(instant)
    .toZonedDateTimeISO(timezoneID)
    .toLocaleString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
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

export function getEventAccessibleLabel(
  event: CalendarEvent,
  categories: ReadonlyArray<ScheduleCategory>,
  timezoneID: string,
): string {
  const category = getCategory(categories, event);
  return `${event.title}, ${category.label}, ${getEventTimeLabel(event, timezoneID)}`;
}

/**
 * Renders a colored pill displaying an event's accessible label.
 */
export function CalendarEventPill({
  event,
}: {
  event: CalendarEvent;
}): React.JSX.Element {
  const {categories, timezoneID} = useScheduleContext();
  const category = getCategory(categories, event);
  return (
    <span className={cx(styles.event, eventColorClassName(category.color))}>
      {getEventAccessibleLabel(event, categories, timezoneID)}
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
