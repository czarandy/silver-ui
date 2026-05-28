# CheckboxInput Audit

Files reviewed:

- `/Users/agoder/silver-ui/src/components/CheckboxInput/CheckboxInput.tsx`
- `/Users/agoder/silver-ui/src/components/CheckboxInput/CheckboxInput.stories.tsx`
- `/Users/agoder/silver-ui/src/components/CheckboxInput/CheckboxInput.test.tsx`
- `/Users/agoder/silver-ui/src/components/CheckboxInput/index.ts`

---

## Performance Problems

### 1. `mergeRefs` creates a new ref callback on every render (CheckboxInput.tsx, line 172)

`mergeRefs(ref, inputRef)` is called inline in JSX, producing a fresh `RefCallback` each render. React will call the old callback with `null` and the new callback with the element on every re-render. This is a minor but unnecessary cost. Consider memoizing the merged ref with `useMemo` or `useCallback`.

### 2. Inline `onChange` handler recreated every render (CheckboxInput.tsx, line 163)

The `onChange` arrow function closes over `isReadOnly`, `isLoading`, and `onChange`, and is recreated each render. This is a standard React pattern and low-severity for a leaf component, but worth noting if the component is rendered in large lists (e.g., it is used per-row inside `useTableSelection`).

### 3. No `React.memo` wrapper (CheckboxInput.tsx)

The component is a plain function component with no memoization. Given its use inside table rows (via `useTableSelection`), wrapping with `React.memo` or using `useMemo` at the call site could prevent unnecessary re-renders when parent state changes but checkbox props remain the same.

---

## Accessibility Concerns

### 1. CRITICAL: Focus ring never appears -- missing `peer` class (CheckboxInput.tsx, lines 83-87 and 158)

The visual checkbox box uses `_peerFocusVisible` (line 83) to show a focus outline. In Panda CSS, this condition generates the selector `.peer:is(:focus-visible) ~ &`, which requires the preceding sibling input element to have a CSS class named `peer`. However, the input's `className` on line 158 is only `styles.input` -- it does not include `'peer'`. As a result, keyboard users will never see a focus indicator on the checkbox. This is a WCAG 2.4.7 violation.

**Fix:** Add `'peer'` to the input's className: `className={cx('peer', styles.input)}`.

### 2. Missing `aria-required` on the input (CheckboxInput.tsx, line 174)

The component passes `required={isRequired}` (HTML attribute) but does not set `aria-required`. While the HTML `required` attribute implies `aria-required`, explicitly setting `aria-required` improves compatibility with older assistive technologies. TextInput sets `aria-required` (line 182 of TextInput.tsx) for consistency.

### 3. `isReadOnly` prevents change but does not visually indicate read-only state (CheckboxInput.tsx)

When `isReadOnly` is true, clicking the checkbox is silently blocked (line 164-166), and `readOnly` plus `aria-readonly` are set on the input. However, there is no visual differentiation (no opacity change, no cursor change on the box) to signal the read-only state to sighted users. The `readOnly` HTML attribute is also not natively meaningful on checkboxes -- the browser does not enforce it.

### 4. No visual error styling on the checkbox box itself (CheckboxInput.tsx)

When `status.type === 'error'`, the component sets `aria-invalid` on the input and the Field renders an error message below, but the checkbox box itself has no error border color or visual treatment. Other input components (TextInput) show a red border via `inputStyles.status[status.type]`. Users may not notice the error state at a glance.

### 5. `isLoading` prevents interaction but checkbox is not disabled (CheckboxInput.tsx, lines 164-166)

When `isLoading` is true, clicks are silently swallowed via `event.preventDefault()`, but the input is not `disabled` and the cursor remains `pointer`. The user can still focus and attempt to interact with no visible feedback that the control is temporarily unresponsive. This creates a confusing experience.

---

## Logic Bugs

### 1. `readOnly` + `onChange` handler uses `event.preventDefault()` but checkbox is native (CheckboxInput.tsx, lines 163-166)

The `onChange` handler calls `event.preventDefault()` for read-only/loading states, but at the point `onChange` fires on a native checkbox, the checked state has already been toggled by the browser. `preventDefault()` in a React synthetic `onChange` does not actually prevent the check state from changing visually -- it only prevents calling the user's `onChange` callback. Because the component is controlled (`checked={isChecked}`), React will reconcile the DOM back to the correct state on re-render, so this works in practice, but the `event.preventDefault()` call is misleading and has no effect. A simple `return` without `preventDefault` would be clearer.

### 2. `isReadOnly` and `isDisabled` can both be true simultaneously (CheckboxInput.tsx)

There is no guard or precedence logic if both `isDisabled` and `isReadOnly` are set. While not technically a crash, it produces redundant and potentially confusing ARIA attributes (`disabled` + `aria-readonly`).

---

## Unclear API

