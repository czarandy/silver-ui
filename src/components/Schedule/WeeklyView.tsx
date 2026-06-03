/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import {plainDateDayOfWeek, type PlainDate} from '../../internal/plainDate';
import {TimeGridView} from './TimeGridView';
import {useScheduleContext} from './context';
import {enumerateDates, getScheduleRangeFromDates} from './dateMath';
import {ScheduleFrame, formatWeekTitle} from './shared';
import type {
  ScheduleView,
  ScheduleViewComponentProps,
  ZonedDateTime,
} from './types';
import {scheduleRangeToZonedDateTimeRange} from './zonedDateTime';

export interface ScheduleWeeklyViewOptions {
  /**
   * Pixel height used for each hourly row.
   * @default 100
   */
  hourHeight?: number;
  /**
   * Exclusive ending hour shown in the weekly grid (1-24).
   * @default 24
   */
  maxHour?: number;
  /**
   * First hour shown in the weekly grid (0-23).
   * @default 0
   */
  minHour?: number;
  /**
   * Day used as the first day of the week, where 0 is Sunday and 6 is Saturday.
   * @default 0
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Internal view component that renders a 7-day time grid.
 */
function ScheduleWeeklyView({
  options,
}: ScheduleViewComponentProps<ScheduleWeeklyViewOptions>): React.JSX.Element {
  const {range} = useScheduleContext();
  const days = enumerateDates(range.startDate, range.endDate);
  const title = formatWeekTitle(days[0], days[days.length - 1]);
  return (
    <ScheduleFrame title={title} titleLabel={title}>
      <TimeGridView
        days={days}
        hourHeight={options.hourHeight}
        maxHour={options.maxHour}
        minHour={options.minHour}
      />
    </ScheduleFrame>
  );
}

/**
 * Creates a weekly schedule view configuration.
 */
export function createScheduleWeeklyView({
  hourHeight = 100,
  maxHour = 24,
  minHour = 0,
  weekStartsOn = 0,
}: ScheduleWeeklyViewOptions = {}): ScheduleView<ScheduleWeeklyViewOptions> {
  const getWeekStart = (date: ZonedDateTime) =>
    setStartOfWeek(date.toPlainDate(), weekStartsOn);
  const getWeekRange = (date: ZonedDateTime) => {
    const startDate = getWeekStart(date);
    return scheduleRangeToZonedDateTimeRange(
      getScheduleRangeFromDates({
        endDate: startDate.add({days: 7}),
        startDate,
        timezoneID: date.timezoneID,
      }),
      date.timezoneID,
    );
  };

  return {
    component: ScheduleWeeklyView,
    getDateRange: getWeekRange,
    getNextDateRange: date => ({
      label: 'Next week',
      range: getWeekRange(date.addDays(7)),
    }),
    getPreviousDateRange: date => ({
      label: 'Previous week',
      range: getWeekRange(date.addDays(-7)),
    }),
    options: {hourHeight, maxHour, minHour, weekStartsOn},
  };
}

function setStartOfWeek(
  date: PlainDate,
  weekStartsOn: NonNullable<ScheduleWeeklyViewOptions['weekStartsOn']>,
): PlainDate {
  const daysSinceWeekStart = (plainDateDayOfWeek(date) - weekStartsOn + 7) % 7;
  return date.add({days: -daysSinceWeekStart});
}
