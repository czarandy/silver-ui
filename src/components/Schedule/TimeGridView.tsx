/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import {Fragment, type CSSProperties} from 'react';
import {css, cx} from 'styled-system/css';
import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateFormat,
  plainDateIsEqual,
  type PlainDate,
} from '../../internal/plainDate';
import {Heading, Text} from '../Text';
import {useScheduleContext} from './context';
import {eventOccursOnDate, isDayEvent} from './dateMath';
import {
  CalendarEventPill,
  formatHour,
  getEventAccessibleLabel,
  styles as sharedStyles,
} from './shared';
import type {CalendarEvent} from './types';

type GridStyle = CSSProperties & {'--schedule-day-count': string};

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
  allDayLabel: css({
    p: '2',
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
    minH: '10',
    p: '1',
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
    minH: '14',
    p: '1',
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  events: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
  }),
} as const;

function isEventInHour(
  event: CalendarEvent,
  hour: number,
  timezoneID: string,
): boolean {
  if (isDayEvent(event)) {
    return false;
  }
  const eventHour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezoneID,
    }).format(new Date(event.start)),
  );
  return eventHour === hour;
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
  maxHour = 23,
  minHour = 0,
}: {
  /**
   * Days to display as columns in the grid.
   */
  days: PlainDate[];
  /**
   * Last hour shown in the grid (0-23).
   * @default 23
   */
  maxHour?: number;
  /**
   * First hour shown in the grid (0-23).
   * @default 0
   */
  minHour?: number;
}): React.JSX.Element {
  const {categories, events, focusDate, timezoneID} = useScheduleContext();
  const hours = Array.from(
    {length: Math.max(0, maxHour - minHour + 1)},
    (_, index) => minHour + index,
  );
  const focusPlainDate = focusDate.toPlainDate();
  const gridStyle: GridStyle = {
    '--schedule-day-count': String(days.length),
  };

  return (
    <div
      aria-label="Schedule time grid"
      className={cx(sharedStyles.surface, styles.grid)}
      role="grid"
      style={gridStyle}>
      <div className={styles.corner} />
      <div className={styles.header} role="row">
        {days.map((day, index) => (
          <div
            aria-colindex={index + 2}
            aria-current={
              plainDateIsEqual(day, focusPlainDate) ? 'date' : undefined
            }
            className={styles.dayHeader}
            key={day.toString()}
            role="columnheader">
            <Heading level={3}>
              {plainDateFormat(day, DATE_FORMAT_WITH_WEEKDAY)}
            </Heading>
          </div>
        ))}
      </div>
      <div className={styles.allDayLabel}>
        <Text color="secondary" type="supporting" weight="bold">
          all day
        </Text>
      </div>
      <div className={styles.allDayRow} role="row">
        {days.map(day => {
          const dayEvents = events.filter(
            event =>
              isDayEvent(event) && eventOccursOnDate(event, day, timezoneID),
          );
          return (
            <div
              aria-label={getCellName({
                categories,
                date: day,
                events: dayEvents,
                hourLabel: 'all day',
                timezoneID,
              })}
              className={styles.dayCell}
              key={`${day.toString()}-all-day`}
              role="gridcell">
              <div className={styles.events}>
                {dayEvents.map(event => (
                  <CalendarEventPill event={event} key={event.id} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {hours.map(hour => {
        const hourLabel = formatHour(hour, timezoneID);
        return (
          <Fragment key={hour}>
            <div className={styles.timeLabel}>{hourLabel}</div>
            <div className={styles.timeRow} role="row">
              {days.map(day => {
                const hourEvents = events.filter(
                  event =>
                    eventOccursOnDate(event, day, timezoneID) &&
                    isEventInHour(event, hour, timezoneID),
                );
                return (
                  <div
                    aria-label={getCellName({
                      categories,
                      date: day,
                      events: hourEvents,
                      hourLabel,
                      timezoneID,
                    })}
                    className={styles.hourCell}
                    key={`${day.toString()}-${hour}`}
                    role="gridcell">
                    <div className={styles.events}>
                      {hourEvents.map(event => {
                        const category = categories.find(
                          item => item.label === event.category,
                        );
                        return (
                          <CalendarEventPill
                            event={{
                              ...event,
                              category: category?.label ?? event.category,
                            }}
                            key={event.id}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
