# PasswordInput Component Audit

**Files reviewed:**

- `src/components/PasswordInput/PasswordInput.tsx`
- `src/components/PasswordInput/PasswordInput.stories.tsx`
- `src/components/PasswordInput/PasswordInput.test.tsx`
- `src/components/PasswordInput/index.ts`

Related files consulted:

- `src/components/TextInput/TextInput.tsx` (parent component)
- `src/components/Field/inputStyles.ts` (shared styles)

---

## Performance

No significant issues found. The component is a thin wrapper around `TextInput` with a single `useState` hook for visibility toggling. The toggle button's `onClick` handler uses a functional updater (`v => !v`), which is correct.

### P1. Toggle button `endContent` is re-created on every render (PasswordInput.tsx, lines 32-45)

The JSX tree passed as `endContent` is a new object reference on every render. This is standard React behavior and is unlikely to cause measurable performance issues in practice, since `TextInput` does not memoize `endContent`. However, if `TextInput` were ever wrapped in `React.memo`, this would defeat memoization. This is a low-priority observation, not an actionable issue.

---

## Accessibility

### A1. Toggle button uses `clearButton` style class, which has no `_disabled` cursor (PasswordInput.tsx, line 35; inputStyles.ts, lines 74-93)

When `isDisabled` is true, the toggle button receives `disabled={true}` (PasswordInput.tsx, line 36), which is correct. However, the `clearButton` CSS class does not include a `_disabled` cursor rule, so the disabled toggle button will show the default cursor rather than `not-allowed`. This is inconsistent with the input itself, which shows `cursor: not-allowed` via `inputStyles.control` (inputStyles.ts, line 58) and `inputStyles.wrapperDisabled` (inputStyles.ts, line 38).

**Recommendation:** Add `_disabled: { cursor: 'not-allowed' }` to the `clearButton` style in `inputStyles.ts`, which will also fix this for the clear button in TextInput and other components.

### A2. Visibility state is not announced to screen readers (PasswordInput.tsx, lines 25-49)

When the user clicks the toggle button, the input type changes between `password` and `text`, and the button's `aria-label` changes between "Show password" and "Hide password". The `aria-label` change is good, but screen readers may not announce the state change because the button label is not an ARIA live region and the focus remains on the button, not the input.

**Recommendation:** Consider adding `aria-pressed={isVisible}` to the toggle button to communicate the toggled state semantically. This would make the button a toggle button (consistent with `role="button"` and `aria-pressed`), which is the WAI-ARIA pattern for show/hide controls.

### A3. No `autocomplete="current-password"` or `autocomplete="new-password"` support (PasswordInput.tsx)

The component does not expose an `autoComplete` prop. Password managers rely on the `autocomplete` attribute to identify password fields. While `TextInput` does not currently support `autoComplete` either, this is a more critical gap for password inputs specifically.

**Recommendation:** Add an `autoComplete` prop (or pass through the HTML `autoComplete` attribute) so consumers can set `autocomplete="current-password"` or `autocomplete="new-password"`.

---

## Logic Bugs

### L1. `hasClear` and the eye toggle can coexist, producing two adjacent buttons (PasswordInput.tsx; TextInput.tsx, lines 202-211)

The `PasswordInputProps` type omits `endContent`, `startIcon`, and `type` from `TextInputProps`, but it does NOT omit `hasClear`. If a consumer passes `hasClear={true}` with a non-empty value, TextInput renders both the clear button (X icon) AND the eye toggle button side by side. When the clear button is clicked, it calls `onChange?.('', null)` to clear the value, but the password toggle remains. This is not a crash, but it is likely an unintended UX: two icon buttons of the same size in the end slot may confuse users, and clearing a password field is an unusual pattern.

**Recommendation:** Either omit `hasClear` from `PasswordInputProps` (add it to the `Omit` list), or explicitly set `hasClear={false}` when passing props to `TextInput`.

### L2. Password visibility persists after the input is disabled (PasswordInput.tsx, lines 25, 36)

If a user toggles visibility to "shown" and then the component becomes disabled, the password remains visible as plain text (`type="text"`). The disabled toggle button prevents the user from hiding it again. This could be a security concern in scenarios where a form is disabled after submission but remains visible on screen.

**Recommendation:** Consider resetting `isVisible` to `false` when `isDisabled` changes to `true`, using a `useEffect`.

---

## Unclear API

### U1. `startIcon` is omitted but some consumers may want it (PasswordInput.tsx, line 9)

The `Omit` list removes `startIcon` from the props. A lock icon before a password field is a common UX pattern. The omission is likely intentional to keep the component focused, but it is undocumented and may surprise consumers.

**Recommendation:** Either re-expose `startIcon` or add a JSDoc comment explaining why it is excluded.

