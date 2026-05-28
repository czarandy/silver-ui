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
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border',
    borderRadius: 'md',
    overflow: 'hidden',
    bg: 'bg',
  }),
  visuallyHidden: css({
    position: 'absolute',
    w: '1px',
    h: '1px',
    p: 0,
    m: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
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
    '--schedule-event-bg': 'var(--silver-colors-blue-100)',
    '--schedule-event-fg': 'var(--silver-colors-blue-800)',
    '--schedule-event-dot': 'var(--silver-colors-blue-600)',
  }),
  cyan: css({
    '--schedule-event-bg': 'var(--silver-colors-cyan-100)',
    '--schedule-event-fg': 'var(--silver-colors-cyan-800)',
    '--schedule-event-dot': 'var(--silver-colors-cyan-600)',
  }),
  gray: css({
    '--schedule-event-bg': 'var(--silver-colors-silver-neutral-100)',
    '--schedule-event-fg': 'var(--silver-colors-silver-neutral-800)',
    '--schedule-event-dot': 'var(--silver-colors-silver-neutral-600)',
  }),
  green: css({
    '--schedule-event-bg': 'var(--silver-colors-green-100)',
    '--schedule-event-fg': 'var(--silver-colors-green-800)',
    '--schedule-event-dot': 'var(--silver-colors-green-600)',
  }),
  orange: css({
    '--schedule-event-bg': 'var(--silver-colors-orange-100)',
    '--schedule-event-fg': 'var(--silver-colors-orange-800)',
    '--schedule-event-dot': 'var(--silver-colors-orange-600)',
  }),
  pink: css({
    '--schedule-event-bg': 'var(--silver-colors-pink-100)',
    '--schedule-event-fg': 'var(--silver-colors-pink-800)',
    '--schedule-event-dot': 'var(--silver-colors-pink-600)',
  }),
  purple: css({
    '--schedule-event-bg': 'var(--silver-colors-purple-100)',
    '--schedule-event-fg': 'var(--silver-colors-purple-800)',
    '--schedule-event-dot': 'var(--silver-colors-purple-600)',
  }),
  red: css({
    '--schedule-event-bg': 'var(--silver-colors-red-100)',
    '--schedule-event-fg': 'var(--silver-colors-red-800)',
    '--schedule-event-dot': 'var(--silver-colors-red-600)',
  }),
  teal: css({
    '--schedule-event-bg': 'var(--silver-colors-teal-100)',
    '--schedule-event-fg': 'var(--silver-colors-teal-800)',
    '--schedule-event-dot': 'var(--silver-colors-teal-600)',
  }),
  yellow: css({
    '--schedule-event-bg': 'var(--silver-colors-yellow-100)',
    '--schedule-event-fg': 'var(--silver-colors-yellow-800)',
    '--schedule-event-dot': 'var(--silver-colors-yellow-600)',
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
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezoneID,
  }).format(new Date(instant));
}

export function formatHour(hour: number, timezoneID: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    timeZone: timezoneID,
  }).format(new Date(Date.UTC(2026, 0, 1, hour)));
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

export function ScheduleFrame({
  children,
  title,
  titleLabel,
}: {
  children: ReactNode;
  title: ReactNode;
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
