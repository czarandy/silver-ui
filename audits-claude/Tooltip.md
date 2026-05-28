# Tooltip Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/Tooltip/Tooltip.tsx`
- `src/components/Tooltip/useTooltip.tsx`
- `src/components/Tooltip/Tooltip.stories.tsx`
- `src/components/Tooltip/Tooltip.test.tsx`
- `src/components/Tooltip/index.ts`
- `src/internal/useLayer.tsx` (dependency)
- `src/internal/mergeRefs.ts` (dependency)
- `src/internal/useIsomorphicLayoutEffect.ts` (dependency)

---

## Performance Problems

1. **`tooltip` object as a dependency in layout effects causes excessive cleanup/re-attachment (Tooltip.tsx, lines 105-131 and 133-159):**
   Both `useIsomorphicLayoutEffect` calls list `tooltip` as a dependency. The `useTooltip` hook returns a new object from `useMemo` (useTooltip.tsx, line 265), but that memo depends on `ref`, `layer.ref`, `interactionRef`, `layer.anchorId`, `layer.id`, and `renderTooltip`. Several of these are `useCallback` results that themselves depend on frequently-changing references (e.g., `interactionRef` depends on all five event handlers). Any time any option like `delay`, `isEnabled`, or `isOpen` changes, the entire `tooltip` object reference changes, causing both layout effects to tear down and re-attach `aria-describedby` attributes and the layer ref. This is wasted work -- the effects only need `tooltip.ref` and `tooltip.describedBy`, not the whole object. Destructuring these values before passing them as dependencies would reduce churn.

2. **`matchMedia('(hover: none)')` called on every mouseenter event (useTooltip.tsx, lines 139-145):**
   The touch-device check runs `window.matchMedia('(hover: none)')` on every `mouseenter` event. While `matchMedia` is fast, this could be hoisted to a module-level constant or cached in a ref, since hover capability does not change during a session (ignoring device emulation in DevTools).

3. **Event listeners are registered/unregistered via manual `addEventListener`/`removeEventListener` (useTooltip.tsx, lines 175-207):**
   This is a valid pattern for imperative ref-based attachment, but the `interactionRef` callback is recreated whenever any of its five handler dependencies change (line 200-206). Because these handlers depend on `scheduleShow`/`scheduleHide` which depend on `delay`/`hideDelay`/`isEnabled`/`isOpen`/`layer`, changing any of those props causes all listeners to be torn down and re-attached. This is correct but costs more than necessary. A stable ref pattern (storing the latest handlers in a ref and using stable wrapper functions) would avoid the listener churn.

---

## Accessibility Concerns

1. **No Escape key dismissal (useTooltip.tsx, entire file):**
   WCAG 2.1 Success Criterion 1.4.13 (Content on Hover or Focus) requires that tooltips be dismissable without moving hover or focus -- typically via the Escape key. The component does not listen for `keydown` events to dismiss the tooltip on Escape. The underlying `useLayer` uses `popover: 'manual'` (useLayer.tsx, line 182), which does not get browser-native light-dismiss behavior. An explicit Escape key handler is needed.

2. **`display: contents` wrapper strips the element from the accessibility tree in some browsers (Tooltip.tsx, line 37-39):**
   When wrapping element children (non-text), the component renders a `<div>` with `display: contents`. While modern browsers have largely fixed the accessibility bug where `display: contents` removed elements from the accessibility tree, older versions of Safari and Firefox still exhibit this behavior. This wrapper div is the element that receives `ref` and `data-testid`, so if it is removed from the accessibility tree, screen readers may not properly associate the tooltip with its trigger in those browsers.

3. **Text-only children get `tabIndex={0}` but no `role` (Tooltip.tsx, line 180):**
   When `children` is a string, the component wraps it in a `<span tabIndex={0}>`. This makes it focusable but provides no semantic role. Screen readers will announce it as a generic focusable element. Adding `role="text"` or wrapping the tooltip trigger in a semantically meaningful element would improve the experience. Additionally, there is no visible focus indicator style applied -- the component relies on the browser's default focus outline, which may be absent or insufficient depending on the design system's global reset styles.

4. **`aria-describedby` is set to an empty string as fallback (Tooltip.tsx, lines 117-119 and 145-147):**
   The `mergeIds` function returns `undefined` when no IDs are present, but the code uses `?? ''` to set `aria-describedby` to an empty string. An empty `aria-describedby=""` attribute is technically valid but pointless and could confuse some screen readers or linting tools. It should be omitted entirely in that case. In practice, `tooltip.describedBy` is always defined (it comes from `useId`), so the fallback to `''` is defensive but the pattern is still incorrect for the general case.