### 1. `value` is required but `onChange` is optional (CheckboxInput.tsx, lines 36, 42)

`value` is required (`value: CheckboxInputValue`) while `onChange` is optional. A required `value` with no `onChange` handler creates a controlled component that can never change -- React would warn about this for text inputs, but does not for checkboxes because of the `readOnly` attribute. It would be clearer to either make both optional (with a default `value` of `false`) or document that `onChange` should always be provided for interactive use.

### 2. Missing `htmlName` prop (CheckboxInput.tsx)

TextInput supports an `htmlName` prop for form submission. CheckboxInput does not, which prevents it from being used in native HTML form submissions without wrapping.

### 3. Missing `labelTooltip` prop (CheckboxInput.tsx)

TextInput supports `labelTooltip` to show extra info next to the label. CheckboxInput has `labelIcon` but not `labelTooltip`, which is an inconsistency in the API across form components.

### 4. Missing JSDoc comments on all props (CheckboxInput.tsx, lines 23-43)

TextInput props all have JSDoc descriptions. CheckboxInput props have none, making the component harder to use from an IDE.

### 5. `onChange` callback signature puts `checked` first, `event` second (CheckboxInput.tsx, line 36)

`onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void` -- while reasonable, this differs from native HTML checkbox `onChange(event)` and from TextInput's `onChange(value, event)` only in type. This is actually consistent, but worth documenting explicitly so consumers know the first argument is the _next_ boolean state, not the current one.

---

## Missing Tests

### 1. No test for `isDisabled` behavior (CheckboxInput.test.tsx)

There is no test verifying that a disabled checkbox does not fire `onChange` when clicked, or that the input element has the `disabled` attribute.

### 2. No test for `isReadOnly` behavior (CheckboxInput.test.tsx)

There is no test verifying that a read-only checkbox blocks changes.

### 3. No test for `isLoading` behavior (CheckboxInput.test.tsx)

There is no test verifying that loading state blocks interaction or shows a spinner.

### 4. No test for `status` / error state (CheckboxInput.test.tsx)

There is no test for `aria-invalid`, error message rendering, or `aria-describedby` linkage.

### 5. No test for `description` rendering (CheckboxInput.test.tsx)

There is no test verifying that the description text is rendered and linked via `aria-describedby`.

### 6. No test for `ref` forwarding (CheckboxInput.test.tsx)

There is no test confirming the forwarded ref points to the input element.

### 7. No test for `className` and `style` passthrough (CheckboxInput.test.tsx)

There is no test verifying that custom `className` and `style` are applied to the root element.

### 8. No test for `size` prop (CheckboxInput.test.tsx)

There is no test verifying that the `sm` and `md` sizes render correctly.

### 9. No test for keyboard interaction (CheckboxInput.test.tsx)

There is no test for toggling the checkbox via Space key, which is the primary keyboard interaction.

---

## Missing Stories

### 1. No story for `isDisabled` (CheckboxInput.stories.tsx)

There is no story demonstrating a disabled checkbox.

### 2. No story for `isReadOnly` (CheckboxInput.stories.tsx)

There is no story demonstrating a read-only checkbox.

### 3. No story for `isLoading` (CheckboxInput.stories.tsx)

There is no story demonstrating the loading spinner state.

### 4. No story for `status` (error/warning/success) (CheckboxInput.stories.tsx)

There is no story demonstrating validation states. TextInput has a `WithStatus` story for comparison.

### 5. No story for `description` (CheckboxInput.stories.tsx)

There is no story showing a checkbox with description text.

### 6. No story for `size="sm"` (CheckboxInput.stories.tsx)

There is no story demonstrating the small size variant.

### 7. No story for `labelIcon` (CheckboxInput.stories.tsx)

There is no story demonstrating the `labelIcon` prop.

### 8. No story for `isLabelHidden` (CheckboxInput.stories.tsx)

There is no story demonstrating a visually hidden label (used in table selection).

### 9. No interactive/controlled story (CheckboxInput.stories.tsx)

All three stories are static (no `args` for `onChange` with an action, no use of `useArgs` for toggling). There is no story that lets the user click and see the checkbox toggle in Storybook.

---

## Summary of Severity

| Issue                                                    | Severity |
| -------------------------------------------------------- | -------- |
| Missing `peer` class breaks focus ring                   | Critical |
| No visual error styling on checkbox box                  | Medium   |
| `isLoading` not visually distinct from interactive state | Medium   |
| No visual read-only indicator                            | Medium   |
| Only 2 tests covering basic functionality                | Medium   |
| Only 3 stories, all static, none interactive             | Medium   |
| Missing JSDoc on all props                               | Low      |
| Missing `htmlName` prop                                  | Low      |
| Missing `labelTooltip` prop                              | Low      |
| `mergeRefs` re-created each render                       | Low      |
| Misleading `event.preventDefault()` in onChange          | Low      |