### U2. No controlled visibility prop (PasswordInput.tsx, line 25)

The visibility toggle is entirely internal state. There is no `isVisible` / `onVisibilityChange` prop pair. If a consumer needs to programmatically show the password (e.g., a "show all passwords" toggle in a settings form), they cannot.

**Recommendation:** This is a design decision, not necessarily a bug. If the component is intended to be simple, the current approach is fine. If advanced use cases are expected, consider an optional controlled mode via `isVisible` / `defaultIsVisible` / `onVisibilityChange`.

---

## Missing Tests

### T1. No test for `hasClear` interaction (PasswordInput.test.tsx)

As noted in L1, `hasClear` is not omitted from the props. There is no test verifying the behavior when both `hasClear={true}` and the toggle button are present simultaneously.

### T2. No test for `ref` forwarding (PasswordInput.test.tsx)

The component accepts a `ref` prop (PasswordInput.tsx, line 14) and passes it through to TextInput. No test verifies that the ref is correctly attached to the underlying `<input>` element.

### T3. No test for `status` prop rendering (PasswordInput.test.tsx)

The stories include a `WithStatus` story, but there is no test verifying that the status message and error styling are correctly applied when `status` is passed.

### T4. No test for `size` prop (PasswordInput.test.tsx)

The `size` prop is inherited from TextInput and controls the visual height. No test verifies this prop is correctly forwarded.

### T5. No test for keyboard interaction with the toggle button (PasswordInput.test.tsx)

All tests use `user.click()` for the toggle. There is no test for keyboard-based toggling (e.g., pressing Enter or Space on the toggle button). While this is handled by the browser for `<button>`, it is good practice to test the full interaction path.

### T6. No test verifying `type` prop cannot be overridden (PasswordInput.test.tsx)

The `type` prop is omitted from `PasswordInputProps`, so TypeScript prevents it at compile time. However, a runtime test confirming that the rendered input is always `type="password"` (or `type="text"` when toggled) and cannot be accidentally set to `type="email"` would guard against regressions if the Omit is accidentally removed.

---

## Missing Stories

### S1. No story for `isRequired` or `isOptional` (PasswordInput.stories.tsx)

Both props are inherited from TextInput and affect the label rendering (adding a required indicator or "(optional)" text). No story demonstrates either.

### S2. No story for `size` variants (PasswordInput.stories.tsx)

The `size` prop (`sm`, `md`, `lg`) is available but not demonstrated. A story showing all three sizes would help verify the toggle button alignment at different heights.

### S3. No story for `description` (PasswordInput.stories.tsx)

The `description` prop renders helper text below the label. This is commonly used for password requirements (e.g., "Must be at least 8 characters"). No story demonstrates this.

### S4. No story for `isLoading` (PasswordInput.stories.tsx)

The `isLoading` prop shows a spinner in the input. When combined with the toggle button, it is worth verifying that both fit correctly. No story demonstrates this.

### S5. No story for `hasClear` combined with toggle (PasswordInput.stories.tsx)

As noted in L1, `hasClear` is not omitted. If it is intended to work, a story should demonstrate the two-button layout. If it is not intended, the prop should be omitted from the type.

### S6. No story for `labelTooltip` (PasswordInput.stories.tsx)

The `labelTooltip` prop is available but not demonstrated.

### S7. No story for `isLabelHidden` (PasswordInput.stories.tsx)

This prop visually hides the label (useful for compact forms where the placeholder provides context). No story demonstrates this.

---

## Summary

The PasswordInput component is a clean, focused wrapper around TextInput. The core toggle functionality works correctly and the code is well-organized. The main findings are:

| Priority | Category        | Issue                                                          |
| -------- | --------------- | -------------------------------------------------------------- |
| Medium   | Logic Bug       | L1: `hasClear` not omitted, allows confusing two-button layout |
| Medium   | Accessibility   | A2: Toggle state not announced via `aria-pressed`              |
| Medium   | Accessibility   | A3: No `autoComplete` prop for password manager integration    |
| Low      | Accessibility   | A1: `clearButton` style missing `_disabled` cursor             |
| Low      | Logic Bug       | L2: Password stays visible when input becomes disabled         |
| Medium   | Missing Tests   | T1: No test for `hasClear` interaction                         |
| Medium   | Missing Tests   | T2: No test for ref forwarding                                 |
| Low      | Missing Tests   | T3: No test for status prop                                    |
| Medium   | Missing Stories | S1: No `isRequired`/`isOptional` story                         |
| Medium   | Missing Stories | S2: No `size` variants story                                   |
| Medium   | Missing Stories | S3: No `description` story (common for password hints)         |
| Low      | Missing Stories | S4-S7: Several inherited props not demonstrated                |
