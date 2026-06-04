# ButtonGroup Audit

## Summary

ButtonGroup groups related Button elements and propagates shared size, disabled state, and orientation through React context. It renders a `role="group"` container with connected border-radius and separator styling via CSS recipes. The component is well-structured with clear separation of context, recipe, and component logic.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **No keyboard navigation between grouped buttons.** The WAI-ARIA toolbar pattern recommends roving tabindex or arrow-key navigation within a group of buttons. Currently each button in the group is independently tabbable. For a visual group that behaves as a single control, this means users must Tab through every button rather than using arrow keys. This is not strictly a bug (the `role="group"` pattern allows independent tabbing), but it is a missed accessibility enhancement for toolbar-like usage.

### Low

- **`aria-disabled` on the group container has limited utility.** The group sets `aria-disabled` on the wrapper `div[role="group"]`, but assistive technologies generally do not propagate this to child elements. The actual disabling is correctly handled by context propagation to individual Buttons, so the `aria-disabled` on the group is redundant rather than harmful.
- **No recipe file export from the barrel.** The `buttonGroupRecipe` is exported from `index.ts`, which is good for consumers who want to customize. No issue here, just confirming it is exported.
- **No story for mixed button types in a group.** The `MixedVariants` story shows mixed visual variants, but there is no story showing a group with mixed `href` links and regular buttons, or a group with tooltip-wrapped buttons alongside plain ones (though `LinkButtons` and `ApplyGroupStylingToTooltipWrappedButtons` partially cover this -- the test does, the stories partially).
- **Disabled buttons within an enabled group cannot be individually re-enabled.** The test at line 118 verifies that `isDisabled={false}` on a child Button does not override the group's `isDisabled={true}`. This is correct behavior, but the Button's disabled logic uses `isDisabled || buttonGroup?.isDisabled === true`, meaning a child cannot set `isDisabled={false}` to opt out of group disabling. This is by design but could surprise consumers.

## Recommendations

1. Consider whether arrow-key navigation should be added for toolbar-like use cases. If the ButtonGroup is intended as a toolbar, add `role="toolbar"` and roving tabindex. If it is purely a visual grouping, the current implementation is adequate.
2. The CSS selectors in the recipe use `:where(button, a)` which is good for specificity, but document that wrapping elements (like Tooltip spans) between the group and button may require the `& > :not(:first-child) :where(button, a)` descendant selector pattern (which is already present).
3. Add a story showing a ButtonGroup with buttons in a loading state to ensure the visual styling (spinner, disabled appearance) integrates well with the group border treatment.

## SVA Conversion

**Benefit: Low / None**

`ButtonGroup.tsx` renders a single styled root `<div>` via the single-element `cva` (`buttonGroupRecipe`) with one `orientation` variant; it styles its child buttons through descendant `:where(button, a)` selectors inside that root recipe rather than rendering its own additional slots. There is no standalone `css()` styles object and no per-element `cx()` branching. Because all styling already belongs to one element's recipe (and the child styling is selector-based), `sva` slots would add nothing.