5. **`anchorRef` mode does not prevent tooltip from hovering over non-interactive anchors (Tooltip.tsx, lines 105-131):**
   When using `anchorRef`, the layout effect attaches `aria-describedby` but the interaction listeners (mouseenter, focus) are attached by `useTooltip` via its own `ref`. In `anchorRef` mode, `tooltip.ref` is called with the anchor element (line 115), which means interaction listeners are attached to the anchor. However, if the anchor is not focusable and `focusTrigger` is `'auto'`, keyboard users cannot access the tooltip at all -- there is no `tabIndex` applied to the anchor in this mode (unlike the text-only path).

---

## Logic Bugs

1. **`isDefaultOpen` effect runs on every `layer` reference change (useTooltip.tsx, lines 223-227):**
   The effect `useEffect(() => { if (isDefaultOpen) { layer.show(); } }, [isDefaultOpen, layer])` has `layer` as a dependency. Since `layer` is not memoized by `useLayer` (useLayer.tsx returns a plain object literal at line 192), this effect re-runs on every render, calling `layer.show()` every render when `isDefaultOpen` is `true`. In practice, `layer.show()` is idempotent (it checks `isOpenRef.current` at line 102), so this does not cause visible bugs, but it is semantically incorrect for a "default open" prop -- it should only run once on mount, and would fight with user-initiated close actions by immediately re-opening the tooltip.

2. **`isOpen` controlled mode effect also re-runs on every render (useTooltip.tsx, lines 229-242):**
   Same issue: `layer` is not memoized, so the effect runs on every render. When `isOpen` is `true`, `layer.show()` is called every render. Again idempotent, but wasteful and semantically wrong. More critically, the `clearTimeouts()` call at line 235 runs every render, which could cancel a pending hide animation if one were added in the future.

3. **Second layout effect condition is fragile (Tooltip.tsx, lines 133-159):**
   The second layout effect runs when `anchorRef == null && !textOnly`. It grabs `wrapperRef.current?.firstElementChild` and attaches the tooltip to it. However, this only runs on mount (and when `tooltip` changes). If the child element is conditionally rendered or changes identity after mount, the tooltip will be attached to a stale or null element. The effect does not re-run when children change because `children` is not in the dependency array.

4. **Focus trigger evaluation happens once at ref-attach time, not dynamically (useTooltip.tsx, lines 188-195):**
   The `focusTrigger` option is evaluated inside the `interactionRef` callback when the element is first attached. If the element's focusability changes (e.g., a button becomes `disabled`), the focus listeners are not re-evaluated. The `isFocusable` check (line 190) runs against the element at attachment time only. This is unlikely to cause real problems since `interactionRef` is recreated when `focusTrigger` changes, but it would not react to changes in the element's own attributes.

5. **`onShow`/`onHide` callbacks passed to `useLayer` are not stable (useTooltip.tsx, line 93):**
   `useLayer({onShow, onHide})` is called with the `onShow` and `onHide` values from options. Inside `useLayer`, `onShow` is captured in the `show` callback's closure (useLayer.tsx, line 109) and `onHide` in `hide` (line 120) and `handleToggle` (line 148). These callbacks are memoized via `useCallback` with `[onShow]` and `[onHide]` as dependencies. If the consumer's `onOpenChange` is not stable (not wrapped in `useCallback`), the entire `layer` object cascades new references on every render, amplifying the performance issue described above.

---

## Unclear API

1. **Dual modes with unclear interaction (`anchorRef` vs `children`) (Tooltip.tsx, lines 16-34):**
   The component supports two usage patterns: wrapping children or attaching to an external `anchorRef`. The interaction between these modes is not well documented. When `anchorRef` is provided AND `children` is provided, both rendering paths activate (the `anchorRef` layout effect runs AND the children are rendered with a wrapper div). The `anchorRef != null && children == null` early return (line 161) only catches the case where `anchorRef` is provided without children, but the mixed case is implicitly allowed and may produce confusing double-attachment behavior.

2. **`hasHoverIndication` prop semantics are non-obvious (Tooltip.tsx, lines 25, 81-82):**
   The `'auto'` value means "show underline only for text-only children." This is reasonable but the prop name and type (`'auto' | boolean`) do not communicate this behavior. A consumer might expect `'auto'` to show underline on any hover target, or might not understand why their text tooltip has a dashed underline by default. A JSDoc comment would help.

3. **`focusTrigger` values are not self-explanatory (useTooltip.tsx, line 17):**
   `'auto'` means "attach focus listeners only if the element is natively focusable." `'always'` and `'never'` are clearer. The `'auto'` behavior is sensible but not guessable from the type alone.

4. **`UseTooltipReturn` exposes `ref`, `positionRef`, and `interactionRef` without guidance (useTooltip.tsx, lines 32-38):**
   The hook returns three separate refs. `ref` combines both `positionRef` and `interactionRef`, but the split is exposed for advanced use cases without documentation explaining when to use which. A consumer might use `ref` and `interactionRef` together, causing double-attachment of interaction listeners.

