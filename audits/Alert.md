# Alert Audit

## Summary

Alert displays a contextual message with status-based styling (error, info, success, warning), an optional collapsible body, and dismiss functionality. It maps statuses to appropriate ARIA roles (`alert` for error/warning, `status` for info/success) and supports custom icons, end content, and padding. The component is well-structured with a recipe-based styling approach, comprehensive tests, and good story coverage.

## Issues

### Critical

- None

### High

- **Collapsible content is removed from the DOM instead of hidden.** When `isExpanded` is false, the collapsible `children` are completely unmounted (`showContent` gates rendering). This means any stateful children (forms, inputs) lose their state when collapsed and re-expanded. Additionally, the `aria-controls` attribute on the expand button references a `bodyId` element that does not exist in the DOM when collapsed, which is invalid per ARIA spec. Consider rendering the content with `display: none` or `hidden` attribute instead, so the `aria-controls` target always exists.

### Medium

- **No controlled expand/collapse API.** The component only offers `isDefaultExpanded` (uncontrolled). There is no `isExpanded` / `onExpandChange` prop pair for controlled usage. Consumers who need to programmatically control expansion (e.g., "expand all alerts") cannot do so without workarounds.
- **No animation on collapse/expand.** The collapsible body appears and disappears abruptly with no transition, while the rest of the library uses smooth transitions. This creates an inconsistent experience compared to other collapsible patterns (Accordion, for instance).
- **Missing recipe file for the root container.** The `alertRecipe` in `Alert.recipe.ts` has only a `base` style with no variants. The `container` variant styling (border-radius) is handled entirely by `alertHeaderRecipe`, but the root `<div>` that wraps both header and body has no border styling. This means the body border (`borderInlineWidth`, `borderBlockEndWidth`) comes from raw `css()` styles rather than the recipe, creating an inconsistency in the styling approach.
- **`padding` prop uses inline token lookup.** The `padding` prop applies `token(\`spacing.${padding}\`)` inline, which constructs a token path at runtime. While this works, it bypasses the recipe system and does not validate that the spacing step exists at build time.

### Low

- **`alertRecipe` has no variants and is essentially a no-op.** The recipe only defines a `base` with three properties. It could be simplified to a plain `css()` call, or the root-level styles could be moved into the header recipe to consolidate.
- **`AlertVariants` type is exported but unused.** The `Alert.recipe.ts` exports `AlertVariants` but no consumer or the component itself uses this type, since the recipe has no meaningful variants.
- **Test file does not verify the `container` prop.** There are no tests for the `container="section"` variant, even though the recipe applies different border-radius styles for card vs. section. The stories cover it visually but the behavior is untested.
- **Test file does not verify the `padding` prop.** The custom padding behavior is not tested.

## Recommendations

1. Render collapsed content as hidden rather than unmounted to preserve child state and keep `aria-controls` valid.
2. Add a controlled `isExpanded` / `onExpandChange` prop pair alongside the existing `isDefaultExpanded`.
3. Add collapse/expand animation (e.g., grid-template-rows transition like ToastViewport uses).
4. Add tests for `container` and `padding` props.
5. Consider removing the `AlertVariants` export or giving the root recipe actual variants.
