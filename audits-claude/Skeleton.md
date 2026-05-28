# Skeleton Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/Skeleton/Skeleton.tsx`
- `src/components/Skeleton/Skeleton.stories.tsx`
- `src/components/Skeleton/Skeleton.test.tsx`
- `src/components/Skeleton/index.ts`

---

## Performance Problems

**No significant performance issues found.**

- The component is stateless and effect-free -- a single `<div>` with pre-compiled Panda CSS classes. No memoization is needed.
- The `styles` object (lines 49-68, `Skeleton.tsx`) is module-level and created once.
- The inline `style` object (lines 93-97) is re-created on every render. This is standard practice for lightweight components and not a concern. If the component were rendered at very high volume (hundreds of skeletons), a `useMemo` on the style object keyed by `width`, `height`, `index`, and `style` could avoid unnecessary object allocations, but this is a micro-optimization that is not warranted today.
- The `formatSize` helper (lines 70-72) is a trivial pure function with no performance cost.

---

## Accessibility Concerns

1. **Missing `role` and `aria-label` (Skeleton.tsx, lines 87-99):**
   The rendered `<div>` has no ARIA semantics. Screen readers will either ignore it entirely or announce it as a generic container. The WAI-ARIA best practice for skeleton/placeholder loading patterns is to use `role="status"` (or a wrapping live region) with an accessible label like `aria-label="Loading"` so assistive technology users know content is loading. Compare with the project's own `Spinner` component (`src/components/Spinner/Spinner.tsx`, line 97), which correctly uses `role="status"` and `aria-label`.

   **Recommendation:** Add `role="status"` and a default `aria-label="Loading"` to the skeleton element. Expose an optional `aria-label` prop so consumers can customize the announcement (e.g., "Loading profile picture"). For lists of skeletons, consider using `aria-hidden="true"` on all but the first skeleton to avoid repetitive announcements.

2. **No `aria-busy` guidance or support:**
   When a skeleton replaces real content, the parent container should ideally have `aria-busy="true"` so assistive technology knows to wait for content. The Skeleton component does not document this pattern or provide tooling for it.

   **Recommendation:** Add a usage note to the JSDoc or Storybook docs explaining the `aria-busy` pattern for skeleton containers.

3. **No dark mode support (Skeleton.tsx, line 51):**
   The background color is hardcoded to `silver-neutral.200`. In dark mode, this will produce a light-colored skeleton on a dark background, which may have incorrect contrast or look jarring. The `panda.config.ts` defines dark-mode semantic tokens for `bg.subtle` and others, but the skeleton does not use them.

   **Recommendation:** Use a semantic token or add a `_dark` condition to select a darker shade (e.g., `silver-neutral.700`) in dark mode.

---

## Logic Bugs

1. **Negative `index` values produce negative `animationDelay` (Skeleton.tsx, line 95):**
   The formula `delayTime + staggerTime * index` will produce values less than the intended 1000ms base delay if `index` is negative. For example, `index={-20}` yields `-1000ms`, which browsers normalize to `0ms`. This is unlikely in practice but represents unclamped input.

   **Recommendation:** Either clamp `index` to a minimum of 0, or document that negative values are unsupported.

2. **No validation of `radius` values:**
   The `radius` prop is typed as `SkeletonRadius` (line 5), so TypeScript prevents invalid values at compile time. However, at runtime (e.g., when consumed from JavaScript), an invalid radius value would cause `styles.radius[radius]` to return `undefined`, which `cx` would silently filter out. The skeleton would render with no border-radius class applied. This is a minor concern given the TypeScript-first API.

---

## Unclear API

1. **`index` prop name is ambiguous (Skeleton.tsx, line 25):**
   The name `index` does not clearly convey that it controls animation stagger delay. A consumer reading `<Skeleton index={2} />` might think it relates to list ordering or z-index. The JSDoc comment (line 22) clarifies the purpose, but a more descriptive name like `staggerIndex` or `animationIndex` would be self-documenting.