---

## Missing Tests

1. **No test for tooltip dismissal on mouse leave:**
   The test suite verifies show-on-hover but never verifies that the tooltip hides when the mouse leaves the trigger.

2. **No test for the `delay` prop:**
   The test uses `delay={0}` as a convenience (line 68) but never verifies that a nonzero delay actually delays tooltip appearance.

3. **No test for `hideDelay` prop:**
   The `hideDelay` option is not tested at all.

4. **No test for `isEnabled={false}`:**
   Disabling the tooltip is not tested. Verifying that hover/focus do not trigger the tooltip when disabled is important.

5. **No test for `focusTrigger` modes:**
   None of the three `focusTrigger` values (`'auto'`, `'always'`, `'never'`) are tested. The auto-detection of focusability (`isFocusable` in useTooltip.tsx, line 65) is also untested.

6. **No test for tooltip content rendering:**
   No test asserts that the tooltip's `content` prop actually appears in the DOM (e.g., via `getByRole('tooltip')` with text matching).

7. **No test for Escape key dismissal:**
   Since Escape key handling is missing from the implementation (see Accessibility section), there is correspondingly no test for it.

8. **No test for `placement` or `alignment` props:**
   Positioning behavior is not tested (though this may be considered an integration concern for `useLayer`).

9. **No test for `className` or `style` forwarding:**
   The wrapper element accepts `className` and `style` but these are not verified in tests.

10. **No test for the `useTooltip` hook directly:**
    The hook is exported as a public API but has no standalone tests. All testing is indirect through the `Tooltip` component.

11. **No test for cleanup behavior:**
    When the component unmounts, timeouts should be cleared and `aria-describedby` should be restored to its previous value. Neither cleanup path is tested.

12. **No test for the `hasHoverIndication` prop:**
    The dashed-underline hover indication for text-only tooltips is not verified.

---

## Missing Stories

1. **No story for `alignment` variations:**
   The story file demonstrates `placement` (above/below/start/end) but not `alignment` (start/center/end). Alignment significantly affects tooltip positioning and should be shown.

2. **No story for `delay` / `hideDelay`:**
   These timing props affect the user experience but have no story demonstrating different delay values.

3. **No story for `focusTrigger`:**
   The three modes (`auto`/`always`/`never`) are not demonstrated. A story showing keyboard-triggered tooltips would be valuable.

4. **No story for `isEnabled={false}`:**
   Disabled tooltips are not shown.

5. **No story for `isDefaultOpen`:**
   A tooltip that is open on mount is not demonstrated.

6. **No story for controlled mode (`isOpen` + `onOpenChange`):**
   The controlled API is not shown in stories. This is a common pattern consumers need to see.

7. **No story for `anchorRef` usage:**
   The external anchor pattern is tested but not demonstrated in Storybook.

8. **No story for `hasHoverIndication`:**
   The dashed-underline style is not visually demonstrated. The `'auto'` vs explicit `true`/`false` behavior would benefit from side-by-side comparison.

9. **No story for rich content (ReactNode) in `content`:**
   All stories use plain text strings for `content`. Since the prop accepts `ReactNode`, a story showing formatted or multi-line tooltip content would be useful.

10. **No story demonstrating the `useTooltip` hook directly:**
    The hook is a public export intended for advanced consumers, but there is no story showing how to use it standalone.

---

## Additional Observations

- **`popover: 'manual'` is used instead of `'hint'` (useLayer.tsx, line 182).** The Popover API's `'hint'` value (included in the `PopoverValue` type at line 29) was designed specifically for tooltips -- it provides automatic light-dismiss and allows only one hint popover at a time (closing others when a new one opens). Switching to `popover: 'hint'` would provide free Escape-key dismissal and single-tooltip-at-a-time behavior, addressing the accessibility concern above. Browser support for `popover="hint"` should be verified before adopting it.
- **Clean barrel exports.** The `index.ts` file exports both the component and the hook with all relevant types -- well organized.
- **`displayName` is set** -- good for React DevTools debugging.
- **The `isFocusable` utility (useTooltip.tsx, lines 65-77) is pragmatic but incomplete.** It does not account for `<summary>`, `<details>`, elements with `contenteditable="true"` (it does check `isContentEditable`), `<audio controls>`, `<video controls>`, or elements inside an `inert` subtree. For a tooltip trigger check, this is likely sufficient, but it may miss edge cases.
- **No recipe file.** Unlike some other Silver UI components, Tooltip uses inline `css()` calls rather than a Panda CSS recipe. This is fine for a component with minimal variant logic, but it does mean the tooltip's visual styles are split between `Tooltip.tsx` (wrapper styles) and `useTooltip.tsx` (container/content styles), which could make theming harder.
