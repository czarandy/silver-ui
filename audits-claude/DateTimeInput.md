# DateTimeInput Component Audit

**Files reviewed:**

- `src/components/DateTimeInput/DateTimeInput.tsx`
- `src/components/DateTimeInput/DateTimeInput.stories.tsx`
- `src/components/DateTimeInput/DateTimeInput.test.tsx`
- `src/components/DateTimeInput/index.ts`

---

## Performance

### P1. `splitDateTime` is called on `min` and `max` every render (DateTimeInput.tsx, lines 88-89)

`splitDateTime(min)` and `splitDateTime(max)` are called unconditionally on each render. These are string splits with no memoization. The cost is trivial for a single component instance, but the pattern is worth noting. No action needed unless profiling shows this component in a hot path.

### P2. Inline arrow functions for `onChange` handlers (DateTimeInput.tsx, lines 116, 130)

Both `DateInput` and `TimeInput` receive new closure references on every render:

- Line 116: `onChange={nextDate => onChange(combineDateTime(nextDate, time))}`
- Line 130: `onChange={nextTime => onChange(combineDateTime(date, nextTime))}`

If `DateInput` or `TimeInput` were wrapped in `React.memo`, these new references would defeat memoization. Currently neither child is memoized, so this has no practical impact. Wrapping these in `useCallback` would be premature unless memoization is added to the children.

**Overall:** No actionable performance issues.

---

## Accessibility

### A1. Nested `Field` wrappers produce duplicate label/description structure (DateTimeInput.tsx, lines 92-136)

`DateTimeInput` wraps its content in a `<Field>` (line 92), and then the child `DateInput` (line 106) and `TimeInput` (line 121) each render their own internal `<Field>` as well (see DateInput.tsx line 94, TimeInput.tsx line 77). This results in three `<Field>` wrappers total, with three `<label>` elements in the DOM.

The outer `<Field>` generates a `<label htmlFor={fieldId}>` (line 86, 92-93), but that `fieldId` from `useId()` does not correspond to any actual `<input>` element -- neither the DateInput's `<input>` nor the TimeInput's `<input>` use this ID. The outer label's `htmlFor` points to a nonexistent element, making it a dead label that does nothing when clicked.

**Recommendation:** Either remove the outer `<Field>` wrapper and use a `<fieldset>`/`<legend>` grouping pattern instead (semantically correct for a compound control with two inputs), or ensure the outer label's `htmlFor` is wired to the date input's actual ID. A `<fieldset>` with a visually hidden `<legend>` is the standard approach for grouping related inputs.

### A2. The `status` prop is only passed to the outer Field (DateTimeInput.tsx, line 101)

The `status` prop (e.g., `{type: 'error', message: 'Invalid date/time'}`) is passed to the outer `<Field>`, but neither the inner `DateInput` nor `TimeInput` receives it. This means:

- The individual `<input>` elements inside `DateInput` and `TimeInput` will not have `aria-invalid="true"` set when status is `error`.
- The visual error styling (red border) applied by `inputStyles.status.error` will not appear on either input.
- Screen readers will not announce the inputs as invalid.

**Recommendation:** Pass the `status` prop through to both `DateInput` and `TimeInput` so that `aria-invalid` and visual error styles are applied to the actual form controls.

### A3. No `aria-required` on the actual inputs (DateTimeInput.tsx, lines 106-133)

`isRequired` is passed to the outer `<Field>` (line 98) which displays a "Required" indicator, but `isRequired` is not forwarded to `DateInput` or `TimeInput`. Those child components accept `isRequired` and would set `aria-required="true"` on their `<input>` elements (see TimeInput.tsx line 106, DateInput.tsx line 150).

**Recommendation:** Forward `isRequired` and `isOptional` to both child components.

### A4. `ref` is only forwarded to DateInput (DateTimeInput.tsx, line 117)

The `ref` prop is forwarded to the `DateInput` child only. This is reasonable behavior (the ref points to the first input in the group), but it is not documented in the props interface. Consumers might expect the ref to point to the wrapping `<div>` or the TimeInput.

**Recommendation:** Add a JSDoc comment on the `ref` prop in `DateTimeInputProps` (line 29) clarifying that it refers to the date input element.

---

## Logic Bugs

