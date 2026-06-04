# Skeleton Audit

## Summary

Skeleton renders a pulsing placeholder with a shimmer animation, supporting configurable dimensions, border radius, and staggered animation delays for list loading patterns. It includes good accessibility defaults (`role="status"`, `aria-label="Loading"`) and respects `prefers-reduced-motion`. The component is simple, well-implemented, and has thorough tests and expressive stories.

## Issues

### Critical

- None

### High

- None

### Medium

- **Consumer `style` prop can override computed `width`, `height`, and `animationDelay`.** The spread order `{width, height, animationDelay, ...style}` means consumer-provided `style` values will override the component's computed dimensions and animation delay. While this flexibility is intentional, it can lead to subtle bugs if a consumer accidentally passes `width` or `height` via `style` instead of the dedicated props, and gets unexpected behavior with the stagger. Consider applying consumer styles first and computed styles second, or at least documenting this behavior.
- **Every Skeleton instance announces "Loading" to screen readers.** When multiple Skeletons are used in a list (which is the primary use case shown in stories), each one has `role="status"` and `aria-label="Loading"`. This means a screen reader may announce "Loading" many times. The component's JSDoc recommends setting `aria-busy="true"` on the parent, but even with that, individual status announcements can be noisy. Consider using `aria-hidden="true"` by default when `staggerIndex > 0`, or providing guidance to use a single `role="status"` wrapper with individual skeletons as `aria-hidden`.

### Low

- **No recipe file.** The component uses raw `css()` calls. The `radius` variants would fit naturally in a recipe with a `radius` variant.
- **`SkeletonRadius` type mixes numbers and strings.** The type `0 | 1 | 2 | 3 | 4 | 'none' | 'rounded'` includes `0` and `'none'` which produce identical output (`borderRadius: 0`). This redundancy may confuse consumers. Consider removing one of the aliases.
- **The `delayTime` and `staggerTime` constants are not configurable.** Consumers cannot customize the base delay (1000ms) or the per-item stagger interval (100ms). While the defaults are reasonable, more advanced loading patterns might need control over timing. This is a minor API limitation.
- **No test for the `radius` prop.** The radius variants are demonstrated in stories but not tested. A test verifying that different radius values produce the expected CSS classes would improve coverage.
- **Stories do not show `aria-busy` parent pattern.** The JSDoc recommends `aria-busy="true"` on parent containers, but no story demonstrates this best practice.

## Recommendations

1. Document or reconsider the `style` spread order to prevent accidental dimension overrides.
2. Consider a pattern for reducing screen reader noise when multiple Skeletons are rendered (e.g., `aria-hidden` on all but the first, or a wrapper component).
3. Remove the `0` / `'none'` redundancy in `SkeletonRadius`, or document why both exist.
4. Add a test for the `radius` prop.
5. Add a story demonstrating the recommended `aria-busy` parent pattern.

## SVA Conversion

**Benefit: Low / None**

Skeleton renders a single `<div>`. Its styling in `Skeleton.tsx` is one `styles.root` `css()` block plus a `radius` map of seven single-property `css()` blocks, combined via `cx()`, with width/height/animation-delay applied as inline styles. There is only one styled DOM element, so a slot recipe has no slots to consolidate; this is the textbook case where `cva` (or even the current flat css map) is correct and `sva` adds nothing.
