# Tooltip Audit

## Summary

Tooltip displays contextual information in a popup anchored to a trigger element. It consists of a declarative `Tooltip` component for wrapping children, and a lower-level `useTooltip` hook for attaching tooltips to external refs. The implementation uses CSS anchor positioning via a `useLayer` hook, with separate refs for positioning and interaction handling.

## Issues

### Critical

- None

### High

- **`isTouchDevice` is evaluated once at module load time:** The `isTouchDevice` constant (line 20 in `useTooltip.tsx`) is computed at module evaluation time using `window.matchMedia('(hover: none)')`. This has two problems: (1) it will error during SSR/Node.js if `window` is not defined (the `typeof window !== 'undefined'` guard helps, but `matchMedia` may still behave differently), and (2) it does not respond to changes (e.g., a user switching between touch and mouse input on a convertible laptop). The tooltip will be permanently disabled for hover if the page loads with touch input active.

### Medium

- **`display: contents` on element-children wrapper may break some CSS features:** The wrapper `<div>` for non-text children uses `display: contents` (line 192). While this is intentional to avoid layout interference, `display: contents` can cause issues with certain CSS features like `position: relative` on the wrapper, and some browser/screen reader combinations strip the element from the accessibility tree. Since this wrapper carries `data-testid`, `className`, `style`, and `ref`, some of these props may not work as expected because the wrapper is effectively invisible to layout.
- **`mergeIds` helper could produce a single-space string:** The `mergeIds` function (line 95) filters falsy values and joins with a space. If all inputs are falsy, it returns `undefined`, which is correct. But if some are empty strings (which are falsy), they are filtered out correctly. However, the `filter(Boolean)` call would also filter out `0` and `false` if they were somehow passed, which should never happen for ID strings but is worth noting.
- **No test for `hideDelay` prop:** The `hideDelay` prop is documented and implemented but not tested. A test should verify the tooltip remains visible for the specified duration after mouse leave.
- **No test for the `alignment` prop:** While the `alignment` prop is demonstrated in stories, there is no test verifying it works correctly.

### Low

- **No test for `hasHoverIndication` prop:** The dashed underline indicator for text-only triggers is implemented but not tested. A test should verify the class is applied when `hasHoverIndication` is `true` or `'auto'` with text children.
- **Focus trigger behavior depends on `isFocusable` heuristic:** The `isFocusable` function (line 98 in `useTooltip.tsx`) checks for specific HTML element types and `tabindex`. This may miss custom elements or Web Components that are focusable but do not match the hardcoded tag name list.
- **No story for `hideDelay` prop:** Adding a story that demonstrates the delayed hide behavior would help consumers understand the feature.
- **The `delay` prop defaults to 200ms but `hideDelay` defaults to 0ms:** This asymmetry is intentional for UX (tooltips should appear with a slight delay but disappear immediately), but it is not explicitly documented beyond the JSDoc defaults.
- **Missing `focusTrigger` story for `always` and `never` modes:** While `focusTrigger` is in the argTypes, there are no stories specifically demonstrating the difference between `'auto'`, `'always'`, and `'never'` focus trigger modes.

## Recommendations

- Make `isTouchDevice` reactive by using `matchMedia` with an event listener or by checking at tooltip show time rather than module load time.
- Add tests for `hideDelay`, `alignment`, and `hasHoverIndication` props.
- Add stories for `hideDelay` and `focusTrigger` modes.
- The core architecture is sound: the hook-based approach with separate `ref`, `positionRef`, and `interactionRef` provides excellent flexibility. The stable handler ref pattern avoids stale closure issues. The `useTooltip` hook story demonstrates the hook-based API well.

## SVA Conversion

**Benefit: Low / None**

The `Tooltip` component itself (`Tooltip.tsx`) renders no styled DOM of its own — it delegates entirely to `HoverLayerTrigger` and `useTooltip`. The actual tooltip popup styling lives in `useTooltip.tsx` as a small `const styles = {...}` object with `tooltipContainer`, `tooltipContent`, and a placement-keyed `marginByPlacement` map (`above`/`below`/`start`/`end`), composed via `cx()` when rendering into the layer. While that is technically two slots (container + content) plus a placement variant, it is hook-internal styling for a popup with no size/variant/state matrix, and sva recipes are oriented toward component markup rather than imperative `layer.render(...)` calls. The marginal benefit (turning the 2-block + placement-map into a slot recipe) does not justify conversion; cx-composed styles are appropriate here.
