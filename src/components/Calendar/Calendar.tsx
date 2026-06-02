import {ChevronLeft, ChevronRight} from 'lucide-react';
import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import {css, cx} from 'styled-system/css';
import type {DateRange, DayOfWeek} from '../../internal/dateTypes';
import {
  DATE_FORMAT_MONTH_YEAR,
  DATE_FORMAT_WITH_WEEKDAY,
  getDaysInMonth,
  plainDateCreate,
  plainDateDayOfWeek,
  plainDateFormat,
  plainDateGetWeekNumber,
  plainDateIsAfter,
  plainDateIsBefore,
  plainDateIsEqual,
  plainDateIsInRange,
  plainDateToday,
  type PlainDate,
} from '../../internal/plainDate';
import {getBrowserTimezoneID} from '../../internal/time';
import {useGridFocus} from '../../internal/useGridFocus';
import {Button} from '../Button';

export type {DateRange, DayOfWeek} from '../../internal/dateTypes';

export interface CalendarHandle {
  navigateTo: (date: PlainDate) => void;
}

interface CalendarBaseProps {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Returns true for dates that should be disabled.
   */
  getIsDateDisabled?: (date: PlainDate) => boolean;
  /**
   * Whether to show outside-month days.
   * @default true
   */
  hasOutsideDays?: boolean;
  /**
   * Whether month grids use only needed rows rather than a fixed six rows.
   * @default false
   */
  hasVariableRowCount?: boolean;
  /**
   * Whether to show ISO week numbers.
   * @default false
   */
  hasWeekNumbers?: boolean;
  /**
   * Maximum selectable date.
   */
  max?: PlainDate;
  /**
   * Minimum selectable date.
   */
  min?: PlainDate;
  /**
   * Number of months displayed.
   * @default 1
   */
  numberOfMonths?: 1 | 2;
  /**
   * Called when the visible month changes.
   */
  onViewDateChange?: (viewDate: PlainDate) => void;
  /**
   * Ref exposing imperative calendar navigation.
   */
  ref?: Ref<CalendarHandle>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Timezone used to determine today's date.
   * @default browser timezone
   */
  timezoneID?: string;
  /**
   * Controlled visible month.
   */
  viewDate?: PlainDate;
  /**
   * First day of week, where 0 is Sunday.
   * @default 0
   */
  weekStartsOn?: DayOfWeek;
}

interface CalendarSingleProps extends CalendarBaseProps {
  /**
   * Default selected date for uncontrolled usage.
   */
  defaultValue?: PlainDate;
  /**
   * Selection mode. Defaults to 'single'.
   */
  mode?: 'single';
  /**
   * Called when the selected date changes.
   */
  onChange: (value: PlainDate) => void;
  /**
   * Controlled selected date.
   */
  value?: PlainDate;
}

