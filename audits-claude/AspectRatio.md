# AspectRatio Component Audit

Audited: 2026-05-28
Files reviewed:

- `src/components/AspectRatio/AspectRatio.tsx`
- `src/components/AspectRatio/AspectRatio.recipe.ts`
- `src/components/AspectRatio/AspectRatio.stories.tsx`
- `src/components/AspectRatio/AspectRatio.test.tsx`
- `src/components/AspectRatio/index.ts`

---

## Performance

**No issues found.**

- The recipe (`aspectRatioRecipe`) is defined at module scope and has no variants, so `cva()` returns a static class string with no per-render cost.
- The `styles.child` object is also module-scoped and computed once.
- The component is a simple function component with no state, effects, or expensive computations. No memoization is needed.

---

## Accessibility

### Issue 1: No semantic role or landmark on the container

**File:** `AspectRatio.tsx`, lines 54-61
**Severity:** Low

The root element is a plain `<div>` with no ARIA attributes. For a layout utility this is acceptable -- the component is a generic container, not an interactive or semantic element. However, the component does not forward arbitrary HTML attributes (e.g. `role`, `aria-label`, `aria-labelledby`) to the root element, which limits consumers' ability to add semantics when needed.

**Recommendation:** Consider accepting a rest-spread of `HTMLDivElement` attributes (`...rest`) and forwarding them to the root `<div>`. This would allow consumers to pass `role`, `aria-*`, and other standard attributes without needing to wrap the component. Many sibling components in the library likely follow this pattern.

---

## Logic Bugs

### Issue 2: No validation of the `ratio` prop

**File:** `AspectRatio.tsx`, line 58
**Severity:** Low

The `ratio` prop is typed as `number` but has no runtime guard. Values of `0`, negative numbers, `NaN`, or `Infinity` would produce broken or invisible layouts (`aspect-ratio: 0`, `aspect-ratio: NaN`, etc.) with no error or warning. While TypeScript prevents non-number values, it cannot prevent logically invalid numbers.

**Recommendation:** Consider adding a development-mode warning (e.g., `console.warn`) when `ratio <= 0`, `isNaN(ratio)`, or `!isFinite(ratio)`.

### Issue 3: `style` prop can override `aspectRatio`

**File:** `AspectRatio.tsx`, line 58
**Severity:** Low

The inline style is constructed as `{aspectRatio: ratio, ...style}`. If a consumer passes `style={{aspectRatio: '1/1'}}`, it will silently override the `ratio` prop, making the component behave unexpectedly. The `ratio` prop would be ignored with no warning.

**Recommendation:** Spread `style` first, then apply `aspectRatio`, so the explicit prop always wins: `{...style, aspectRatio: ratio}`. Alternatively, document that `style.aspectRatio` will override the `ratio` prop if that is intentional behavior.

---

## API Clarity

### Issue 4: `ratio` prop name and type could be more expressive

**File:** `AspectRatio.tsx`, lines 24-26
**Severity:** Informational

The prop accepts a `number` (e.g. `16 / 9`). The CSS `aspect-ratio` property also accepts string values like `"16 / 9"`, which some developers may expect to work. The current API is fine and consistent with Radix UI's AspectRatio, but worth noting.

### No other API clarity issues

The props interface is clean, well-documented with JSDoc comments, and minimal. The component does exactly what it says.

---

## Missing Tests

### Issue 5: No test for ratio=0 or invalid ratio values

**File:** `AspectRatio.test.tsx`
**Severity:** Low

There is no test covering edge-case ratio values (0, negative, NaN). If a runtime guard is added (see Issue 2), tests should verify the warning behavior.

### Issue 6: No test for style override behavior

**File:** `AspectRatio.test.tsx`
**Severity:** Low

There is no test verifying what happens when `style={{aspectRatio: '1/1'}}` is passed alongside `ratio={16/9}`. Whether the current override behavior is intentional or a bug (see Issue 3), a test should document the expected behavior.

### Issue 7: No test for the inner child wrapper

**File:** `AspectRatio.test.tsx`
**Severity:** Low

The component wraps children in an inner `<div>` with `position: absolute; inset: 0; width: 100%; height: 100%` (line 59). No test verifies that this inner wrapper exists and has the expected styling. This is an implementation detail, but it is load-bearing for the component's purpose -- children need to fill the aspect-ratio box.

### Existing test coverage is solid for:

- Applying `aspectRatio` style from the `ratio` prop
- Rendering children
- Forwarding `className`, `style`, `data-testid`, and `ref`

---

## Missing Stories

### Issue 8: No story for `ratio={1}` (square) in isolation

**File:** `AspectRatio.stories.tsx`
**Severity:** Low

The `Ratios` story shows `1:1` in a grid alongside other ratios, but there is no dedicated story for a square aspect ratio. A `Square` story would be useful for visual testing.

### Issue 9: No story demonstrating video or iframe content

**File:** `AspectRatio.stories.tsx`
**Severity:** Low

The component description says it is for "media or embedded content," but the only stories demonstrate images and plain divs. A story with an `<iframe>` (e.g., an embedded video) would demonstrate a primary use case and verify that embedded content fills the ratio box correctly.

### Issue 10: No story demonstrating responsive behavior

**File:** `AspectRatio.stories.tsx`
**Severity:** Low

Since the component sets `width: 100%`, its size depends on its parent container. A story with a resizable container (or at least a constrained-width wrapper like `maxWidth: 400px`) would help demonstrate how the component responds to different container widths.

### Existing story coverage:

- `Widescreen`: 16:9 with an image -- good default demonstration
- `Ratios`: Side-by-side comparison of 1:1, 4:3, 16:9 -- good overview

---

## Summary

The AspectRatio component is simple, well-implemented, and has no critical issues. The main findings are:

| #   | Category      | Severity | Summary                                                      |
| --- | ------------- | -------- | ------------------------------------------------------------ |
| 1   | Accessibility | Low      | No rest-spread for ARIA/HTML attributes on root              |
| 2   | Logic         | Low      | No validation for invalid ratio values (0, NaN, negative)    |
| 3   | Logic         | Low      | `style` prop can silently override `ratio` via `aspectRatio` |
| 4   | API           | Info     | `ratio` accepts only `number`, not CSS string format         |
| 5   | Tests         | Low      | No edge-case tests for invalid ratio values                  |
| 6   | Tests         | Low      | No test documenting style override behavior                  |
| 7   | Tests         | Low      | No test for inner child wrapper styling                      |
| 8   | Stories       | Low      | No isolated square (1:1) story                               |
| 9   | Stories       | Low      | No iframe/video embed story                                  |
| 10  | Stories       | Low      | No responsive/constrained-width story                        |
