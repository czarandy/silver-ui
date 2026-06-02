/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import {css, cx} from 'styled-system/css';
import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateFormat,
  plainDateIsEqual,
  plainDateSetStartOfWeek,
  type PlainDate,
} from '../../internal/plainDate';
import {Heading, Text} from '../Text';
import {useScheduleContext} from './context';
import {eventOccursOnDate} from './dateMath';
import {
  CalendarEventPill,
  ScheduleFrame,
  formatMonthTitle,
  getEventAccessibleLabel,
  styles as sharedStyles,
} from './shared';
import type {
  CalendarEvent,
  ScheduleView,
  ScheduleViewComponentProps,
} from './types';

export interface ScheduleMonthlyViewOptions {
  /**
   * Number of weeks to display in the monthly grid.
   * @default 6
   */
  weekCount?: number;
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
    p: '2',
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  otherMonth: css({
    bg: 'bg.subtle',
    color: 'fg.muted',
  }),
  dayNumber: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minW: '6',
    h: '6',
    mb: '1',
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
} as const;

const weekdays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function getMonthDays(date: PlainDate, weekCount: number): PlainDate[] {
  const firstOfMonth = date.with({day: 1});
  const firstVisibleDay = plainDateSetStartOfWeek(firstOfMonth);
  return Array.from({length: weekCount * 7}, (_, index) =>
    firstVisibleDay.add({days: index}),
  );
}

function getGridCellName({
  date,
  events,
  timezoneID,
}: {
  date: PlainDate;
  events: CalendarEvent[];
  timezoneID: string;
}): string {
  const eventLabels = events.map(event =>
    getEventAccessibleLabel(event, [], timezoneID),
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
  const {events, highlightDate, timezoneID, viewDate} = useScheduleContext();
  const month = viewDate.toPlainDate();
  const title = formatMonthTitle(month);
  const days = getMonthDays(month, options.weekCount ?? 6);
  const today = highlightDate.toPlainDate();

  return (
    <ScheduleFrame title={title} titleLabel={title}>
      <div
        aria-label={title}
        className={cx(sharedStyles.surface, styles.grid)}
        role="grid">
        {weekdays.map((weekday, index) => (
          <div
            aria-colindex={index + 1}
            className={styles.weekday}
            key={weekday}
            role="columnheader">
            <Heading level={3}>{weekday}</Heading>
          </div>
        ))}
        {days.map(day => {
          const dayEvents = events.filter(event =>
            eventOccursOnDate(event, day, timezoneID),
          );
          const isCurrentMonth =
            day.month === month.month && day.year === month.year;
          return (
            <div
              aria-current={plainDateIsEqual(day, today) ? 'date' : undefined}
              aria-label={getGridCellName({
                date: day,
                events: dayEvents,
                timezoneID,
              })}
              className={cx(
                styles.cell,
                !isCurrentMonth ? styles.otherMonth : undefined,
              )}
              key={day.toString()}
              role="gridcell">
              <Text
                as="span"
                className={cx(
                  styles.dayNumber,
                  plainDateIsEqual(day, today) ? styles.today : undefined,
                )}
                color="inherit"
                type="label">
                {day.day}
              </Text>
              <ul className={styles.events}>
                {dayEvents.map(event => (
                  <li key={event.id}>
                    <CalendarEventPill event={event} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </ScheduleFrame>
  );
}

/**
 * Creates a monthly schedule view configuration.
 */
export function createScheduleMonthlyView({
  weekCount = 6,
}: ScheduleMonthlyViewOptions = {}): ScheduleView<ScheduleMonthlyViewOptions> {
  return {
    component: ScheduleMonthlyView,
    getDateRange: date => {
      const month = date.toPlainDate();
      const firstVisible = plainDateSetStartOfWeek(month.with({day: 1}));
      const end = firstVisible.add({days: weekCount * 7});
      return [
        date.startOfDay().addDays(month.until(firstVisible).days),
        date.startOfDay().addDays(month.until(end).days),
      ];
    },
    getNextDateRange: date => ({
      label: 'Next month',
      range: [date.startOfDay().addDays(32), date.startOfDay().addDays(64)],
    }),
    getPreviousDateRange: date => ({
      label: 'Previous month',
      range: [date.startOfDay().addDays(-32), date.startOfDay()],
    }),
    options: {weekCount},
  };
}
