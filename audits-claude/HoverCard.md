# HoverCard Component Audit

**Files reviewed:**

- `src/components/HoverCard/HoverCard.tsx`
- `src/components/HoverCard/useHoverCard.tsx`
- `src/components/HoverCard/index.ts`
- `src/components/HoverCard/HoverCard.stories.tsx`
- `src/components/HoverCard/HoverCard.test.tsx`

---

## Performance Problems

### 1. `useHoverCard` return object is not memoized (useHoverCard.tsx, lines 304-313)

The `useHoverCard` hook returns a new object literal on every render. The sibling `useTooltip` hook wraps its return value in `useMemo` (useTooltip.tsx, line 265), but `useHoverCard` does not. This means any consumer that depends on the returned object for referential equality (e.g., in a dependency array or `React.memo` boundary) will see unnecessary re-renders.

### 2. `layer` in `useIsomorphicLayoutEffect` dependency causes extra effect cycles (HoverCard.tsx, line 178)

The layout effect at line 153 has `[hoverCard, textOnly]` as its dependencies. Since `hoverCard` is the un-memoized return of `useHoverCard` (see issue 1 above), this effect will re-run on every render for element-child triggers, repeatedly setting and tearing down `aria-describedby` and calling `hoverCard.ref`.

### 3. No `hover: none` media query guard (useHoverCard.tsx, line 135)

The `useTooltip` hook checks `window.matchMedia('(hover: none)')` before scheduling show on `mouseenter` (useTooltip.tsx, line 139-145). `useHoverCard` does not. On touch-only devices, taps fire synthetic `mouseenter` events, which will open the hover card unexpectedly and may conflict with other touch interactions.

---

## Accessibility Concerns

### 4. No ARIA role on the hover card popover (useHoverCard.tsx, line 249-301)

The rendered hover card `<div>` is never assigned an ARIA role. The `useTooltip` hook passes `role: 'tooltip'` (useTooltip.tsx, line 258), but `useHoverCard.renderHoverCard` does not set any role. Since hover cards can contain interactive content (links, buttons), the appropriate role would vary, but a reasonable default might be `role="dialog"` or at minimum `role="complementary"`. Without a role, assistive technologies have no semantic indication of what the popover region is.

### 5. `aria-describedby` may be wrong for interactive content (HoverCard.tsx, line 165-167)

Hover cards are semantically richer than tooltips -- they can contain interactive elements like links or buttons. Using `aria-describedby` is correct for tooltips with plain text, but for hover cards with interactive content, `aria-details` (or `aria-labelledby` depending on context) would be more semantically appropriate. `aria-describedby` causes screen readers to flatten all descendant text into a single string, which loses the structure/interactivity of the content.

### 6. Escape key handling unconditionally calls `stopPropagation` (useHoverCard.tsx, lines 168-169)

When the hover card is not open, pressing Escape on the trigger still calls `event.stopPropagation()`. This swallows Escape key events that parent components (e.g., a Dialog or modal) may need to handle. The handler should check whether the hover card is actually open before stopping propagation.

### 7. Text trigger `<span tabIndex={0}>` lacks an explicit role (HoverCard.tsx, line 197)

The text trigger `<span>` is made focusable with `tabIndex={0}` but has no ARIA role. Screen readers will announce it as generic text. Adding `role="button"` or a more descriptive role or an `aria-label` would improve the experience by communicating that the element is interactive.

---

## Logic Bugs

### 8. `focusout` listener removal is unconditional, but attachment is conditional (useHoverCard.tsx, lines 180-188 vs 195-201)

In the `interactionRef` cleanup path (lines 180-188), `focusin` and `focusout` listeners are always removed from the previous element. However, these listeners are only attached conditionally (when `shouldAttachFocus` is true, lines 195-201). This is not harmful -- removing a listener that was never added is a no-op -- but if the `handleFocusIn`/`handleFocusOut` references change between renders, the cleanup may attempt to remove a different function reference than the one that was added, leaving stale listeners attached. The same pattern exists in `useTooltip`, so this may be intentional, but it is worth noting.

### 9. `isDefaultOpen` effect runs on every `layer` change (useHoverCard.tsx, lines 230-234)

The `isDefaultOpen` effect depends on `[isDefaultOpen, layer]`. Since `layer` is a new object every render (from `useLayer`), this effect will re-fire `layer.show()` on every render when `isDefaultOpen` is `true`, not just on mount. In practice, `layer.show()` is idempotent when already open (it checks `isOpenRef`), so this is not a visible bug, but it is unnecessary work and a semantic mismatch with "default open on mount."

### 10. Escape in hover card content does not guard against closed state (useHoverCard.tsx, lines 269-276)

The `onKeyDown` handler inside the hover card content fires `layer.hide()` and `triggerRef.current?.focus()` without checking if the card is actually open. While unlikely (the content is only rendered when visible), it could cause unexpected focus shifts if the popover's toggle state gets out of sync.

---

## Unclear API

