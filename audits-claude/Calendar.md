# Calendar Component Audit

**Files reviewed:**

- `src/components/Calendar/Calendar.tsx`
- `src/components/Calendar/Calendar.stories.tsx`
- `src/components/Calendar/Calendar.test.tsx`
- `src/components/Calendar/index.ts`
- `src/internal/plainDate.ts` (dependency)
- `src/internal/dateTypes.ts` (dependency)
- `src/internal/useGridFocus.ts` (dependency)

---

## Performance

### P1. `MonthGrid` and `DayCell` are not wrapped in `React.memo` (Calendar.tsx, lines 633 and 832)

`MonthGrid` receives many props including callback functions (`onDayClick`, `onDayHover`, `onNavigateNext`, `onNavigatePrevious`, `onPendingFocusHandled`). Several of these callbacks are defined as inline arrow functions in the parent `Calendar` render body (lines 589-601), which means they get new references every render. This causes every `MonthGrid` to re-render on every state change (e.g., hovering a date updates `hoveredDate` state, which re-renders the entire calendar including both month grids when `numberOfMonths={2}`).

Similarly, `DayCell` re-renders for every parent render. With up to 42 day cells per month grid, hovering a single date triggers a re-render of all 42+ `DayCell` components. Wrapping `DayCell` in `React.memo` and stabilizing its props would significantly reduce re-renders during hover interactions.

**Recommendation:** Wrap `DayCell` in `React.memo`. Consider stabilizing the inline callbacks passed to `MonthGrid` via `useCallback`, and optionally memoize `MonthGrid` as well.

### P2. `plainDateFormat` creates a new `Intl.DateTimeFormat` on every call (plainDate.ts, line 160)

Each `DayCell` calls `plainDateFormat(day.date, DATE_FORMAT_WITH_WEEKDAY)` for its `aria-label` (Calendar.tsx, line 916). With 42 cells, this creates 42 `Intl.DateTimeFormat` instances per month grid per render. `Intl.DateTimeFormat` construction is expensive relative to its `.format()` call.

**Recommendation:** Cache `Intl.DateTimeFormat` instances by options key in `plainDate.ts`, or create the formatter once at module scope for each format constant.

### P3. `today` is memoized with an empty dependency array (Calendar.tsx, line 413)

`const today = useMemo(() => plainDateToday(), []);` computes today's date once on mount and never updates. If a user leaves the calendar open past midnight, "today" highlighting will be stale. This is a minor issue but could cause confusion.

**Recommendation:** This is acceptable for most use cases, but document this behavior or consider a daily refresh mechanism if the calendar may be long-lived.

---

## Accessibility

### A1. No `aria-live` region for month navigation announcements (Calendar.tsx, line 564)

When the user navigates between months via the Previous/Next buttons, the month/year label updates visually (line 564, `<span className={styles.monthYear}>{monthYearLabel}</span>`) but this change is not announced to screen readers. The WAI-ARIA date picker pattern recommends an `aria-live="polite"` region so assistive technology announces the new month.

**Recommendation:** Add `aria-live="polite"` to the month/year `<span>` element on line 564.

### A2. Day name abbreviations are not accessible to screen readers (Calendar.tsx, lines 293-295, 759-762)

Day-of-week headers use two-letter abbreviations ("Su", "Mo", "Tu", etc.) without an `aria-label` or `abbr` attribute providing the full day name. Screen readers will announce "Su" rather than "Sunday". The `role="columnheader"` is correctly applied, but the abbreviated text is insufficient for comprehension.

**Recommendation:** Add `aria-label` with the full day name (e.g., `aria-label="Sunday"`) to each `<div role="columnheader">` element, or use an `<abbr>` element.

### A3. The outer `<div>` has a keyboard event handler but no ARIA role (Calendar.tsx, lines 538-553)

The root `<div>` has an `onKeyDown` handler for Escape (to cancel range selection). The eslint-disable comment on line 538 (`jsx-a11y-x/no-static-element-interactions`) confirms this is a known lint violation. A `<div>` with a keyboard handler but no interactive role is unexpected for assistive technology.

**Recommendation:** Consider moving the Escape handler into the grid's `onKeyDown` instead, or add an appropriate `role` (e.g., `role="group"`) with an `aria-label` like "Calendar" to the root element.

### A4. Week number column header is an empty `<div>` (Calendar.tsx, line 758)

When `hasWeekNumbers` is true, an empty `<div className={styles.dayName} />` is rendered as a placeholder in the header row (line 758). This has no semantic meaning. It should either have a `role="columnheader"` with an accessible label like "Week" or be explicitly hidden from the accessibility tree.

**Recommendation:** Add `role="columnheader"` and `aria-label="Week"` to the empty div, or use `aria-hidden="true"` if it is purely decorative spacing.

### A5. `aria-disabled` and `disabled` are applied inconsistently on day buttons (Calendar.tsx, lines 915, 932)

