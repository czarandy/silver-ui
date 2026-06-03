# Stepper Audit

## Summary

Stepper displays progress through a sequence of steps, supporting horizontal and vertical orientations, non-linear navigation (clickable steps), error/disabled states, custom icons, and step content areas. The architecture cleanly separates Stepper (provider/layout), Step (individual step rendering), StepperContext (shared state), and Step.recipe (styling). Tests and stories are comprehensive with good coverage of interactive and visual states.

## Issues

### Critical

- None

### High

- **`step` prop requires manual index assignment, creating a fragile API.** Consumers must manually pass `step={0}`, `step={1}`, etc. to each `<Step>`. If steps are reordered, added, or removed, the indices must be manually updated. This is error-prone and unlike most stepper APIs which auto-assign indices based on render order (via `React.Children.map` or similar). If a consumer accidentally duplicates or skips an index, the behavior will be incorrect with no warning.
- **`className` and `style` are forwarded to `<ol>` but `ref` is forwarded to `<nav>`.** In `Stepper.tsx`, the `ref` goes to the `<nav>` element while `className`, `style`, and `data-testid` go to the `<ol>`. This split makes it impossible for consumers to style the element they have a ref to, or get a ref to the element they are styling. The test verifies `data-testid` and `className` on the `<ol>` but `ref` on the `<nav>`, which is inconsistent.

### Medium

- **Non-clickable step indicators are `aria-hidden="true"`.** When a step is not clickable (no `onStepClick` or step is upcoming/disabled), the indicator renders as `<div aria-hidden="true">`. This hides the step number from screen readers entirely. While the label text is still accessible, the step number provides useful context (e.g., "step 3 of 5") that screen reader users lose. Consider keeping the indicator accessible with `aria-hidden` only on the decorative check/error icons, not the number.
- **No keyboard navigation between steps.** In non-linear mode, each clickable step is a separate button, but there is no arrow-key navigation between them (like a tablist pattern). Users must Tab through each step individually. For steppers with many steps, this creates excessive Tab stops. Consider implementing arrow-key navigation or a roving tabindex pattern.
- **Step does not communicate total step count.** There is no `aria-setsize` / `aria-posinset` or equivalent to tell assistive technology how many steps exist and which one is current. The `aria-current="step"` on the active step is good, but total count context is missing.

### Low

- **`onStepClick` in context is typed as `((index: number) => void) | null`.** The `null` type is used instead of `undefined`, which is slightly inconsistent with typical React patterns where optional callbacks are `undefined` when not provided.
- **`buttonReset` style in `Step.tsx` resets all button styles manually.** Consider using CSS `all: unset` or a shared button reset utility to reduce duplication.
- **`maxW: '120px'` on horizontal labels uses a hardcoded pixel value.** This limits label length but is not configurable by consumers. Long labels will be truncated or wrap awkwardly. Consider using a token or making this configurable.
- **No test for Step `ref` forwarding.** While `Stepper` ref forwarding is tested, `Step` ref forwarding is not explicitly tested.
- **No test for Step `style` prop.** The `style` prop on individual steps is not tested.
- **No story for a disabled step in non-linear mode.** The `States` story shows disabled steps but not in a non-linear context where the interaction difference matters.

## Recommendations

1. Consider auto-assigning step indices via `React.Children.map` to eliminate the manual `step` prop, or at minimum add a dev-mode warning when indices are non-sequential or duplicated.
2. Align `ref`, `className`, `style`, and `data-testid` to target the same element (either all on `<nav>` or all on `<ol>`).
3. Add `aria-setsize` and `aria-posinset` to step list items so screen readers know the total count.
4. Reconsider hiding step numbers from assistive technology when steps are non-clickable.
5. Add tests for Step `ref` and `style` forwarding.
