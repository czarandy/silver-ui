# Progress Component Audit

**Files reviewed:**

- `src/components/Progress/Progress.tsx`
- `src/components/Progress/Progress.test.tsx`
- `src/components/Progress/index.ts`

**Missing files:**

- No `Progress.stories.tsx` exists
- No `Progress.recipe.ts` exists (component uses inline `css()` calls, which is acceptable given other components like Skeleton follow the same pattern)

---

## Performance

### P1. Inline `style` object created on every render (Progress.tsx, line 227)

The expression `{width: \`${percentage}%\`}`creates a new object reference each render. For a simple progress bar this is negligible, but if the component is rendered in a large list (e.g., a dashboard with many progress indicators), this can defeat`React.memo`optimizations on parent components. A`useMemo`keyed on`percentage` would avoid unnecessary object allocations.

**Severity:** Low. Only relevant in bulk-rendering scenarios.

### P2. `useId` is called unconditionally (Progress.tsx, line 174)

This is correct behavior and not a problem. Noted for completeness: the `labelId` is always used (either in the visible label or the visually-hidden fallback), so the hook call is justified.

No other performance issues found. The `styles` object is defined at module scope (lines 74-153) so CSS class names are computed once. The component has no expensive computations or derived state.

---

## Accessibility

### A1. `role="meter"` is used for determinate progress but may need `role="progressbar"` (Progress.tsx, line 221)

The component uses `role="meter"` for determinate state and `role="progressbar"` for indeterminate state. The ARIA spec distinguishes these: `meter` is for a known value within a range (like disk usage), while `progressbar` is for task completion. Both are valid roles, but using `meter` for determinate progress is semantically debatable. If the component represents task completion (e.g., file upload 60% done), `progressbar` is more appropriate. If it represents a static gauge (e.g., 60% disk used), `meter` is correct.

**Recommendation:** Consider making the role configurable via a prop (e.g., `role?: 'meter' | 'progressbar'`), or document the intended usage clearly. At minimum, add a JSDoc note explaining that `role="meter"` is intentional and when consumers should prefer a different approach.

### A2. No `aria-disabled` attribute when `isDisabled` is true (Progress.tsx, lines 181-229)

When `isDisabled` is true, the component applies visual disabled styling (gray fill and muted label text) but does not set `aria-disabled="true"` on the root element or the meter/progressbar. Assistive technology users will not know the progress bar is disabled.

**Recommendation:** Add `aria-disabled={isDisabled || undefined}` to the root `<div>` or the element with `role="meter"`.

### A3. Disabled track background has no dark mode variant (Progress.tsx, lines 98-100, 124)

The track background uses `bg: 'silver-neutral.100'` (line 124) and the disabled text uses `color: 'silver-neutral.400'` (line 99). Neither has a dark mode variant. In dark mode, `silver-neutral.100` will likely be nearly invisible against a dark background, making the track disappear. Compare with `panda.config.ts` lines 49-59 where `fg` and `bg` semantic tokens define both `base` and `_dark` values.

**Recommendation:** Use semantic tokens with dark mode variants for the track background and disabled colors, or add explicit `_dark` overrides.

### A4. Indeterminate animation does not fully stop for `prefers-reduced-motion` (Progress.tsx, lines 141-143)

The `prefers-reduced-motion` handler slows the pulse animation to 3s but does not stop it entirely. Compare with the Spinner component (Spinner.tsx, line 67) which sets `animation: 'none'` for reduced motion. Users who prefer reduced motion may still find a pulsing bar distracting.

**Recommendation:** Change the reduced-motion override to `animation: 'none'` and use a static visual indicator (e.g., a striped pattern or reduced opacity) to convey the indeterminate state.

### A5. `aria-valuemin` and `aria-valuemax` are omitted for indeterminate (Progress.tsx, lines 216-217)

When indeterminate, all `aria-value*` attributes are set to `undefined`. This is correct per the ARIA spec for `role="progressbar"` -- an indeterminate progressbar should omit `aria-valuenow`. No issue here.

---

## Logic Bugs

### L1. Division by zero is guarded but `max=0` produces misleading output (Progress.tsx, lines 155-157, 176)

When `max=0`, the percentage correctly defaults to `0` (line 176: `max > 0 ? ... : 0`). However, the default `formatValueLabel` (line 156) computes `Math.round((value / max) * 100)`, which produces `NaN%` when `max=0`. This `NaN%` string is then set as `aria-valuetext` (line 219) and displayed if `hasValueLabel` is true (line 204).

**Reproduction:** `<Progress label="Test" max={0} value={0} hasValueLabel />`

**Recommendation:** Guard `defaultFormatValueLabel` against `max === 0`:

```ts
function defaultFormatValueLabel(value: number, max: number): string {
  if (max === 0) return '0%';
  return `${Math.round((value / max) * 100)}%`;
}
```

### L2. No validation or warning when `max` is negative (Progress.tsx, line 176)

If `max` is negative, `Math.min(Math.max(0, value), max)` will clamp to `max` (a negative number), and `percentage` will be `0` (since `max > 0` is false). The `formatValueLabel` will again produce `NaN%` or misleading results. This is an edge case, but a console warning in development would help catch misuse.

**Severity:** Low. Negative `max` is clearly a misuse, but failing silently with `NaN%` is worse than a warning.

