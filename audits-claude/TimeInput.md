# TimeInput Component Audit

**Files reviewed:**

- `src/components/TimeInput/index.ts`
- `src/components/TimeInput/TimeInput.tsx`
- `src/components/TimeInput/TimeInput.stories.tsx`
- `src/components/TimeInput/TimeInput.test.tsx`

No `.recipe.ts` file exists for this component (consistent with the sibling `TextInput` and `DateInput` components, which also omit recipe files).

---

## Performance Problems

### No Issues Found

The component is a thin controlled wrapper around a native `<input type="time">`. There are no expensive computations, effects, context subscriptions, or unnecessary re-renders. The `useId` call and conditional JSX are all lightweight. No memoization is needed at this level of complexity.

---

## Accessibility Concerns

### Minor: `isLoading` Disables Input Without Visual Disabled Style

- **TimeInput.tsx, line 111:** `disabled={isDisabled || isLoading}` disables the native input when loading.
- **TimeInput.tsx, lines 91-96:** The wrapper only applies `inputStyles.wrapperDisabled` when `isDisabled` is true, not when `isLoading` is true.

This means a loading input is functionally disabled but does not look disabled (no reduced opacity). The `aria-busy` attribute (line 103) is set, which is good, but the visual appearance may confuse sighted users who try to interact with the field and find it unresponsive. The `TextInput` component has the same pattern, so this may be intentional (the spinner provides the visual cue), but it is worth verifying.

### Minor: Clear Button Not Keyboard-Focusable When Loading

- **TimeInput.tsx, lines 129-137:** The clear button renders when `value != null && !isDisabled`, but does not check `isLoading`. If the input is loading and has a value, the clear button is visible and focusable, but clicking it calls `onChange` on a disabled input. This is a minor inconsistency -- the button should probably also be hidden or disabled when `isLoading` is true.

### Minor: Missing `aria-label` for the Clock Icon

- **TimeInput.tsx, lines 99-101:** The leading clock icon is decorative and rendered inside a `<span>`. Since it is inside the input wrapper and adjacent to the labeled input, this is acceptable (the icon does not need its own label). No change needed, but confirming it was reviewed.

### Info: `isOptional` and `isRequired` Are Mutually Contradictory

- **TimeInput.tsx, lines 28-29 and 57-58:** Both `isOptional` and `isRequired` can be set to `true` simultaneously. There is no guard or warning. This is inherited from the `Field` component and is consistent with `TextInput`, so it is not a TimeInput-specific bug, but consumers could produce confusing UI (a field labeled both "Optional" and marked `aria-required`).

---

## Logic Bugs

### Low Severity: `hasClear` Button Visible While `isLoading`

- **TimeInput.tsx, line 129:** The condition `hasClear && value != null && !isDisabled` does not account for `isLoading`. When `isLoading` is true, the clear button renders alongside the spinner. Clicking it calls `onChange?.(undefined)`, but the input is `disabled` and will not reflect the change visually until loading completes. This could lead to confusing behavior. Consider adding `&& !isLoading` to the condition, consistent with how `isDisabled` is handled.

### Low Severity: `step` Prop Can Conflict with `hasSeconds`

- **TimeInput.tsx, line 125:** `step={step ?? (hasSeconds ? 1 : 60)}`. If a consumer passes `hasSeconds={true}` and `step={3600}`, the browser will show a seconds field (because the step resolves to 3600, not 1), but it will be forced into hour-granularity increments. The interaction between these two props is not documented and could confuse consumers. Consider either:
  - Documenting that `step` overrides `hasSeconds` behavior.
  - Ignoring `step` when `hasSeconds` is explicitly set, or vice versa.

### Info: Unsafe Cast of `event.target.value`

- **TimeInput.tsx, line 120:** `event.target.value as ISOTimeString` performs an unchecked type assertion. If the browser ever emits a non-ISO value (unlikely for `type="time"`, but possible with polyfills or custom inputs), the consumer's `onChange` handler would receive a value that does not match the `ISOTimeString` type. This is standard practice for typed wrappers around native inputs and is not a real bug, but worth noting.

---

## Unclear API

### Missing JSDoc Comments on Props

- **TimeInput.tsx, lines 17-42:** The `TimeInputProps` interface has no JSDoc comments on any property. The sibling `TextInput` component (`TextInput.tsx`, lines 23-127) documents every prop with JSDoc. For consistency and discoverability (Storybook auto-generates doc tables from JSDoc), all props should have comments. The following props especially benefit from documentation:
  - `hasSeconds` -- what it controls (seconds segment visibility)
  - `hasClear` -- behavior of the clear button
  - `step` -- relationship to `hasSeconds`, units (seconds)
  - `min` / `max` -- expected format (`HH:MM` or `HH:MM:SS`)
  - `value` / `onChange` -- controlled component contract

