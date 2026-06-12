/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import type {CSSProperties} from 'react';
import {Link} from 'components/Link';
import {Popover} from 'components/Popover';
import {useScheduleContext} from 'components/Schedule/context';
import {isDayEvent} from 'components/Schedule/dateMath';
import {
  CalendarMonthEventPill,
  formatMonthTitle,
  getEventAccessibleLabel,
  hasEventPopoverPlugin,
  isEventInPast,
  scheduleClasses,
  ScheduleFrame,
} from 'components/Schedule/shared';
import type {
  CalendarEvent,
  ScheduleView,
  ScheduleViewComponentProps,
  ScheduleZonedInstant,
  ScheduleZonedInstantRange,
} from 'components/Schedule/types';
import {useCurrentTime} from 'components/Schedule/useCurrentTime';
import {Heading, Text} from 'components/Text';
import {cx} from 'internal/cx';
import type {DayOfWeek} from 'internal/dateTypes';
import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateDayOfWeek,
  plainDateFormat,
  plainDateFromInstant,
  plainDateIsAfter,
  plainDateIsBefore,
  plainDateIsEqual,
  type PlainDate,
} from 'internal/plainDate';
import {css} from 'styled-system/css';

export interface ScheduleMonthlyViewOptions {
  /**
   * Pixel height used for each week row in the monthly grid.
   * @default 128
   */
  monthRowHeight?: number;
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
  todayText: css({
    marginInlineEnd: '1px',
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
    gridAutoRows: 'var(--schedule-month-row-height)',
  }),
  monthEventOverlay: css({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gridAutoRows: 'var(--schedule-month-row-height)',
    pointerEvents: 'none',
  }),
  monthEventSpan: css({
    alignSelf: 'start',
    minW: 0,
    mx: '0.5',
    pointerEvents: 'auto',
    zIndex: 1,
  }),
  monthSeeMoreSpan: css({
    alignSelf: 'start',
    minW: 0,
    mx: '0.5',
    pointerEvents: 'auto',
    zIndex: 2,
  }),
  monthSeeMoreButton: css({
    display: 'inline-flex',
    alignItems: 'center',
    maxW: 'full',
    h: '5',
    px: '1',
    borderRadius: 'sm',
    color: 'primary',
    cursor: 'pointer',
    fontSize: 'xs',
    fontWeight: 'medium',
    lineHeight: 'tight',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    _hover: {
      bg: 'bg.muted',
    },
  }),
  monthPopoverContent: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
    p: '3',
  }),
  monthPopoverEvents: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    m: 0,
    p: 0,
    listStyleType: 'none',
  }),
} as const;

type MonthGridStyle = CSSProperties & {'--schedule-month-row-height': string};

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
  endIndex: number;
  event: CalendarEvent;
  level: number;
  startIndex: number;
  week: number;
}

const DEFAULT_MONTH_ROW_HEIGHT = 128;
const MONTH_EVENT_TOP_OFFSET = 30;
const MONTH_EVENT_LEVEL_HEIGHT = 22;
const MONTH_EVENT_HEIGHT = 20;
const MONTH_EVENT_BOTTOM_PADDING = 4;

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
      weekLevels[level] = columnEnd;
      segments.push({
        columnEnd,
        columnStart,
        endIndex,
        event,
        level,
        startIndex,
        week,
      });
    }
  });

  return segments;
}

function getMonthEventSegmentStyle({
  columnEnd,
  columnStart,
  level,
  week,
}: MonthEventSegment): CSSProperties {
  return {
    gridColumn: `${columnStart + 1} / ${columnEnd + 2}`,
    gridRow: `${week + 1}`,
    marginBlockStart: `${MONTH_EVENT_TOP_OFFSET + level * MONTH_EVENT_LEVEL_HEIGHT}px`,
  };
}

function getMonthEventLevelCount(monthRowHeight: number): number {
  const availableHeight =
    monthRowHeight -
    MONTH_EVENT_TOP_OFFSET -
    MONTH_EVENT_HEIGHT -
    MONTH_EVENT_BOTTOM_PADDING;
  return Math.max(
    1,
    Math.floor(availableHeight / MONTH_EVENT_LEVEL_HEIGHT) + 1,
  );
}

function getMonthSeeMoreStyle({
  dayIndex,
  level,
}: {
  dayIndex: number;
  level: number;
}): CSSProperties {
  return {
    gridColumn: `${(dayIndex % 7) + 1} / ${(dayIndex % 7) + 2}`,
    gridRow: `${Math.floor(dayIndex / 7) + 1}`,
    marginBlockStart: `${MONTH_EVENT_TOP_OFFSET + level * MONTH_EVENT_LEVEL_HEIGHT}px`,
  };
}

function segmentCoversDay(
  segment: MonthEventSegment,
  dayIndex: number,
): boolean {
  return segment.startIndex <= dayIndex && segment.endIndex >= dayIndex;
}

function shouldReserveSeeMoreLevel({
  dayEvents,
  levelCount,
}: {
  dayEvents: ReadonlyArray<CalendarEvent>;
  levelCount: number;
}): boolean {
  return dayEvents.length > levelCount;
}

function isSegmentVisible({
  dayEventsByIndex,
  levelCount,
  segment,
}: {
  dayEventsByIndex: ReadonlyArray<ReadonlyArray<CalendarEvent>>;
  levelCount: number;
  segment: MonthEventSegment;
}): boolean {
  for (let index = segment.startIndex; index <= segment.endIndex; index += 1) {
    const visibleLevelCount = shouldReserveSeeMoreLevel({
      dayEvents: dayEventsByIndex[index] ?? [],
      levelCount,
    })
      ? levelCount - 1
      : levelCount;
    if (segment.level >= visibleLevelCount) {
      return false;
    }
  }
  return true;
}

