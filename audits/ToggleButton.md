# ToggleButton Audit

## Summary

ToggleButton is a button that toggles between selected and unselected states using `aria-pressed`. It supports standalone usage with `onChange` as well as managed single/multiple selection via `ToggleButtonGroup`. The component supports icons, selected-icon swapping, loading state, tooltips, and width reservation to prevent layout shift when font weight changes between selected/unselected states. The ToggleButtonGroup sub-component manages selection state via context and supports both single-select (with deselection) and multi-select modes.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **ToggleButtonGroup does not provide `aria-disabled` when `isDisabled` is true.** Unlike ButtonGroup which sets `aria-disabled` on the group container, ToggleButtonGroup only propagates `isDisabled` to children via context. The group's `div[role="group"]` itself has no disability indicator for assistive technologies. This is a minor inconsistency with ButtonGroup.
- **Icon-only loading state shows no spinner, same as Button.** When `isIconOnly` is true and `isLoading` is true (lines 209-213), the spinner is not rendered because it is gated by `!isIconOnly`. The button is disabled and shows `aria-busy`, but there is no visual loading indicator for icon-only toggle buttons.
- **No live region for loading state announcements.** Unlike the regular Button component which has a `VisuallyHidden` element with `aria-live="polite"` and `role="status"` to announce "Loading", ToggleButton has no such announcement. Screen reader users are told `aria-busy="true"` and `aria-label` is set, but there is no proactive announcement when loading begins.

### Low

- **`children` prop overrides visible label but not `aria-label`.** When `children` is provided, it replaces the visible text (line 163: `const visibleLabel = children ?? label`). The `aria-label` is set based on `isIconOnly || isLoading`, using the `label` prop. This means the screen reader name comes from `label` while sighted users see `children`. This is intentional (the `label` prop is described as "Accessible label") but could cause confusion if `children` contains text that differs significantly from `label`.
- **No story for `children` prop.** The `children` prop allows custom visible content but no story demonstrates this feature. Only the test covers it.
- **Width reservation renders `visibleLabel` which may include ReactNode children.** The width reservation span (line 204) renders `{visibleLabel}` which could be a ReactNode (from `children`). If `children` is something like `<strong>Bold</strong>`, the reservation span will render the same JSX with `fontWeight: semibold` and `height: 0`, which should work but is untested for complex children.
- **`ToggleButtonGroup` type assertions.** The `onToggle` callback in `ToggleButtonGroup.tsx` (lines 148-165) uses type assertions like `value as string[]` and `onChange as (v: string[]) => void`. This is necessary due to the discriminated union design but creates maintenance risk. If the union types evolve, these casts could silently produce incorrect behavior.
- **No `data-orientation` attribute on ToggleButtonGroup.** Unlike ButtonGroup which sets `data-orientation`, ToggleButtonGroup applies CSS classes for orientation but no data attribute. This is inconsistent but not a functional issue.
- **Vertical orientation story exists but lacks test coverage.** The `VerticalGroup` story demonstrates vertical layout, but no test verifies the vertical CSS class is applied.

## Recommendations

1. Add `aria-disabled={isDisabled || undefined}` to the ToggleButtonGroup container for parity with ButtonGroup.
2. Add a `VisuallyHidden` live region for loading state announcements, matching the Button component pattern.
3. Add a visual spinner for icon-only loading state, or document the limitation.
4. Add a story demonstrating the `children` prop for custom toggle button content.
5. Add a test for vertical orientation CSS class application on ToggleButtonGroup.
6. Consider extracting the `onToggle` logic into separate functions for single and multiple modes to reduce type assertions.