interface CalendarRangeProps extends CalendarBaseProps {
  /**
   * Default selected range for uncontrolled usage.
   */
  defaultValue?: DateRange;
  /**
   * Selection mode set to 'range'.
   */
  mode: 'range';
  /**
   * Called when the selected date range changes.
   */
  onChange: (value: DateRange) => void;
  /**
   * Controlled selected date range.
   */
  value?: DateRange;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

interface CalendarDay {
  date: PlainDate;
  dayNumber: number;
  isOutside: boolean;
}

const styles = {
  root: css({
    display: 'inline-block',
    minW: '220px',
    color: 'fg',
    fontFamily: 'body',
  }),
  header: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2',
    mb: '2',
  }),
  monthYear: css({
    flex: 1,
    textAlign: 'center',
    fontSize: 'sm',
    fontWeight: 'semibold',
  }),
  months: css({
    display: 'flex',
    gap: '4',
  }),
  monthGrid: css({
    flex: '1 1 0',
  }),
  weekHeader: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    mb: '1',
  }),
  weekHeaderWithNumbers: css({
    gridTemplateColumns: 'auto repeat(7, 1fr)',
  }),
  dayName: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: 'component.md',
    h: 'component.md',
    color: 'fg.muted',
    fontSize: 'sm',
  }),
  daysGrid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
  }),
  daysGridWithNumbers: css({
    gridTemplateColumns: 'auto repeat(7, 1fr)',
  }),
  weekRow: css({
    display: 'contents',
  }),
  weekNumber: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: 'component.md',
    h: 'component.md',
    color: 'fg.muted',
    fontSize: 'sm',
  }),
  cell: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    h: 'component.md',
    isolation: 'isolate',
  }),
  rangeBackground: css({
    position: 'absolute',
    insetBlock: '2px',
    insetInline: 0,
    bg: 'bg.selected',
  }),
  previewBackground: css({
    position: 'absolute',
    insetBlock: '2px',
    insetInline: 0,
    bg: 'bg.subtle',
  }),
  rangeLeft: css({
    left: '2px',
    borderTopLeftRadius: 'full',
    borderBottomLeftRadius: 'full',
  }),
  rangeRight: css({
    right: '2px',
    borderTopRightRadius: 'full',
    borderBottomRightRadius: 'full',
  }),
  day: css({
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: 'component.sm',
    h: 'component.sm',
    p: 0,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: 'full',
    bg: 'transparent',
    color: 'fg',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'md',
    transitionProperty: 'background-color, color',
    transitionDuration: 'fast',
    _hover: {
      bg: 'bg.subtle',
    },
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
    _disabled: {
      cursor: 'not-allowed',
    },
  }),
  dayOutside: css({
    color: 'fg.muted',
    opacity: 0.55,
  }),
  dayToday: css({
    boxShadow: 'inset 0 0 0 1px token(colors.border.emphasized)',
  }),
  daySelected: css({
    bg: 'primary',
    color: 'fg.onPrimary',
    _hover: {
      bg: 'primary',
    },
  }),
  dayDisabled: css({
    opacity: 0.35,
  }),
} as const;

