/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import {TimeGridView} from './TimeGridView';
import {useScheduleContext} from './context';
import {getScheduleRangeFromDates} from './dateMath';
import {ScheduleFrame, formatDate, formatMonthTitle} from './shared';
import type {
  ScheduleView,
  ScheduleViewComponentProps,
  ZonedDateTime,
} from './types';
import {scheduleRangeToZonedDateTimeRange} from './zonedDateTime';

export interface ScheduleDayViewOptions {
  /**
   * Pixel height used for each hourly row.
   * @default 100
   */
  hourHeight?: number;
  /**
   * Exclusive ending hour shown in the day grid (1-24).
   * @default 24
   */
  maxHour?: number;
  /**
   * First hour shown in the day grid (0-23).
   * @default 0
   */
  minHour?: number;
}

/**
 * Internal view component that renders a single-day time grid.
 */
function ScheduleDayView({
  options,
}: ScheduleViewComponentProps<ScheduleDayViewOptions>): React.JSX.Element {
  const {viewDate} = useScheduleContext();
  const day = viewDate.toPlainDate();
  return (
    <ScheduleFrame title={formatMonthTitle(day)} titleLabel={formatDate(day)}>
      <TimeGridView
        days={[day]}
        hourHeight={options.hourHeight}
        maxHour={options.maxHour}
        minHour={options.minHour}
      />
    </ScheduleFrame>
  );
}

/**
 * Creates a single-day schedule view configuration.
 */
export function createScheduleDayView({
  hourHeight = 100,
  maxHour = 24,
  minHour = 0,
}: ScheduleDayViewOptions = {}): ScheduleView<ScheduleDayViewOptions> {
  return {
    component: ScheduleDayView,
    getDateRange: (date: ZonedDateTime) =>
      scheduleRangeToZonedDateTimeRange(
        getScheduleRangeFromDates({
          endDate: date.toPlainDate().add({days: 1}),
          startDate: date.toPlainDate(),
          timezoneID: date.timezoneID,
        }),
        date.timezoneID,
      ),
    getNextDateRange: (date: ZonedDateTime) => ({
      label: 'Next day',
      range: [date.startOfDay().addDays(1), date.startOfDay().addDays(2)],
    }),
    getPreviousDateRange: (date: ZonedDateTime) => ({
      label: 'Previous day',
      range: [date.startOfDay().addDays(-1), date.startOfDay()],
    }),
    options: {hourHeight, maxHour, minHour},
  };
}
