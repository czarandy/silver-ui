# Item Audit

## Summary

Item is a complex, polymorphic row primitive used across menus, lists, and selection widgets. It supports button, link, and static rendering modes, with slots for start/end/leading/trailing content, label truncation, description, disabled/selected/highlighted states, a custom link component, and a `role` prop for composite widget integration. This is one of the most sophisticated components in the library.

## Issues

### Critical

- None.

### High

None

### Medium

- **`handleContainerClick` uses DOM query to detect nested interactive elements.** Line 328 calls `targetElement.closest('button, a, input, select, textarea')` to avoid double-firing clicks when nested interactive elements are clicked. This is a pragmatic approach but is fragile -- it won't detect custom interactive components (e.g., a `<div role="button">`) and could miss elements added in the future.
- **`ref` type assertion `as Ref<never>`.** Line 422 casts `ref` to `Ref<never>` to satisfy TypeScript when the root element changes via the `as` prop. This is a known pattern for polymorphic components but loses all type safety on the ref. If `as="li"` is used, the ref should be `Ref<HTMLLIElement>`, but the type system won't enforce this.
- **No recipe file for styling.** Unlike most other components in the library, Item uses inline `css()` calls for all styling. This means styles can't be easily overridden or composed by consumers using the recipe pattern. Consider extracting to an `Item.recipe.ts` for consistency.
- **Complex conditional rendering logic is hard to follow.** The `content` variable (lines 352-397) has a 4-way conditional: `hasParentRole` -> link -> button -> static. This is correct but difficult to maintain. Consider extracting each branch into a named sub-component or helper function.

### Low

- **`endContent` rendered twice in different positions.** When `endContentPosition` is `'inline'`, the end content is rendered in the label row area. When it's `'end'` (default), it's rendered after the text content. The code correctly handles this with a conditional, but a consumer could be confused if they change `endContentPosition` and see the content jump to a different DOM location.
- **No story for `width="auto"`.** The `width` prop defaults to `'full'` and supports `'auto'`, but no story demonstrates the auto-width behavior.
- **Missing test for `trailingContent` rendering position.** Tests verify `trailingContent` is rendered, but no test confirms it appears after the interactive area in the DOM order.
- **`linkComponent` prop name inconsistency.** The prop is `linkComponent` (camelCase), while the provider is `LinkProvider` with a `component` prop. The naming is fine but slightly inconsistent.
- **`eslint-disable` at file top.** The file disables `@eslint-react/static-components` for the entire file. This is necessary for the polymorphic `as` prop pattern but could be scoped more narrowly.

## Recommendations

1. Consider extracting the 4-way content rendering into helper functions for readability.
2. Add a test verifying that disabled links don't navigate on click.
3. Add a story for `width="auto"`.
