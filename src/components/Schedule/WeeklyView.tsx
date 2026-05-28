/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import {
  plainDateAddDays,
  plainDateSetStartOfWeek,
} from '../../internal/plainDate';
import {TimeGridView} from './TimeGridView';
import {useScheduleContext} from './context';
import {enumerateDates, getScheduleRangeFromDates} from './dateMath';
import {ScheduleFrame, formatMonthTitle} from './shared';
import type {
  ScheduleView,
  ScheduleViewComponentProps,
  ZonedDateTime,
} from './types';
import {scheduleRangeToZonedDateTimeRange} from './zonedDateTime';

export interface ScheduleWeeklyViewOptions {
  maxHour?: number;
  minHour?: number;
}

function ScheduleWeeklyView({
  options,
}: ScheduleViewComponentProps<ScheduleWeeklyViewOptions>): React.JSX.Element {
  const {range} = useScheduleContext();
  const days = enumerateDates(range.startDate, range.endDate);
  return (
    <ScheduleFrame
      title={formatMonthTitle(range.startDate)}
      titleLabel={formatMonthTitle(range.startDate)}>
      <TimeGridView
        days={days}
        maxHour={options.maxHour}
        minHour={options.minHour}
      />
    </ScheduleFrame>
  );
}

export function createScheduleWeeklyView({
  maxHour = 23,
  minHour = 0,
}: ScheduleWeeklyViewOptions = {}): ScheduleView<ScheduleWeeklyViewOptions> {
  const getWeekStart = (date: ZonedDateTime) =>
    plainDateSetStartOfWeek(date.toPlainDate());

  return {
    component: ScheduleWeeklyView,
    getDateRange: date =>
      scheduleRangeToZonedDateTimeRange(
        getScheduleRangeFromDates({
          endDate: plainDateAddDays(getWeekStart(date), 7),
          startDate: getWeekStart(date),
          timezoneID: date.timezoneID,
        }),
        date.timezoneID,
      ),
    getNextDateRange: date => ({
      label: 'Next week',
      range: [date.startOfDay().addDays(7), date.startOfDay().addDays(14)],
    }),
    getPreviousDateRange: date => ({
      label: 'Previous week',
      range: [date.startOfDay().addDays(-7), date.startOfDay()],
    }),
    options: {maxHour, minHour},
  };
}
