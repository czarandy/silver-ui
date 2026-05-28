/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import {plainDateAddDays} from '../../internal/plainDate';
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
  maxHour?: number;
  minHour?: number;
}

function ScheduleDayView({
  options,
}: ScheduleViewComponentProps<ScheduleDayViewOptions>): React.JSX.Element {
  const {date} = useScheduleContext();
  const day = date.toPlainDate();
  return (
    <ScheduleFrame title={formatMonthTitle(day)} titleLabel={formatDate(day)}>
      <TimeGridView
        days={[day]}
        maxHour={options.maxHour}
        minHour={options.minHour}
      />
    </ScheduleFrame>
  );
}

export function createScheduleDayView({
  maxHour = 23,
  minHour = 0,
}: ScheduleDayViewOptions = {}): ScheduleView<ScheduleDayViewOptions> {
  return {
    component: ScheduleDayView,
    getDateRange: (date: ZonedDateTime) =>
      scheduleRangeToZonedDateTimeRange(
        getScheduleRangeFromDates({
          endDate: plainDateAddDays(date.toPlainDate(), 1),
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
    options: {maxHour, minHour},
  };
}
