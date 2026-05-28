# Switch Component Audit

Audited files:

- `src/components/Switch/Switch.tsx` (411 lines)
- `src/components/Switch/Switch.stories.tsx` (40 lines)
- `src/components/Switch/Switch.test.tsx` (45 lines)
- `src/components/Switch/index.ts` (6 lines)

No recipe file exists for this component (inline `css()` calls are used instead).

---

## Performance

### P1: Styles object is re-evaluated per module load but not per render (Good)

The `styles` constant (lines 113-255) is defined at module scope with `css()` calls, so class names are generated once. No performance issue here.

### P2: No `React.memo` wrapping

The `Switch` function component (line 260) is not wrapped in `React.memo`. For a controlled component that receives `isSelected` from a parent, this means every parent re-render triggers a Switch re-render even when props are unchanged. Given that Switch is a leaf component often used in lists or forms, adding `React.memo` would be a low-cost improvement.

### P3: Inline arrow in `onChange` handler (line 305)

```tsx
onChange={event => onChange?.(event.target.checked, event)}
```

A new function reference is created on every render. This is a minor concern -- it only matters if the component were memoized (see P2), since the inline closure would defeat `React.memo` without a stable reference. If `React.memo` is added, this handler should be wrapped in `useCallback`.

---

## Accessibility

### A1: Loading state disables the input but does not convey the reason via ARIA (line 302)

When `isLoading` is true, the input is disabled (`disabled={isDisabled || isBusy}`, line 302). Disabling during loading prevents user interaction, which is correct, but `aria-busy={isBusy || undefined}` (line 296) is set on the input. There is a `<span role="status">Loading</span>` in a `VisuallyHidden` wrapper (lines 324-328), but this status announcement is a **sibling** of the `<span className={styles.control}>` container and is not linked to the input via `aria-describedby`. Screen readers may not associate the "Loading" announcement with this specific switch if multiple switches are on the page.

**Recommendation:** Include the loading status element's ID in the `aria-describedby` of the input.

### A2: Missing `aria-label` or `aria-labelledby` when label is visually hidden

When `isLabelHidden` is true (lines 381, 392), the label is wrapped in `VisuallyHidden` which renders a `<span>` with clip styles. The `<label htmlFor={inputId}>` inside still associates with the input via `htmlFor`/`id`, so assistive technology **can** find the label. This is correct. No issue.

### A3: Tooltip trigger inside `<label>` is not keyboard-focusable (line 352-356)

```tsx
<Tooltip content={labelTooltip}>
  <span className={styles.tooltipIcon}>
    <Icon icon={Info} size="sm" />
  </span>
</Tooltip>
```

The tooltip trigger is a `<span>`, which is not focusable by default. Users who navigate by keyboard cannot reach the tooltip. The trigger should be a `<button>` (or have `tabIndex={0}` and appropriate role) to be keyboard-accessible. Additionally, placing an interactive element (tooltip trigger) inside a `<label>` means clicking the info icon will also toggle the switch, which is likely unintended.

**Recommendation:** Move the tooltip trigger outside the `<label>` element, and make it a focusable element (e.g., `<button type="button">`).

### A4: `role="switch"` on `type="checkbox"` (line 309-310)

Using `role="switch"` on `<input type="checkbox">` is an accepted WAI-ARIA pattern. No issue.

### A5: Status message lacks an icon for color-blind users (lines 397-405)

The status banner uses background colors (`yellow.100`, `red.100`, `green.100`) to differentiate warning/error/success (line 179-183). Other Field-based components in this codebase use `getStatusIcon()` from `inputUtils.tsx` to show an icon alongside the message. The Switch status banner uses only color, which does not meet WCAG 1.4.1 (Use of Color). Consider adding a status icon as other input components do.

### A6: `cursor: pointer` on label but no hover/active indication on the track

The label has `cursor: pointer` (line 145) but the track (`pointerEvents: 'none'`, line 222) relies on the hidden input overlay for click handling. This is fine functionally, but there is no visual hover state on the track/thumb to indicate interactivity. Consider adding a subtle hover style.

---

## Logic Bugs

### L1: `isOptional` and `isRequired` can both be true simultaneously

`SwitchProps` allows both `isOptional` and `isRequired` to be `true` at the same time (lines 54-60). The `requirednessText` logic (lines 288-292) gives `isOptional` priority over `isRequired`, so if both are passed, the label says "Optional" while the input has `required={true}` (line 308). This is contradictory and could confuse both users and form validation.

**Recommendation:** Add a runtime warning (or a TypeScript discriminated union) to prevent both props from being true.

### L2: `isLoading` disables the track visually only when `isDisabled` is true (line 317)

The track applies `styles.trackDisabled` only when `isDisabled` is true:

```tsx
isDisabled ? styles.trackDisabled : undefined,
```

But when `isLoading` is true (and `isDisabled` is false), the input is disabled (line 302: `disabled={isDisabled || isBusy}`) without the track receiving the disabled visual style (reduced opacity). This means the switch **looks enabled** but **behaves as disabled** during loading. The spinner inside the thumb partially compensates, but the track opacity should also reflect the disabled state.

**Recommendation:** Change line 317 to: `(isDisabled || isBusy) ? styles.trackDisabled : undefined`

### L3: `onChange` callback signature differs from native convention

The `onChange` prop (line 94) passes `(checked: boolean, event: ChangeEvent)` -- boolean first, event second. While documented, this differs from native React patterns and most other component libraries where the event comes first. This is a design choice, not a bug, but worth noting as it may surprise consumers.

