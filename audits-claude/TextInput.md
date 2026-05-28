# TextInput Audit

Files reviewed:

- `src/components/TextInput/TextInput.tsx`
- `src/components/TextInput/TextInput.stories.tsx`
- `src/components/TextInput/TextInput.test.tsx`
- `src/components/TextInput/index.ts`

Supporting files examined for context:

- `src/components/Field/Field.tsx`, `inputStyles.ts`, `inputUtils.tsx`, `types.ts`
- `src/components/InputGroup/InputGroupContext.ts`
- `src/components/NumberInput/NumberInput.tsx` (sibling input for pattern comparison)
- `src/components/TextArea/TextArea.tsx` (sibling input for pattern comparison)
- `src/components/PasswordInput/PasswordInput.tsx` (downstream consumer of TextInput)

---

## Performance Problems

No significant performance issues found.

- The component is a plain function component with no expensive computation. The only hook is `useId()` and a context read via `useInputGroup()`, both of which are cheap.
- The inline arrow functions on `onChange` (line 190) and `onKeyDown` (lines 191-195) create new closures each render. This is a minor concern that would only matter if the input were rendered inside a virtualized list or extremely performance-sensitive context. In practice, for a form control, this is fine.

---

## Accessibility Concerns

### 1. Missing `onBlur`/`onFocus` props (Medium)

**File:** `TextInput.tsx`

TextInput does not expose `onBlur` or `onFocus` props. Both sibling input components expose them:

- `NumberInput` exposes `onBlur` and `onFocus` (lines 41-42)
- `TextArea` exposes `onBlur` and `onFocus` (lines 36, 39)

This is a practical accessibility gap: consumers cannot implement validation-on-blur patterns, cannot track focus state for analytics, and cannot integrate with form libraries (e.g., react-hook-field, Formik) that rely on `onBlur` to mark fields as "touched". PasswordInput, which wraps TextInput, inherits this limitation.

### 2. Missing `autoComplete` prop (Low-Medium)

**File:** `TextInput.tsx`

NumberInput exposes `autoComplete` (line 26), but TextInput does not. The `autoComplete` attribute is important for accessibility and UX -- screen readers and browser autofill rely on it. For a text input that accepts `type="email"` or `type="password"`, omitting `autoComplete` means consumers cannot set values like `autoComplete="email"` or `autoComplete="current-password"`, which degrades both autofill behavior and accessibility conformance (WCAG 1.3.5 Identify Input Purpose).

### 3. Missing `readOnly` support (Low)

**File:** `TextInput.tsx`

There is no `isReadOnly` prop. A read-only input is semantically different from a disabled one (read-only values are still submitted with forms and are focusable). This is a less common need but worth noting.

### 4. Missing `aria-label` for standalone mode (Non-issue)

The component correctly uses `aria-label` when inside an `InputGroup` (line 181) and relies on `<label htmlFor>` via the `Field` wrapper in standalone mode. This is correct.

### 5. Clear button accessible when loading (Low)

**File:** `TextInput.tsx`, lines 202-210

When `isLoading` is true, the clear button is still visible and clickable. The loading spinner and clear button can appear simultaneously, which may be confusing. NumberInput does not have a loading state, so there is no direct comparison, but Button disables interaction while loading.

---

## Logic Bugs

### 1. `className` and `style` applied to wrapper div, not propagated to Field (Potential Confusion)

**File:** `TextInput.tsx`, lines 166-173 vs. 225-241

When rendered standalone (not inside InputGroup), `className` and `style` are applied to the inner input wrapper `<div>`, not to the outer `<Field>` root. This means consumers who want to control layout (e.g., `style={{marginBottom: '1rem'}}`) are styling the input box rather than the field container. This is consistent with NumberInput and TextArea, so it is an intentional pattern, but it may surprise consumers who expect to control the outer container. Documenting this or adding a `fieldClassName` prop could help.

### 2. `onEnter` fires even when IME composition is active (Low)

**File:** `TextInput.tsx`, lines 191-194

The `onKeyDown` handler does not check `event.isComposing`. In CJK (Chinese, Japanese, Korean) input methods, pressing Enter confirms the composition rather than submitting the form. Without an `event.isComposing` guard, `onEnter` will fire prematurely during IME composition. The fix is:

```tsx
if (event.key === 'Enter' && !event.isComposing) {
  onEnter?.();
}
```

NumberInput has the same issue (NumberInput.tsx line 210).

### 3. No `maxLength` support (Non-bug, Feature Gap)

TextArea supports `maxLength` with a character counter. TextInput does not expose a `maxLength` prop. This is a feature gap rather than a bug, but it means consumers must implement their own character limit logic.

---

## Unclear API

### 1. `onChange` callback signature passes `null` event on clear (Minor)

**File:** `TextInput.tsx`, line 206

When the clear button is clicked, `onChange` is called with `('', null)`. The `null` event in the second argument is a deviation from the standard pattern. The type signature (`event: ChangeEvent<HTMLInputElement> | null`) documents this, but it forces consumers to add a null check. An alternative would be to synthesize a change event or use a separate `onClear` callback. This is a design choice rather than a bug, but worth considering if the API is being reviewed.