2. **`radius` token scale is non-obvious (Skeleton.tsx, lines 5, 59-67):**
   The numeric values `0-4` map to design tokens (`0`, `xs`, `sm`, `md`, `lg`), while `'none'` is an alias for `0` and `'rounded'` maps to `full`. The mapping is not documented in JSDoc -- consumers must read the source to understand what `radius={2}` means. This is consistent with other components in the library if they use the same scale, but worth documenting.

3. **`delayTime` and `staggerTime` are not configurable (Skeleton.tsx, lines 46-47):**
   The 1000ms delay and 100ms stagger are hardcoded constants. If a consumer wants a different stagger cadence, they must override `animationDelay` via the `style` prop, which is possible but undocumented. This is a reasonable default for most use cases.

---

## Missing Tests

The test file (`Skeleton.test.tsx`) contains only a single test case. The following behaviors are untested:

1. **Default dimensions (line 85-86):** No test verifies that omitting `width` and `height` defaults to `'100%'` for both.

2. **`radius` prop (line 29):** No test verifies that different radius values apply the correct CSS class. At minimum, test the default (`3`), `0`/`'none'`, and `'rounded'`.

3. **`index` / animation stagger (line 95):** No test verifies that the `animationDelay` style is correctly computed. For example, `index={2}` should produce `animationDelay: '1200ms'` (1000 + 100\*2).

4. **`style` prop merging (line 96-97):** No test verifies that the `style` prop is spread after the computed styles, allowing consumer overrides of `width`, `height`, and `animationDelay`.

5. **`ref` forwarding (line 34):** No test verifies that a ref is correctly forwarded to the underlying `<div>`.

6. **String dimensions (line 71):** No test verifies that string values for `width`/`height` (e.g., `'50%'`, `'10rem'`) are passed through without `px` suffix.

7. **`prefers-reduced-motion` behavior:** This is a CSS-level concern and may not be testable with jsdom, but if the project uses a CSS assertion library, it should be verified.

---

## Missing Stories

The stories file (`Skeleton.stories.tsx`) has two stories: `Default` and `ContentBlock`. The following props and use cases lack dedicated stories:

1. **`radius` variants:** No story demonstrates the different radius options (`0`, `1`, `2`, `3`, `4`, `'none'`, `'rounded'`). A story with all variants side by side would help visual QA.

2. **String dimensions:** Both stories use numeric dimensions only. A story showing percentage-based or `rem`-based sizing (e.g., `width="50%"`, `height="2rem"`) would demonstrate the string dimension support.

3. **Single skeleton (non-staggered):** The `Default` story shows a single skeleton but uses hardcoded `args`. A simpler story with minimal props would show the true default appearance (100% x 100%).

4. **`prefers-reduced-motion`:** A story or documentation note showing the reduced-motion behavior (static skeleton with higher opacity) would be valuable for accessibility review.

5. **Dark mode:** If Storybook supports dark mode toggling, a story or decorator showing the skeleton in dark mode would expose the missing dark-mode styling (see Accessibility Concerns #3).

6. **In-context usage:** A story showing a skeleton inside a card or list layout (mimicking a real loading state) would demonstrate practical usage beyond the standalone `ContentBlock` story. The `Thumbnail` component uses `Skeleton` internally (`src/components/Thumbnail/Thumbnail.tsx`, line 173), but there is no Skeleton story showing this pattern.

---

## Summary

The Skeleton component is clean, minimal, and well-structured. The main areas for improvement are:

- **Accessibility:** Add `role="status"` and a default `aria-label` to match the project's Spinner component pattern. Add dark-mode styling.
- **Testing:** Expand from 1 test to cover default values, radius variants, stagger delay computation, ref forwarding, style merging, and string dimensions.
- **Stories:** Add stories for radius variants, string dimensions, and dark-mode appearance.
- **API clarity:** Consider renaming `index` to `staggerIndex` for self-documentation.
