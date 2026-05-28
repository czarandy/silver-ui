# RadioGroup Component Audit

**Files reviewed:**

- `src/components/RadioGroup/RadioGroup.tsx`
- `src/components/RadioGroup/RadioGroupItem.tsx`
- `src/components/RadioGroup/RadioGroupContext.tsx`
- `src/components/RadioGroup/RadioGroup.stories.tsx`
- `src/components/RadioGroup/RadioGroup.test.tsx`
- `src/components/RadioGroup/index.ts`

---

## Performance Problems

### 1. Unstable `onChange` reference invalidates memoized context (Medium)

**File:** `RadioGroup.tsx`, lines 136-147

The `contextValue` is memoized with `useMemo`, which is correct, but `onChange` is listed as a dependency. If the parent does not memoize its `onChange` callback (e.g., passes an inline arrow function), the context value object is recreated on every render, causing all `RadioGroupItem` consumers to re-render.

This is a common pitfall with context-based component groups. Consider documenting that consumers should memoize `onChange`, or wrap it in a `useCallback` internally to stabilize the reference (comparing the function by wrapping with a ref).

### 2. `useId()` called unconditionally for unused `descriptionId` in RadioGroupItem (Low)

**File:** `RadioGroupItem.tsx`, line 148

`const descriptionId = useId()` is called on every render regardless of whether `description` is provided. While `useId` is cheap, this generates a DOM ID that is never used when `description` is `undefined`. This is a minor inefficiency.

---

## Accessibility Concerns

### 3. Field `<label htmlFor>` points at a `<div>` instead of an input (High)

**File:** `RadioGroup.tsx`, lines 149-183; `Field.tsx`, lines 193-198

The `Field` component renders a `<label htmlFor={inputId}>`. In `RadioGroup`, `inputId` is set on the `<div role="radiogroup">` (line 178). The HTML `<label>` element's `for` attribute is designed to associate with a labelable element (`<input>`, `<select>`, `<textarea>`, etc.), not a `<div>`. Clicking the label will not focus the radiogroup because `<div>` is not a labelable element.

The radiogroup div already has `aria-label={label}` (line 172), which provides the accessible name. However, the `<label>` rendered by `Field` creates a redundant/conflicting accessible name. The `aria-label` on the `<div role="radiogroup">` and the visible `<label>` text should ideally be connected via `aria-labelledby` instead of both `htmlFor` and `aria-label`.

**Recommendation:** Either use `aria-labelledby` pointing to the label's ID on the radiogroup div (and remove `aria-label`), or configure `Field` to render the label as a `<span>` instead of a `<label>` for group-type usages.

### 4. Duplicate accessible name: both `aria-label` and a `<label>` (Medium)

**File:** `RadioGroup.tsx`, line 172

The `<div role="radiogroup">` has `aria-label={label}`, while the `Field` component also renders a visible `<label>` element with the same text. Screen readers may announce the name twice or behave inconsistently. The proper pattern for a visible label on a radiogroup is `aria-labelledby` pointing to the label element's ID.

### 5. `aria-describedby` on the radiogroup div does not include error status for items (Low)

**File:** `RadioGroup.tsx`, lines 169, 134-135

The `describedby` value only references the description ID and the status message ID at the group level, which is correct. However, the `status` object is passed through context but is never used on individual `RadioGroupItem` inputs. The items' `<input>` elements do not reference the group-level status via `aria-describedby`. In practice, the group-level `aria-describedby` and `aria-invalid` (line 170) on the `role="radiogroup"` div should suffice for screen reader announcements, but this depends on the screen reader.

### 6. No `aria-orientation` on the radiogroup (Low)

**File:** `RadioGroup.tsx`, line 179

The `orientation` prop controls layout but is not communicated to assistive technology. Adding `aria-orientation={orientation}` to the `<div role="radiogroup">` would inform screen readers of the expected arrow-key navigation direction.

---

## Logic Bugs

### 7. No issues with controlled state logic

The controlled value/onChange pattern is correctly implemented. The context correctly distributes `value`, `onChange`, `name`, and `isDisabled` to items.

### 8. `status` in context is unused by RadioGroupItem (Low)

**File:** `RadioGroupContext.tsx`, line 12; `RadioGroupItem.tsx`

The `status` field is included in the context value (line 12) and set in `RadioGroup.tsx` (line 143), but `RadioGroupItem` never reads `context.status`. This means individual radio items have no visual or ARIA awareness of the group's validation state. If `status` was intended for item-level styling (e.g., error ring on the radio circle), it is not implemented. If not needed at the item level, removing it from the context would reduce unnecessary re-renders when status changes.

---

## Unclear API

### 9. `isOptional` and `isRequired` can be set simultaneously (Low)

**File:** `RadioGroup.tsx`, lines 46-51

