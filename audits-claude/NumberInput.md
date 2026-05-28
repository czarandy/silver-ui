# NumberInput Component Audit

Audited files:

- `src/components/NumberInput/NumberInput.tsx`
- `src/components/NumberInput/NumberInput.stories.tsx`
- `src/components/NumberInput/NumberInput.test.tsx`
- `src/components/NumberInput/index.ts`

No `.recipe.ts` file exists for this component (styles are minimal and inline).

---

## Performance Problems

### 1. Inline arrow functions on every render (low severity)

**File:** `NumberInput.tsx`, lines 182-213

The `onBlur`, `onChange`, and `onKeyDown` handlers are inline arrow functions that are re-created on every render. This is a minor concern -- it only matters when the input is passed to memoized children or used in dependency arrays. Since these handlers are passed directly to a native `<input>` element, the practical impact is negligible. No action required unless profiling identifies this as a bottleneck.

### 2. `useMemo` for `displayValue` is unnecessary (low severity)

**File:** `NumberInput.tsx`, lines 143-148

The `useMemo` wraps a trivial ternary expression (`pendingInput ?? (value == null ? '' : String(value))`). The cost of the memoization bookkeeping likely exceeds the cost of the computation itself. This is not harmful, but it adds cognitive overhead for no measurable benefit. Consider removing it.

### 3. No issues with unnecessary re-renders

The component does not use `React.memo`, which is fine -- it's a leaf component that renders a native `<input>`. The parent is responsible for avoiding unnecessary re-renders.

---

## Accessibility Concerns

### 1. `aria-invalid` can resolve to `false` instead of `undefined` (medium severity)

**File:** `NumberInput.tsx`, line 169

```tsx
aria-invalid={status?.type === 'error' || !isInputValid || undefined}
```

When `status?.type` is not `'error'` and `isInputValid` is `true`, the expression evaluates to `false || true || undefined` which is `true` -- wait, let me re-check. When `status?.type !== 'error'` (so `false`) and `isInputValid` is `true` (so `!isInputValid` is `false`), the expression is `false || false || undefined` which is `undefined`. That is correct.

However, when `isInputValid` is `false` but there is no error status, `aria-invalid` will be set to `true`. This is correct behavior -- the input contains unparseable text so it is indeed invalid.

**Revised assessment:** The logic is actually correct, though the expression is hard to read at a glance. Consider extracting it to a named variable for clarity.

### 2. Missing `autoComplete` attribute (low severity)

**File:** `NumberInput.tsx`, line 116

The `autoComplete` prop is accepted but there's no default. Native `<input type="number">` elements don't typically need autocomplete, so this is fine. However, the prop lacks JSDoc documentation explaining its purpose, unlike the sibling `TextInput` component which documents all its props.

### 3. Missing `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (informational)

The component uses `type="number"` which provides native min/max semantics via the `min` and `max` HTML attributes (lines 179-180). The native spinbutton role is implicitly applied. The ARIA value attributes are not strictly required when using native `<input type="number">`, so this is acceptable.

### 4. No `aria-label` for units display (low severity)

**File:** `NumberInput.tsx`, line 221

The `units` suffix (e.g., "GB") is rendered as a visible `<span>` inside the input wrapper, but screen readers may not associate it with the input's value. Consider adding a more descriptive `aria-label` or `aria-description` that includes the unit, e.g., "Quantity (GB)".

### 5. `isOptional` and `isRequired` are not mutually exclusive (low severity)

**File:** `NumberInput.tsx`, lines 35-36

Both `isOptional` and `isRequired` can be set to `true` simultaneously, which is contradictory. There is no runtime guard or TypeScript exclusion to prevent this. The sibling `TextInput` has the same issue, so this is a shared concern across the Field-based components.

---

## Logic Bugs

### 1. `onChange` called with stale `value` reference on blur (medium severity)

**File:** `NumberInput.tsx`, lines 182-195

The `onBlur` handler compares `parsed !== value` using the `value` prop captured in the render closure. If the parent's state has changed between when the user started typing and when they blur the input, the comparison may be stale. In practice this is unlikely to cause issues because React batches state updates and the component re-renders with the new `value` before the blur fires, but in concurrent mode or with deferred updates, the stale closure could cause a valid change to be silently dropped.

### 2. `parseNumberInput` silently rejects out-of-range values (medium severity)

**File:** `NumberInput.tsx`, lines 78-100

When the user types a number outside the `min`/`max` range, `parseNumberInput` returns `null` and the `onChange` callback is never fired. The value simply doesn't update, with no feedback to the user about why. The `isInputValid` flag (line 149-152) will be `false`, which sets `aria-invalid`, but there is no visible error message explaining the constraint. Consider either clamping the value to the range or displaying a validation message.

### 3. Pending input is not reset when `value` prop changes externally (low severity)

**File:** `NumberInput.tsx`, lines 142-148

If the parent updates the `value` prop while the user has pending (uncommitted) input in the field, the pending input will continue to be displayed because `pendingInput` is only cleared on blur (line 193). This means an external value update is invisible to the user until they blur the field. This is a deliberate trade-off to avoid disrupting the user's typing, but it could be confusing if the parent resets the value (e.g., via a "Reset" button).

