import {Temporal} from '@js-temporal/polyfill';
import type {ReactNode} from 'react';
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
import {scheduleRecipe} from './Schedule.recipe';
import {scheduleEventRecipe} from './ScheduleEvent.recipe';
import {useScheduleContext} from './context';
import {isDayEvent} from './dateMath';
import type {
  CalendarEvent,
  ScheduleCategory,
  ScheduleCategoryMap,
  ScheduleHeaderContent,
} from './types';

/**
 * Static slot classes for the schedule shell (root, frame/header, surface).
 * The recipe carries no variants, so a single evaluation is shared by the
 * shell and every view.
 */
export const scheduleClasses = scheduleRecipe();

const categoryFallback: ScheduleCategory = {label: 'Event', color: 'blue'};

export function createCategoryMap(
  categories: ReadonlyArray<ScheduleCategory>,
): ScheduleCategoryMap {
  const categoryMap = new Map<string, ScheduleCategory>();
  categories.forEach(category => {
    if (!categoryMap.has(category.label)) {
      categoryMap.set(category.label, category);
    }
  });
  return categoryMap;
}

export function getCategory(
  categoryMap: ScheduleCategoryMap,
  event: CalendarEvent,
): ScheduleCategory {
  return (
    (event.category == null ? undefined : categoryMap.get(event.category)) ??
    (event.category != null
      ? {label: event.category, color: categoryFallback.color}
      : categoryFallback)
  );
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

function formatTime(instant: number, timezoneID: string): string {
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

export function formatHour(hour: number): string {
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

function getEventStartTimeLabel(
  event: CalendarEvent,
  timezoneID: string,
): string | null {
  return isDayEvent(event) ? null : formatTime(event.start, timezoneID);
}

export function getEventAccessibleLabel(
  event: CalendarEvent,
  categoryMap: ScheduleCategoryMap,
  timezoneID: string,
): string {
  const category = getCategory(categoryMap, event);
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
  const {categoryMap, timezoneID} = useScheduleContext();
  const category = getCategory(categoryMap, event);
  const classes = scheduleEventRecipe({color: category.color, isPast});
  return (
    <span
      className={classes.event}
      data-state={isPast ? 'past' : undefined}
      data-testid={`schedule-event-${event.id}`}>
      <span className={classes.title}>
        {isDayEvent(event)
          ? event.title
          : getEventAccessibleLabel(event, categoryMap, timezoneID)}
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
  const {categoryMap, timezoneID} = useScheduleContext();
  const category = getCategory(categoryMap, event);
  const startTimeLabel = getEventStartTimeLabel(event, timezoneID);
  const classes = scheduleEventRecipe({
    color: category.color,
    isPast,
    isFullWidth: true,
  });
  return (
    <span
      className={classes.event}
      data-state={isPast ? 'past' : undefined}
      data-testid={`schedule-event-${event.id}`}>
      {startTimeLabel != null ? (
        <span className={classes.time}>{startTimeLabel}</span>
      ) : null}
      <span className={classes.title}>{event.title}</span>
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
      <span className={scheduleClasses.headerTitleContent}>
        <Heading level={2}>{title}</Heading>
        {isLoading ? (
          <Spinner
            aria-label="Loading events"
            className={scheduleClasses.headerTitleSpinner}
            size="sm"
          />
        ) : null}
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
    <section aria-label={titleLabel} className={scheduleClasses.frame}>
      <div className={scheduleClasses.header}>
        <div className={scheduleClasses.headerSlotStart}>
          {header.startContent}
        </div>
        <div className={scheduleClasses.headerSlotCenter}>
          {header.centerContent}
        </div>
        <div className={scheduleClasses.headerSlotEnd}>{header.endContent}</div>
      </div>
      {children}
    </section>
  );
}
