# AspectRatio Audit

## Summary

AspectRatio is a lightweight layout component that maintains a fixed width-to-height ratio for media or embedded content. It uses the native CSS `aspect-ratio` property via an inline style and positions children absolutely within the container. It includes development-mode validation that throws for invalid ratio values.

## Issues

### Critical

- None identified.

### High

- None identified.

### Medium

- **Production behavior with invalid `ratio` silently falls back to `1`**: In production (`NODE_ENV === 'production'`), passing `ratio={0}`, `ratio={-1}`, or `ratio={NaN}` does not throw but silently falls back to `resolvedRatio = 1` (line 48). The component renders with a 1:1 aspect ratio instead of failing. This could mask bugs in production where a computed ratio accidentally becomes invalid. Consider at minimum logging a console warning in production.
- **Absolute-positioned inner div blocks pointer events on the outer container**: The inner `<div className={styles.child}>` is absolutely positioned covering the entire container (`inset: 0, w: 100%, h: 100%`). Any event listeners or interactive elements placed on the outer container (rather than as children) would be obscured by this overlay. This is a known pattern for aspect ratio containers but is not documented in the component's API.
- **No test for `NaN` or `Infinity` ratio values**: Tests cover `0` and `-1` but do not test `NaN` or `Infinity`. While `Number.isFinite(NaN)` is `false` (caught by the existing guard), `Infinity` is also caught. Neither edge case is tested.

### Low

- **No story demonstrating video or iframe embedding**: The stories show images and placeholder divs. A story with a video or iframe would better demonstrate the primary use case for aspect ratio containers.
- **Recipe has no variants**: The `aspectRatioRecipe` in the recipe file defines only a `base` style with no variants. The `cva` wrapper adds overhead for what could be a simple `css()` call. This is a minor style inconsistency rather than a real problem.
- **`data-testid` prop is explicitly listed in the interface despite extending `ComponentPropsWithRef<'div'>`**: The `ComponentPropsWithRef<'div'>` base type already includes `data-testid` via the general HTML attributes. Listing it again does no harm but is redundant.

## Recommendations

1. Consider adding a console.warn in production for invalid ratio values, instead of silently falling back.
2. Add a test for `NaN` and `Infinity` ratio values.
3. Add a story showing embedded video or iframe content.

## SVA Conversion

**Benefit: Low / None**

`AspectRatio.tsx` renders only two elements: a root `<div>` styled by the single-element `cva` (`aspectRatioRecipe`) and one inner positioning `<div>` with a single static `styles.child` css() block (absolute inset/full-size) that has no variants. With no orientation/size/state variants and only one trivial non-recipe block, an `sva` recipe (root/child) would technically be possible but adds essentially no consolidation value over the current cva + one css() block.