### L1. `onChange` fires `undefined` when only one of date/time has a value (DateTimeInput.tsx, lines 116, 130)

When only the date is set and the time is `undefined`, or vice versa, `combineDateTime` returns `undefined` (line 59). This creates a problem in the following scenario:

1. User has no value set (`value={undefined}`), so both `date` and `time` are `undefined`.
2. User picks a date. `onChange` fires with `combineDateTime('2026-05-21', undefined)` which returns `undefined`.
3. The parent sees `undefined` -- indistinguishable from "cleared" -- and the date selection is silently lost.

The same happens when the user picks a time before a date. The component cannot represent a partial state (date without time or time without date), so the first interaction in either sub-input is always a no-op from the consumer's perspective.

**Recommendation:** Consider either:

- Auto-filling a sensible default for the missing half (e.g., current time or `00:00` when only date is set, today's date when only time is set).
- Tracking partial state internally with `useState` so the component assembles a full datetime before firing `onChange`.
- Documenting that `value` must always be provided (i.e., this is an "edit-only" component, not a "create from empty" component).

### L2. Min/max time constraints ignore cross-date boundaries (DateTimeInput.tsx, lines 128-129)

The time constraints are conditionally applied:

- Line 128: `max={date === maxParts.date ? maxParts.time : undefined}`
- Line 129: `min={date === minParts.date ? minParts.time : undefined}`

This logic is correct for clamping time when the date equals the min/max date. However, `date` can be `undefined` and `minParts.date` / `maxParts.date` can also be `undefined`. Since `undefined === undefined` is `true`, if both `min` and `value` are `undefined`, the time min constraint will be set to `minParts.time` which is also `undefined` -- this is harmless but accidentally correct. If a consumer passes `min="T09:00"` (malformed, no date part), `splitDateTime` would produce `date: ''` and `time: '09:00'`, and the equality check `'' === ''` would match, applying the time constraint incorrectly. This is an edge case with a malformed input, so it is low risk.

### L3. `splitDateTime` uses unchecked type assertions (DateTimeInput.tsx, lines 51-52)

The `split('T')` result is cast with `as ISODateString` and `as ISOTimeString` without validation. If `value` contains no `T` separator, `date` will be the entire string and `time` will be `undefined`. The `as` casts suppress TypeScript errors but do not prevent runtime issues. Given the `ISODateTimeString` template literal type, this can only happen if the consumer uses a type assertion themselves, so the risk is low.

---

## Unclear API

### U1. `isOptional` and `isRequired` are both accepted but mutually exclusive (DateTimeInput.tsx, lines 21, 22)

Both props default to `false`, and there is no runtime or type-level enforcement that they are not both `true` simultaneously. If both are `true`, the `Field` component will display "Required" (Field.tsx line 191: `isOptional ? 'Optional' : isRequired ? 'Required' : null` -- `isOptional` takes precedence because it is checked first). This is inherited from Field's API but worth noting.

### U2. `onChange` is required but `value` is optional (DateTimeInput.tsx, lines 28, 33)

`onChange` is typed as required (`onChange: (...) => void`, no `?`), but `value` is optional. This suggests the component supports both controlled and uncontrolled usage, but it does not actually manage internal state -- it is always controlled. When `value` is `undefined`, both sub-inputs render empty, and as described in L1, the first user interaction will fire `onChange(undefined)`, which is a no-op. The API would be clearer if `value` were also required, or if the component handled the undefined-value case gracefully.

### U3. `dateConstraints` name and type could be clearer (DateTimeInput.tsx, line 14)

The prop `dateConstraints?: ReadonlyArray<(date: Date) => boolean>` is passed through to `DateInput` and then to `Calendar`. The name does not clearly indicate whether `true` means "allowed" or "disallowed," and the `Date` type (mutable JS Date) is inconsistent with the otherwise Temporal/ISO-string-based API. This is inherited from `DateInput`/`Calendar` and not specific to `DateTimeInput`.

---

## Missing Tests

### T1. Only one test exists (DateTimeInput.test.tsx)

The test file contains a single test case ("updates the time portion") at 22 lines. This is significantly below the coverage of peer components (e.g., `Dialog.test.tsx` at 194 lines, `Breadcrumbs.test.tsx` at 117 lines). The following scenarios are untested:

### T2. No test for updating the date portion

There is no test verifying that changing the date via `DateInput` fires `onChange` with the correct combined value. The existing test only covers the time portion.

### T3. No test for `undefined` value (empty state)

No test verifies the component's behavior when `value` is `undefined`, which is the initial state in a "create" flow. This would expose bug L1.

### T4. No test for `hasClear` functionality

`hasClear` is a supported prop that renders clear buttons in both sub-inputs. No test verifies that clicking clear fires `onChange(undefined)`.

### T5. No test for `min`/`max` constraint forwarding

The component has conditional logic for forwarding time constraints based on the current date (lines 128-129). No test verifies that `min`/`max` are correctly split and forwarded to the child components.

### T6. No test for `isDisabled` state

No test verifies that both sub-inputs are disabled when `isDisabled` is `true`.

### T7. No test for `hasSeconds` forwarding

`hasSeconds` is forwarded to `TimeInput` (line 123). No test verifies this.

### T8. No test for accessibility attributes

No test verifies that:

- Labels are correctly associated with inputs (the test does use `getByLabelText`, which partially covers this).
- `aria-required` is set when `isRequired` is `true`.
- `aria-invalid` is set when `status` has `type: 'error'`.

### T9. No test for `status` rendering

No test verifies that the `status` prop renders a validation message.

### T10. No test for ref forwarding

The `ref` prop (line 29) is not tested.

---

## Missing Stories

### S1. Only one story exists (DateTimeInput.stories.tsx)

The stories file contains only a single `Default` story at 14 lines. By comparison, sibling components like `TimeInput` have at least two stories (Default, WithSeconds), and `DateInput` has two (Default, WithConstraints). The following stories are missing:

### S2. No story for `hasSeconds`

The `hasSeconds` prop changes the TimeInput to display a seconds field. This should be demonstrated, consistent with the `TimeInput` component's `WithSeconds` story.

### S3. No story for `min`/`max` constraints

The `min` and `max` props constrain the selectable date and time range. This is a key feature that should be visually demonstrable, consistent with the `DateInput` component's `WithConstraints` story.

### S4. No story for `hasClear`

The `hasClear` prop adds clear buttons to both sub-inputs. No story demonstrates this.

### S5. No story for `isDisabled` state

No story shows the disabled appearance.

### S6. No story for `status` (error/warning/success)

No story shows validation states, which are important for form integration.

### S7. No story for `isLoading`

No story shows the loading state.

### S8. No story for `numberOfMonths={2}`

The `numberOfMonths` prop is forwarded to `DateInput`/`Calendar` and changes the calendar popover to show two months. No story demonstrates this.

### S9. No story for empty/undefined value

No story shows the component in its initial empty state, which is the starting point for "create" flows.

### S10. No story for size variants

The `size` prop accepts `'sm' | 'md' | 'lg'` but no story demonstrates the different sizes.

---

## Summary

The DateTimeInput component is a clean, well-typed composition of DateInput and TimeInput. The main concern areas are accessibility (nested Field wrappers producing a dead label and missing aria attribute forwarding) and extremely thin test/story coverage.

| Priority | Category        | Issue                                                                                                                         |
| -------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| High     | Accessibility   | A1: Outer `<Field>` label `htmlFor` points to nonexistent element; should use `<fieldset>`/`<legend>`                         |
| High     | Accessibility   | A2: `status` not forwarded to child inputs -- no `aria-invalid` or visual error styling on inputs                             |
| Medium   | Accessibility   | A3: `isRequired`/`isOptional` not forwarded -- no `aria-required` on actual inputs                                            |
| Medium   | Logic Bug       | L1: First interaction on empty component fires `onChange(undefined)` -- partial state is silently lost                        |
| Low      | Logic Bug       | L3: Unchecked type assertions in `splitDateTime`                                                                              |
| Low      | Unclear API     | U2: `onChange` is required but `value` is optional; component does not handle empty state gracefully                          |
| High     | Missing Tests   | T1-T10: Only 1 test exists; date changes, clear, disabled, min/max, seconds, status, and ref are all untested                 |
| High     | Missing Stories | S1-S10: Only 1 story exists; hasSeconds, min/max, hasClear, disabled, status, loading, sizes, and empty state are all missing |
