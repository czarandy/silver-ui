# DateInput Component Audit

Audited files:

- `src/components/DateInput/DateInput.tsx`
- `src/components/DateInput/DateInput.stories.tsx`
- `src/components/DateInput/DateInput.test.tsx`
- `src/components/DateInput/index.ts`

---

## Performance Problems

### 1. `Intl.DateTimeFormat` instantiated on every format call

**File:** `src/internal/plainDate.ts`, line 160  
**Impact:** Moderate

`plainDateFormat()` creates a new `Intl.DateTimeFormat` on every call. `DateInput` calls this via `formatDate()` (line 57-60 of `DateInput.tsx`) inside a `useMemo`, so it only fires when `value` changes -- the memo mitigates the cost. However, if `DATE_FORMAT_LONG` were used elsewhere in hot paths, the lack of caching in `plainDateFormat` would be a broader concern. Within DateInput itself this is acceptable.

### 2. No memoization of the inline `onChange` callback passed to Calendar

**File:** `DateInput.tsx`, lines 126-129  
**Impact:** Low

The `onChange` handler passed to `<Calendar>` is an inline arrow function created on every render:

```tsx
onChange={nextValue => {
  onChange?.(nextValue);
  setIsOpen(false);
}}
```

This means the `Calendar` component receives a new function reference on every DateInput render. If `Calendar` or its children use `React.memo`, this would defeat memoization. Currently `Calendar` is not wrapped in `memo`, so the practical impact is low, but it is inconsistent with the pattern used in `Calendar.tsx` itself, which wraps its handlers in `useCallback`.

### 3. No issues with `dateConstraints` referential stability

**File:** `DateInput.tsx`, line 34  
**Impact:** Note

`dateConstraints` is typed as `ReadonlyArray<(date: Date) => boolean>` and passed straight through to `Calendar`. If consumers pass a new array on every render, this will trigger Calendar re-renders. This is a consumer responsibility, but it could be documented.

---

## Accessibility Concerns

### 1. The `<input>` is read-only but not explicitly role-adjusted

**File:** `DateInput.tsx`, line 146-159  
**Impact:** Low

The `<input>` has `readOnly` and `type="text"`, which gives it `role="textbox"`. Since it cannot be typed into, a screen reader user might be confused when the input does not accept keyboard input. The text value is effectively a display-only representation of the selected date. Consider adding `role="combobox"` or an alternative pattern (e.g., making the display a `<span>` and relying on the button for interaction).

### 2. Missing `aria-haspopup` on the calendar trigger button

**File:** `DateInput.tsx`, lines 137-144  
**Impact:** Low

The `<Button>` that triggers the popover is wrapped by `<Popover>`, which internally attaches `aria-haspopup` and `aria-expanded` via DOM manipulation (see `Popover.tsx`, lines 176-199). This works, but it means the ARIA attributes are applied imperatively after mount rather than declaratively. If the Popover's layout effect runs late, there could be a brief moment where the button lacks these attributes.

### 3. Clear button is not disabled during loading

**File:** `DateInput.tsx`, lines 161-169  
**Impact:** Low

When `isLoading` is true, the main input and calendar button are disabled, but the clear button's visibility check is `hasClear && value != null && !isDisabled`. It does not check `isLoading`. A user could clear the value while the component is in a loading state.

### 4. `aria-required` on a read-only input may confuse assistive technology

**File:** `DateInput.tsx`, line 150  
**Impact:** Low

The input is `readOnly` and cannot be directly edited. Adding `aria-required` to a read-only field is technically valid but may confuse users since they cannot type into it to satisfy the requirement -- they must use the popover button. Consider applying `aria-required` to the wrapping group or the button instead.

---

## Logic Bugs

### 1. `isOptional` and `isRequired` are not mutually exclusive

**File:** `DateInput.tsx`, lines 74-75  
**Impact:** Low

Both `isOptional` and `isRequired` can be set to `true` simultaneously. There is no runtime guard or TypeScript discriminated union preventing this conflicting state. The `Field` component presumably renders both an "(optional)" label and sets `aria-required`, which is contradictory.

### 2. Clear button visible during loading

**File:** `DateInput.tsx`, line 161  
**Impact:** Low (also an a11y issue)

The condition `hasClear && value != null && !isDisabled` does not account for `isLoading`. When loading, the input is disabled but the clear button remains visible and clickable if `isDisabled` is false.

### 3. Calendar `onChange` signature mismatch

**File:** `DateInput.tsx`, lines 126-129 vs `Calendar.tsx`, lines 116-118  
**Impact:** None (works correctly)

`Calendar` in single mode fires `onChange(value: ISODateString, valueAsDate: Date)`, but `DateInput` only captures the first argument. This works because JavaScript ignores extra arguments, but the second argument (`valueAsDate`) is silently discarded. If a consumer wanted the `Date` object from `DateInput`, they would need to convert from `ISODateString` themselves.

---

## Unclear API

### 1. `dateConstraints` uses `Date` objects while all other date props use `ISODateString`

**File:** `DateInput.tsx`, line 34  
**Impact:** Moderate

