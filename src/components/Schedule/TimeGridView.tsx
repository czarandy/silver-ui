/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */
'use client';

import {
  Fragment,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {scheduleRecipe} from 'components/Schedule/Schedule.recipe';
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
  getTimedEventBlockStyle,
  isEventInPast,
  mergeSchedulePluginProps,
  ScheduleCurrentTimeIndicator,
  ScheduleEventOverflowPopover,
  useScheduleEventPluginProps,
  useScheduleEventPopover,
} from 'components/Schedule/shared';
import type {
  CalendarEvent,
  CalendarInstantEvent,
  ScheduleHeight,
  SchedulePluginElementProps,
  ScheduleTimeGridCellPropsRenderProps,
} from 'components/Schedule/types';
import {useCurrentTime} from 'components/Schedule/useCurrentTime';
import {Heading, Text} from 'components/Text';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateFormat,
  plainDateFromInstant,
  plainDateIsAfter,
  plainDateIsBefore,
  plainDateIsEqual,
  type PlainDate,
} from 'internal/plainDate';
import {observeResize, unobserveResize} from 'internal/sharedResizeObserver';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';
import {cx} from 'utils/cx';

type GridStyle = CSSProperties & {
  '--schedule-day-count': string;
  '--schedule-day-min-width': string;
};
type HourStyle = Pick<CSSProperties, 'height' | 'minHeight'>;

interface InlineOverflow {
  hasEnd: boolean;
  hasStart: boolean;
}

const MINUTES_PER_DAY = 24 * 60;

/**
 * A timed event's wall-clock extent, resolved to the grid timezone once so the
 * per-day and per-hour-cell work below is plain arithmetic. Temporal timezone
 * conversions dominate the grid's render cost otherwise: converting per
 * (event, cell) pair is O(hours x days x events) conversions per render.
 */
interface TimedEventExtent {
  endDate: PlainDate;
  /**
   * Minutes into `endDate`; `1440` when the event ends exactly at the
   * following midnight.
   */
  endMinute: number;
  event: CalendarInstantEvent;
  startDate: PlainDate;
  startMinute: number;
}

/**
 * A timed event clipped to one grid day, in minutes since that day's midnight.
 */
interface TimedEventDaySpan {
  endMinute: number;
  event: CalendarInstantEvent;
  startMinute: number;
}

interface TimedEventLayout {
  event: CalendarInstantEvent;
  height: number;
  level: number;
  startHour: number;
  top: number;
}

function getTimedEventExtents(
  events: ReadonlyArray<CalendarEvent>,
  timezoneID: string,
): TimedEventExtent[] {
  return events
    .filter((event): event is CalendarInstantEvent => !isDayEvent(event))
    .map(event => {
      const startDate = plainDateFromInstant(event.start, timezoneID);
      // An event ending exactly at midnight belongs to the day it ends on, not
      // the day the ending midnight starts, so the end date comes from the
      // final contained millisecond.
      const endDate = plainDateFromInstant(
        Math.max(event.end - 1, event.start),
        timezoneID,
      );
      const endsAtFollowingMidnight = !plainDateIsEqual(
        plainDateFromInstant(event.end, timezoneID),
        endDate,
      );
      return {
        endDate,
        endMinute: endsAtFollowingMidnight
          ? MINUTES_PER_DAY
          : getMinutesSinceStartOfDay(event.end, timezoneID),
        event,
        startDate,
        startMinute: getMinutesSinceStartOfDay(event.start, timezoneID),
      };
    });
}

function getTimedEventDaySpans(
  extents: ReadonlyArray<TimedEventExtent>,
  day: PlainDate,
): TimedEventDaySpan[] {
  return extents
    .filter(
      extent =>
        !plainDateIsAfter(extent.startDate, day) &&
        !plainDateIsBefore(extent.endDate, day),
    )
    .map(extent => ({
      endMinute: plainDateIsEqual(extent.endDate, day)
        ? extent.endMinute
        : MINUTES_PER_DAY,
      event: extent.event,
      startMinute: plainDateIsEqual(extent.startDate, day)
        ? extent.startMinute
        : 0,
    }));
}

