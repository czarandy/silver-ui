/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import {css, cx} from 'styled-system/css';
import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateAddDays,
  plainDateFormat,
  plainDateIsEqual,
  plainDateSetFirstOfMonth,
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
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'silver-neutral.200',
  }),
  cell: css({
    minH: '24',
    p: '2',
    borderInlineEndWidth: '1px',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'silver-neutral.100',
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'silver-neutral.100',
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
    color: 'white',
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
  const firstOfMonth = plainDateSetFirstOfMonth(date);
  const firstVisibleDay = plainDateSetStartOfWeek(firstOfMonth);
  return Array.from({length: weekCount * 7}, (_, index) =>
    plainDateAddDays(firstVisibleDay, index),
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

function ScheduleMonthlyView({
  options,
}: ScheduleViewComponentProps<ScheduleMonthlyViewOptions>): React.JSX.Element {
  const {date, events, focusDate, timezoneID} = useScheduleContext();
  const month = date.toPlainDate();
  const title = formatMonthTitle(month);
  const days = getMonthDays(month, options.weekCount ?? 6);
  const today = focusDate.toPlainDate();

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

export function createScheduleMonthlyView({
  weekCount = 6,
}: ScheduleMonthlyViewOptions = {}): ScheduleView<ScheduleMonthlyViewOptions> {
  return {
    component: ScheduleMonthlyView,
    getDateRange: date => {
      const month = date.toPlainDate();
      const firstVisible = plainDateSetStartOfWeek(
        plainDateSetFirstOfMonth(month),
      );
      const end = plainDateAddDays(firstVisible, weekCount * 7);
      return [
        date
          .startOfDay()
          .addDays(
            Math.round(
              (Date.UTC(
                firstVisible.year,
                firstVisible.month - 1,
                firstVisible.day,
              ) -
                Date.UTC(month.year, month.month - 1, month.day)) /
                86_400_000,
            ),
          ),
        date
          .startOfDay()
          .addDays(
            Math.round(
              (Date.UTC(end.year, end.month - 1, end.day) -
                Date.UTC(month.year, month.month - 1, month.day)) /
                86_400_000,
            ),
          ),
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