The constraint callbacks receive native `Date` objects, while `min`, `max`, `value`, and `onChange` all use `ISODateString`. This is inconsistent and requires consumers to work with two different date representations. The `Date` objects are locale-sensitive (midnight in local timezone), which could cause subtle off-by-one bugs near timezone boundaries.

### 2. No `name` prop for form submission

**File:** `DateInput.tsx`, lines 31-54  
**Impact:** Moderate

Unlike a standard form input, `DateInput` does not accept a `name` prop. This means it cannot participate in native form submission or be used with `FormData`. If form integration is expected, this is a gap.

### 3. `numberOfMonths` is passed through but not clearly useful

**File:** `DateInput.tsx`, line 46, 69  
**Impact:** Low

`numberOfMonths` defaults to 1 and is passed to `Calendar`, but for a single-date picker (not a range), showing 2 months adds visual complexity without clear benefit. The prop exists because `Calendar` supports it, but it's unclear when a consumer would want a 2-month calendar for single-date selection.

### 4. `ref` points to the read-only input, not the trigger button

**File:** `DateInput.tsx`, line 49, 157  
**Impact:** Low

The forwarded `ref` is attached to the read-only `<input>` element, which is not interactive (it is read-only and non-focusable in the typical sense). A consumer might expect the ref to point to the calendar trigger button or the wrapper. Calling `ref.current.focus()` would focus a non-editable text field.

---

## Missing Tests

The test file (`DateInput.test.tsx`) is 26 lines with a single test case. Compared to other components in the codebase (e.g., `Breadcrumbs.test.tsx` at 117 lines, `Icon.test.tsx` at 90 lines), coverage is notably thin.

### Missing test cases:

1. **Disabled state** -- verify the calendar button and clear button are not interactive when `isDisabled` is true.
2. **Loading state** -- verify the spinner renders and interactions are blocked when `isLoading` is true.
3. **Calendar popover opens and selects a date** -- the core flow of opening the calendar and selecting a date is not tested.
4. **`min` / `max` constraints** -- verify that out-of-range dates are disabled in the calendar.
5. **`dateConstraints` callback** -- verify custom constraint functions disable the expected dates.
6. **Status rendering** -- verify error/warning/success status displays the correct icon and message, and that `aria-invalid` is set for error status.
7. **Placeholder text** -- verify the default placeholder ("Select a date") renders when no value is provided.
8. **`isRequired` / `isOptional`** -- verify `aria-required` is set and the label renders "(optional)".
9. **`isLabelHidden`** -- verify the label is visually hidden but still accessible.
10. **`data-testid`** -- verify the test ID is applied to the input.
11. **`numberOfMonths`** -- verify two month panels render when set to 2.
12. **Keyboard interaction** -- verify the popover opens/closes with keyboard (Enter/Space on the button, Escape to close).

---

## Missing Stories

The stories file (`DateInput.stories.tsx`) has only 2 stories (16 lines). Compared to `TextInput.stories.tsx` (3 stories, 21 lines) and `InputGroup.stories.tsx` (62 lines), this is sparse.

### Existing stories:

- `Default` -- basic usage with a value
- `WithConstraints` -- min/max with clear button

### Missing stories:

1. **Disabled** -- `isDisabled: true` to show the disabled visual state.
2. **Loading** -- `isLoading: true` to show the spinner and disabled state.
3. **WithStatus (error)** -- `status: {type: 'error', message: 'Date is required'}` to show error styling and message. This is the pattern used in `TextInput.stories.tsx` (`WithStatus`) and is essential for demonstrating form validation.
4. **WithStatus (warning/success)** -- other status types.
5. **Optional** -- `isOptional: true` to show the "(optional)" label text.
6. **Required** -- `isRequired: true` to demonstrate required field behavior.
7. **Placeholder** -- no value set, showing the placeholder text.
8. **WithDescription** -- `description` prop showing helper text below the field.
9. **TwoMonths** -- `numberOfMonths: 2` showing the dual-month calendar layout.
10. **WithLabelTooltip** -- `labelTooltip` prop showing an info tooltip on the label.
11. **Sizes** -- demonstrating `size: 'sm' | 'md' | 'lg'` variants.
12. **HiddenLabel** -- `isLabelHidden: true` to show the visually hidden label.

---

## Summary

| Category        | Severity     | Count                                 |
| --------------- | ------------ | ------------------------------------- |
| Performance     | Low          | 2                                     |
| Accessibility   | Low          | 4                                     |
| Logic Bugs      | Low          | 3                                     |
| Unclear API     | Low-Moderate | 4                                     |
| Missing Tests   | High         | 12 missing cases (only 1 test exists) |
| Missing Stories | Moderate     | 12 missing stories (only 2 exist)     |

**Top priorities:**

1. **Test coverage is critically low** -- the single test only covers rendering a formatted date and clearing it. The core interaction (opening the calendar and selecting a date) is untested.
2. **Stories are too sparse** -- key props like `isDisabled`, `isLoading`, `status`, `description`, `size`, and `isRequired` have no visual demonstration.
3. **Clear button active during loading** -- the clear button should check `isLoading` in its visibility/disabled condition (line 161).
4. **`dateConstraints` type inconsistency** -- using `Date` callbacks when everything else uses `ISODateString` is a friction point for consumers.