---

## Unclear API

### U1. `isDisabled` is described as "visually disabled" but behavior is ambiguous (Progress.tsx, line 34)

The JSDoc says "Whether the progress bar is visually disabled." This raises the question: is there a non-visual aspect to disabling a progress bar? A progress bar is not interactive, so "disabled" is unusual. Clarify whether this is meant for form contexts where a parent form is disabled, or purely for visual dimming to indicate staleness.

### U2. `isLabelHidden` and `hasValueLabel` interaction is not documented (Progress.tsx, lines 28-44)

When `isLabelHidden` is true and `hasValueLabel` is true, the header row is still rendered (line 187: `!isLabelHidden || showValueLabel`), with the label visually hidden and the value label visible. This behavior is correct but not obvious from the prop names alone. A JSDoc note on `isLabelHidden` explaining that the value label remains visible when both are set would help.

### U3. `variant` does not accept `'info'` unlike Badge and other components

The `ProgressVariant` type (lines 5-10) includes `accent`, `success`, `warning`, `neutral`, and `error`. Other components in the library (e.g., Badge) also include `info`. If `info` is a standard variant in the design system, its absence here should be intentional and documented.

---

## Missing Tests

### T1. No test for `isDisabled` prop (Progress.test.tsx)

The `isDisabled` prop affects visual styling (disabled colors on label, value label, and fill) but no test verifies this behavior. At minimum, test that the disabled CSS class is applied.

### T2. No test for `variant` prop (Progress.test.tsx)

No test verifies that different variants (`success`, `warning`, `error`, `neutral`) apply the correct CSS class. A basic test should confirm the fill element receives the expected variant class.

### T3. No test for `isLabelHidden` prop (Progress.test.tsx)

The `isLabelHidden` prop moves the label into a visually-hidden `<span>` (line 209). No test verifies the label is still present in the DOM for accessibility (it should be), or that the visually-hidden class is applied.

### T4. No test for `className` and `style` pass-through (Progress.test.tsx)

The component accepts `className` and `style` on the root element. No test verifies these are forwarded correctly.

### T5. No test for ref forwarding (Progress.test.tsx)

The component accepts a `ref` prop but no test confirms the ref attaches to the root `<div>`.

### T6. No test for `max=0` edge case (Progress.test.tsx)

As noted in L1, `max=0` causes `defaultFormatValueLabel` to return `NaN%`. There should be a test documenting the expected behavior for this edge case.

### T7. No test for `formatValueLabel` affecting `aria-valuetext` (Progress.test.tsx)

The test at line 21 checks that a custom `formatValueLabel` renders the value label text and sets `aria-valuetext`, which is good. However, there is no test for the default formatter producing correct percentage strings for non-trivial values (e.g., `value=1, max=3` should produce `33%`).

---

## Missing Stories

### S1. No stories file exists at all

There is no `Progress.stories.tsx` file. Every other component in the library (59 story files found) has stories. This is a significant gap for a component that ships multiple visual states.

The following stories should be created at minimum:

- **Default:** Basic determinate progress bar with a label.
- **Variants:** All five variants (`accent`, `success`, `warning`, `error`, `neutral`) rendered side by side.
- **WithValueLabel:** Demonstrates `hasValueLabel` with the default formatter.
- **CustomFormatter:** Demonstrates `formatValueLabel` with a custom format (e.g., `3 GB / 5 GB`).
- **Indeterminate:** Demonstrates `isIndeterminate` with the pulsing animation.
- **Disabled:** Demonstrates `isDisabled` visual state.
- **HiddenLabel:** Demonstrates `isLabelHidden` to show the label is visually hidden but the bar is still accessible.
- **CustomMax:** Demonstrates a non-100 `max` value (e.g., `max={5} value={3}`).

---

## Summary

The Progress component is well-implemented with solid fundamentals (value clamping, ARIA attributes, reduced-motion support, indeterminate state). The main gaps are the complete absence of stories and a division-by-zero bug in the default value formatter.

| Priority | Category        | Issue                                                                      |
| -------- | --------------- | -------------------------------------------------------------------------- |
| High     | Missing Stories | S1: No stories file exists                                                 |
| High     | Logic Bug       | L1: `max=0` causes `NaN%` in `aria-valuetext` and value label              |
| Medium   | Accessibility   | A2: No `aria-disabled` when `isDisabled` is true                           |
| Medium   | Accessibility   | A3: Track background has no dark mode support                              |
| Medium   | Accessibility   | A4: Indeterminate animation not fully stopped for `prefers-reduced-motion` |
| Medium   | Missing Tests   | T1: No test for `isDisabled`                                               |
| Medium   | Missing Tests   | T2: No test for `variant`                                                  |
| Medium   | Missing Tests   | T3: No test for `isLabelHidden`                                            |
| Low      | Accessibility   | A1: `role="meter"` vs `role="progressbar"` semantics                       |
| Low      | Logic Bug       | L2: Negative `max` silently produces `NaN%`                                |
| Low      | Missing Tests   | T5: No test for ref forwarding                                             |
| Low      | Missing Tests   | T6: No test for `max=0` edge case                                          |
| Low      | Performance     | P1: Inline style object created every render                               |
| Low      | Unclear API     | U1: `isDisabled` semantics on non-interactive element                      |
