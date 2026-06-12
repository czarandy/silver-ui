/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import {cx} from 'internal/cx';
import {css} from 'styled-system/css';
import type {DayOfWeek} from '../../internal/dateTypes';
import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateDayOfWeek,
  plainDateFormat,
  plainDateFromInstant,
  plainDateIsAfter,
  plainDateIsBefore,
  plainDateIsEqual,
  type PlainDate,
} from '../../internal/plainDate';
import {Heading, Text} from '../Text';
import {useScheduleContext} from './context';
import {isDayEvent} from './dateMath';
import {
  CalendarMonthEventPill,
  formatMonthTitle,
  getEventAccessibleLabel,
  isEventInPast,
  scheduleClasses,
  ScheduleFrame,
} from './shared';
import type {
  CalendarEvent,
  ScheduleView,
  ScheduleViewComponentProps,
  ScheduleZonedInstant,
  ScheduleZonedInstantRange,
} from './types';
import {useCurrentTime} from './useCurrentTime';

export interface ScheduleMonthlyViewOptions {
  /**
   * Number of weeks to display in the monthly grid.
   * @default 6
   */
  weekCount?: number;
  /**
   * Day used as the first day of the week, where 0 is Sunday and 6 is Saturday.
   * @default 0
   */
  weekStartsOn?: DayOfWeek;
}

const styles = {
  grid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  }),
  weekday: css({
    p: '2',
    textAlign: 'center',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  cell: css({
    minH: '24',
    p: '0.5',
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  lastColumn: css({
    borderInlineEndWidth: 0,
  }),
  lastRow: css({
    borderBlockEndWidth: 0,
  }),
  otherMonth: css({
    bg: 'bg.subtle',
    color: 'fg.muted',
  }),
  dayNumber: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: '6',
    h: '6',
    m: '0.5',
    borderRadius: 'full',
  }),
  today: css({
    bg: 'primary',
    color: 'fg.onPrimary',
  }),
  events: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
    m: 0,
    p: 0,
    listStyleType: 'none',
  }),
  eventItem: css({
    display: 'flex',
  }),
  monthSurface: css({
    position: 'relative',
    gridColumn: '1 / -1',
  }),
  monthCellGrid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gridAutoRows: '128px',
  }),
  monthEventOverlay: css({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gridAutoRows: '128px',
    pointerEvents: 'none',
  }),
  monthEventSpan: css({
    alignSelf: 'start',
    minW: 0,
    mx: '0.5',
    pointerEvents: 'auto',
    zIndex: 1,
  }),
} as const;

const weekdays = [
  {label: 'Sunday', shortLabel: 'Sun'},
  {label: 'Monday', shortLabel: 'Mon'},
  {label: 'Tuesday', shortLabel: 'Tue'},
  {label: 'Wednesday', shortLabel: 'Wed'},
  {label: 'Thursday', shortLabel: 'Thu'},
  {label: 'Friday', shortLabel: 'Fri'},
  {label: 'Saturday', shortLabel: 'Sat'},
];

function getWeekdays(weekStartsOn: DayOfWeek): typeof weekdays {
  return Array.from(
    {length: 7},
    (_, index) => weekdays[(index + weekStartsOn) % 7],
  );
}

function setStartOfWeek(date: PlainDate, weekStartsOn: DayOfWeek): PlainDate {
  const daysSinceWeekStart = (plainDateDayOfWeek(date) - weekStartsOn + 7) % 7;
  return date.add({days: -daysSinceWeekStart});
}

function getMonthDays(
  date: PlainDate,
  weekCount: number,
  weekStartsOn: DayOfWeek,
): PlainDate[] {
  const firstOfMonth = date.with({day: 1});
  const firstVisibleDay = setStartOfWeek(firstOfMonth, weekStartsOn);
  return Array.from({length: weekCount * 7}, (_, index) =>
    firstVisibleDay.add({days: index}),
  );
}

function getVisibleMonthRange(
  date: ScheduleZonedInstant,
  month: PlainDate,
  weekCount: number,
  weekStartsOn: DayOfWeek,
): ScheduleZonedInstantRange {
  const firstVisible = setStartOfWeek(month.with({day: 1}), weekStartsOn);
  const end = firstVisible.add({days: weekCount * 7});
  const currentDate = date.toPlainDate();
  return [
    date.startOfDay().addDays(currentDate.until(firstVisible).days),
    date.startOfDay().addDays(currentDate.until(end).days),
  ];
}

interface MonthEventSegment {
  columnEnd: number;
  columnStart: number;
  event: CalendarEvent;
  level: number;
  week: number;
}

const MAX_MONTH_EVENT_LEVELS = 4;