### 11. `hasHoverIndication` accepts `'auto' | boolean` -- unusual union type (HoverCard.tsx, line 52)

The type `'auto' | boolean` is an uncommon pattern. A consumer writing `hasHoverIndication={false}` gets a different behavior than `hasHoverIndication="auto"`, but the distinction between `"auto"` and `true` is subtle (both show indication for text triggers, but `true` forces it for element triggers too). Consider documenting this more clearly in the JSDoc, or simplifying to `boolean | undefined` where `undefined` means "auto."

### 12. `className`, `style`, `ref`, and `data-testid` only apply to text triggers (HoverCard.tsx, lines 28-87)

These props are silently ignored when `children` is an element (non-text) trigger. The JSDoc says "applied to the trigger wrapper for text triggers," but a consumer wrapping a `<Button>` and passing `className` will see no effect with no warning. This could be confusing.

### 13. `HoverCardFocusTrigger` is re-exported from both the component and the hook (HoverCard.tsx, line 14; index.ts, lines 1-7)

The type `HoverCardFocusTrigger` is exported from `useHoverCard.tsx`, re-exported by `HoverCard.tsx` (line 14), and also exported from `index.ts` via the `useHoverCard` barrel. This double-export path is not harmful but adds surface area; consumers might import it from either path.

---

## Missing Tests

### 14. No test for closing behavior (mouseLeave / focusOut)

Tests verify opening on hover (line 40) but never verify that the hover card closes when the mouse leaves or focus moves away. There should be tests for `hidePopoverMock` being called after `mouseLeave` with the appropriate delay.

### 15. No test for Escape key dismissal

The Escape key handling in `useHoverCard.tsx` (lines 166-175 and 269-276) is untested. This is important because of the `stopPropagation` behavior noted in issue 6.

### 16. No test for `isEnabled={false}` disabling interactions

The `isEnabled` prop gates hover/focus behavior (useHoverCard.tsx, lines 113-114, 139), but no test verifies that setting `isEnabled={false}` prevents the card from opening.

### 17. No test for controlled `isOpen` prop

The Tooltip test file includes a "supports controlled open state" test (Tooltip.test.tsx, line 103), but HoverCard has no equivalent. The controlled mode logic (useHoverCard.tsx, lines 236-247) is untested.

### 18. No test for `isDefaultOpen`

The Tooltip test file tests "shows on mount when isDefaultOpen is true" (Tooltip.test.tsx, line 124), but HoverCard does not.

### 19. No test for hovering into the hover card content (keep-alive behavior)

A key differentiator of HoverCard vs Tooltip is that users can move their mouse into the card content without it closing (useHoverCard.tsx, lines 278-284). This critical behavior has no test coverage.

### 20. No test for focus moving into the hover card content

When focus moves from the trigger into the hover card popover, the card should stay open (useHoverCard.tsx, lines 153-163, checking if `relatedTarget` is inside the popover). This is untested.

### 21. No test for `focusTrigger` prop values

The three `focusTrigger` modes (`'auto'`, `'always'`, `'never'`) are untested.

---

## Missing Stories

### 22. No story for `placement` variations

The Tooltip stories include a `Placements` story demonstrating all four placements (Tooltip.stories.tsx, line 54). HoverCard has no equivalent, making it hard for consumers to preview positioning.

### 23. No story for `alignment` variations

No story demonstrates the `start`, `center`, `end` alignment options.

### 24. No story for `isEnabled={false}`

No story demonstrates the disabled state.

### 25. No story for controlled `isOpen` state

No story demonstrates using the controlled `isOpen` / `onOpenChange` pattern.

### 26. No story for `focusTrigger` variations

No story demonstrates the `auto` / `always` / `never` focus trigger modes.

### 27. No story for `hasHoverIndication` variations

The `hasHoverIndication` prop is surfaced in argTypes but no dedicated story demonstrates the visual difference between `true`, `false`, and `'auto'`.

### 28. No story demonstrating interactive content in the hover card

A key use case for HoverCard (vs Tooltip) is containing interactive elements like links or buttons inside the card content. No story demonstrates this, which would be valuable for both documentation and testing.

### 29. No story with `delay` / `hideDelay` customization

No story demonstrates or documents the timing behavior with custom delay values.

---

## Summary

The HoverCard component is well-structured and follows established patterns from the codebase (closely mirroring the Tooltip architecture). The most impactful issues to address are:

1. **Memoize the `useHoverCard` return value** (performance, issue 1) -- easy fix, matches the `useTooltip` pattern.
2. **Add ARIA role to the popover** (accessibility, issue 4) -- important for screen reader users.
3. **Guard Escape `stopPropagation` on open state** (accessibility, issue 6) -- prevents swallowing parent Escape handlers.
4. **Add `hover: none` media query guard** (performance/UX, issue 3) -- prevents ghost opens on touch devices.
5. **Expand test coverage** (issues 14-21) -- the current 4 tests cover basic rendering but miss all closing/interaction/controlled behavior.
6. **Add placement and interactive-content stories** (issues 22, 28) -- highest value story additions.
