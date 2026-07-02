/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */
'use client';

import {Temporal} from '@js-temporal/polyfill';
import {
  Fragment,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {scheduleEventRecipe} from 'components/Schedule/ScheduleEvent.recipe';
import {scheduleTimeGridViewRecipe} from 'components/Schedule/TimeGridView.recipe';
import {useScheduleContext} from 'components/Schedule/context';
import {eventOccursOnDate, isDayEvent} from 'components/Schedule/dateMath';
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
  ScheduleCurrentTimeIndicator,
  ScheduleEventOverflowPopover,
  useScheduleEventPluginProps,
  useScheduleEventPopover,
} from 'components/Schedule/shared';
import type {
  CalendarEvent,
  CalendarInstantEvent,
} from 'components/Schedule/types';
import {useCurrentTime} from 'components/Schedule/useCurrentTime';
import {Heading, Text} from 'components/Text';
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';
import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateFormat,
  plainDateFromInstant,
  plainDateIsBefore,
  plainDateIsEqual,
  type PlainDate,
} from 'internal/plainDate';

type GridStyle = CSSProperties & {'--schedule-day-count': string};
type HourStyle = Pick<CSSProperties, 'height' | 'minHeight'>;

const styles = scheduleTimeGridViewRecipe();

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

/**
 * Renders a single positioned timed-event block. Becomes a clickable `<button>`
 * trigger when an event popover plugin is active, otherwise a static `<div>`.
 */
function TimeGridEvent({
  currentTime,
  hourHeight,
  layout,
  maxHour,
  minHour,
}: {
  currentTime: number;
  hourHeight: number;
  layout: TimedEventLayout;
  maxHour: number;
  minHour: number;
}): React.JSX.Element {
  const {categoryMap, plugins, timezoneID} = useScheduleContext();
  const {event} = layout;
  const {popover, triggerProps} = useScheduleEventPopover(event);
  const eventPluginProps = useScheduleEventPluginProps({
    event,
    layout: 'timeGrid',
  });
  const pluginEndContent = useMemo(
    () =>
      plugins.map((plugin, index): ReactNode => {
        const content = plugin.renderTimeGridEventContent?.({
          event,
          hourHeight,
          maxHour,
          minHour,
          timezoneID,
        });
        // The plugins array is stable, ordered config that is never reordered,
        // so the index is a safe key for the appended content nodes.
        return isReactNode(content) ? (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- stable plugin order
          <Fragment key={index}>{content}</Fragment>
        ) : null;
      }),
    [event, hourHeight, maxHour, minHour, plugins, timezoneID],
  );
  const category = getCategory(categoryMap, event);
  const isPast = isEventInPast(event, currentTime, timezoneID);
  const classes = scheduleEventRecipe({
    layout: 'block',
    color: category.color,
    isPast,
    isInteractive: triggerProps != null,
  });
  const style = getTimedEventStyle(layout);
  const body = (
    <>
      <span className={classes.title}>{event.title}</span>
      <span className={classes.time}>
        {getEventTimeLabel(event, timezoneID)}
      </span>
      {pluginEndContent}
    </>
  );
  return (
    <>
      {triggerProps != null ? (
        <button
          className={classes.event}
          data-state={isPast ? 'past' : undefined}
          data-testid={`schedule-event-${event.id}`}
          style={style}
          type="button"
          {...eventPluginProps}
          {...triggerProps}>
          {body}
        </button>
      ) : (
        <div
          className={classes.event}
          data-state={isPast ? 'past' : undefined}
          data-testid={`schedule-event-${event.id}`}
          {...eventPluginProps}
          style={style}>
          {body}
        </div>
      )}
      {popover}
    </>
  );
}

function getCellName({
  categoryMap,
  date,
  events,
  hourLabel,
  timezoneID,
}: {
  categoryMap: ReturnType<typeof useScheduleContext>['categoryMap'];
  date: PlainDate;
  events: CalendarEvent[];
  hourLabel: string;
  timezoneID: string;
}): string {
  const dateLabel = plainDateFormat(date, DATE_FORMAT_WITH_WEEKDAY);
  const eventLabels = events.map(event =>
    getEventAccessibleLabel(event, categoryMap, timezoneID),
  );
  return eventLabels.length > 0
    ? `${dateLabel} ${hourLabel}. ${eventLabels.join('. ')}`
    : `${dateLabel} ${hourLabel}`;
}

/**
 * Shared time grid layout used by day and week views with hourly rows.
 */