function getEventDateSpan(
  event: CalendarEvent,
  timezoneID: string,
): [PlainDate, PlainDate] {
  if (isDayEvent(event)) {
    return [event.start, event.end];
  }

  return [
    plainDateFromInstant(event.start, timezoneID),
    plainDateFromInstant(Math.max(event.end - 1, event.start), timezoneID),
  ];
}

function getEventVisibleDateIndexes({
  event,
  firstDay,
  lastDay,
  timezoneID,
}: {
  event: CalendarEvent;
  firstDay: PlainDate;
  lastDay: PlainDate;
  timezoneID: string;
}): [number, number] | null {
  const [eventStart, eventEnd] = getEventDateSpan(event, timezoneID);
  if (
    plainDateIsBefore(eventEnd, firstDay) ||
    plainDateIsAfter(eventStart, lastDay)
  ) {
    return null;
  }

  const startIndex = plainDateIsBefore(eventStart, firstDay)
    ? 0
    : firstDay.until(eventStart).days;
  const endIndex = plainDateIsAfter(eventEnd, lastDay)
    ? firstDay.until(lastDay).days
    : firstDay.until(eventEnd).days;

  return [startIndex, endIndex];
}

function getEventsByDate(
  events: ReadonlyArray<CalendarEvent>,
  days: ReadonlyArray<PlainDate>,
  timezoneID: string,
): Map<string, CalendarEvent[]> {
  const eventsByDate = new Map<string, CalendarEvent[]>();
  if (days.length === 0) {
    return eventsByDate;
  }
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  days.forEach(day => {
    eventsByDate.set(day.toString(), []);
  });

  events.forEach(event => {
    const indexes = getEventVisibleDateIndexes({
      event,
      firstDay,
      lastDay,
      timezoneID,
    });
    if (indexes == null) {
      return;
    }

    const [startIndex, endIndex] = indexes;
    for (let index = startIndex; index <= endIndex; index += 1) {
      eventsByDate.get(days[index].toString())?.push(event);
    }
  });

  return eventsByDate;
}

function getAvailableLevel(levels: number[], columnStart: number): number {
  const level = levels.findIndex(columnEnd => columnStart > columnEnd);
  return level >= 0 ? level : levels.length;
}

function getMonthEventSegments(
  events: ReadonlyArray<CalendarEvent>,
  days: ReadonlyArray<PlainDate>,
  timezoneID: string,
): MonthEventSegment[] {
  const segments: MonthEventSegment[] = [];
  const levelsByWeek: number[][] = [];
  if (days.length === 0) {
    return segments;
  }
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  const monthEvents = events
    .map(event => {
      const indexes = getEventVisibleDateIndexes({
        event,
        firstDay,
        lastDay,
        timezoneID,
      });
      if (indexes == null) {
        return null;
      }
      const [startIndex, endIndex] = indexes;
      return {
        endIndex,
        event,
        isPriority: isDayEvent(event) || endIndex > startIndex,
        startIndex,
      };
    })
    .filter(
      (
        record,
      ): record is {
        endIndex: number;
        event: CalendarEvent;
        isPriority: boolean;
        startIndex: number;
      } => record != null,
    )
    .sort((a, b) => {
      if (a.startIndex !== b.startIndex) {
        return a.startIndex - b.startIndex;
      }
      if (a.isPriority !== b.isPriority) {
        return a.isPriority ? -1 : 1;
      }
      const aDuration = a.endIndex - a.startIndex;
      const bDuration = b.endIndex - b.startIndex;
      if (aDuration !== bDuration) {
        return bDuration - aDuration;
      }
      return a.event.title.localeCompare(b.event.title);
    });

  monthEvents.forEach(({endIndex, event, startIndex}) => {
    for (
      let week = Math.floor(startIndex / 7);
      week <= Math.floor(endIndex / 7);
      week += 1
    ) {
      const columnStart =
        week === Math.floor(startIndex / 7) ? startIndex % 7 : 0;
      const columnEnd = week === Math.floor(endIndex / 7) ? endIndex % 7 : 6;
      const weekLevels = (levelsByWeek[week] ??= []);
      const level = getAvailableLevel(weekLevels, columnStart);
      if (level < MAX_MONTH_EVENT_LEVELS) {
        weekLevels[level] = columnEnd;
        segments.push({columnEnd, columnStart, event, level, week});
      }
    }
  });

  return segments;
}

function getMonthEventSegmentStyle({
  columnEnd,
  columnStart,
  level,
  week,
}: MonthEventSegment): React.CSSProperties {
  return {
    gridColumn: `${columnStart + 1} / ${columnEnd + 2}`,
    gridRow: `${week + 1}`,
    marginBlockStart: `${30 + level * 29}px`,
  };
}