### 4. `onChange` type narrowing with discriminated union may confuse consumers (low severity)

**File:** `NumberInput.tsx`, lines 56-68

The discriminated union on `hasClear` controls whether `onChange` accepts `number | null` or just `number`. This is a clever pattern, but when `hasClear` is `false` (the default), the user cannot clear the field, yet they can still erase all text. On blur, the field reverts to the last valid value silently. This behavior is correct but may surprise consumers who expect `onChange` to fire with some indication that the field is empty.

---

## Unclear API

### 1. No JSDoc comments on any props (medium severity)

**File:** `NumberInput.tsx`, lines 24-54

Unlike `TextInput`, which has JSDoc comments on every prop in its interface, `NumberInputBaseProps` has zero documentation. Props like `isIntegerOnly`, `hasClear`, `units`, `step`, and the relationship between `min`/`max` and validation behavior are not documented.

### 2. `null` vs `undefined` inconsistency in optional props (low severity)

**File:** `NumberInput.tsx`, lines 39-40, 50-53

Several props use `number | null` (e.g., `max`, `min`, `step`, `units`) rather than the more conventional `number | undefined`. This forces consumers to explicitly pass `null` to "unset" a value. The `value` prop also accepts `number | null`. While internally consistent, this differs from the HTML convention where `undefined` means "not specified."

### 3. `labelIcon` prop exists on NumberInput but not TextInput

**File:** `NumberInput.tsx`, line 37

`NumberInput` accepts a `labelIcon` prop that `TextInput` does not. This inconsistency between sibling input components may confuse consumers building forms with mixed input types.

### 4. Missing `endContent` and `isLoading` props (informational)

**File:** `NumberInput.tsx` vs `TextInput.tsx`

`TextInput` supports `endContent` (line 39) and `isLoading` (line 63) props that `NumberInput` does not. If these are intentionally omitted, that's fine, but it creates an asymmetry between the two input components.

---

## Missing Tests

### 1. No test for `min`/`max` boundary enforcement

The test file does not verify that typing a number outside the `min`/`max` range is rejected or that the value clamps correctly.

### 2. No test for `isIntegerOnly`

No test verifies that decimal input is rejected when `isIntegerOnly` is `true`.

### 3. No test for `isDisabled` state

No test verifies that the input is non-interactive when disabled, or that the clear button is hidden when disabled.

### 4. No test for `status` rendering

No test verifies that error/warning/success status icons or messages are rendered, or that `aria-invalid` is set for error status.

### 5. No test for `onBlur` committing pending input

The two-phase input model (type to set pending, blur to commit) is not tested. This is a core behavior of the component.

### 6. No test for `onEnter` callback

No test verifies that pressing Enter triggers the `onEnter` callback.

### 7. No test for `units` display

No test verifies that the units suffix renders when provided.

### 8. No test for `pendingInput` / display value behavior

No test verifies that the displayed value reflects what the user is actively typing (even if invalid), rather than the committed `value` prop.

### 9. No test for keyboard step behavior

No test verifies that arrow keys increment/decrement by the `step` value.

### 10. No test for InputGroup integration

No test verifies that the component renders correctly inside an `InputGroup` (without the wrapping `Field`).

---

## Missing Stories

### 1. No story for `isDisabled`

There is no story showing the disabled state of the input.

### 2. No story for `status` variants

No stories for error, warning, or success status states. `TextInput` has a `WithStatus` story that could serve as a template.

### 3. No story for `isIntegerOnly`

No story demonstrating integer-only mode, which is a distinctive feature of this component.

### 4. No story for `min`/`max` constraints

While `WithUnits` sets `min: 0, max: 100`, there is no dedicated story that highlights boundary validation behavior.

### 5. No story for `size` variants

No stories showing `sm`, `md`, and `lg` sizes.

### 6. No story for `startIcon`

No story demonstrating the start icon slot.

### 7. No story for `isRequired` / `isOptional`

No stories showing required or optional field labeling.

### 8. No story for `description`

No story showing the description text below the label.

### 9. No interactive / controlled story

Both existing stories use static `value` and no-op `onChange`. There is no story demonstrating actual interactive behavior (e.g., using Storybook's `useArgs` or `useState` to make the input functional). This makes it impossible to manually test typing, clearing, and validation in Storybook.

### 10. No story for `placeholder`

No story demonstrating placeholder text.

---

## Summary

| Category        | Critical | Medium               | Low | Informational |
| --------------- | -------- | -------------------- | --- | ------------- |
| Performance     | 0        | 0                    | 2   | 0             |
| Accessibility   | 0        | 0                    | 3   | 1             |
| Logic Bugs      | 0        | 2                    | 2   | 0             |
| Unclear API     | 0        | 1                    | 2   | 1             |
| Missing Tests   | --       | 10 missing scenarios | --  | --            |
| Missing Stories | --       | 10 missing stories   | --  | --            |

The component's core logic is sound, but it is significantly under-tested and under-storied relative to its complexity. The two-phase input model (pending input on type, commit on blur) is the most sophisticated behavior and has zero test coverage. The API would benefit from JSDoc documentation to match the standard set by `TextInput`. The silent rejection of out-of-range values (returning `null` from `parseNumberInput` with no user feedback) is the most impactful logic concern.
