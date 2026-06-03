# Slider Audit

## Summary

Slider control supporting both single-value and range (dual-thumb) modes. Features pointer-based drag interaction, keyboard navigation (arrows, Home, End, PageUp/Down), snap-to-step, marks with optional labels, tooltip/text/none value display, vertical orientation, and `onChangeEnd` for commit semantics. Uses the shared `Field` wrapper.

## Issues

### Critical

- None.

### High

None

### Medium

- **Range slider does not associate thumbs with the `for` label.** For single-value mode, the thumb gets `id={inputId}`, linking it to the `<label>` rendered by `Field`. For range mode, neither thumb gets the `inputId`, so the Field label's `htmlFor` points to nothing. The `aria-label` on each thumb compensates, but clicking the label text will not focus either thumb. Consider setting `id={inputId}` on the first thumb in range mode, or using `aria-labelledby` to link both thumbs to the visible label.
- **No `aria-label` on the group container for range sliders when label is generic.** The track container div gets `aria-label={label}` and `role="group"` only when `isRange` is true. This is correct, but the group's `aria-label` duplicates the field label exactly, which may cause redundant announcements. Consider using a more descriptive group label like `"${label} range"`.
- **No story for `onChangeEnd`.** The `onChangeEnd` callback is tested in unit tests but no story demonstrates or documents the commit-vs-live-change distinction. This is important API behavior worth illustrating.
- **Missing story for vertical range slider.** There is a `Vertical` story for single-value but no vertical range story.

### Low

- **`filledStyle` computed as an IIFE on every render.** The filled track style object is computed via an immediately-invoked function expression. While the computation is trivial, wrapping it in `useMemo` with `[values, min, max, isRange, isHorizontal]` would be more idiomatic.
- **No recipe file.** All styles are defined inline with `css()` calls. This is consistent within the component but inconsistent with components that use `.recipe.ts` files.
- **No test for `description` prop.** The `description` prop is accepted and passed to `Field` but never tested.
- **Thumb `onKeyDown` creates a new closure per thumb per render.** The inline arrow `event => handleKeyDown(thumbIndex, event)` is recreated each render. For two thumbs this is negligible, but it could be extracted.
- **`marks` without labels still render empty wrapper divs.** When `mark.label` is `undefined`, the mark renders a wrapper `<div key={mark.value}>` containing only the tick element. The extra wrapper is harmless but unnecessary.
- **No test for `ref` forwarding.** The component accepts `ref` forwarded to the field root but no test verifies it.
- **Unused `TIME_*` constants in stories.** Several defined constants like `DEFAULT_RANGE_VALUE` are used, but this is fine. No actual unused variables.

## Recommendations

1. Assign `id={inputId}` to the first thumb even in range mode so the Field label click focuses it.
2. Add a story for `onChangeEnd` demonstrating the live-change vs. commit distinction.
3. Add a test for `description` rendering and `ref` forwarding.