---

## Unclear API

### U1: `isSelected` vs common `checked` naming

The prop is named `isSelected` (line 64) rather than the more conventional `checked` or `isChecked`. While consistent with an "is"-prefix convention, it may cause confusion since the underlying element is a checkbox input with a `checked` attribute. Most switch component libraries use `checked`.

### U2: `labelSpacing="spread"` semantics are unclear

The prop name `labelSpacing` with value `"spread"` (lines 21, 80-82) is not immediately intuitive. It sets `justify-content: space-between` and `width: 100%`, effectively pushing the label and switch to opposite ends of the container. A name like `fullWidth` or `justify="space-between"` might communicate intent more clearly.

### U3: No `name` prop

The `<input>` has no `name` prop available in `SwitchProps`. For form submissions (including FormData-based patterns), the `name` attribute is essential. This limits the Switch to purely controlled/JS-driven use cases.

### U4: No `value` prop

Similarly, there is no `value` prop, which is useful for identifying which switch was toggled in a form or when multiple switches share an `onChange` handler.

---

## Missing Tests

The test file has only 3 tests (45 lines). For a component with 18 props, this is minimal. Compared to the codebase median (~100-200 lines for similar-complexity components), coverage is thin.

### T1: No test for `isLabelHidden`

No test verifies that the label is visually hidden but still accessible to screen readers when `isLabelHidden={true}`.

### T2: No test for `labelPosition`

No test verifies that `labelPosition="start"` renders the label before the switch control in the DOM.

### T3: No test for `labelSpacing="spread"`

No test verifies the spread layout behavior.

### T4: No test for `status` rendering

No test verifies that status messages render with the correct role (`alert` for error, `status` for warning/success) and that `aria-invalid` is set for error status.

### T5: No test for `description`

No test verifies that the description text renders and is associated with the input via `aria-describedby`.

### T6: No test for `isRequired` / `isOptional` text

No test verifies the "Required" / "Optional" indicator text appears correctly.

### T7: No test for `labelTooltip`

No test verifies the tooltip trigger renders when `labelTooltip` is provided.

### T8: No test for `labelIcon`

No test verifies the icon renders adjacent to the label text.

### T9: No test for `onBlur` / `onFocus` callbacks

No test verifies that blur and focus event handlers are called.

### T10: No test for `data-testid`

No test verifies the test ID is applied to the input element.

### T11: No test for disabled switch preventing onChange

The disabled test (line 39-44) checks that the element is disabled and shows loading text, but does not verify that clicking a disabled switch does **not** call `onChange`.

### T12: No test for `ref` forwarding

No test verifies the ref is forwarded to the underlying input element.

---

## Missing Stories

The stories file has only 3 stories (40 lines). Many props have no dedicated story.

### S1: No story for `labelPosition="start"`

This prop changes the visual layout significantly but has no story demonstrating it.

### S2: No story for `labelSpacing="spread"`

The spread layout (label and switch at opposite ends of a container) has no visual demonstration.

### S3: No story for `isLabelHidden`

No story shows the visually-hidden label variant.

### S4: No story for `labelIcon`

No story demonstrates a switch with an icon in the label.

### S5: No story for `labelTooltip`

No story demonstrates the info tooltip next to the label.

### S6: No story for `isRequired` / `isOptional`

No story shows the "Required" or "Optional" indicator text.

### S7: No story for `description`

While `description` is set as a default arg in `meta.args` (line 10), there is no dedicated story that **contrasts** a switch with and without a description, or shows a long description.

### S8: No story for `status` variants (warning, success)

Only the `Error` story exists (line 37). Warning and success status variants are not demonstrated.

### S9: No story for combined loading + disabled state

The `States` story shows disabled and loading separately but not their combination, and doesn't show loading in the "off" position.

### S10: `SwitchStory` wrapper discards the second `onChange` argument (line 21)

```tsx
function SwitchStory(args: React.ComponentProps<typeof Switch>) {
  const [isSelected, setIsSelected] = useState(args.isSelected);
  return <Switch {...args} isSelected={isSelected} onChange={setIsSelected} />;
}
```

`onChange` passes `(checked: boolean, event: ChangeEvent)`, but `setIsSelected` only accepts `boolean`. The event argument is silently dropped. This is fine for a story wrapper, but if the story is used as a usage example, it gives consumers the wrong impression of the API shape.

---

## Summary of Highest Priority Issues

| ID  | Category        | Severity | Description                                                        |
| --- | --------------- | -------- | ------------------------------------------------------------------ |
| A3  | Accessibility   | High     | Tooltip trigger is not keyboard-accessible and is inside `<label>` |
| L2  | Logic Bug       | High     | Loading state does not apply disabled visual style to track        |
| A5  | Accessibility   | Medium   | Status message relies on color alone, no icon                      |
| A1  | Accessibility   | Medium   | Loading status not linked to input via `aria-describedby`          |
| L1  | Logic Bug       | Medium   | `isOptional` and `isRequired` can both be true                     |
| T\* | Missing Tests   | Medium   | Only 3 tests for 18 props; critical behaviors untested             |
| S\* | Missing Stories | Low-Med  | 10+ props have no dedicated story                                  |
| U3  | API             | Low-Med  | No `name` prop for form integration                                |
| P2  | Performance     | Low      | No `React.memo` wrapping                                           |
