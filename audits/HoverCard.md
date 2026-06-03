# HoverCard Audit

## Summary

HoverCard is a floating card that appears on hover or focus of a trigger element. It supports both text triggers (rendered as inline `<span>` with `tabIndex=0`) and element triggers (like buttons), with configurable placement, alignment, show/hide delays, focus trigger behavior, and hover indication styling. The hook `useHoverCard` manages all interaction logic including hover delays, focus handling, and Escape dismissal.

## Issues

### Critical

- None identified.

### High

- None identified.

### Medium

- **`window.matchMedia('(hover: none)')` called on every mouse enter**: The `handleMouseEnter` callback calls `window.matchMedia('(hover: none)')` synchronously on every mouse enter event. This creates a new `MediaQueryList` object each time. The result should be cached or evaluated once at mount time to avoid unnecessary overhead on hover-heavy UIs.
- **`useIsomorphicLayoutEffect` with `hoverCard` in dependency array causes frequent re-registration**: The effect in `HoverCard` that attaches `hoverCard.ref` and sets `aria-describedby` on element children depends on `[hoverCard, textOnly]`. Since `useHoverCard` returns a new object from `useMemo` whenever any of its many dependencies change, this effect re-runs frequently, causing DOM attribute thrashing on the child element.
- **Text triggers with `tabIndex={0}` lack a semantic role**: Text wrapped in a `<span tabIndex={0}>` is focusable but has no ARIA role. Screen readers will announce it as "text" without context about its interactive nature. Adding `role="note"` or `role="button"` (if click is supported) would improve the experience.

### Low

- **No story for `focusTrigger="always"` or `focusTrigger="never"` with element triggers**: The `focusTrigger` prop has three values but stories only show the default behavior. The `never` value is tested but not shown in stories.
- **No test for `alignment` or `placement` rendering**: Tests verify behavior (open/close, focus, disabled) but don't verify that placement/alignment props are passed through correctly.
- **`mergeIds` helper is overly generic**: The `mergeIds` function joins IDs with spaces but could produce unexpected results if any ID itself contains spaces. This is unlikely in practice but the function doesn't document this assumption.
- **Element trigger cleanup in `useIsomorphicLayoutEffect` removes `aria-describedby` entirely**: If the child element had an `aria-describedby` from another source, the cleanup correctly restores it. However, if the original was empty/missing and another component adds one during the HoverCard's lifetime, the cleanup will remove that too.
- **No story demonstrating `ref` prop**: The `ref` prop for text triggers is accepted but not shown in stories.
- **`className`, `style`, `data-testid` only apply to text triggers**: These props are silently ignored for element triggers (when children is not text-only). This is documented implicitly by the prop types but could surprise consumers.

## Recommendations

- Cache the `matchMedia('(hover: none)')` result at mount time or use a shared hook to avoid per-event overhead.
- Consider adding `role="note"` or another appropriate ARIA role to text triggers to give screen readers context about the interactive nature.
- Add stories demonstrating `focusTrigger` variants and different `alignment`/`placement` combinations with element triggers.
- Document that `className`, `style`, `data-testid`, and `ref` only apply to text triggers.
- The test coverage is reasonable (7 tests) but could benefit from additional tests for placement rendering and edge cases like rapid hover-in/hover-out sequences.
