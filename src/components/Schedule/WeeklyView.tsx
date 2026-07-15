/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */
'use client';

import {TimeGridView} from 'components/Schedule/TimeGridView';
import {useScheduleContext} from 'components/Schedule/context';
import {
  enumerateDates,
  getScheduleRangeFromDates,
} from 'components/Schedule/dateMath';
import {scheduleRangeToScheduleZonedInstantRange} from 'components/Schedule/scheduleZonedInstant';
import {ScheduleFrame, formatWeekTitle} from 'components/Schedule/shared';
import type {
  ScheduleView,
  ScheduleViewComponentProps,
  ScheduleZonedInstant,
} from 'components/Schedule/types';
import type {DayOfWeek} from 'internal/dateTypes';
import {plainDateDayOfWeek, type PlainDate} from 'internal/plainDate';

const WEEK_DAY_OFFSETS = [0, 1, 2, 3, 4, 5, 6];

const EMPTY_HIDDEN_DAYS: ReadonlyArray<DayOfWeek> = [];

export interface ScheduleWeeklyViewOptions {
  /**
   * Maximum number of all-day events shown before the rest collapse into a
   * popover.
   * @default 3
   */
  allDayEventLimit?: number;
  /**
   * Days of the week to omit from the grid, where 0 is Sunday and 6 is
   * Saturday. The view's date range is trimmed to span only the first through
   * last visible day, so `[0, 6]` renders a Monday-Friday week. Duplicate and
   * out-of-range values are ignored, and hiding every day falls back to
   * rendering the full week.
   * @default []
   */
  hiddenDays?: ReadonlyArray<DayOfWeek>;
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
  weekStartsOn?: DayOfWeek;
}

/**
 * Internal view component that renders a weekly time grid.
 */
function ScheduleWeeklyView({
  height,
  options,
}: ScheduleViewComponentProps<ScheduleWeeklyViewOptions>): React.JSX.Element {
  const {range} = useScheduleContext();
  const hiddenDays = normalizeHiddenDays(
    options.hiddenDays ?? EMPTY_HIDDEN_DAYS,
  );
  const weekDays = enumerateDates(range.startDate, range.endDate);
  // The range is already trimmed to visible days at its edges, but an interior
  // hidden day still falls inside it and must be dropped as a column here.
  const visibleDays = weekDays.filter(day => !isDayHidden(day, hiddenDays));
  const days = visibleDays.length > 0 ? visibleDays : weekDays;
  const title = formatWeekTitle(days[0], days[days.length - 1]);
  return (
    <ScheduleFrame height={height} title={title} titleLabel={title}>
      <TimeGridView
        allDayEventLimit={options.allDayEventLimit}
        days={days}
        height={height}
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
  allDayEventLimit = 3,
  hiddenDays = EMPTY_HIDDEN_DAYS,
  hourHeight = 100,
  maxHour = 24,
  minHour = 0,
  weekStartsOn = 0,
}: ScheduleWeeklyViewOptions = {}): ScheduleView<ScheduleWeeklyViewOptions> {
  const hiddenDaySet = normalizeHiddenDays(hiddenDays);
  const getWeekStart = (date: ScheduleZonedInstant) =>
    setStartOfWeek(date.toPlainDate(), weekStartsOn);
  const getWeekRange = (date: ScheduleZonedInstant) => {
    // Trim the range to the first and last visible day so async event loaders
    // never fetch days the grid cannot render. Hiding every day leaves no
    // visible offsets, in which case the full week is rendered.
    const weekStart = getWeekStart(date);
    const visibleOffsets = WEEK_DAY_OFFSETS.filter(
      offset => !isDayHidden(weekStart.add({days: offset}), hiddenDaySet),
    );
    const firstVisibleOffset = visibleOffsets[0] ?? 0;
    const lastVisibleOffset = visibleOffsets[visibleOffsets.length - 1] ?? 6;
    return scheduleRangeToScheduleZonedInstantRange(
      getScheduleRangeFromDates({
        endDate: weekStart.add({days: lastVisibleOffset + 1}),
        startDate: weekStart.add({days: firstVisibleOffset}),
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
    options: {
      allDayEventLimit,
      hiddenDays: [...hiddenDaySet],
      hourHeight,
      maxHour,
      minHour,
      weekStartsOn,
    },
  };
}

function normalizeHiddenDays(
  hiddenDays: ReadonlyArray<DayOfWeek>,
): ReadonlySet<DayOfWeek> {
  return new Set(
    hiddenDays.filter(day => Number.isInteger(day) && day >= 0 && day <= 6),
  );
}

function isDayHidden(
  date: PlainDate,
  hiddenDays: ReadonlySet<DayOfWeek>,
): boolean {
  return hiddenDays.has(plainDateDayOfWeek(date) as DayOfWeek);
}

function setStartOfWeek(date: PlainDate, weekStartsOn: DayOfWeek): PlainDate {
  const daysSinceWeekStart = (plainDateDayOfWeek(date) - weekStartsOn + 7) % 7;
  return date.add({days: -daysSinceWeekStart});
}
