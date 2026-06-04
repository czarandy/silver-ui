# Icon Audit

## Summary

Icon renders a Lucide icon component with Silver UI size and color tokens. It handles accessibility by defaulting to `aria-hidden="true"` for decorative icons and switching to `role="img"` when `aria-label` is provided. The component accepts any Lucide-compatible SVG component via the `icon` prop.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **`IconComponent` type is overly broad.** The type `ComponentType<LucideProps | SVGProps<SVGSVGElement>>` means the icon must accept either Lucide props or SVG props, but not necessarily both. Since the component spreads all remaining props via `{...props}` (which includes SVG attributes like `strokeWidth`, `className`, etc.), a non-Lucide SVG component could receive props it doesn't understand. The union should arguably be an intersection (`LucideProps & SVGProps<SVGSVGElement>`) or a more constrained type.
- **`height` and `width` are explicitly set to `undefined`.** On lines 90-91, `height={undefined}` and `width={undefined}` override any intrinsic width/height on the SVG to let CSS control sizing. This is intentional but undocumented. If a consumer's custom icon component requires explicit dimensions, this will break it silently.

### Low

- **`focusable="false"` for all icons.** Line 89 sets `focusable="false"` on all icons, which is correct for IE/Edge SVG focus behavior. This is good defensive practice but the `focusable` attribute is a non-standard SVG attribute specific to older browsers.
- **No `title` prop support.** SVG `<title>` elements provide hover tooltips and additional accessible text. The component doesn't expose a way to add an SVG title. For decorative icons this is fine, but for labeled icons, a title could enhance the experience.
- **Missing story for `aria-label` usage.** The test covers the accessible icon case (line 19-24), but there is no story showing an icon used as an independent labeled image (i.e., non-decorative).
- **`info` color variant is available but not demonstrated.** The `info` color is in the recipe but not explicitly highlighted in any story (it's part of the Colors grid but has no individual story).
- **`strokeWidth` prop default differs from Lucide default.** Lucide's default `strokeWidth` is 2, and the Icon component also defaults to 2 (line 80). This is correct but worth noting -- if Lucide changes its default, the explicit override here ensures consistency.

## Recommendations

1. Tighten the `IconComponent` type to ensure the icon component actually accepts the props being passed.
2. Add a comment explaining why `height` and `width` are set to `undefined`.
3. Add a story demonstrating accessible/labeled icon usage with `aria-label`.

## SVA Conversion

**Benefit: Low / None**

`Icon.tsx` renders exactly one styled DOM element — the SVG icon — using a single `cva` (`Icon.recipe.ts`) with `size` and `color` variants. This is the textbook case where `cva` is correct: one element, one class. There is no standalone `css()` object, no per-element `cx()` branching, and no second slot to style. `sva` would add structure with no benefit.