function getHiddenEventsByDate({
  dayEventsByIndex,
  days,
  segments,
  visibleSegments,
}: {
  dayEventsByIndex: ReadonlyArray<ReadonlyArray<CalendarEvent>>;
  days: ReadonlyArray<PlainDate>;
  segments: ReadonlyArray<MonthEventSegment>;
  visibleSegments: ReadonlyArray<MonthEventSegment>;
}): Map<string, CalendarEvent[]> {
  const hiddenEventsByDate = new Map<string, CalendarEvent[]>();
  days.forEach((day, dayIndex) => {
    const allSegmentEventIds = new Set(
      segments
        .filter(segment => segmentCoversDay(segment, dayIndex))
        .map(segment => segment.event.id),
    );
    const visibleSegmentEventIds = new Set(
      visibleSegments
        .filter(segment => segmentCoversDay(segment, dayIndex))
        .map(segment => segment.event.id),
    );
    const hiddenEvents = (dayEventsByIndex[dayIndex] ?? []).filter(
      event =>
        allSegmentEventIds.has(event.id) &&
        !visibleSegmentEventIds.has(event.id),
    );
    if (hiddenEvents.length > 0) {
      hiddenEventsByDate.set(day.toString(), hiddenEvents);
    }
  });

  return hiddenEventsByDate;
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
  const {categoryMap, events, highlightDate, plugins, timezoneID, viewDate} =
    useScheduleContext();
  const eventPopoverActive = hasEventPopoverPlugin(plugins);
  const currentTime = useCurrentTime();
  const month = viewDate.toPlainDate();
  const title = formatMonthTitle(month);
  const monthRowHeight = Math.max(
    64,
    Math.floor(options.monthRowHeight ?? DEFAULT_MONTH_ROW_HEIGHT),
  );
  const weekStartsOn = options.weekStartsOn ?? 0;
  const days = getMonthDays(month, options.weekCount ?? 6, weekStartsOn);
  const eventSegments = getMonthEventSegments(events, days, timezoneID);
  const eventsByDate = getEventsByDate(events, days, timezoneID);
  const dayEventsByIndex = days.map(
    day => eventsByDate.get(day.toString()) ?? [],
  );
  const monthEventLevelCount = getMonthEventLevelCount(monthRowHeight);
  const visibleEventSegments = eventSegments.filter(segment =>
    isSegmentVisible({
      dayEventsByIndex,
      levelCount: monthEventLevelCount,
      segment,
    }),
  );
  const hiddenEventsByDate = getHiddenEventsByDate({
    dayEventsByIndex,
    days,
    segments: eventSegments,
    visibleSegments: visibleEventSegments,
  });
  const today = highlightDate.toPlainDate();
  const visibleWeekdays = getWeekdays(weekStartsOn);
  const monthGridStyle: MonthGridStyle = {
    '--schedule-month-row-height': `${monthRowHeight}px`,
  };

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
          <div className={styles.monthCellGrid} style={monthGridStyle}>
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
                    // When events are interactive popover triggers they expose
                    // their own accessible names, so omit them here to avoid
                    // announcing each event twice.
                    events: eventPopoverActive ? [] : dayEvents,
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
                      className={
                        plainDateIsEqual(day, today)
                          ? styles.todayText
                          : undefined
                      }
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
          <div className={styles.monthEventOverlay} style={monthGridStyle}>
            {visibleEventSegments.map(segment => (
              <div
                // The overlay is decorative when pills are static, but becomes
                // focusable when they are popover triggers — a focusable button
                // must not live inside an aria-hidden subtree.
                aria-hidden={eventPopoverActive ? undefined : 'true'}
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
            {days.map((day, dayIndex) => {
              const hiddenEvents = hiddenEventsByDate.get(day.toString()) ?? [];
              if (hiddenEvents.length === 0) {
                return null;
              }
              const dateLabel = plainDateFormat(day, DATE_FORMAT_WITH_WEEKDAY);
              const label = `Show ${hiddenEvents.length} more events for ${dateLabel}`;
              return (
                <div
                  className={styles.monthSeeMoreSpan}
                  key={`${day.toString()}-see-more`}
                  style={getMonthSeeMoreStyle({
                    dayIndex,
                    level: Math.max(0, monthEventLevelCount - 1),
                  })}>
                  <Popover
                    content={
                      <div className={styles.monthPopoverContent}>
                        <Heading level={4}>{dateLabel}</Heading>
                        <ul className={styles.monthPopoverEvents}>
                          {(eventsByDate.get(day.toString()) ?? []).map(
                            event => (
                              <li key={event.id}>
                                <CalendarMonthEventPill
                                  event={event}
                                  isPast={isEventInPast(
                                    event,
                                    currentTime,
                                    timezoneID,
                                  )}
                                />
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    }
                    data-testid={`schedule-month-see-more-${day.toString()}`}
                    label={label}
                    width={320}>
                    <Link
                      className={styles.monthSeeMoreButton}
                      color="primary"
                      label={label}
                      size="xs"
                      weight="medium">
                      +{hiddenEvents.length} more
                    </Link>
                  </Popover>
                </div>
              );
            })}
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
  monthRowHeight = DEFAULT_MONTH_ROW_HEIGHT,
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
    options: {monthRowHeight, weekCount, weekStartsOn},
  };
}
