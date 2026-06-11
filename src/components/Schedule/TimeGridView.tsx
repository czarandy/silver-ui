/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import {Temporal} from '@js-temporal/polyfill';
import type {CSSProperties} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateFormat,
  plainDateFromInstant,
  plainDateIsBefore,
  plainDateIsEqual,
  type PlainDate,
} from '../../internal/plainDate';
import {Heading, Text} from '../Text';
import {scheduleEventRecipe} from './ScheduleEvent.recipe';
import {useScheduleContext} from './context';
import {eventOccursOnDate, isDayEvent} from './dateMath';
import {
  CalendarEventPill,
  formatHour,
  formatTimezoneAbbreviation,
  getCategory,
  getEventAccessibleLabel,
  getEventTimeLabel,
  getMinutesSinceStartOfDay,
  isEventInPast,
  scheduleClasses,
} from './shared';
import type {CalendarEvent, CalendarInstantEvent} from './types';
import {useCurrentTime} from './useCurrentTime';

type GridStyle = CSSProperties & {'--schedule-day-count': string};
type HourStyle = Pick<CSSProperties, 'height' | 'minHeight'>;

const styles = {
  grid: css({
    display: 'grid',
    gridTemplateColumns: '72px 1fr',
    overflow: 'auto',
  }),
  header: css({
    display: 'grid',
    gridTemplateColumns:
      'repeat(var(--schedule-day-count), minmax(160px, 1fr))',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  corner: css({
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  dayHeader: css({
    p: '2',
    textAlign: 'center',
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
  }),
  lastColumn: css({
    borderInlineEndWidth: 0,
  }),
  dayHeaderContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1',
  }),
  dayHeaderDayNumber: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minW: '30px',
    h: '30px',
    lineHeight: '30px',
    borderRadius: 'full',
  }),
  dayHeaderCurrent: css({
    bg: 'primary',
    color: 'fg.onPrimary',
  }),
  allDayLabel: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    py: '1',
    px: '2',
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  allDayRow: css({
    display: 'grid',
    gridTemplateColumns:
      'repeat(var(--schedule-day-count), minmax(160px, 1fr))',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  dayCell: css({
    minH: 0,
    p: '0.5',
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
  }),
  timeLabel: css({
    p: '2',
    color: 'fg.muted',
    textAlign: 'end',
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  timeRow: css({
    display: 'grid',
    gridTemplateColumns:
      'repeat(var(--schedule-day-count), minmax(160px, 1fr))',
  }),
  hourCell: css({
    position: 'relative',
    minH: '14',
    p: '1',
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  lastRow: css({
    borderBlockEndWidth: 0,
  }),
  events: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
  }),
  currentTimeLine: css({
    position: 'absolute',
    insetInline: '0',
    borderBlockStartWidth: '2px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'surface.orange.accent',
    transform: 'translateY(2px)',
    zIndex: '20',
    pointerEvents: 'none',
    _before: {
      content: '""',
      position: 'absolute',
      insetInlineStart: '-6px',
      top: '-6px',
      w: '2.5',
      h: '2.5',
      borderRadius: 'full',
      bg: 'surface.orange.accent',
    },
  }),
  rowContents: css({
    display: 'contents',
  }),
} as const;

function eventOverlapsHour(
  event: CalendarEvent,
  day: PlainDate,
  hour: number,
  timezoneID: string,
): boolean {
  if (isDayEvent(event)) {
    return false;
  }
  if (!eventOccursOnDate(event, day, timezoneID)) {
    return false;
  }

  const hourStart = day
    .toPlainDateTime(Temporal.PlainTime.from({hour}))
    .toZonedDateTime(timezoneID).epochMilliseconds;
  const hourEnd =
    hour === 23
      ? day.add({days: 1}).toZonedDateTime(timezoneID).epochMilliseconds
      : day
          .toPlainDateTime(Temporal.PlainTime.from({hour: hour + 1}))
          .toZonedDateTime(timezoneID).epochMilliseconds;
  return event.start < hourEnd && event.end > hourStart;
}

interface TimedEventLayout {
  event: CalendarInstantEvent;
  height: number;
  level: number;
  startHour: number;
  top: number;
}

function eventSpansPastDay(
  event: CalendarInstantEvent,
  day: PlainDate,
  timezoneID: string,
): boolean {
  return !plainDateIsEqual(
    plainDateFromInstant(Math.max(event.end - 1, event.start), timezoneID),
    day,
  );
}

function getAvailableTimedEventLevel(
  levelEndMinutes: number[],
  visibleStart: number,
): number {
  const level = levelEndMinutes.findIndex(
    endMinute => visibleStart >= endMinute,
  );
  return level >= 0 ? level : levelEndMinutes.length;
}

function getTimedEventLayouts({
  day,
  events,
  hourHeight,
  maxHour,
  minHour,
  timezoneID,
}: {
  day: PlainDate;
  events: ReadonlyArray<CalendarInstantEvent>;
  hourHeight: number;
  maxHour: number;
  minHour: number;
  timezoneID: string;
}): TimedEventLayout[] {
  const levelEndMinutes: number[] = [];
  const minMinute = minHour * 60;
  const maxMinute = maxHour * 60;

  return events
    .map(event => {
      const startDate = plainDateFromInstant(event.start, timezoneID);
      const rawStart = plainDateIsBefore(startDate, day)
        ? 0
        : getMinutesSinceStartOfDay(event.start, timezoneID);
      const rawEnd = eventSpansPastDay(event, day, timezoneID)
        ? 24 * 60
        : getMinutesSinceStartOfDay(event.end, timezoneID);
      if (rawEnd <= minMinute || rawStart >= maxMinute) {
        return null;
      }
      const visibleStart = Math.max(rawStart, minMinute);
      const visibleEnd = Math.min(
        maxMinute,
        Math.max(visibleStart + 15, rawEnd),
      );
      return {event, visibleEnd, visibleStart};
    })
    .filter(
      (
        layout,
      ): layout is {
        event: CalendarInstantEvent;
        visibleEnd: number;
        visibleStart: number;
      } => layout != null && layout.visibleEnd > layout.visibleStart,
    )
    .sort((a, b) => {
      if (a.visibleStart !== b.visibleStart) {
        return a.visibleStart - b.visibleStart;
      }
      return (
        a.visibleEnd - b.visibleEnd ||
        a.event.title.localeCompare(b.event.title)
      );
    })
    .map(({event, visibleEnd, visibleStart}) => {
      const level = getAvailableTimedEventLevel(levelEndMinutes, visibleStart);
      levelEndMinutes[level] = visibleEnd;
      const startHour = Math.floor(visibleStart / 60);
      return {
        event,
        height: ((visibleEnd - visibleStart) / 60) * hourHeight,
        level,
        startHour,
        top: ((visibleStart - startHour * 60) / 60) * hourHeight,
      };
    });
}

function getTimedEventStyle({
  height,
  level,
  top,
}: TimedEventLayout): React.CSSProperties {
  return {
    height: `${Math.max(36, height - 5)}px`,
    insetInlineEnd: '2px',
    insetInlineStart: level === 0 ? '2px' : `calc(2px + ${level * 8}%)`,
    top: `${top + 2}px`,
    zIndex: level + 1,
  };
}

function getCellName({
  categories,
  date,
  events,
  hourLabel,
  timezoneID,
}: {
  categories: ReturnType<typeof useScheduleContext>['categories'];
  date: PlainDate;
  events: CalendarEvent[];
  hourLabel: string;
  timezoneID: string;
}): string {
  const dateLabel = plainDateFormat(date, DATE_FORMAT_WITH_WEEKDAY);
  const eventLabels = events.map(event =>
    getEventAccessibleLabel(event, categories, timezoneID),
  );
  return eventLabels.length > 0
    ? `${dateLabel} ${hourLabel}. ${eventLabels.join('. ')}`
    : `${dateLabel} ${hourLabel}`;
}

/**
 * Shared time grid layout used by day and week views with hourly rows.
 */
export function TimeGridView({
  days,
  hourHeight = 100,
  maxHour = 24,
  minHour = 0,
}: {
  /**
   * Days to display as columns in the grid.
   */
  days: PlainDate[];
  /**
   * Pixel height used for each hourly row.
   * @default 100
   */
  hourHeight?: number;
  /**
   * Exclusive ending hour shown in the grid (1-24).
   * @default 24
   */
  maxHour?: number;
  /**
   * First hour shown in the grid (0-23).
   * @default 0
   */
  minHour?: number;
}): React.JSX.Element {
  const {categories, events, highlightDate, timezoneID} = useScheduleContext();
  const normalizedMinHour = Math.max(0, Math.min(23, Math.floor(minHour)));
  const normalizedMaxHour = Math.max(
    normalizedMinHour + 1,
    Math.min(24, Math.floor(maxHour)),
  );
  const hours = Array.from(
    {length: normalizedMaxHour - normalizedMinHour},
    (_, index) => normalizedMinHour + index,
  );
  const currentTime = useCurrentTime();
  const highlightPlainDate = highlightDate.toPlainDate();
  const timezoneLabel = formatTimezoneAbbreviation(
    days[0] ?? highlightPlainDate,
    timezoneID,
  );
  const gridStyle: GridStyle = {
    '--schedule-day-count': String(days.length),
  };
  const normalizedHourHeight = Math.max(1, Math.floor(hourHeight));
  const hourStyle: HourStyle = {
    height: normalizedHourHeight,
    minHeight: normalizedHourHeight,
  };
  // Layout is independent of the hour row, so compute it once per day and reuse
  // it across all hour cells rather than recomputing for every (day, hour) pair.
  const timedEventLayoutsByDay = days.map(day =>
    getTimedEventLayouts({
      day,
      events: events.filter(
        (event): event is CalendarInstantEvent =>
          !isDayEvent(event) && eventOccursOnDate(event, day, timezoneID),
      ),
      hourHeight: normalizedHourHeight,
      maxHour: normalizedMaxHour,
      minHour: normalizedMinHour,
      timezoneID,
    }),
  );

  return (
    <div
      aria-label="Schedule time grid"
      aria-readonly="true"
      className={cx(scheduleClasses.surface, styles.grid)}
      role="grid"
      style={gridStyle}>
      <div className={styles.rowContents} role="row">
        <div
          aria-colindex={1}
          aria-label="Time"
          className={styles.corner}
          role="columnheader"
        />
        <div className={styles.header}>
          {days.map((day, index) => (
            <div
              aria-colindex={index + 2}
              aria-current={
                plainDateIsEqual(day, highlightPlainDate) ? 'date' : undefined
              }
              aria-label={plainDateFormat(day, DATE_FORMAT_WITH_WEEKDAY)}
              className={cx(
                styles.dayHeader,
                index === days.length - 1 && styles.lastColumn,
              )}
              key={day.toString()}
              role="columnheader">
              <Heading
                aria-hidden="true"
                color="secondary"
                level={4}
                textWrap="nowrap">
                <span className={styles.dayHeaderContent}>
                  {plainDateFormat(day, {weekday: 'short'})}
                  <span
                    className={cx(
                      styles.dayHeaderDayNumber,
                      plainDateIsEqual(day, highlightPlainDate) &&
                        styles.dayHeaderCurrent,
                    )}>
                    {day.day}
                  </span>
                </span>
              </Heading>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.rowContents} role="row">
        <div
          aria-colindex={1}
          aria-label={`${timezoneLabel} all day`}
          className={styles.allDayLabel}
          role="rowheader">
          <Text color="secondary" type="supporting" weight="bold">
            {timezoneLabel}
          </Text>
        </div>
        <div className={styles.allDayRow}>
          {days.map((day, index) => {
            const dayEvents = events.filter(
              event =>
                isDayEvent(event) && eventOccursOnDate(event, day, timezoneID),
            );
            return (
              <div
                aria-colindex={index + 2}
                aria-label={getCellName({
                  categories,
                  date: day,
                  events: dayEvents,
                  hourLabel: 'all day',
                  timezoneID,
                })}
                className={cx(
                  styles.dayCell,
                  index === days.length - 1 && styles.lastColumn,
                )}
                key={`${day.toString()}-all-day`}
                role="gridcell">
                <div className={styles.events}>
                  {dayEvents.map(event => (
                    <CalendarEventPill
                      event={event}
                      isPast={isEventInPast(event, currentTime, timezoneID)}
                      key={event.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {hours.map(hour => {
        const hourLabel = formatHour(hour);
        const isLastHour = hour === hours[hours.length - 1];
        return (
          <div className={styles.rowContents} key={hour} role="row">
            <div
              aria-colindex={1}
              className={cx(styles.timeLabel, isLastHour && styles.lastRow)}
              role="rowheader"
              style={hourStyle}>
              {hourLabel}
            </div>
            <div className={styles.timeRow}>
              {days.map((day, index) => {
                const hourEvents = events.filter(event =>
                  eventOverlapsHour(event, day, hour, timezoneID),
                );
                const visibleTimedEventLayouts = timedEventLayoutsByDay[
                  index
                ].filter(layout => layout.startHour === hour);
                const currentTimeTop = getCurrentTimeTopForHour({
                  currentTime,
                  day,
                  hour,
                  maxHour: normalizedMaxHour,
                  minHour: normalizedMinHour,
                  timezoneID,
                });
                return (
                  <div
                    aria-colindex={index + 2}
                    aria-label={getCellName({
                      categories,
                      date: day,
                      events: hourEvents,
                      hourLabel,
                      timezoneID,
                    })}
                    className={cx(
                      styles.hourCell,
                      index === days.length - 1 && styles.lastColumn,
                      isLastHour && styles.lastRow,
                    )}
                    key={`${day.toString()}-${hour}`}
                    role="gridcell"
                    style={hourStyle}>
                    {currentTimeTop != null ? (
                      <div
                        aria-hidden="true"
                        className={styles.currentTimeLine}
                        data-testid="schedule-current-time-line"
                        style={{top: `${currentTimeTop}%`}}
                      />
                    ) : null}
                    <div className={styles.events}>
                      {visibleTimedEventLayouts.map(layout => {
                        const {event} = layout;
                        const category = getCategory(categories, event);
                        const isPast = isEventInPast(
                          event,
                          currentTime,
                          timezoneID,
                        );
                        const eventClasses = scheduleEventRecipe({
                          layout: 'block',
                          color: category.color,
                          isPast,
                        });
                        return (
                          <div
                            className={eventClasses.event}
                            data-state={isPast ? 'past' : undefined}
                            data-testid={`schedule-event-${event.id}`}
                            key={event.id}
                            style={getTimedEventStyle(layout)}>
                            <span className={eventClasses.title}>
                              {event.title}
                            </span>
                            <span className={eventClasses.time}>
                              {getEventTimeLabel(event, timezoneID)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getCurrentTimeTopForHour({
  currentTime,
  day,
  hour,
  maxHour,
  minHour,
  timezoneID,
}: {
  currentTime: number;
  day: PlainDate;
  hour: number;
  maxHour: number;
  minHour: number;
  timezoneID: string;
}): number | null {
  if (!plainDateIsEqual(day, plainDateFromInstant(currentTime, timezoneID))) {
    return null;
  }

  const currentMinute = getMinutesSinceStartOfDay(currentTime, timezoneID);
  const minMinute = minHour * 60;
  const maxMinute = maxHour * 60;
  if (currentMinute < minMinute || currentMinute > maxMinute) {
    return null;
  }

  if (currentMinute === maxMinute) {
    return hour === maxHour - 1 ? 100 : null;
  }

  if (Math.floor(currentMinute / 60) !== hour) {
    return null;
  }

  return ((currentMinute % 60) / 60) * 100;
}