### `ISOTimeString` Type Is Not Validated at Runtime

- **TimeInput.tsx, lines 13-15:** The type `ISOTimeString` uses template literal types for compile-time safety, which is good. However, there is no runtime validation or normalization. A consumer passing `value="9:00"` (missing leading zero) would get a TypeScript error but no runtime error. This is acceptable for a typed library, but worth mentioning in documentation.

### Placeholder Has Limited Effect

- **TimeInput.tsx, line 64:** `placeholder='Select a time'` is the default, but native `<input type="time">` in most browsers ignores the `placeholder` attribute entirely (the browser renders its own time picker UI). The prop exists but is effectively non-functional in Chrome, Firefox, and Safari. Consider either:
  - Removing the prop and the default value.
  - Documenting that placeholder behavior depends on the browser.

---

## Missing Tests

### Critical: Only One Test Case

- **TimeInput.test.tsx:** The test file contains a single test that verifies `onChange` is called with an ISO time string on change. The following behaviors are untested:

1. **Clear button:** No test verifies that clicking the clear button calls `onChange(undefined)`. Compare with `TextInput.test.tsx` which tests clearing.
2. **Disabled state:** No test verifies that a disabled input cannot be interacted with.
3. **Loading state:** No test verifies that `isLoading` disables the input and shows the spinner, or that `aria-busy` is set.
4. **`hasSeconds` prop:** No test verifies the step attribute changes or that seconds values are accepted.
5. **Empty string produces `undefined`:** The `onChange` handler (line 118) converts empty string to `undefined`. No test verifies this path.
6. **`min`/`max` constraints:** No test verifies the min/max attributes are rendered.
7. **Status rendering:** No test verifies that `status` produces `aria-invalid`, the status icon, or the status message.
8. **`isRequired`/`isOptional`:** No test verifies `aria-required` is set.
9. **Label association:** No test verifies the label is properly associated with the input (the existing test does use `getByLabelText`, which partially covers this).
10. **`ref` forwarding:** No test verifies that a ref correctly references the underlying `<input>` element.

### Test Uses `fireEvent` Instead of `userEvent`

- **TimeInput.test.tsx, line 11:** The test uses `fireEvent.change` from `@testing-library/react`. The sibling `TextInput.test.tsx` and `DateInput.test.tsx` both use `userEvent` from `@testing-library/user-event`, which more closely simulates real user interactions (focus, keystrokes, blur). For consistency and better testing fidelity, `userEvent` should be preferred.

---

## Missing Stories

### Only Two Stories Cover a 20+ Prop Component

- **TimeInput.stories.tsx:** The file defines only `Default` and `WithSeconds` stories. The following props and states have no story:

1. **`hasClear`:** No story demonstrates the clear button. This is a significant omission since `TextInput.stories.tsx` includes a `WithIconAndClear` story.
2. **`status` (error/warning/success):** No story demonstrates validation states. `TextInput.stories.tsx` includes a `WithStatus` story.
3. **`isDisabled`:** No story demonstrates the disabled state.
4. **`isLoading`:** No story demonstrates the loading spinner.
5. **`min` / `max`:** No story demonstrates time constraints (contrast with `DateInput.stories.tsx` which has `WithConstraints`).
6. **`size` (`sm` / `md` / `lg`):** No story demonstrates size variants.
7. **`isLabelHidden`:** No story demonstrates a hidden label.
8. **`isOptional` / `isRequired`:** No story demonstrates optional/required indicators.
9. **`description`:** No story demonstrates the description text below the label.
10. **`labelTooltip`:** No story demonstrates the label tooltip.

### No Interactive / Controlled Story

Both existing stories use static `value` args with no `onChange` handler wired up. There is no story that demonstrates the component in a controlled pattern (using Storybook `args` with actions or `useState`). Consumers visiting Storybook cannot interact with the time picker and see value changes reflected.

---

## Summary

| Category        | Severity    | Count                |
| --------------- | ----------- | -------------------- |
| Performance     | None        | 0                    |
| Accessibility   | Minor       | 2                    |
| Logic Bugs      | Low         | 2                    |
| Unclear API     | Moderate    | 3                    |
| Missing Tests   | Critical    | 9 untested behaviors |
| Missing Stories | Significant | 10 missing stories   |

The component implementation is solid and consistent with sibling input components. The main gaps are in **testing** (only 1 of ~10 important behaviors is tested), **stories** (only 2 of ~12 useful stories exist), and **documentation** (no JSDoc on props). The `isLoading` + clear button interaction is the most notable logic issue.
