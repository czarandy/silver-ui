# DateRangeInput Component Audit

**Files reviewed:**

- `src/components/DateRangeInput/DateRangeInput.tsx`
- `src/components/DateRangeInput/DateRangeInput.stories.tsx`
- `src/components/DateRangeInput/DateRangeInput.test.tsx`
- `src/components/DateRangeInput/index.ts`

No `*.recipe.ts` file exists. This is consistent with the component since it uses shared `inputStyles` from `Field/inputStyles.ts` rather than a component-specific recipe.

---

## Performance

### P1. `Intl.DateTimeFormat` instantiated on every render cycle (DateRangeInput.tsx, line 60)

`formatRange` calls `plainDateFormat` twice, and `plainDateFormat` (in `plainDate.ts`, line 160) creates a `new Intl.DateTimeFormat(undefined, options)` each time. Because `displayValue` is wrapped in `useMemo` keyed on `[value]`, this only fires when `value` changes, so this is acceptable for typical usage. However, if the component re-renders frequently with different `value` objects that are structurally equal (new object references with the same `start`/`end`), the memo will miss because `useMemo` uses `Object.is` comparison. Since `DateRange` is `{ start: string; end: string }`, two distinct objects with the same field values will be referentially unequal.

**Impact:** Low. The `Intl.DateTimeFormat` allocation is cheap and this only matters if the consumer creates a new `value` object on every render without memoizing it. No fix is needed, but documenting that `value` should be referentially stable (or memoized) would help consumers avoid unnecessary work.

### P2. Calendar is mounted only when the popover is open (no issue)

The `Calendar` component is passed as `content` to `Popover`. The Popover implementation renders the content into the DOM only when open (via the popover API), so the calendar grid is not computed while the popover is closed. No performance concern here.

---

## Accessibility

### A1. Read-only input receives focus but is not interactive (DateRangeInput.tsx, line 147-161)

The `<input readOnly>` element has an associated `<label>` via `id={inputId}` and `htmlFor={inputId}` (through the `Field` component), so clicking the label focuses the read-only input. However, typing in the input does nothing, and the only way to change the value is through the calendar popover button or the clear button. This can be confusing for keyboard users who tab to the input and expect to type.

**Recommendation:** Consider adding `tabIndex={-1}` to the input so keyboard focus flows directly to the actionable calendar button and clear button. Alternatively, use `role="combobox"` with `aria-readonly="true"` to better communicate that the input opens a picker. The sibling `DateInput` component has the same pattern, so this is a systemic concern rather than specific to `DateRangeInput`.

### A2. Clear button is not disabled when `isLoading` is true (DateRangeInput.tsx, lines 162-170)

The calendar button and the `<input>` are both disabled when `isLoading` is true (line 140, line 155), but the clear button's visibility condition at line 162 only checks `!isDisabled`, not `!isLoading`. A user could clear the value while the component is in a loading state.

**Recommendation:** Change the condition on line 162 to `hasClear && value != null && !isDisabled && !isLoading`.

### A3. No `aria-label` or `role` on the outer wrapper `<div>` (DateRangeInput.tsx, line 109)

The outer `<div>` wrapping the button, input, and clear button has no group semantics. Screen reader users encounter three separate controls (calendar button, text input, clear button) without a clear grouping. Consider adding `role="group"` with `aria-labelledby` pointing to the label, consistent with how composite input controls are grouped.

### A4. Popover closes immediately after range selection without returning focus (DateRangeInput.tsx, lines 126-129)

When a range is selected in the calendar, `setIsOpen(false)` is called, which closes the popover. The Popover component should return focus to the trigger button automatically, but this behavior depends on the `usePopover` implementation. If focus is not returned, keyboard users will be stranded.

**Recommendation:** Verify that focus returns to the calendar trigger button after popover close. If not, explicitly call `triggerRef.current?.focus()` after closing.

---

## Logic Bugs

### L1. `formatRange` does not validate that `start` is before `end` (DateRangeInput.tsx, line 56-61)

The `formatRange` function formats whatever `start` and `end` values are provided without checking their order. If a consumer passes `{ start: '2026-05-12', end: '2026-05-10' }`, the display will show "May 12, 2026 - May 10, 2026", which is a reversed range. The Calendar component's `handleDayClick` (Calendar.tsx, line 527-529) does normalize order, but the `DateRangeInput` does not guard against invalid external input.

**Impact:** Low. This is primarily a consumer-side concern, and normalizing in the display layer could mask bugs elsewhere. However, a console warning in development mode would be helpful.

### L2. Calendar `onChange` callback signature mismatch is masked by optional chaining (DateRangeInput.tsx, line 127)

The `Calendar` in range mode calls `onChange` with a `DateRange` value (never `undefined`). However, the `DateRangeInput`'s `onChange` prop accepts `DateRange | undefined`. This works fine because `DateRange` is a subtype of `DateRange | undefined`, but it means the popover path can never produce an `undefined` value -- only the clear button can. This is correct behavior but could be surprising if someone reads the `onChange` type and expects the calendar itself might clear the value.