`aria-disabled` is set when the day is outside the current month OR when it is disabled by constraints (line 915, `effectivelyDisabled`), but the native `disabled` attribute is only set when `isDisabled` is true (line 932, constraints only -- not outside days). This means outside days are visually styled as disabled and have `aria-disabled="true"`, but they are not natively disabled. Since clicking outside days is guarded by the `effectivelyDisabled` check in `onClick` (line 930), the behavior is correct, but the asymmetry between `disabled` and `aria-disabled` is confusing. A screen reader will announce the button as disabled, but keyboard focus can still reach it.

**Recommendation:** Either set `disabled={effectivelyDisabled}` to match `aria-disabled`, or add `tabIndex={-1}` to outside days so they are not reachable via keyboard.

---

## Logic Bugs

### L1. Range selection start is not cleared when switching from `range` to `single` mode (Calendar.tsx, line 417)

`rangeSelectionStart` is stored as component state and never reset when the `mode` prop changes. If a consumer switches `mode` from `"range"` to `"single"` after a user has clicked the first date of a range (but before clicking the second), the `rangeSelectionStart` state remains set. This could cause subtle issues if `mode` is toggled dynamically, because the Escape key handler on line 543 still checks `rangeSelectionStart`.

**Recommendation:** Add a `useEffect` that clears `rangeSelectionStart` when `mode` changes away from `"range"`.

### L2. `navigateMonth` uses `delta * offset` which may not land on the expected date (Calendar.tsx, lines 474-493)

When the user presses ArrowDown on the last row, `navigateMonth(1, focusedDate, 7)` is called. The function then computes `plainDateAddDays(focusedDate, 1 * 7)` to find the target focus date. However, when `hasVariableRowCount` is true, a month may have 4 or 5 rows. Pressing ArrowDown from the last row of a 4-row month navigates to the next month and tries to focus the date 7 days later. If the next month has 6 rows, the date may land in the middle of that month rather than in the first row -- which is the expected position when arrowing down from the bottom.

**Recommendation:** Review whether the offset-based focus target is correct for all row-count combinations, especially with `hasVariableRowCount`.

### L3. `dateConstraints` callback identity affects memoization (Calendar.tsx, line 62; MonthGrid line 667)

The `isDisabled` callback in `MonthGrid` depends on `dateConstraints` (line 667). If a consumer passes an inline array literal like `dateConstraints={[d => d.getDay() !== 0]}`, a new array reference is created every render, breaking the `useCallback` memoization. This is more of an API ergonomics concern than a bug, but it can cause unnecessary re-computation.

**Recommendation:** Document that `dateConstraints` should be a stable reference (e.g., defined outside the component or wrapped in `useMemo`).

---

## Unclear API

### U1. `focusDate` name is ambiguous (Calendar.tsx, line 67)

The prop `focusDate` controls which month is visible, not which date has keyboard focus. The name suggests it determines the focused/highlighted date. Other calendar libraries use names like `viewDate`, `visibleMonth`, or `displayedMonth` to distinguish between the viewed month and the focused date.

**Recommendation:** Consider renaming to `viewDate` or `visibleMonth` for clarity, or improve the JSDoc to explicitly state it controls the visible month, not keyboard focus.

### U2. `dateConstraints` API uses negative logic (Calendar.tsx, lines 62-63, 355-358)

The `dateConstraints` prop is an array of functions that return `true` when a date is **allowed** and `false` when it is disabled. This double-negative logic (a constraint that returns false means disabled; `isDateDisabled` returns true when `.some(c => !c(date))`) is unintuitive. A simpler API would be `disabledDates?: (date: Date) => boolean` where returning `true` means disabled.

**Recommendation:** Consider simplifying to a single `isDateDisabled` callback, or at minimum document the current semantics clearly.

### U3. `numberOfMonths` is limited to `1 | 2` without explanation (Calendar.tsx, line 95)

The type is `1 | 2` rather than `number`. If this is an intentional design constraint (e.g., layout only supports two side-by-side months), it should be documented. If 3+ months may be supported later, a `number` type with a minimum would be more forward-compatible.

---

## Missing Tests

### T1. No keyboard navigation tests (Calendar.test.tsx)

There are no tests for arrow key navigation between days, PageUp/PageDown for month navigation, Home/End for row navigation, or Escape to cancel a range selection. Keyboard navigation is the most complex behavior in this component and is entirely untested.

**Recommendation:** Add tests for:

- Arrow keys moving focus between days
- ArrowDown/ArrowUp crossing month boundaries
- PageUp/PageDown navigating months
- Home/End navigating within a row
- Escape cancelling range selection

### T2. No tests for `hasOutsideDays` prop (Calendar.test.tsx)

The `hasOutsideDays` prop controls whether days from adjacent months are shown. When `false`, empty placeholder cells are rendered instead. This behavior is untested.

### T3. No tests for `hasWeekNumbers` prop (Calendar.test.tsx)

Week number display is untested. Should verify that ISO week numbers appear and are correct.

### T4. No tests for `hasVariableRowCount` prop (Calendar.test.tsx)

The variable row count feature (4-6 rows depending on month) is untested. Should verify a month like February 2026 (which starts on Sunday with 28 days = exactly 4 rows) renders with 4 rows when enabled vs 6 rows when disabled.

### T5. No tests for `weekStartsOn` prop (Calendar.test.tsx)

