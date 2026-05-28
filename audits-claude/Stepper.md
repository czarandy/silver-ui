# Stepper Component Audit

**Files reviewed:**

- `src/components/Stepper/Stepper.tsx`
- `src/components/Stepper/Step.tsx`
- `src/components/Stepper/StepperContext.ts`
- `src/components/Stepper/Stepper.stories.tsx`
- `src/components/Stepper/Stepper.test.tsx`
- `src/components/Stepper/index.ts`

---

## Performance

### P1. `handleClick` closure is recreated on every render (Step.tsx, line 353)

The `handleClick` function is defined inline inside the `Step` component without `useCallback`. Because `Step` reads `isClickable` and `onStepClick` from context and props, this closure is recreated on every render of every step whenever the parent `Stepper` re-renders (e.g., when `activeStep` changes). In practice, since `Step` is not wrapped in `React.memo`, this is not causing extra renders by itself, but it means every step's indicator button receives a new `onClick` reference on every render. For a typical 3-5 step stepper this is negligible.

**Recommendation:** No action required. If the component is later wrapped in `React.memo` for optimization, `handleClick` should be memoized with `useCallback`.

### P2. `getIndicatorClassName` and `getLabelClassName` are called on every render (Step.tsx, lines 290-312)

These helper functions call `cx()` with multiple conditional class names on every render. The cost is trivial (string concatenation) and the functions are appropriately defined at module scope. No issue.

### P3. `styles` objects are correctly module-scoped (Stepper.tsx lines 53-68, Step.tsx lines 69-258)

CSS class names from `css()` calls are computed once at module load time. This is the correct pattern.

**Overall:** No meaningful performance issues. The component is lightweight.

---

## Accessibility

### A1. Non-clickable indicator hides step number from assistive technology (Step.tsx, line 368)

When a step is not clickable, the indicator `<div>` is rendered with `aria-hidden="true"`. This means the step number (e.g., "1", "2", "3") is completely hidden from screen readers. The only programmatic text available to assistive technology is the label (e.g., "Account") and description, but there is no indication of the step's position in the sequence.

While the `<ol>` + `<li>` structure provides implicit ordering, the explicit step number that sighted users see is hidden. This creates an information asymmetry between visual and non-visual users.

**Recommendation:** Remove `aria-hidden="true"` from the non-clickable indicator div, or add `aria-label` or visually-hidden text to the `<li>` element that communicates the step's position (e.g., "Step 1 of 3: Account").

### A2. No step count communicated to assistive technology (Stepper.tsx / Step.tsx)

The stepper uses `<nav>` + `<ol>` + `<li>`, which is a good semantic foundation. However, screen reader users have no way to know the total number of steps without navigating through all of them. While `<ol>` provides ordering, many screen readers announce list items as "item N of M" only when focus enters the list, which may not happen if the stepper is non-interactive.

**Recommendation:** Consider adding an `aria-label` or `aria-roledescription` on each `<li>` that includes "Step X of Y" information, or document that consumers should use the `label` prop to include the step count (e.g., `label="Checkout (step 2 of 4)"`).

### A3. Error state is communicated only visually (Step.tsx, lines 271-273, 183-187)

When `hasError` is true, the step indicator turns red and shows a warning icon, but there is no programmatic indication of the error state. Screen reader users will not know a step has an error unless they happen to read the label text (which does not change) or the error icon has accessible text (it does not -- the non-clickable indicator is `aria-hidden`).

For clickable steps with errors, the button's `aria-label` is "Go to step N: Label" with no mention of the error.

**Recommendation:** Add `aria-invalid="true"` or include "Error" in the accessible label for error-state steps. For clickable error steps, update the button's `aria-label` to include the error state (e.g., "Go to step 2: Profile (error)").

### A4. Disabled state is not communicated on the `<li>` element (Step.tsx, line 326)

When `isDisabled` is true, the step is visually dimmed but the `<li>` element has no `aria-disabled` attribute. In non-linear mode, disabled steps simply do not render a button (which correctly prevents interaction), but screen reader users receive no indication that the step is disabled -- they just see a list item with a label.

**Recommendation:** Add `aria-disabled="true"` to the `<li>` element when `isDisabled` is true.

### A5. `<nav>` landmark with default label "Progress" is acceptable (Stepper.tsx, line 96)

The use of `<nav aria-label="Progress">` wrapping an `<ol>` is a well-established pattern (used by GOV.UK, W3C examples, etc.). The default label is appropriate.

### A6. Clickable indicator button has a good `aria-label` (Step.tsx, line 361)

The button uses `aria-label={`Go to step ${step + 1}: ${label}`}`, which is clear and actionable.

---

## Logic Bugs