### L3. No `focusDate` passed to the Calendar (DateRangeInput.tsx, line 119-131)

The sibling `DateInput` passes `focusDate={value}` to the Calendar (DateInput.tsx, line 122), which ensures the calendar opens to the month containing the selected date. `DateRangeInput` does not pass `focusDate`, so the calendar always opens to the current month regardless of the selected range. If a user has selected a range in January 2025 and reopens the calendar, they will see the current month instead of January 2025.

**Recommendation:** Pass `focusDate={value?.start}` to the `Calendar` component.

---

## Unclear API

### U1. `isOptional` and `isRequired` are not mutually exclusive (DateRangeInput.tsx, lines 40-41)

Both `isOptional` and `isRequired` can be set to `true` simultaneously. The `Field` component handles this by showing "Optional" when `isOptional` is true and "Required" when `isRequired` is true, but if both are true, `isOptional` wins (Field.tsx, line 191: `isOptional ? 'Optional' : isRequired ? 'Required' : null`). This should be documented or enforced via a discriminated union.

### U2. `dateConstraints` uses `Date` objects, not `PlainDate` (DateRangeInput.tsx, line 34)

The `dateConstraints` prop takes functions of `(date: Date) => boolean`, which uses JavaScript's `Date` with time zone quirks, while the rest of the component operates on ISO date strings and Temporal `PlainDate`. This is inherited from the Calendar component's API, but it creates a leaky abstraction. Consumers must be careful not to call time-zone-sensitive methods on the `Date` object.

### U3. `ref` points to the read-only input, not the most useful element (DateRangeInput.tsx, line 49)

The `ref` is forwarded to the `<input readOnly>` element. Since the input is read-only and not directly interactive, the ref has limited utility. A more useful ref target might be the wrapper div or an imperative handle that exposes `open()` / `close()` methods for the popover.

---

## Missing Tests

### T1. Only one test exists (DateRangeInput.test.tsx)

The test file contains a single test that verifies rendering a formatted range and clearing it. The following behaviors are untested:

- **Disabled state:** Verify that the calendar button, input, and clear button are all disabled when `isDisabled` is true.
- **Loading state:** Verify that the spinner appears, the calendar button is disabled, and the input is disabled when `isLoading` is true.
- **Empty/undefined value:** Verify that the input shows the placeholder text when `value` is undefined.
- **Status display:** Verify that error/warning/success status icons and messages render correctly and that `aria-invalid` is set for error status.
- **Popover opens:** Verify clicking the calendar button opens the popover (or at minimum that the button has `aria-haspopup` and `aria-expanded` attributes).
- **`isRequired` / `isOptional` indicators:** Verify the label shows the correct indicator text.
- **`description` rendering:** Verify description text renders and is linked via `aria-describedby`.
- **`isLabelHidden`:** Verify the label is visually hidden but still accessible.
- **`data-testid` forwarding:** Verify the test ID is applied to the input element.
- **Clear button not shown when `hasClear` is false:** The current test only tests `hasClear={true}`.
- **Clear button not shown when value is undefined:** Ensure the clear button does not render when there is no value.

### T2. No integration test for calendar interaction

There is no test that opens the calendar popover, selects a date range, and verifies the `onChange` callback fires with the correct `DateRange`. This is the primary user flow for the component.

---

## Missing Stories

### S1. Only `Default` story exists (DateRangeInput.stories.tsx)

The stories file contains only a single `Default` story. For comparison, the sibling `TextInput` has `Default`, `WithStatus`, and `WithIconAndClear` stories, and `DateInput` has `Default` and `WithConstraints`. The following stories would demonstrate important props and states:

- **WithConstraints:** Demonstrate `min`, `max`, and/or `dateConstraints` props to show date restriction behavior.
- **WithClear:** Demonstrate `hasClear={true}` with a selected value, showing the clear button.
- **WithStatus:** Demonstrate error, warning, and success status variants with messages.
- **Disabled:** Demonstrate `isDisabled={true}`.
- **Loading:** Demonstrate `isLoading={true}` with the spinner visible.
- **SingleMonth:** Demonstrate `numberOfMonths={1}` (the default is 2, which differs from `DateInput`'s default of 1).
- **Empty:** Demonstrate the component with no value to show the placeholder text.
- **WithDescription:** Demonstrate the `description` prop.
- **Sizes:** Demonstrate the `sm`, `md`, and `lg` size variants.

---

## Summary

The component is structurally sound and follows the same patterns as its sibling `DateInput`. The most impactful issues are:

1. **L3 (Logic bug):** Missing `focusDate` prop means the calendar does not open to the selected range's month.
2. **A2 (Accessibility):** Clear button remains active during loading state.
3. **T1/T2 (Missing tests):** Only one test exists covering one of many behaviors; the primary calendar interaction flow is untested.
4. **S1 (Missing stories):** Only the default story exists; key props like `hasClear`, `status`, `isDisabled`, `min`/`max`, and `numberOfMonths` have no story coverage.
