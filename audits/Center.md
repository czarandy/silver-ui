# Center Audit

## Summary

Center is a simple layout utility component that centers its children along one or both axes using flexbox. It supports horizontal-only, vertical-only, and both-axis centering, an inline display mode, and explicit width/height values. It extends `HTMLAttributes<HTMLDivElement>` for full native attribute pass-through.

## Issues

### Critical

- None identified.

### High

- None identified.

### Medium

- **`style` prop overrides `width`/`height` props without warning**: The style spread order is `{ width: toPixelSize(width), height: toPixelSize(height), ...style }`, which means `style.width` and `style.height` silently override the explicit `width` and `height` props. While this is tested (test line 78), it is a confusing API behavior — a consumer could set `width={300}` and `style={{width: '50%'}}` not realizing the style wins. The opposite ordering (spreading style first, then applying width/height) would make the dedicated props authoritative, which is more intuitive.
- **No `minHeight` consideration for vertical centering**: When `axis` is `'vertical'` or `'both'` without an explicit `height`, the component has no intrinsic height and content will not appear visually centered. The stories always provide an explicit `height` for vertical centering demos. A note in the JSDoc or a story showing this common pitfall would help consumers.

### Low

- **`isInline` recipe variant has an empty `false` branch**: In the recipe, `isInline: { true: { display: 'inline-flex' }, false: {} }`. The `false` branch is a no-op since the base already sets `display: 'flex'`. This is harmless but is unnecessary boilerplate.
- **Tests use Panda CSS class name strings directly**: Tests like `expect(center).toHaveClass('silver-ai_center')` are coupled to Panda CSS internal class name generation. If the CSS framework config changes class prefixes, these tests will break without any component logic change. This is a library-wide concern, not specific to Center.
- **No story for `data-testid` or `ref` usage**: These are tested but not documented in stories.

## Recommendations

1. Consider reversing the style spread order so `width`/`height` props take precedence over `style.width`/`style.height`, or document the current behavior explicitly.
2. Add a JSDoc note to the `axis` prop explaining that vertical centering requires the container to have a defined height.
3. Consider removing the empty `false: {}` branch from the `isInline` recipe variant for cleanliness.

## SVA Conversion

**Benefit: Low / None**

Center renders a single styled `<div>` and applies one class via `cx(centerRecipe({axis, isInline}), className)`. Its styling is already fully expressed by a `cva` root recipe (`Center.recipe.ts`) with `axis` (both/horizontal/vertical) and `isInline` variants; `width`/`height` are inline styles, not recipe concerns. With only one styled element and no standalone `css()` object or per-element `cx()` branches, `sva` would provide no consolidation benefit.