### L1. `getStepState` priority means `hasError` overrides `isDisabled` (Step.tsx, lines 260-288)

The state precedence is: `error` > `disabled` > `active` > `completed` > `upcoming`. This means if both `hasError` and `isDisabled` are true, the step shows as "error" (red, with warning icon) rather than "disabled" (dimmed). This may be intentional, but it is surprising -- a disabled step with an error would appear interactive (red, prominent) despite being disabled.

**Recommendation:** Document the precedence, or consider whether `isDisabled` should take priority over `hasError`. At minimum, add a comment explaining the intended behavior.

### L2. `isCompleted` override combined with `activeStep` can produce contradictory states (Step.tsx, line 334)

A consumer can write `<Step step={2} isCompleted />` while `activeStep={0}`, making step 2 appear completed even though it is ahead of the active step. The connector line for this step would also show as completed (line 341), which could confuse users. This is by design (the prop is documented as "Override the automatically computed completed state"), but there is no validation or console warning for contradictory configurations.

**Recommendation:** This is acceptable as-is since the override is explicitly opt-in. No action required.

### L3. No validation of `step` prop ordering or uniqueness

The `step` prop is a raw number with no validation. Consumers can pass duplicate step indices, negative numbers, or non-sequential numbers without any warning. The component will render but may produce unexpected visual results (e.g., two steps appearing active).

**Recommendation:** Consider adding a development-mode warning in the `Stepper` component that validates child `step` props are sequential and unique. This is low priority.

### L4. `activeStep` beyond the range of children produces a valid but odd state (Stepper.tsx)

If `activeStep` is set to a value larger than the number of steps (e.g., `activeStep={5}` with 3 steps), all steps will appear completed and no step will be marked `aria-current="step"`. This is a natural consequence of the logic and is arguably correct (all steps are done), but it is undocumented.

**Recommendation:** Document this edge case behavior or add a development-mode warning.

---

## Unclear API

### U1. `step` prop requires manual index management (Step.tsx, line 62)

Each `<Step>` requires a `step` prop specifying its zero-based index. This is error-prone because consumers must manually keep the indices in sync with the child order. If a step is reordered or removed, all subsequent `step` values must be updated. Many stepper implementations (e.g., MUI) derive the index automatically from React children order.

**Recommendation:** Consider deriving the step index from child position via `React.Children.map` in the `Stepper` component, and making the `step` prop optional. The current approach works but adds maintenance burden for consumers.

### U2. `children` prop on `Step` only renders in vertical orientation (Step.tsx, lines 402-423 vs 426-441)

The `children` prop on `Step` (documented as "Content rendered below the label and description in vertical steppers") is silently ignored in horizontal orientation. There is no runtime warning. A consumer who passes children in horizontal mode will see nothing rendered and may be confused.

**Recommendation:** Either render children in horizontal mode (perhaps in a collapsible section below the step), throw a development warning when children are provided in horizontal mode, or make the type system prevent it (e.g., a discriminated union on orientation).

### U3. `isNonLinear` is inferred from `onStepClick` presence (Stepper.tsx, line 87)

The stepper determines whether it is "non-linear" (steps are clickable) solely by checking if `onStepClick` is provided. This coupling is fine for simple cases, but it means there is no way to have a non-linear stepper where the click handler is conditionally added later. This is a minor API quirk, not a real problem.

---

## Missing Tests

### T1. No test for error state rendering (Stepper.test.tsx)

The test on line 109 renders a step with `hasError` but only asserts that `screen.getByTestId('step')` is in the document. It does not verify that:

- The error icon (TriangleAlert) is rendered
- The error styling class is applied
- The label text still appears

**Recommendation:** Add assertions for the error indicator content (e.g., query for the SVG icon) and error-specific styling.

### T2. No test for connector line styling (Step.tsx, lines 338-341)

There are no tests verifying that the connector line between steps receives the correct styling based on completion state (completed connector vs. incomplete connector).

**Recommendation:** Add a test that verifies completed steps have a visually distinct connector from upcoming steps.

### T3. No test for vertical orientation with `onStepClick` (Stepper.test.tsx)

The `onStepClick` test (line 69) only tests horizontal orientation. Vertical orientation with clickable steps is not tested, but the rendering paths are different (lines 402-423 vs 426-441).

**Recommendation:** Add a test for vertical non-linear stepper to ensure buttons render correctly in the vertical layout.

### T4. No test for `isCompleted` override (Stepper.test.tsx, line 109)

The test on line 112 renders `<Step isCompleted label="Done" step={0} />` inside a stepper with `activeStep={0}`, so this step would be active by default. The test does not verify that the completion override actually changes the rendered output (e.g., shows a check icon instead of the step number).