Both `isOptional` and `isRequired` are independent boolean props. Setting both to `true` is contradictory. The `Field` component resolves the visual indicator in order (`isOptional` wins over `isRequired`), but there is no runtime warning. Consider making them mutually exclusive via a union type or documenting the precedence.

### 10. `onChange` is required even for read-only display (Low)

**File:** `RadioGroup.tsx`, line 63

`onChange` is typed as required (`onChange: (value: string) => void`). There is no `isReadOnly` prop, so consumers who want to display a static radio group must still pass a no-op `onChange`. Consider making `onChange` optional or adding an `isReadOnly` prop.

### 11. `value` type is limited to `string` (Low)

**File:** `RadioGroup.tsx`, line 89; `RadioGroupItem.tsx`, line 48

Both `RadioGroup.value` and `RadioGroupItem.value` are typed as `string`. While this is a common and reasonable design choice, it means consumers with numeric or enum-based identifiers must convert to/from strings. This is a design tradeoff, not a bug.

---

## Missing Tests

### 12. No test for item-level `isDisabled` (Medium)

**File:** `RadioGroup.test.tsx`

There is a test for group-level `isDisabled` (line 52), but no test verifying that a single `RadioGroupItem` can be disabled independently while others remain interactive.

### 13. No test for orientation rendering (Low)

**File:** `RadioGroup.test.tsx`

The `orientation` prop is not tested. A test could verify that the correct CSS class is applied for `horizontal` vs. `vertical`.

### 14. No test for error/validation status (Medium)

**File:** `RadioGroup.test.tsx`

There is no test verifying that `status={{ type: 'error', message: '...' }}` results in the correct `aria-invalid`, status message rendering, or `aria-describedby` association.

### 15. No test for `isRequired` (Low)

**File:** `RadioGroup.test.tsx`

There is no test verifying that `isRequired` sets `aria-required` on the radiogroup or `required` on the individual radio inputs.

### 16. No test for RadioGroupItem used outside RadioGroup (Low)

**File:** `RadioGroup.test.tsx`

`RadioGroupItem` throws an error when used without a `RadioGroup` parent (line 143-145 of `RadioGroupItem.tsx`). This behavior is not tested.

### 17. No test for `description` on RadioGroupItem (Low)

**File:** `RadioGroup.test.tsx`

The `description` prop on `RadioGroupItem` is not tested for rendering or for correct `aria-describedby` association on the input.

### 18. No test for keyboard navigation (Medium)

**File:** `RadioGroup.test.tsx`

There are no tests for arrow-key navigation between radio items within the group. Native radio inputs with the same `name` attribute support arrow-key navigation by default, but this should be verified.

### 19. No test for `data-testid` passthrough (Low)

**File:** `RadioGroup.test.tsx`

Neither `RadioGroup` nor `RadioGroupItem` `data-testid` prop is tested.

---

## Missing Stories

### 20. No story for `isDisabled` (Medium)

**File:** `RadioGroup.stories.tsx`

There is no story showing a fully disabled radio group or individual disabled items within an otherwise active group.

### 21. No story for `size="sm"` (Medium)

**File:** `RadioGroup.stories.tsx`

The `size` prop supports `'sm'` and `'md'`, but only the default `'md'` is shown. A story demonstrating `size="sm"` is missing.

### 22. No story for `isLabelHidden` (Low)

**File:** `RadioGroup.stories.tsx`

No story demonstrates the visually-hidden label variant.

### 23. No story for `isRequired` or `isOptional` (Low)

**File:** `RadioGroup.stories.tsx`

These props affect the visible label indicator text but have no dedicated stories.

### 24. No story for `startContent` or `endContent` on RadioGroupItem (Medium)

**File:** `RadioGroup.stories.tsx`

`RadioGroupItem` supports `startContent` and `endContent` props (e.g., for icons or badges), but neither is demonstrated in any story.

### 25. No story for warning or success status (Low)

**File:** `RadioGroup.stories.tsx`

Only `error` status is demonstrated. The `status` prop also supports `'warning'` and `'success'` types.

### 26. No story for `labelTooltip` (Low)

**File:** `RadioGroup.stories.tsx`

The `labelTooltip` prop is not demonstrated.

---

## Summary

| Category        | High | Medium | Low |
| --------------- | ---- | ------ | --- |
| Performance     | 0    | 1      | 1   |
| Accessibility   | 1    | 1      | 2   |
| Logic Bugs      | 0    | 0      | 1   |
| Unclear API     | 0    | 0      | 3   |
| Missing Tests   | 0    | 3      | 5   |
| Missing Stories | 0    | 3      | 4   |

**Most critical issue:** The `<label htmlFor>` / `aria-label` dual-naming pattern (issues #3 and #4) is the highest-priority accessibility concern. The Field component's `<label>` element uses `htmlFor` pointing at a non-labelable `<div>`, and the radiogroup div redundantly carries `aria-label`. This should be refactored to use `aria-labelledby` on the radiogroup pointing to the label element's ID.