export function TimeGridView({
  allDayEventLimit = 3,
  days,
  hourHeight = 100,
  maxHour = 24,
  minHour = 0,
}: {
  /**
   * Maximum number of all-day events shown before the rest collapse into a
   * popover.
   * @default 3
   */
  allDayEventLimit?: number;
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
  const {categoryMap, events, highlightDate, plugins, timezoneID} =
    useScheduleContext();
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
  const normalizedAllDayEventLimit = Number.isFinite(allDayEventLimit)
    ? Math.max(0, Math.floor(allDayEventLimit))
    : 3;
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
          {days.map((day, index) => {
            const isCurrentDay = plainDateIsEqual(day, highlightPlainDate);
            const dayHeaderClasses = scheduleTimeGridViewRecipe({
              isCurrentDay,
              isLastColumn: index === days.length - 1,
            });
            return (
              <div
                aria-colindex={index + 2}
                aria-current={isCurrentDay ? 'date' : undefined}
                aria-label={plainDateFormat(day, DATE_FORMAT_WITH_WEEKDAY)}
                className={dayHeaderClasses.dayHeader}
                key={day.toString()}
                role="columnheader">
                <Heading
                  aria-hidden="true"
                  color="secondary"
                  level={4}
                  textWrap="nowrap">
                  <span className={styles.dayHeaderContent}>
                    {plainDateFormat(day, {weekday: 'short'})}
                    <span className={dayHeaderClasses.dayHeaderDayNumber}>
                      {day.day}
                    </span>
                  </span>
                </Heading>
              </div>
            );
          })}
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
            const visibleDayEvents = dayEvents.slice(
              0,
              normalizedAllDayEventLimit,
            );
            const hiddenDayEvents = dayEvents.slice(normalizedAllDayEventLimit);
            const dayCellClasses = scheduleTimeGridViewRecipe({
              isLastColumn: index === days.length - 1,
            });
            const dateLabel = plainDateFormat(day, DATE_FORMAT_WITH_WEEKDAY);
            const seeMoreLabel = `Show ${hiddenDayEvents.length} more all-day events for ${dateLabel}`;
            return (
              <div
                aria-colindex={index + 2}
                aria-label={getCellName({
                  categoryMap,
                  date: day,
                  events: dayEvents,
                  hourLabel: 'all day',
                  timezoneID,
                })}
                className={dayCellClasses.dayCell}
                key={`${day.toString()}-all-day`}
                role="gridcell">
                <div className={styles.allDayEvents}>
                  {visibleDayEvents.map(event => (
                    <CalendarEventPill
                      event={event}
                      isPast={isEventInPast(event, currentTime, timezoneID)}
                      key={event.id}
                    />
                  ))}
                  {hiddenDayEvents.length > 0 ? (
                    <ScheduleEventOverflowPopover
                      buttonClassName={styles.allDaySeeMoreButton}
                      contentClassName={styles.allDayPopoverContent}
                      events={dayEvents}
                      eventsClassName={styles.allDayPopoverEvents}
                      hiddenEventCount={hiddenDayEvents.length}
                      label={seeMoreLabel}
                      renderEvent={event => (
                        <CalendarEventPill
                          event={event}
                          isFullWidth
                          isPast={isEventInPast(event, currentTime, timezoneID)}
                        />
                      )}
                      testId={`schedule-all-day-see-more-${day.toString()}`}
                      title={dateLabel}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {hours.map(hour => {
        const hourLabel = formatHour(hour);
        const isLastHour = hour === hours[hours.length - 1];
        const timeLabelClasses = scheduleTimeGridViewRecipe({
          isLastRow: isLastHour,
        });
        return (
          <div className={styles.rowContents} key={hour} role="row">
            <div
              aria-colindex={1}
              className={timeLabelClasses.timeLabel}
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
                const hourCellClasses = scheduleTimeGridViewRecipe({
                  isLastColumn: index === days.length - 1,
                  isLastRow: isLastHour,
                });
                const hourCellPluginProps = plugins.reduce<
                  HTMLAttributes<HTMLElement>
                >(
                  (props, plugin) => ({
                    ...props,
                    ...plugin.getTimeGridCellProps?.({
                      date: day,
                      hour,
                      hourHeight: normalizedHourHeight,
                      maxHour: normalizedMaxHour,
                      minHour: normalizedMinHour,
                      timezoneID,
                    }),
                  }),
                  {},
                );
                return (
                  <div
                    aria-colindex={index + 2}
                    aria-label={getCellName({
                      categoryMap,
                      date: day,
                      events: hourEvents,
                      hourLabel,
                      timezoneID,
                    })}
                    className={hourCellClasses.hourCell}
                    data-testid={`schedule-time-grid-cell-${day.toString()}-${hour}`}
                    key={`${day.toString()}-${hour}`}
                    role="gridcell"
                    style={hourStyle}
                    {...hourCellPluginProps}>
                    {currentTimeTop != null ? (
                      <ScheduleCurrentTimeIndicator
                        layout="timeGrid"
                        style={{top: `${currentTimeTop}%`}}
                        testId="schedule-current-time-line"
                      />
                    ) : null}
                    <div className={styles.events}>
                      {visibleTimedEventLayouts.map(layout => (
                        <TimeGridEvent
                          currentTime={currentTime}
                          hourHeight={normalizedHourHeight}
                          key={layout.event.id}
                          layout={layout}
                          maxHour={normalizedMaxHour}
                          minHour={normalizedMinHour}
                        />
                      ))}
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