function generateCalendarDays({
  year,
  month,
  weekStartsOn,
  hasVariableRowCount,
}: {
  hasVariableRowCount: boolean;
  month: number;
  weekStartsOn: DayOfWeek;
  year: number;
}): {dayNames: string[]; weeks: CalendarDay[][]} {
  const names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dayNames = Array.from({length: 7}, (_, index) => {
    return names[(index + weekStartsOn) % 7];
  });
  const daysInMonth = getDaysInMonth(year, month);
  const firstOfMonth = plainDateCreate(year, month, 1);
  let startOffset = plainDateDayOfWeek(firstOfMonth) - weekStartsOn;
  if (startOffset < 0) {
    startOffset += 7;
  }

  const totalDays = daysInMonth + startOffset;
  const totalRows = hasVariableRowCount ? Math.ceil(totalDays / 7) : 6;
  const days = Array.from({length: totalRows * 7}, (_, index) => {
    const dayOffset = index - startOffset + 1;
    const isOutside = dayOffset < 1 || dayOffset > daysInMonth;
    const date = isOutside
      ? firstOfMonth.add({days: dayOffset - 1})
      : plainDateCreate(year, month, dayOffset);

    return {
      date,
      dayNumber: date.day,
      isOutside,
    };
  });

  const weeks: CalendarDay[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return {dayNames, weeks};
}

function checkDateDisabled(
  date: PlainDate,
  options: {
    getIsDateDisabled?: (date: PlainDate) => boolean;
    max?: PlainDate;
    min?: PlainDate;
  },
): boolean {
  if (options.min != null && plainDateIsBefore(date, options.min)) {
    return true;
  }

  if (options.max != null && plainDateIsAfter(date, options.max)) {
    return true;
  }

  return options.getIsDateDisabled?.(date) ?? false;
}

function plainDateFromDataAttribute(value: string): PlainDate {
  return plainDateCreate(
    parseInt(value.slice(0, 4)),
    parseInt(value.slice(5, 7)),
    parseInt(value.slice(8, 10)),
  );
}

function getSelectedTabDate({
  days,
  getIsDisabled,
  month,
  selectedDate,
  today,
  year,
}: {
  days: CalendarDay[];
  getIsDisabled: (date: PlainDate) => boolean;
  month: number;
  selectedDate: PlainDate | null;
  today: PlainDate;
  year: number;
}): PlainDate | null {
  if (
    selectedDate?.year === year &&
    selectedDate.month === month &&
    !getIsDisabled(selectedDate)
  ) {
    return selectedDate;
  }

  if (today.year === year && today.month === month && !getIsDisabled(today)) {
    return today;
  }

  return (
    days.find(day => !day.isOutside && !getIsDisabled(day.date))?.date ?? null
  );
}

/**
 * A date picker calendar supporting single date and date range selection.
 */
export function Calendar({
  className,
  'data-testid': dataTestId,
  defaultValue,
  getIsDateDisabled: getIsDateDisabledProp,
  hasOutsideDays = true,
  hasVariableRowCount = false,
  hasWeekNumbers = false,
  max,
  min,
  mode = 'single',
  numberOfMonths = 1,
  onChange,
  onViewDateChange,
  ref,
  style,
  timezoneID,
  value,
  viewDate: viewDateFromProps,
  weekStartsOn = 0,
}: CalendarProps): React.JSX.Element {
  const effectiveTimezoneID = timezoneID ?? getBrowserTimezoneID();
  const today = useMemo(
    () => plainDateToday(effectiveTimezoneID),
    [effectiveTimezoneID],
  );
  const [internalValue, setInternalValue] = useState<
    DateRange | PlainDate | undefined
  >(defaultValue);
  const [rangeSelectionStart, setRangeSelectionStart] =
    useState<PlainDate | null>(null);
  const [hoveredDate, setHoveredDate] = useState<PlainDate | null>(null);
  const [pendingFocus, setPendingFocus] = useState<PlainDate | null>(null);
  const effectiveValue = value ?? internalValue;
  const isViewDateControlled =
    viewDateFromProps != null && onViewDateChange != null;
  const [internalViewDate, setInternalViewDate] = useState(() => {
    if (viewDateFromProps != null) {
      return viewDateFromProps;
    }

    if (effectiveValue != null && 'year' in effectiveValue) {
      return effectiveValue;
    }

    if (effectiveValue != null && 'start' in effectiveValue) {
      return effectiveValue.start;
    }

    return today;
  });
  const viewDate = isViewDateControlled ? viewDateFromProps : internalViewDate;
  const baseMonth = useMemo(() => viewDate.with({day: 1}), [viewDate]);
  const visibleMonths = useMemo(
    () =>
      Array.from({length: numberOfMonths}, (_, index) =>
        baseMonth.add({months: index}),
      ),
    [baseMonth, numberOfMonths],
  );
  const monthYearLabel = useMemo(
    () =>
      visibleMonths
        .map(month => plainDateFormat(month, DATE_FORMAT_MONTH_YEAR))
        .join(' - '),
    [visibleMonths],
  );

  const canNavigatePrevious =
    min == null || plainDateIsBefore(min.with({day: 1}), baseMonth);
  const lastVisibleMonth = visibleMonths.at(-1) ?? baseMonth;
  const canNavigateNext =
    max == null || plainDateIsAfter(max.with({day: 1}), lastVisibleMonth);

  const navigateMonth = useCallback(
    (delta: number, focusedDate?: PlainDate, offset = 7) => {
      const nextMonth = baseMonth.add({months: delta});

      if (focusedDate != null) {
        setPendingFocus(focusedDate.add({days: delta * offset}));
      }

      onViewDateChange?.(nextMonth);
      if (!isViewDateControlled) {
        setInternalViewDate(nextMonth);
      }
    },
    [baseMonth, isViewDateControlled, onViewDateChange],
  );

  useImperativeHandle(
    ref,
    () => ({
      navigateTo: date => {
        onViewDateChange?.(date);
        if (!isViewDateControlled) {
          setInternalViewDate(date);
        }
      },
    }),
    [isViewDateControlled, onViewDateChange],
  );

  const handleDayClick = useCallback(
    (date: PlainDate) => {
      if (mode === 'single') {
        setInternalValue(date);
        (onChange as CalendarSingleProps['onChange'])(date);
        return;
      }

      if (rangeSelectionStart == null) {
        setRangeSelectionStart(date);
        return;
      }

      const range = plainDateIsBefore(date, rangeSelectionStart)
        ? {start: date, end: rangeSelectionStart}
        : {start: rangeSelectionStart, end: date};
      setInternalValue(range);
      setRangeSelectionStart(null);
      (onChange as CalendarRangeProps['onChange'])(range);
    },
    [mode, onChange, rangeSelectionStart],
  );

  const handleNavigateNext = useCallback(
    (focusedDate: PlainDate, offset: number) =>
      navigateMonth(1, focusedDate, offset),
    [navigateMonth],
  );

  const handleNavigatePrevious = useCallback(
    (focusedDate: PlainDate, offset: number) =>
      navigateMonth(-1, focusedDate, offset),
    [navigateMonth],
  );

  const handlePendingFocusHandled = useCallback(
    () => setPendingFocus(null),
    [],
  );

  return (
    // eslint-disable-next-line jsx-a11y-x/no-static-element-interactions
    <div
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      onKeyDown={event => {
        if (
          mode === 'range' &&
          rangeSelectionStart != null &&
          event.key === 'Escape'
        ) {
          setRangeSelectionStart(null);
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      style={style}>
      <div className={styles.header}>
        <Button
          icon={ChevronLeft}
          isDisabled={!canNavigatePrevious}
          isIconOnly
          label="Previous month"
          onClick={() => navigateMonth(-1)}
          size="sm"
          variant="ghost"
        />
        <span className={styles.monthYear}>{monthYearLabel}</span>
        <Button
          icon={ChevronRight}
          isDisabled={!canNavigateNext}
          isIconOnly
          label="Next month"
          onClick={() => navigateMonth(1)}
          size="sm"
          variant="ghost"
        />
      </div>
      <div className={styles.months}>
        {visibleMonths.map(month => (
          <MonthGrid
            getIsDateDisabled={getIsDateDisabledProp}
            hasOutsideDays={hasOutsideDays}
            hasVariableRowCount={hasVariableRowCount}
            hasWeekNumbers={hasWeekNumbers}
            hoveredDate={hoveredDate}
            key={month.toString()}
            max={max}
            min={min}
            mode={mode}
            month={month}
            onDayClick={handleDayClick}
            onDayHover={setHoveredDate}
            onNavigateNext={handleNavigateNext}
            onNavigatePrevious={handleNavigatePrevious}
            onPendingFocusHandled={handlePendingFocusHandled}
            pendingFocus={pendingFocus}
            rangeSelectionStart={rangeSelectionStart}
            today={today}
            value={effectiveValue}
            weekStartsOn={weekStartsOn}
          />
        ))}
      </div>
    </div>
  );
}

interface MonthGridProps {
  getIsDateDisabled?: (date: PlainDate) => boolean;
  hasOutsideDays: boolean;
  hasVariableRowCount: boolean;
  hasWeekNumbers: boolean;
  hoveredDate: PlainDate | null;
  max?: PlainDate;
  min?: PlainDate;
  mode: 'single' | 'range';
  month: PlainDate;
  onDayClick: (date: PlainDate) => void;
  onDayHover: (date: PlainDate | null) => void;
  onNavigateNext: (focusedDate: PlainDate, offset: number) => void;
  onNavigatePrevious: (focusedDate: PlainDate, offset: number) => void;
  onPendingFocusHandled: () => void;
  pendingFocus: PlainDate | null;
  rangeSelectionStart: PlainDate | null;
  today: PlainDate;
  value: DateRange | PlainDate | undefined;
  weekStartsOn: DayOfWeek;
}

const MonthGrid = memo(function MonthGrid({
  month,
  value,
  mode,
  rangeSelectionStart,
  hoveredDate,
  min,
  max,
  getIsDateDisabled: getIsDateDisabledProp,
  hasOutsideDays,
  hasWeekNumbers,
  hasVariableRowCount,
  weekStartsOn,
  onDayClick,
  onDayHover,
  today,
  onNavigatePrevious,
  onNavigateNext,
  pendingFocus,
  onPendingFocusHandled,
}: MonthGridProps): React.JSX.Element {
  const {dayNames, weeks} = useMemo(
    () =>
      generateCalendarDays({
        year: month.year,
        month: month.month,
        weekStartsOn,
        hasVariableRowCount,
      }),
    [hasVariableRowCount, month.month, month.year, weekStartsOn],
  );
  const days = weeks.flat();
  const isDisabled = useCallback(
    (date: PlainDate) =>
      checkDateDisabled(date, {
        min,
        max,
        getIsDateDisabled: getIsDateDisabledProp,
      }),
    [getIsDateDisabledProp, max, min],
  );
  const selectedDate =
    mode === 'single' && value != null && 'year' in value ? value : null;
  const tabbableDate = getSelectedTabDate({
    days,
    getIsDisabled: isDisabled,
    month: month.month,
    selectedDate,
    today,
    year: month.year,
  });

  const getFocusedDate = useCallback((): PlainDate | null => {
    const activeElement = document.activeElement as HTMLElement | null;
    const date = activeElement?.dataset.date;
    return date == null ? null : plainDateFromDataAttribute(date);
  }, []);

  const {gridRef, handleKeyDown} = useGridFocus<HTMLDivElement>({
    columns: 7,
    cellSelector: 'button:not([disabled])',
    onNavigateBefore: (_column, offset) => {
      const focusedDate = getFocusedDate();
      if (focusedDate != null) {
        onNavigatePrevious(focusedDate, offset);
      }
    },
    onNavigateAfter: (_column, offset) => {
      const focusedDate = getFocusedDate();
      if (focusedDate != null) {
        onNavigateNext(focusedDate, offset);
      }
    },
    onPageUp: () => {
      const focusedDate = getFocusedDate();
      if (focusedDate != null) {
        onNavigatePrevious(focusedDate, 7);
      }
    },
    onPageDown: () => {
      const focusedDate = getFocusedDate();
      if (focusedDate != null) {
        onNavigateNext(focusedDate, 7);
      }
    },
  });

  useEffect(() => {
    if (pendingFocus == null || gridRef.current == null) {
      return;
    }

    const button = gridRef.current.querySelector<HTMLButtonElement>(
      `button[data-date="${pendingFocus.toString()}"]`,
    );
    button?.focus();
    onPendingFocusHandled();
  }, [gridRef, onPendingFocusHandled, pendingFocus]);

  let rangeStart: PlainDate | null = null;
  let rangeEnd: PlainDate | null = null;
  if (mode === 'range' && value != null && 'start' in value) {
    rangeStart = value.start;
    rangeEnd = value.end;
  }
  if (rangeSelectionStart != null) {
    rangeStart = rangeSelectionStart;
    rangeEnd = rangeSelectionStart;
  }

  let previewStart: PlainDate | null = null;
  let previewEnd: PlainDate | null = null;
  if (mode === 'range' && rangeSelectionStart != null && hoveredDate != null) {
    if (!plainDateIsEqual(rangeSelectionStart, hoveredDate)) {
      previewStart = plainDateIsBefore(hoveredDate, rangeSelectionStart)
        ? hoveredDate
        : rangeSelectionStart;
      previewEnd = plainDateIsBefore(hoveredDate, rangeSelectionStart)
        ? rangeSelectionStart
        : hoveredDate;
    }
  }

  return (
    <div className={styles.monthGrid}>
      <div
        className={cx(
          styles.weekHeader,
          hasWeekNumbers ? styles.weekHeaderWithNumbers : undefined,
        )}>
        {hasWeekNumbers ? <div className={styles.dayName} /> : null}
        {dayNames.map(dayName => (
          <div className={styles.dayName} key={dayName} role="columnheader">
            {dayName}
          </div>
        ))}
      </div>
      <div
        aria-label={plainDateFormat(month, DATE_FORMAT_MONTH_YEAR)}
        className={cx(
          styles.daysGrid,
          hasWeekNumbers ? styles.daysGridWithNumbers : undefined,
        )}
        onKeyDown={handleKeyDown}
        ref={gridRef}
        role="grid"
        tabIndex={-1}>
        {weeks.map(week => {
          const weekDate =
            week.find(day => !day.isOutside)?.date ?? week[0].date;
          return (
            <div
              className={styles.weekRow}
              key={week[0].date.toString()}
              role="row">
              {hasWeekNumbers ? (
                <div className={styles.weekNumber}>
                  {plainDateGetWeekNumber(weekDate)}
                </div>
              ) : null}
              {week.map((day, dayIndex) => (
                <DayCell
                  day={day}
                  dayIndex={dayIndex}
                  hasOutsideDays={hasOutsideDays}
                  isDisabled={isDisabled(day.date)}
                  isTabbable={
                    tabbableDate != null &&
                    plainDateIsEqual(tabbableDate, day.date)
                  }
                  key={day.date.toString()}
                  mode={mode}
                  onDayClick={onDayClick}
                  onDayHover={onDayHover}
                  previewEnd={previewEnd}
                  previewStart={previewStart}
                  rangeEnd={rangeEnd}
                  rangeStart={rangeStart}
                  selectedDate={selectedDate}
                  today={today}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});

interface DayCellProps {
  day: CalendarDay;
  dayIndex: number;
  hasOutsideDays: boolean;
  isDisabled: boolean;
  isTabbable: boolean;
  mode: 'single' | 'range';
  onDayClick: (date: PlainDate) => void;
  onDayHover: (date: PlainDate | null) => void;
  previewEnd: PlainDate | null;
  previewStart: PlainDate | null;
  rangeEnd: PlainDate | null;
  rangeStart: PlainDate | null;
  selectedDate: PlainDate | null;
  today: PlainDate;
}

const DayCell = memo(function DayCell({
  day,
  dayIndex,
  mode,
  selectedDate,
  rangeStart,
  rangeEnd,
  previewStart,
  previewEnd,
  today,
  hasOutsideDays,
  isDisabled,
  isTabbable,
  onDayClick,
  onDayHover,
}: DayCellProps): React.JSX.Element {
  if (day.isOutside && !hasOutsideDays) {
    return <div className={styles.cell} />;
  }

  const effectivelyDisabled = isDisabled || day.isOutside;
  const isToday = plainDateIsEqual(day.date, today);
  const isSelected =
    mode === 'single' &&
    selectedDate != null &&
    plainDateIsEqual(day.date, selectedDate);
  const isInRange =
    mode === 'range' &&
    rangeStart != null &&
    rangeEnd != null &&
    plainDateIsInRange(day.date, [rangeStart, rangeEnd]);
  const isRangeStart =
    mode === 'range' &&
    rangeStart != null &&
    plainDateIsEqual(day.date, rangeStart);
  const isRangeEnd =
    mode === 'range' &&
    rangeEnd != null &&
    plainDateIsEqual(day.date, rangeEnd);
  const isInPreview =
    previewStart != null &&
    previewEnd != null &&
    plainDateIsInRange(day.date, [previewStart, previewEnd]);
  const isPreviewStart =
    previewStart != null && plainDateIsEqual(day.date, previewStart);
  const isPreviewEnd =
    previewEnd != null && plainDateIsEqual(day.date, previewEnd);
  const isFirstColumn = dayIndex === 0;
  const isLastColumn = dayIndex === 6;

  return (
    <div className={styles.cell}>
      {isInRange ? (
        <div
          className={cx(
            styles.rangeBackground,
            isRangeStart || isFirstColumn ? styles.rangeLeft : undefined,
            isRangeEnd || isLastColumn ? styles.rangeRight : undefined,
          )}
        />
      ) : null}
      {isInPreview ? (
        <div
          className={cx(
            styles.previewBackground,
            isPreviewStart || isFirstColumn ? styles.rangeLeft : undefined,
            isPreviewEnd || isLastColumn ? styles.rangeRight : undefined,
          )}
        />
      ) : null}
      <button
        aria-disabled={effectivelyDisabled || undefined}
        aria-label={plainDateFormat(day.date, DATE_FORMAT_WITH_WEEKDAY)}
        aria-selected={isSelected || isInRange || undefined}
        className={cx(
          styles.day,
          day.isOutside ? styles.dayOutside : undefined,
          isToday && !isSelected && !isInRange ? styles.dayToday : undefined,
          isSelected || isRangeStart || isRangeEnd
            ? styles.daySelected
            : undefined,
          effectivelyDisabled ? styles.dayDisabled : undefined,
        )}
        data-date={day.date.toString()}
        disabled={isDisabled}
        onClick={() => {
          if (!effectivelyDisabled) {
            onDayClick(day.date);
          }
        }}
        onMouseEnter={() => {
          if (!effectivelyDisabled) {
            onDayHover(day.date);
          }
        }}
        onMouseLeave={() => onDayHover(null)}
        role="gridcell"
        tabIndex={isTabbable ? 0 : -1}
        type="button">
        {day.dayNumber}
      </button>
    </div>
  );
});

Calendar.displayName = 'Calendar';