**Recommendation:** Add an assertion that the check icon is rendered when `isCompleted` is true, confirming the override works.

### T5. No test for `className`, `style`, or `ref` forwarding (Stepper.test.tsx)

Neither the `Stepper` nor `Step` component has tests for:

- `className` being applied to the rendered element
- `style` being applied
- `ref` being correctly forwarded

**Recommendation:** Add at least a ref forwarding test for both `Stepper` (ref on `<nav>`) and `Step` (ref on `<li>`).

### T6. No test for `Step` used outside `Stepper` (StepperContext.ts, line 19)

The `useStepperContext` hook throws an error when used outside a `Stepper`. This is not tested.

**Recommendation:** Add a test verifying that rendering `<Step>` without a `<Stepper>` wrapper throws the expected error.

### T7. No test for edge case of `activeStep` beyond step range

No test covers the behavior when `activeStep` exceeds the number of steps (e.g., `activeStep={5}` with 3 steps).

**Recommendation:** Add a test confirming that all steps appear completed and no step has `aria-current="step"` when `activeStep` exceeds the range.

### T8. No test for `displayName` (Stepper.tsx line 112, Step.tsx line 444)

Both `Stepper.displayName` and `Step.displayName` are set but not tested.

---

## Missing Stories

### S1. No story for the error state with description (Stepper.stories.tsx)

The `States` story (line 68) shows an error step but without a `description` prop. Since error state applies special styling to both the label and description (Step.tsx, lines 236-247), there should be a story demonstrating an error step with a description to verify the error color propagates to both.

### S2. No story for vertical non-linear stepper (Stepper.stories.tsx)

The `NonLinear` story (line 64) only demonstrates horizontal orientation. Vertical non-linear steppers are a distinct layout and should have their own story.

### S3. No story demonstrating `isCompleted` override (Stepper.stories.tsx)

The `States` story uses `isCompleted` (line 71), but it is combined with other states in a single stepper where the override effect is hard to distinguish. A dedicated story showing a step marked completed that would otherwise be upcoming (e.g., `activeStep={0}` with `<Step step={2} isCompleted />`) would better demonstrate this prop.

### S4. No story for `children` content in vertical stepper (beyond Vertical story) (Stepper.stories.tsx)

The `Vertical` story (line 38) shows children, but only simple text. A story demonstrating richer step content (e.g., a form within a step) would better showcase the feature.

### S5. No story for all-steps-completed state (Stepper.stories.tsx)

No story shows `activeStep` set beyond the last step index, which results in all steps appearing completed. This is a common end state for steppers.

### S6. No story for long labels or many steps (Stepper.stories.tsx)

There is no story testing the layout with long label text, long descriptions, or a large number of steps (e.g., 6+). The `maxW: '120px'` constraint on horizontal labels (Step.tsx, line 211) means long labels will wrap, which should be visually verified.

### S7. No story for `hasError` and `isDisabled` combined (Stepper.stories.tsx)

Given the state precedence issue noted in L1, a story showing the interaction between `hasError` and `isDisabled` would help document the expected behavior.

---

## Summary

The Stepper component is well-structured with clean separation between the parent `Stepper`, child `Step`, and shared context. The code is readable and follows the same patterns as other components in the library. The main findings are:

| Priority | Category        | Issue                                                                            |
| -------- | --------------- | -------------------------------------------------------------------------------- |
| High     | Accessibility   | A1: Non-clickable indicator `aria-hidden` hides step numbers from screen readers |
| Medium   | Accessibility   | A3: Error state not programmatically communicated                                |
| Medium   | Accessibility   | A4: Disabled state not communicated via `aria-disabled`                          |
| Medium   | Unclear API     | U1: Manual `step` index management is error-prone                                |
| Medium   | Unclear API     | U2: `children` silently ignored in horizontal orientation                        |
| Medium   | Logic Bugs      | L1: `hasError` overrides `isDisabled` without documentation                      |
| Medium   | Missing Tests   | T1: Error state rendering not meaningfully tested                                |
| Medium   | Missing Tests   | T3: Vertical non-linear stepper not tested                                       |
| Medium   | Missing Tests   | T5: No ref forwarding test                                                       |
| Medium   | Missing Tests   | T6: Context error boundary not tested                                            |
| Low      | Accessibility   | A2: Total step count not communicated                                            |
| Low      | Missing Stories | S1: Error state with description not shown                                       |
| Low      | Missing Stories | S2: Vertical non-linear stepper not shown                                        |
| Low      | Missing Stories | S5: All-steps-completed state not shown                                          |
| Low      | Missing Stories | S6: Long labels / many steps not shown                                           |