function getGridCellName({
  categoryMap,
  date,
  events,
  timezoneID,
}: {
  categoryMap: ReturnType<typeof useScheduleContext>['categoryMap'];
  date: PlainDate;
  events: CalendarEvent[];
  timezoneID: string;
}): string {
  const eventLabels = events.map(event =>
    getEventAccessibleLabel(event, categoryMap, timezoneID),
  );
  const dateLabel = plainDateFormat(date, DATE_FORMAT_WITH_WEEKDAY);
  return eventLabels.length > 0
    ? `${dateLabel}. ${eventLabels.join('. ')}`
    : dateLabel;
}

/**
 * Internal view component that renders a month grid with day cells and events.
 */
function ScheduleMonthlyView({
  options,
}: ScheduleViewComponentProps<ScheduleMonthlyViewOptions>): React.JSX.Element {
  const {categoryMap, events, highlightDate, timezoneID, viewDate} =
    useScheduleContext();
  const currentTime = useCurrentTime();
  const month = viewDate.toPlainDate();
  const title = formatMonthTitle(month);
  const weekStartsOn = options.weekStartsOn ?? 0;
  const days = getMonthDays(month, options.weekCount ?? 6, weekStartsOn);
  const eventSegments = getMonthEventSegments(events, days, timezoneID);
  const eventsByDate = getEventsByDate(events, days, timezoneID);
  const today = highlightDate.toPlainDate();
  const visibleWeekdays = getWeekdays(weekStartsOn);

  return (
    <ScheduleFrame title={title} titleLabel={title}>
      <div
        aria-label={title}
        className={cx(scheduleClasses.surface, styles.grid)}
        role="grid">
        {visibleWeekdays.map((weekday, index) => (
          <div
            aria-colindex={index + 1}
            aria-label={weekday.label}
            className={styles.weekday}
            key={weekday.label}
            role="columnheader">
            <Heading color="secondary" level={4}>
              {weekday.shortLabel}
            </Heading>
          </div>
        ))}
        <div className={styles.monthSurface}>
          <div className={styles.monthCellGrid}>
            {days.map((day, index) => {
              const dayEvents = eventsByDate.get(day.toString()) ?? [];
              const isCurrentMonth =
                day.month === month.month && day.year === month.year;
              const isLastColumn = index % 7 === 6;
              const isLastRow = index >= days.length - 7;
              return (
                <div
                  aria-current={
                    plainDateIsEqual(day, today) ? 'date' : undefined
                  }
                  aria-label={getGridCellName({
                    categoryMap,
                    date: day,
                    events: dayEvents,
                    timezoneID,
                  })}
                  className={cx(
                    styles.cell,
                    isLastColumn ? styles.lastColumn : undefined,
                    isLastRow ? styles.lastRow : undefined,
                    !isCurrentMonth ? styles.otherMonth : undefined,
                  )}
                  key={day.toString()}
                  role="gridcell">
                  <span
                    className={cx(
                      styles.dayNumber,
                      plainDateIsEqual(day, today) ? styles.today : undefined,
                    )}>
                    <Text
                      as="span"
                      color="inherit"
                      hasTabularNumbers
                      type="supporting"
                      weight="medium">
                      {day.day}
                    </Text>
                  </span>
                </div>
              );
            })}
          </div>
          <div aria-hidden="true" className={styles.monthEventOverlay}>
            {eventSegments.map(segment => (
              <div
                className={styles.monthEventSpan}
                data-testid={`schedule-event-span-${segment.event.id}`}
                key={`${segment.event.id}:${segment.week}:${segment.columnStart}`}
                style={getMonthEventSegmentStyle(segment)}>
                <CalendarMonthEventPill
                  event={segment.event}
                  isPast={isEventInPast(segment.event, currentTime, timezoneID)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScheduleFrame>
  );
}

/**
 * Creates a monthly schedule view configuration.
 */
export function createScheduleMonthlyView({
  weekCount = 6,
  weekStartsOn = 0,
}: ScheduleMonthlyViewOptions = {}): ScheduleView<ScheduleMonthlyViewOptions> {
  return {
    component: ScheduleMonthlyView,
    getDateRange: date => {
      const month = date.toPlainDate();
      return getVisibleMonthRange(date, month, weekCount, weekStartsOn);
    },
    getNextDateRange: date => {
      const nextMonth = date.toPlainDate().with({day: 1}).add({months: 1});
      return {
        label: 'Next month',
        range: getVisibleMonthRange(date, nextMonth, weekCount, weekStartsOn),
      };
    },
    getPreviousDateRange: date => {
      const previousMonth = date
        .toPlainDate()
        .with({day: 1})
        .subtract({months: 1});
      return {
        label: 'Previous month',
        range: getVisibleMonthRange(
          date,
          previousMonth,
          weekCount,
          weekStartsOn,
        ),
      };
    },
    options: {weekCount, weekStartsOn},
  };
}