Different week start days are untested. Should verify that `weekStartsOn={1}` (Monday) changes the day header order and the position of dates in the grid.

### T6. No test for `numberOfMonths={2}` (Calendar.test.tsx)

Two-month display is untested. Should verify both months render with correct labels and dates.

### T7. No test for `dateConstraints` prop (Calendar.test.tsx)

Custom date constraints beyond `min`/`max` are untested. Should verify that `dateConstraints` disables specific dates and prevents selection.

### T8. No test for `onFocusDateChange` callback (Calendar.test.tsx)

The controlled visible month callback is untested. Should verify it is called when navigating months.

### T9. No test for `CalendarHandle.navigateTo` via ref (Calendar.test.tsx)

The imperative handle is tested for existence (line 69) but `navigateTo` is never actually invoked in a test. Should verify calling `navigateTo('2026-12-01')` navigates to December 2026.

### T10. No test for range selection in reverse order (Calendar.test.tsx)

The test on line 27 selects start before end. There is no test for selecting end before start (clicking May 12 then May 10), which should still produce a correctly ordered range.

### T11. No test for `defaultValue` prop (Calendar.test.tsx)

The uncontrolled mode with `defaultValue` is untested for both single and range modes.

---

## Missing Stories

### S1. No story for `dateConstraints` prop (Calendar.stories.tsx)

The `WithConstraints` story (line 51) only demonstrates `min` and `max`. There is no story showing `dateConstraints` with a custom function, e.g., disabling weekends.

### S2. No story for `hasOutsideDays={false}` (Calendar.stories.tsx)

No story demonstrates hiding outside days. This is a visual difference that should be shown.

### S3. No story for `hasVariableRowCount` (Calendar.stories.tsx)

No story demonstrates variable row counts. This should be shown for months with different row requirements.

### S4. No story for range mode with hover preview (Calendar.stories.tsx)

The `Range` story (line 38) shows a pre-selected range but does not demonstrate the interactive range preview behavior (where hovering after the first click shows a preview highlight). An interactive story without a pre-set `value` would better showcase this.

### S5. No story for controlled `focusDate` with `onFocusDateChange` (Calendar.stories.tsx)

There is no story demonstrating the controlled visible month pattern, which is important for consumers who want to sync the calendar's viewed month with external state.

### S6. No story for `defaultValue` (uncontrolled mode) (Calendar.stories.tsx)

All stories use the controlled `value` prop. An uncontrolled story with `defaultValue` would demonstrate that the component works without external state management.

### S7. No story for disabled states via `dateConstraints` (Calendar.stories.tsx)

A story showing weekends disabled, or specific dates disabled, would help demonstrate the constraint system.

---

## Architectural Notes

### N1. No recipe file (Calendar component directory)

The project convention (per MEMORY.md) is to define component styles in a `.recipe.ts` file using `cva`. The Calendar component defines all styles inline as a `styles` object using raw `css()` calls (Calendar.tsx, lines 138-280). This is understandable given the Calendar's complexity (it has no variant-based styling that `cva` excels at), but it deviates from the established pattern.

### N2. `DayCell` accepts `className`, `style`, and `data-testid` props that are never passed (Calendar.tsx, lines 813-815, 828)

The `DayCellProps` interface declares `className`, `style`, and `data-testid` props (lines 813-815, 828), but these are never passed from the parent `MonthGrid`. These props add dead code to the interface.

**Recommendation:** Remove unused props from `DayCellProps`, or if they are intended for future use, add a comment explaining that.

---

## Summary

The Calendar component is well-architected with a clean separation between `Calendar`, `MonthGrid`, and `DayCell`. The date logic is solid, leveraging the Temporal polyfill through a well-designed abstraction layer. The main gaps are in test coverage and accessibility.

| Priority | Category        | Issue                                                                   |
| -------- | --------------- | ----------------------------------------------------------------------- |
| High     | Missing Tests   | T1: No keyboard navigation tests                                        |
| High     | Accessibility   | A1: No `aria-live` for month change announcements                       |
| Medium   | Performance     | P1: `MonthGrid` and `DayCell` not memoized; hover causes full re-render |
| Medium   | Accessibility   | A2: Day name abbreviations not accessible                               |
| Medium   | Accessibility   | A5: `aria-disabled` / `disabled` asymmetry on outside days              |
| Medium   | Missing Tests   | T2-T9: 8 props/behaviors have no test coverage                          |
| Medium   | Missing Stories | S1, S4: Key interactive behaviors not demonstrated                      |
| Low      | Logic Bugs      | L1: `rangeSelectionStart` not cleared on mode change                    |
| Low      | Logic Bugs      | L2: Focus target after month boundary navigation may be off             |
| Low      | Unclear API     | U1: `focusDate` name is ambiguous                                       |
| Low      | Unclear API     | U2: `dateConstraints` uses non-obvious negative logic                   |
| Low      | Performance     | P2: `Intl.DateTimeFormat` created per cell per render                   |
| Low      | Accessibility   | A3: Root div has keyboard handler with no ARIA role                     |
| Low      | Accessibility   | A4: Empty week number column header                                     |