function spanOverlapsHour(span: TimedEventDaySpan, hour: number): boolean {
  return span.startMinute < (hour + 1) * 60 && span.endMinute > hour * 60;
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
  hourHeight,
  maxHour,
  minHour,
  spans,
}: {
  hourHeight: number;
  maxHour: number;
  minHour: number;
  spans: ReadonlyArray<TimedEventDaySpan>;
}): TimedEventLayout[] {
  const levelEndMinutes: number[] = [];
  const minMinute = minHour * 60;
  const maxMinute = maxHour * 60;

  return spans
    .map(({event, endMinute, startMinute}) => {
      if (endMinute <= minMinute || startMinute >= maxMinute) {
        return null;
      }
      const visibleStart = Math.max(startMinute, minMinute);
      const visibleEnd = Math.min(
        maxMinute,
        Math.max(visibleStart + 15, endMinute),
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
        return isNonEmptyReactNode(content) ? (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- stable plugin order
          <Fragment key={index}>{content}</Fragment>
        ) : null;
      }),
    [event, hourHeight, maxHour, minHour, plugins, timezoneID],
  );
  const category = getCategory(categoryMap, event);
  // Formatting an instant resolves its timezone; memoized so grid re-renders
  // (e.g. a plugin popover opening) skip it.
  const timeLabel = useMemo(
    () => getEventTimeLabel(event, timezoneID),
    [event, timezoneID],
  );
  const isPast = isEventInPast(event, currentTime, timezoneID);
  const classes = scheduleEventRecipe({
    layout: 'block',
    color: category.color,
    isCanceled: event.isCanceled,
    isPast,
    isInteractive: triggerProps != null,
  });
  const {
    className: eventClassName,
    style: eventStyle,
    ...eventPassthroughProps
  } = mergeSchedulePluginProps(
    {className: classes.event, style: getTimedEventBlockStyle(layout)},
    eventPluginProps,
  );
  const body = (
    <>
      <span className={classes.title}>{event.title}</span>
      {event.location != null && event.location !== '' ? (
        <span className={classes.location}>{event.location}</span>
      ) : null}
      <span className={classes.time}>{timeLabel}</span>
      {pluginEndContent}
    </>
  );
  return (
    <>
      {triggerProps != null ? (
        <button
          className={eventClassName}
          data-state={isPast ? 'past' : undefined}
          data-testid={`schedule-event-${event.id}`}
          style={eventStyle}
          type="button"
          {...eventPassthroughProps}
          {...triggerProps}>
          {body}
        </button>
      ) : (
        <div
          className={eventClassName}
          data-state={isPast ? 'past' : undefined}
          data-testid={`schedule-event-${event.id}`}
          style={eventStyle}
          {...eventPassthroughProps}>
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
  dayMinWidth = 160,
  days,
  height,
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
   * Minimum pixel width of each day column.
   * @default 160
   */
  dayMinWidth?: number;
  /**
   * Days to display as columns in the grid.
   */
  days: PlainDate[];
  /**
   * Height behavior inherited from the schedule shell.
   */
  height: ScheduleHeight;
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
  const hours = useMemo(
    () =>
      Array.from(
        {length: normalizedMaxHour - normalizedMinHour},
        (_, index) => normalizedMinHour + index,
      ),
    [normalizedMaxHour, normalizedMinHour],
  );
  const currentTime = useCurrentTime();
  const highlightPlainDate = useMemo(
    () => highlightDate.toPlainDate(),
    [highlightDate],
  );
  const timezoneLabel = useMemo(
    () => formatTimezoneAbbreviation(days[0] ?? highlightPlainDate, timezoneID),
    [days, highlightPlainDate, timezoneID],
  );
  const normalizedDayMinWidth = Number.isFinite(dayMinWidth)
    ? Math.max(0, Math.floor(dayMinWidth))
    : 160;
  const gridStyle: GridStyle = {
    '--schedule-day-count': String(days.length),
    '--schedule-day-min-width': `${normalizedDayMinWidth}px`,
  };
  const gridRef = useRef<HTMLDivElement>(null);
  const fixedRowsRef = useRef<HTMLDivElement>(null);
  const [inlineOverflow, setInlineOverflow] = useState<InlineOverflow>({
    hasEnd: false,
    hasStart: false,
  });
  const scheduleClasses = scheduleRecipe({height});
  const styles = scheduleTimeGridViewRecipe({height});
  const normalizedHourHeight = Math.max(1, Math.floor(hourHeight));
  const normalizedAllDayEventLimit = Number.isFinite(allDayEventLimit)
    ? Math.max(0, Math.floor(allDayEventLimit))
    : 3;
  const hourStyle: HourStyle = {
    height: normalizedHourHeight,
    minHeight: normalizedHourHeight,
  };
  // Timezone resolution happens once per event here; every per-day and
  // per-cell decision below (block layout, hour overlap for cell labels) is
  // arithmetic on these extents. The memos also keep the grid cheap to
  // re-render when unrelated schedule state changes, e.g. a plugin opening a
  // popover.
  const timedEventExtents = useMemo(
    () => getTimedEventExtents(events, timezoneID),
    [events, timezoneID],
  );
  const timedEventSpansByDay = useMemo(
    () => days.map(day => getTimedEventDaySpans(timedEventExtents, day)),
    [days, timedEventExtents],
  );
  const timedEventLayoutsByDay = useMemo(
    () =>
      timedEventSpansByDay.map(spans =>
        getTimedEventLayouts({
          hourHeight: normalizedHourHeight,
          maxHour: normalizedMaxHour,
          minHour: normalizedMinHour,
          spans,
        }),
      ),
    [
      normalizedHourHeight,
      normalizedMaxHour,
      normalizedMinHour,
      timedEventSpansByDay,
    ],
  );
  const currentTimePosition = useMemo(
    () => ({
      date: plainDateFromInstant(currentTime, timezoneID),
      minute: getMinutesSinceStartOfDay(currentTime, timezoneID),
    }),
    [currentTime, timezoneID],
  );
  // Cell names embed each overlapping event's formatted times, and formatting
  // an instant resolves its timezone, so they are memoized alongside the spans
  // they are derived from. Indexed as [dayIndex][hour - normalizedMinHour].
  const hourCellNamesByDay = useMemo(
    () =>
      timedEventSpansByDay.map((spans, dayIndex) =>
        hours.map(hour =>
          getCellName({
            categoryMap,
            date: days[dayIndex],
            events: spans
              .filter(span => spanOverlapsHour(span, hour))
              .map(span => span.event),
            hourLabel: formatHour(hour),
            timezoneID,
          }),
        ),
      ),
    [categoryMap, days, hours, timedEventSpansByDay, timezoneID],
  );

  useIsomorphicLayoutEffect(() => {
    const grid = gridRef.current;
    if (grid == null) {
      return;
    }

    const updateInlineOverflow = () => {
      const maxScrollOffset = Math.max(0, grid.scrollWidth - grid.clientWidth);
      const scrollOffset = Math.min(maxScrollOffset, Math.abs(grid.scrollLeft));
      const nextOverflow = {
        hasEnd: maxScrollOffset > 1 && scrollOffset < maxScrollOffset - 1,
        hasStart: maxScrollOffset > 1 && scrollOffset > 1,
      };
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- scroll cues reflect measured DOM overflow
      setInlineOverflow(currentOverflow =>
        currentOverflow.hasEnd === nextOverflow.hasEnd &&
        currentOverflow.hasStart === nextOverflow.hasStart
          ? currentOverflow
          : nextOverflow,
      );
    };

    updateInlineOverflow();
    grid.addEventListener('scroll', updateInlineOverflow, {passive: true});
    const resizeTargets = [grid, fixedRowsRef.current].filter(
      (target): target is HTMLDivElement => target != null,
    );
    if (typeof ResizeObserver !== 'undefined') {
      resizeTargets.forEach(target =>
        observeResize(target, updateInlineOverflow),
      );
    }
    return () => {
      grid.removeEventListener('scroll', updateInlineOverflow);
      if (typeof ResizeObserver !== 'undefined') {
        resizeTargets.forEach(target =>
          unobserveResize(target, updateInlineOverflow),
        );
      }
    };
  }, [days.length, normalizedDayMinWidth]);

  return (
    <div className={styles.container}>
      <div
        aria-label="Schedule time grid"
        aria-readonly="true"
        className={cx(scheduleClasses.surface, styles.grid)}
        ref={gridRef}
        role="grid"
        style={gridStyle}
        tabIndex={0}>
        <div
          className={styles.fixedRows}
          data-testid="schedule-time-grid-fixed-rows"
          ref={fixedRowsRef}
          role="rowgroup">
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
                  isDaySeven: day.day === 7,
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
                    isDayEvent(event) &&
                    eventOccursOnDate(event, day, timezoneID),
                );
                const visibleDayEvents = dayEvents.slice(
                  0,
                  normalizedAllDayEventLimit,
                );
                const hiddenDayEvents = dayEvents.slice(
                  normalizedAllDayEventLimit,
                );
                const dayCellClasses = scheduleTimeGridViewRecipe({
                  isLastColumn: index === days.length - 1,
                });
                const dateLabel = plainDateFormat(
                  day,
                  DATE_FORMAT_WITH_WEEKDAY,
                );
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
                              isPast={isEventInPast(
                                event,
                                currentTime,
                                timezoneID,
                              )}
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
        </div>
        <div
          className={styles.timeRows}
          data-testid="schedule-time-grid-time-rows"
          role="rowgroup">
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
                    const visibleTimedEventLayouts = timedEventLayoutsByDay[
                      index
                    ].filter(layout => layout.startHour === hour);
                    const currentTimeTop = getCurrentTimeTopForHour({
                      currentTimePosition,
                      day,
                      hour,
                      maxHour: normalizedMaxHour,
                      minHour: normalizedMinHour,
                    });
                    const hourCellClasses = scheduleTimeGridViewRecipe({
                      isLastColumn: index === days.length - 1,
                      isLastRow: isLastHour,
                    });
                    const cellRenderProps: ScheduleTimeGridCellPropsRenderProps =
                      {
                        date: day,
                        hour,
                        hourHeight: normalizedHourHeight,
                        maxHour: normalizedMaxHour,
                        minHour: normalizedMinHour,
                        timezoneID,
                      };
                    const hourCellPluginProps =
                      plugins.reduce<SchedulePluginElementProps>(
                        (props, plugin) =>
                          mergeSchedulePluginProps(
                            props,
                            plugin.getTimeGridCellProps?.(cellRenderProps),
                          ),
                        {},
                      );
                    const {
                      className: hourCellClassName,
                      style: hourCellStyle,
                      ...hourCellPassthroughProps
                    } = mergeSchedulePluginProps(
                      {className: hourCellClasses.hourCell, style: hourStyle},
                      hourCellPluginProps,
                    );
                    // The plugins array is stable, ordered config that is never
                    // reordered, so the index is a safe key for the cell content.
                    const hourCellContent = plugins.map(
                      (plugin, pluginIndex): ReactNode => {
                        const content =
                          plugin.renderTimeGridCellContent?.(cellRenderProps);
                        return isNonEmptyReactNode(content) ? (
                          // eslint-disable-next-line @eslint-react/no-array-index-key -- stable plugin order
                          <Fragment key={pluginIndex}>{content}</Fragment>
                        ) : null;
                      },
                    );
                    return (
                      <div
                        aria-colindex={index + 2}
                        aria-label={
                          hourCellNamesByDay[index][hour - normalizedMinHour]
                        }
                        className={hourCellClassName}
                        data-testid={`schedule-time-grid-cell-${day.toString()}-${hour}`}
                        key={`${day.toString()}-${hour}`}
                        role="gridcell"
                        style={hourCellStyle}
                        {...hourCellPassthroughProps}>
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
                        {hourCellContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {inlineOverflow.hasStart ? (
        <div
          aria-hidden="true"
          className={styles.overflowCueStart}
          data-testid="schedule-time-grid-overflow-start"
        />
      ) : null}
      {inlineOverflow.hasEnd ? (
        <div
          aria-hidden="true"
          className={styles.overflowCueEnd}
          data-testid="schedule-time-grid-overflow-end"
        />
      ) : null}
    </div>
  );
}

function getCurrentTimeTopForHour({
  currentTimePosition,
  day,
  hour,
  maxHour,
  minHour,
}: {
  currentTimePosition: {date: PlainDate; minute: number};
  day: PlainDate;
  hour: number;
  maxHour: number;
  minHour: number;
}): number | null {
  if (!plainDateIsEqual(day, currentTimePosition.date)) {
    return null;
  }

  const currentMinute = currentTimePosition.minute;
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
