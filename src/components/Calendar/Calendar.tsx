import {ChevronLeft, ChevronRight} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import {css, cx} from 'styled-system/css';
import type {
  DateRange,
  DayOfWeek,
  ISODateString,
} from '../../internal/dateTypes';
import {
  DATE_FORMAT_MONTH_YEAR,
  DATE_FORMAT_WITH_WEEKDAY,
  getDaysInMonth,
  plainDateAddDays,
  plainDateAddMonths,
  plainDateDayOfWeek,
  plainDateFormat,
  plainDateFromISO,
  plainDateGetWeekNumber,
  plainDateIsAfter,
  plainDateIsBefore,
  plainDateIsEqual,
  plainDateIsInRange,
  plainDateSetFirstOfMonth,
  plainDateToDate,
  plainDateToISO,
  plainDateToday,
  type PlainDate,
} from '../../internal/plainDate';
import {useGridFocus} from '../../internal/useGridFocus';
import {Button} from '../Button';

export type {
  DateRange,
  DayOfWeek,
  ISODateString,
} from '../../internal/dateTypes';

export interface CalendarHandle {
  navigateTo: (date: ISODateString) => void;
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
   * Custom date constraints. A date is disabled when any function returns false.
   */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;
  /**
   * Controlled visible month.
   */
  focusDate?: ISODateString;
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
  max?: ISODateString;
  /**
   * Minimum selectable date.
   */
  min?: ISODateString;
  /**
   * Number of months displayed.
   * @default 1
   */
  numberOfMonths?: 1 | 2;
  /**
   * Called when the visible month changes.
   */
  onFocusDateChange?: (focusDate: ISODateString) => void;
  /**
   * Ref exposing imperative calendar navigation.
   */
  ref?: Ref<CalendarHandle>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
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
  defaultValue?: ISODateString;
  /**
   * Selection mode. Defaults to 'single'.
   */
  mode?: 'single';
  /**
   * Called when the selected date changes.
   */
  onChange?: (value: ISODateString, valueAsDate: Date) => void;
  /**
   * Controlled selected date.
   */
  value?: ISODateString;
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
  onChange?: (value: DateRange) => void;
  /**
   * Controlled selected date range.
   */
  value?: DateRange;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

interface CalendarDay {
  date: PlainDate;
  dayNumber: number;
  iso: ISODateString;
  isOutside: boolean;
}

const styles = {
  root: css({
    display: 'inline-block',
    minW: '220px',
    p: '3',
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
    bg: 'primary.subtle',
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
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
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
    boxShadow: 'inset 0 0 0 1px token(colors.silver-neutral.400)',
  }),
  daySelected: css({
    bg: 'primary',
    color: 'white',
    _hover: {
      bg: 'primary.hover',
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
  const firstOfMonth = plainDateFromISO(
    `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01` as ISODateString,
  );
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
      ? plainDateAddDays(firstOfMonth, dayOffset - 1)
      : plainDateFromISO(
          `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(dayOffset).padStart(2, '0')}` as ISODateString,
        );

    return {
      date,
      dayNumber: date.day,
      isOutside,
      iso: plainDateToISO(date),
    };
  });

  const weeks: CalendarDay[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return {dayNames, weeks};
}

function isDateDisabled(
  date: PlainDate,
  options: {
    dateConstraints?: ReadonlyArray<(date: Date) => boolean>;
    max?: ISODateString;
    min?: ISODateString;
  },
): boolean {
  if (
    options.min != null &&
    plainDateIsBefore(date, plainDateFromISO(options.min))
  ) {
    return true;
  }

  if (
    options.max != null &&
    plainDateIsAfter(date, plainDateFromISO(options.max))
  ) {
    return true;
  }

  return (
    options.dateConstraints?.some(
      constraint => !constraint(plainDateToDate(date)),
    ) ?? false
  );
}

function getSelectedTabDate({
  days,
  month,
  selectedDate,
  today,
  year,
  isDisabled,
}: {
  days: CalendarDay[];
  isDisabled: (date: PlainDate) => boolean;
  month: number;
  selectedDate: PlainDate | null;
  today: PlainDate;
  year: number;
}): ISODateString | null {
  if (
    selectedDate?.year === year &&
    selectedDate.month === month &&
    !isDisabled(selectedDate)
  ) {
    return plainDateToISO(selectedDate);
  }

  if (today.year === year && today.month === month && !isDisabled(today)) {
    return plainDateToISO(today);
  }

  return days.find(day => !day.isOutside && !isDisabled(day.date))?.iso ?? null;
}

/**
 * A date picker calendar supporting single date and date range selection.
 */
export function Calendar({ref, ...props}: CalendarProps): React.JSX.Element {
  const {
    mode = 'single',
    value,
    defaultValue,
    onChange,
    numberOfMonths = 1,
    min,
    max,
    dateConstraints,
    focusDate: focusDateFromProps,
    onFocusDateChange,
    hasOutsideDays = true,
    hasWeekNumbers = false,
    hasVariableRowCount = false,
    weekStartsOn = 0,
    className,
    'data-testid': dataTestId,
    style,
  } = props;

  const today = useMemo(() => plainDateToday(), []);
  const [internalValue, setInternalValue] = useState<
    DateRange | ISODateString | undefined
  >(defaultValue);
  const [rangeSelectionStart, setRangeSelectionStart] =
    useState<ISODateString | null>(null);
  const [hoveredDate, setHoveredDate] = useState<ISODateString | null>(null);
  const [pendingFocus, setPendingFocus] = useState<ISODateString | null>(null);
  const effectiveValue = value ?? internalValue;
  const [internalFocusDate, setInternalFocusDate] = useState(() => {
    if (focusDateFromProps != null) {
      return plainDateFromISO(focusDateFromProps);
    }

    if (typeof effectiveValue === 'string') {
      return plainDateFromISO(effectiveValue);
    }

    if (effectiveValue != null) {
      return plainDateFromISO(effectiveValue.start);
    }

    return today;
  });
  const focusDate =
    focusDateFromProps != null
      ? plainDateFromISO(focusDateFromProps)
      : internalFocusDate;
  const baseMonth = useMemo(
    () => plainDateSetFirstOfMonth(focusDate),
    [focusDate],
  );
  const visibleMonths = useMemo(
    () =>
      Array.from({length: numberOfMonths}, (_, index) =>
        plainDateAddMonths(baseMonth, index),
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
    min == null ||
    plainDateIsBefore(
      plainDateSetFirstOfMonth(plainDateFromISO(min)),
      plainDateSetFirstOfMonth(baseMonth),
    );
  const lastVisibleMonth = visibleMonths.at(-1) ?? baseMonth;
  const canNavigateNext =
    max == null ||
    plainDateIsAfter(
      plainDateSetFirstOfMonth(plainDateFromISO(max)),
      plainDateSetFirstOfMonth(lastVisibleMonth),
    );

  const navigateMonth = useCallback(
    (delta: number, focusedDate?: ISODateString, offset = 7) => {
      const nextMonth = plainDateAddMonths(baseMonth, delta);
      const nextISO = plainDateToISO(nextMonth);

      if (focusedDate != null) {
        const targetDate = plainDateAddDays(
          plainDateFromISO(focusedDate),
          delta * offset,
        );
        setPendingFocus(plainDateToISO(targetDate));
      }

      onFocusDateChange?.(nextISO);
      if (focusDateFromProps == null) {
        setInternalFocusDate(nextMonth);
      }
    },
    [baseMonth, focusDateFromProps, onFocusDateChange],
  );

  useImperativeHandle(
    ref,
    () => ({
      navigateTo: date => {
        onFocusDateChange?.(date);
        if (focusDateFromProps == null) {
          setInternalFocusDate(plainDateFromISO(date));
        }
      },
    }),
    [focusDateFromProps, onFocusDateChange],
  );

  const handleDayClick = useCallback(
    (date: PlainDate) => {
      const iso = plainDateToISO(date);

      if (mode === 'single') {
        setInternalValue(iso);
        (onChange as CalendarSingleProps['onChange'])?.(
          iso,
          plainDateToDate(date),
        );
        return;
      }

      if (rangeSelectionStart == null) {
        setRangeSelectionStart(iso);
        return;
      }

      const startDate = plainDateFromISO(rangeSelectionStart);
      const range = plainDateIsBefore(date, startDate)
        ? {start: iso, end: rangeSelectionStart}
        : {start: rangeSelectionStart, end: iso};
      setInternalValue(range);
      setRangeSelectionStart(null);
      (onChange as CalendarRangeProps['onChange'])?.(range);
    },
    [mode, onChange, rangeSelectionStart],
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
            dateConstraints={dateConstraints}
            hasOutsideDays={hasOutsideDays}
            hasVariableRowCount={hasVariableRowCount}
            hasWeekNumbers={hasWeekNumbers}
            hoveredDate={hoveredDate}
            key={plainDateToISO(month)}
            max={max}
            min={min}
            mode={mode}
            month={month}
            onDayClick={handleDayClick}
            onDayHover={date =>
              setHoveredDate(date == null ? null : plainDateToISO(date))
            }
            onNavigateNext={(focusedDate, offset) =>
              navigateMonth(1, focusedDate, offset)
            }
            onNavigatePrevious={(focusedDate, offset) =>
              navigateMonth(-1, focusedDate, offset)
            }
            onPendingFocusHandled={() => setPendingFocus(null)}
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
  /**
   * Custom date constraint functions.
   */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;
  /**
   * Whether to render outside-month days.
   */
  hasOutsideDays: boolean;
  /**
   * Whether the grid uses variable row counts.
   */
  hasVariableRowCount: boolean;
  /**
   * Whether to display ISO week numbers.
   */
  hasWeekNumbers: boolean;
  /**
   * Currently hovered date, used for range preview.
   */
  hoveredDate: ISODateString | null;
  /**
   * Maximum selectable date.
   */
  max?: ISODateString;
  /**
   * Minimum selectable date.
   */
  min?: ISODateString;
  /**
   * Selection mode: single date or date range.
   */
  mode: 'single' | 'range';
  /**
   * The month to render.
   */
  month: PlainDate;
  /**
   * Called when a day is clicked.
   */
  onDayClick: (date: PlainDate) => void;
  /**
   * Called when a day is hovered or unhovered.
   */
  onDayHover: (date: PlainDate | null) => void;
  /**
   * Called when navigating past the last day in the grid.
   */
  onNavigateNext: (focusedDate: ISODateString, offset: number) => void;
  /**
   * Called when navigating before the first day in the grid.
   */
  onNavigatePrevious: (focusedDate: ISODateString, offset: number) => void;
  /**
   * Called after a pending focus target has been focused.
   */
  onPendingFocusHandled: () => void;
  /**
   * Date that should receive focus after a navigation.
   */
  pendingFocus: ISODateString | null;
  /**
   * Start date of an in-progress range selection.
   */
  rangeSelectionStart: ISODateString | null;
  /**
   * Today's date, used for highlighting.
   */
  today: PlainDate;
  /**
   * Current selected value (single date or range).
   */
  value: DateRange | ISODateString | undefined;
  /**
   * First day of the week, where 0 is Sunday.
   */
  weekStartsOn: DayOfWeek;
}

/**
 * Renders the day grid for a single month within the calendar.
 */
function MonthGrid({
  month,
  value,
  mode,
  rangeSelectionStart,
  hoveredDate,
  min,
  max,
  dateConstraints,
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
    (date: PlainDate) => isDateDisabled(date, {min, max, dateConstraints}),
    [dateConstraints, max, min],
  );
  const selectedDate =
    mode === 'single' && typeof value === 'string'
      ? plainDateFromISO(value)
      : null;
  const tabbableDate = getSelectedTabDate({
    days,
    isDisabled,
    month: month.month,
    selectedDate,
    today,
    year: month.year,
  });

  const getFocusedDate = useCallback((): ISODateString | null => {
    const activeElement = document.activeElement as HTMLElement | null;
    const date = activeElement?.dataset.date;
    return date == null ? null : (date as ISODateString);
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
      `button[data-date="${pendingFocus}"]`,
    );
    button?.focus();
    onPendingFocusHandled();
  }, [gridRef, onPendingFocusHandled, pendingFocus]);

  let rangeStart: PlainDate | null = null;
  let rangeEnd: PlainDate | null = null;
  if (mode === 'range' && value != null && typeof value === 'object') {
    rangeStart = plainDateFromISO(value.start);
    rangeEnd = plainDateFromISO(value.end);
  }
  if (rangeSelectionStart != null) {
    rangeStart = plainDateFromISO(rangeSelectionStart);
    rangeEnd = rangeStart;
  }

  let previewStart: PlainDate | null = null;
  let previewEnd: PlainDate | null = null;
  if (mode === 'range' && rangeSelectionStart != null && hoveredDate != null) {
    const start = plainDateFromISO(rangeSelectionStart);
    const hover = plainDateFromISO(hoveredDate);
    if (!plainDateIsEqual(start, hover)) {
      previewStart = plainDateIsBefore(hover, start) ? hover : start;
      previewEnd = plainDateIsBefore(hover, start) ? start : hover;
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
            <div className={styles.weekRow} key={week[0].iso} role="row">
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
                  isTabbable={tabbableDate === day.iso}
                  key={day.iso}
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
}

interface DayCellProps {
  /**
   * Additional CSS class names for the cell.
   */
  className?: string;
  /**
   * Test ID for the cell.
   */
  'data-testid'?: string;
  /**
   * Calendar day data to render.
   */
  day: CalendarDay;
  /**
   * Zero-based column index of this day in the week row.
   */
  dayIndex: number;
  /**
   * Whether outside-month days are shown.
   */
  hasOutsideDays: boolean;
  /**
   * Whether this day is disabled.
   */
  isDisabled: boolean;
  /**
   * Whether this day is the tabbable cell in the grid.
   */
  isTabbable: boolean;
  /**
   * Selection mode: single date or date range.
   */
  mode: 'single' | 'range';
  /**
   * Called when a day is clicked.
   */
  onDayClick: (date: PlainDate) => void;
  /**
   * Called when a day is hovered or unhovered.
   */
  onDayHover: (date: PlainDate | null) => void;
  /**
   * End of the preview range highlight.
   */
  previewEnd: PlainDate | null;
  /**
   * Start of the preview range highlight.
   */
  previewStart: PlainDate | null;
  /**
   * End of the confirmed selected range.
   */
  rangeEnd: PlainDate | null;
  /**
   * Start of the confirmed selected range.
   */
  rangeStart: PlainDate | null;
  /**
   * Currently selected date in single mode.
   */
  selectedDate: PlainDate | null;
  /**
   * Inline styles for the cell.
   */
  style?: CSSProperties;
  /**
   * Today's date, used for highlighting.
   */
  today: PlainDate;
}

/**
 * Renders a single day cell within the month grid.
 */
function DayCell({
  className,
  day,
  'data-testid': dataTestId,
  dayIndex,
  mode,
  selectedDate,
  rangeStart,
  rangeEnd,
  previewStart,
  previewEnd,
  today,
  style,
  hasOutsideDays,
  isDisabled,
  isTabbable,
  onDayClick,
  onDayHover,
}: DayCellProps): React.JSX.Element {
  if (day.isOutside && !hasOutsideDays) {
    return (
      <div
        className={cx(styles.cell, className)}
        data-testid={dataTestId}
        style={style}
      />
    );
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
    <div
      className={cx(styles.cell, className)}
      data-testid={dataTestId}
      style={style}>
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
        data-date={day.iso}
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
}

Calendar.displayName = 'Calendar';
