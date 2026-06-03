# Calendar Audit

## Summary

Calendar is a date picker component supporting single date and date range selection. It renders a month grid with navigable days, supports min/max constraints, custom disabled dates, outside-month days, variable row counts, week numbers, two-month display, keyboard navigation via arrow keys, and an imperative `CalendarHandle` for programmatic navigation. The component uses `memo` on both `MonthGrid` and `DayCell` for performance.

## Issues

### Critical

- None identified.

### High

- None identified.

### Medium

- **`navigateMonth` uses confusing `offset` parameter for focus calculation**: The `navigateMonth` function calculates `focusedDate.add({days: delta * offset})` where `offset` is passed from keyboard handlers and represents the grid step (1 or 7). However, when navigating to the previous/next month via the chevron buttons, `navigateMonth(-1)` is called without `focusedDate` and `offset` defaults to 7, which is ignored since `focusedDate` is undefined. The dual use makes the function harder to understand.
- **`hoveredDate` state causes re-renders on mouse move in range mode**: Every `onMouseEnter` on a day cell calls `setHoveredDate`, which updates state in the parent `Calendar` component, causing all `MonthGrid` and `DayCell` components to re-evaluate. While `memo` helps, the `hoveredDate` prop changes on every hover, bypassing the memo optimization for the `MonthGrid` component.
- **Keyboard navigation across month boundaries relies on `pendingFocus` with `querySelector`**: When the user arrows past the visible month, `setPendingFocus` is set and an effect uses `querySelector` to find and focus the button for that date. If the date doesn't exist in the new month (e.g., navigating from Jan 31 to Feb), the focus will be lost since no matching button exists.
- **`plainDateFromDataAttribute` uses fragile string slicing**: The function parses date strings using `parseInt(value.slice(0, 4))` etc., assuming a fixed `YYYY-MM-DD` format. Any deviation in the `data-date` attribute format would silently produce wrong dates.

### Low

- **No story for controlled `viewDate` with `onViewDateChange`**: While the `onViewDateChange` callback is tested, there is no story demonstrating the fully controlled view date pattern.
- **No story for `timezoneID` prop**: The timezone prop is accepted but not demonstrated in stories.
- **No test for keyboard navigation**: Arrow key navigation, PageUp/PageDown, and Home/End keys are implemented via `useGridFocus` but not tested in the Calendar test file.
- **No test for range mode escape to cancel selection**: The Escape key handler that clears `rangeSelectionStart` is not tested.
- **`getSelectedTabDate` logic for tabbable date selection is complex**: The function falls through from selected date to today to first non-disabled date. If none are available (all dates disabled), it returns `null`, which means no day in the grid gets `tabIndex={0}`, making the calendar unreachable by keyboard.
- **`aria-disabled` on outside days is set but button is not disabled**: Outside-month days have `aria-disabled={true}` and the click handler checks `effectivelyDisabled`, but the `disabled` attribute on the button is only set for `isDisabled`, not for `day.isOutside`. This means outside days are clickable (the handler prevents the click, but the button doesn't communicate its disabled state to the browser).
- **Day name headers use duplicate keys**: `dayNames.map(dayName => ... key={dayName})` uses the day name string as the key. If a locale were to produce duplicate short names (unlikely but possible), this would cause React key conflicts.

## Recommendations

- Add keyboard navigation tests to verify arrow key, PageUp/PageDown, and Escape behavior.
- Consider adding `disabled` to outside-month day buttons in addition to `aria-disabled` for consistent disabled state.
- Investigate hover performance in range mode; consider debouncing `setHoveredDate` or using CSS-only hover previews.
- Add a story for controlled `viewDate` and `timezoneID` to demonstrate timezone-aware rendering.
- The test coverage is strong (14 tests covering single/range selection, constraints, disabled dates, outside days, week numbers, variable rows, week start, className/style/ref/data-testid, two months, navigation callbacks, imperative handle, reverse range, and default values).