### 2. `isOptional` and `isRequired` are not mutually exclusive (Minor)

**File:** `TextInput.tsx`, lines 67-70

Both `isOptional` and `isRequired` can be set to `true` simultaneously. The Field component handles this by preferring "Optional" in the label text (Field.tsx line 191: `isOptional ? 'Optional' : isRequired ? 'Required' : null`), but `aria-required` is still set on the input (TextInput.tsx line 182). This creates a contradictory state. Consider making these mutually exclusive via a union type or adding a runtime warning.

### 3. `startIcon` naming inconsistency (Cosmetic)

**File:** `TextInput.tsx`, line 110

The prop is named `startIcon` but accepts `ReactNode` (not just icons). NumberInput also uses `startIcon`. The Button component uses `icon` for the start position. This is a minor naming inconsistency; `startContent` would be more accurate (matching `endContent`), but changing it would be a breaking change.

---

## Missing Tests

The test file has only 2 tests. Compared to Button (28 tests) and even NumberInput (2 tests), TextInput is under-tested given its larger API surface.

### Missing test coverage:

1. **Disabled state** -- No test verifies that `isDisabled` renders a disabled input or that interactions are blocked.
2. **InputGroup integration** -- No test verifies that when inside an InputGroup context, the Field wrapper is omitted and `aria-label` is applied.
3. **Status rendering** -- No test verifies that error/warning/success status renders the status icon and sets `aria-invalid`.
4. **`aria-describedby` wiring** -- No test verifies that description text is linked to the input via `aria-describedby`.
5. **`onEnter` callback** -- No test verifies that pressing Enter calls `onEnter`.
6. **`onKeyDown` forwarding** -- No test verifies that arbitrary key events are forwarded.
7. **Loading state** -- No test verifies that `isLoading` sets `aria-busy` and shows a spinner.
8. **`isLabelHidden`** -- No test verifies the label is visually hidden but still accessible.
9. **Ref forwarding** -- No test verifies that `ref` is forwarded to the underlying `<input>` element.
10. **`type` prop** -- No test verifies that `type="email"` or `type="password"` is applied.
11. **`className` and `style` forwarding** -- No test verifies these are applied.
12. **`data-testid` forwarding** -- No test verifies the test ID is applied to the input.
13. **Placeholder** -- No test verifies placeholder text is rendered.
14. **Clear button hidden when value is empty** -- No test verifies the clear button does not appear when `value=""`.
15. **Clear button hidden when disabled** -- No test verifies the clear button does not appear when disabled.
16. **`endContent` rendering** -- No test verifies endContent is rendered.

---

## Missing Stories

The stories file has only 3 stories. Compared to Button (12 stories), coverage is thin.

### Missing story coverage:

1. **Sizes** -- No story demonstrates `size="sm"`, `size="md"`, `size="lg"` side by side.
2. **Disabled** -- No story shows `isDisabled`.
3. **Loading** -- No story shows `isLoading`.
4. **Description** -- No story shows the `description` prop.
5. **Label hidden** -- No story shows `isLabelHidden`.
6. **Optional / Required** -- No story demonstrates `isOptional` or `isRequired` indicators.
7. **Label tooltip** -- No story shows `labelTooltip`.
8. **End content** -- No story shows `endContent`.
9. **Password type** -- No story shows `type="password"` (though PasswordInput exists separately).
10. **All status types** -- Only `error` status is shown. No stories for `warning` or `success`.
11. **Placeholder only** -- No story shows a placeholder without a value (the Default story has `value: ''` which is fine, but an explicit placeholder-focused story could help).
12. **argTypes controls** -- Unlike Button stories, there are no `argTypes` defined, so Storybook's controls panel does not offer dropdowns for `size`, `status.type`, etc.

---

## Summary

| Category        | Severity | Count                                                                     |
| --------------- | -------- | ------------------------------------------------------------------------- |
| Performance     | None     | 0                                                                         |
| Accessibility   | Medium   | 2 (missing onBlur/onFocus, missing autoComplete)                          |
| Accessibility   | Low      | 2 (no readOnly, clear button during loading)                              |
| Logic Bugs      | Low      | 1 (onEnter fires during IME composition)                                  |
| API Clarity     | Minor    | 3 (null event on clear, isOptional/isRequired conflict, startIcon naming) |
| Missing Tests   | High     | 16 untested behaviors                                                     |
| Missing Stories | Medium   | 12 missing stories                                                        |

### Recommended priorities:

1. **Add `onBlur` and `onFocus` props** -- Required for form library integration and validation patterns. Blocking for real-world form usage.
2. **Add `autoComplete` prop** -- Important for email/password type inputs and WCAG compliance.
3. **Guard `onEnter` against IME composition** -- One-line fix, prevents bugs in CJK locales.
4. **Expand test coverage** -- At minimum, add tests for disabled state, status/aria-invalid, onEnter, ref forwarding, and InputGroup integration.
5. **Expand stories** -- Add stories for sizes, disabled, loading, description, and all status types. Add `argTypes` for interactive Storybook controls.
