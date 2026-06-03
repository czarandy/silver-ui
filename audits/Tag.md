# Tag Audit

## Summary

Tag is a compact chip component for displaying selected values, filters, tags, or removable entities. It supports multiple interaction modes (static, clickable, link, removable, or combinations), colors, sizes, icons, tooltips, and hidden labels. The component handles complex rendering logic for different combinations of `onClick`, `onRemove`, and `href`.

## Issues

### Critical

- None

### High

- None

### Medium

- **Duplicated rendering logic across multiple branches:** The Tag component has five distinct rendering branches (href+onRemove, href-only, onClick+onRemove, onClick-only, static) with duplicated JSX for icons, labels, and endContent. The `TagContent` helper function handles some cases but not all -- the href+onRemove and onClick+onRemove branches inline their content rather than using `TagContent`. This makes the component harder to maintain and increases the risk of inconsistencies across branches. Consider refactoring to reduce duplication.
- **`default` and `gray` colors are identical:** In `Tag.recipe.ts`, the `default` and `gray` color variants have exactly the same styles (`surface.gray`, `surface.gray.fg`, `surface.gray.hover`). This is potentially confusing for consumers who might expect them to differ. Consider either differentiating them or documenting that they are aliases.

### Low

- **No `aria-label` on the outer `<span>` wrapper for onClick+onRemove and href+onRemove modes:** When both an action (click or link) and a remove button exist, the tag renders as a `<span>` containing two interactive elements. The outer span does not have a group role or label to describe the composite widget. Screen reader users may not understand the relationship between the two buttons.
- **`isLabelHidden` comparison uses `=== true` in some places and truthiness in others:** In `TagContent` (line 193), the check is `isLabelHidden === true`, while in the href+onRemove branch (line 268), it's just `isLabelHidden` (truthy check). These behave the same given the prop type is `boolean | undefined`, but the inconsistency is a minor code quality issue.
- **No test for `startContent` prop:** While `endContent` is tested, `startContent` is not directly tested. It appears in stories but not in the test file.
- **Missing story demonstrating disabled link tag:** The `Disabled` story shows disabled static, clickable, and removable tags, but not a disabled link tag (`href` + `isDisabled`).
- **`onClick` event type uses `MouseEventHandler<HTMLElement>` but button/link may differ:** The `onClick` prop accepts `MouseEventHandler<HTMLElement>`, which works but is less precise than `MouseEventHandler<HTMLButtonElement>` or `MouseEventHandler<HTMLAnchorElement>` depending on the rendering mode.

## Recommendations

- Refactor the five rendering branches to reduce duplication. A single content builder with conditional wrapper elements would be more maintainable.
- Consider documenting or removing the duplicate `default`/`gray` color variants.
- Add a test for `startContent` rendering.
- Add a story for disabled link tags.
- Test coverage is otherwise strong, covering all interaction modes, remove button event isolation, icon rendering, size/color variants, hidden labels, description, tooltip, ref forwarding, keyboard activation, and the combined href+onClick+onRemove case.
