# Popover Component Audit

**Files reviewed:**

- `src/components/Popover/Popover.tsx`
- `src/components/Popover/usePopover.tsx`
- `src/components/Popover/Popover.stories.tsx`
- `src/components/Popover/Popover.test.tsx`
- `src/components/Popover/index.ts`
- `src/internal/useLayer.tsx` (dependency)
- `src/internal/useFocusTrap.ts` (dependency)

**Note:** No `.recipe.ts` file exists for this component. Styles are defined inline via `css()` in both `Popover.tsx` and `usePopover.tsx`.

---

## Performance Problems

### 1. `popover` object in `useCallback` dependency causes excessive re-creation (medium)

- **File:** `Popover.tsx`, lines 153, 163, 207, 229
- The `handleTriggerClick` callback depends on `popover` (the entire return object from `usePopover`). Since `usePopover` returns a new object on every render (it is not memoized), `handleTriggerClick` is re-created on every render, which cascades to `handleTriggerKeyDown` (depends on `handleTriggerClick`), `attachTrigger` (depends on both), and the layout effect (depends on `attachTrigger` and `popover`). This means the layout effect runs on every render, detaching and re-attaching DOM event listeners and ARIA attributes each time. Consider destructuring the specific stable references needed (`popover.toggle`, `popover.triggerProps`, `popover.triggerRef`) instead of depending on the whole `popover` object, or memoizing the return value of `usePopover`.

### 2. Duplicate `styles.surface` class applied to two nested elements (minor)

- **File:** `usePopover.tsx`, lines 128-129 and lines 140-141
- In the `render` callback, `styles.surface` is applied as a `className` on the inner `<div role="dialog">` (line 128) AND merged into the `props.className` passed to `layer.render()` (line 141), which applies it to the outer popover container `<div>`. This means the surface styles (background, border-radius, box-shadow, border) are applied to two nested elements. While not a performance issue per se, the double border and double box-shadow result in unnecessary paint work and a visually incorrect double-border effect.

### 3. Layout effect teardown and re-setup on every render (medium)

- **File:** `Popover.tsx`, lines 210-229
- The `useIsomorphicLayoutEffect` that attaches the trigger has `[anchorRef, attachTrigger, popover]` as dependencies. As noted in item 1, `popover` changes every render, so this effect tears down and re-runs every render cycle. This involves DOM queries (`findTriggerButton`), `setAttribute`/`removeAttribute` calls, and `addEventListener`/`removeEventListener` calls on every render.

---

## Accessibility Concerns

### 1. `aria-modal="true"` on non-modal popover is incorrect (high)

- **File:** `usePopover.tsx`, line 127
- The dialog element has `aria-modal="true"`, but the popover is not truly modal -- it uses `popover="auto"` (light dismiss) by default and does not block interaction with the rest of the page. Setting `aria-modal="true"` on a non-modal element causes screen readers to incorrectly treat the rest of the page as inert, preventing users from navigating to content outside the popover. This is a WCAG 4.1.2 (Name, Role, Value) violation. The attribute should either be removed entirely or set conditionally based on whether the popover is truly modal.

### 2. Missing `aria-labelledby` fallback when no `label` is provided (medium)

- **File:** `usePopover.tsx`, line 126; `Popover.tsx`, line 68
- The `label` prop is optional. When omitted, the `<div role="dialog">` has no accessible name (`aria-label` is `undefined`). Dialogs require an accessible name per WCAG 4.1.2. Consider requiring `label` (making it non-optional), providing a default, or supporting `aria-labelledby` as an alternative.

### 3. Focus is not returned to trigger on close (medium)

- **File:** `usePopover.tsx`, `useFocusTrap.ts`
- When the popover is closed (via Escape, light dismiss, or the close button), focus is not explicitly returned to the trigger element. The Popover API's light dismiss may handle this in some browsers, but the behavior is inconsistent across browsers and screen readers. WAI-ARIA dialog pattern requires that focus returns to the triggering element on close.

### 4. `handleTriggerKeyDown` prevents default for Space on `[role="button"]` but may cause double-fire (low)

- **File:** `Popover.tsx`, lines 165-173
- For elements with `role="button"`, the component adds a `keydown` handler for Enter and Space. However, browsers already fire a `click` event on Space/Enter for `<button>` elements, and some browsers also fire `click` on `[role="button"][tabindex]` for Enter. The `click` listener (line 189) plus the `keydown` listener could result in `handleTriggerClick` being called twice for the same user action, causing the popover to toggle open and then immediately closed. The 50ms debounce (line 158) may catch some cases but is a fragile guard.

### 5. Close button is visually hidden but uses a non-standard technique (low)

- **File:** `usePopover.tsx`, lines 56-74
- The close button wrapper uses `clipPath: 'inset(50%)'` and size `1px` x `1px` to visually hide the button, then reveals it on `_focusWithin`. This approach works, but the button is completely invisible even to sighted keyboard users until they tab to it. A screen-reader-only close button that becomes visible on focus is an established pattern, but the current CSS could confuse sighted keyboard users who don't realize they can tab to a close button.

---

## Logic Bugs

### 1. Controlled mode sync effect has stale closure risk (medium)

- **File:** `Popover.tsx`, lines 231-241
- The effect that syncs controlled `isOpen` with `popover.show()`/`popover.hide()` depends on `[isControlled, isOpen, popover]`. Since `popover` is a new object every render (as discussed in Performance item 1), this effect runs on every render. More importantly, during the transition between controlled and uncontrolled modes (e.g., `isOpen` goes from `undefined` to `true`), there is no guard to prevent `popover.show()` from being called before the trigger ref is attached, which would silently fail (`popoverRef.current == null` check in `useLayer.show()`).

### 2. `lastHideTimeRef` debounce is timing-dependent and unreliable (medium)

- **File:** `Popover.tsx`, lines 139, 158-159
- The 50ms debounce between hide and re-open is designed to prevent the popover from re-opening when the trigger click event fires after a light-dismiss hide. However, 50ms is an arbitrary threshold that could be too short on slow devices or too long under certain event ordering. This is a common pattern but can cause subtle bugs: if a user clicks the trigger very quickly after the popover auto-closes, their intentional click is swallowed. Consider using a flag-based approach (e.g., set a `justClosed` flag in `onHide`, clear it in a microtask or `requestAnimationFrame`) instead of a time-based debounce.

### 3. `attachTrigger` cleanup does not restore original ARIA attributes (low)

- **File:** `Popover.tsx`, lines 197-199
- The cleanup function calls `removeAttribute` for `aria-haspopup`, `aria-expanded`, and `aria-controls`. If the trigger element had these attributes set before the Popover mounted (e.g., set by another component or by the consumer), they would be permanently removed on unmount. Consider saving and restoring original values.

### 4. `anchorRef` mode renders popover content without a wrapper, causing potential layout issues (low)

- **File:** `Popover.tsx`, lines 259-261
- When `anchorRef` is provided and `children` is null, the component returns `<>{popoverContent}</>`. This means the popover layer element is rendered as a direct child of wherever the `<Popover>` is placed in the tree. If the parent has `display: flex` or `display: grid`, the popover layer element (even though it uses the Popover API for positioning) contributes to the parent's layout, potentially causing unexpected spacing.

---

## Unclear API

### 1. `children` and `anchorRef` interaction is not obvious (medium)

- **File:** `Popover.tsx`, lines 22-28
- The relationship between `children` and `anchorRef` is implicit: if `anchorRef` is provided without `children`, the popover attaches to the external element. If both are provided, `anchorRef` takes precedence for positioning but `children` is still rendered in a wrapper div. If neither is provided, `wrapperRef` is used but there's no trigger to find. These three modes are not documented clearly and the `anchorRef` + `children` combination is potentially confusing.

### 2. `hasCloseButton`, `closeButtonLabel`, `hasAutoFocus`, `hasSurface`, `hasLightDismiss` are on `usePopover` but only some are on `PopoverProps` (medium)

- **File:** `Popover.tsx` lines 55-56; `usePopover.tsx` lines 19-20
- `PopoverProps` exposes `hasCloseButton`, `closeButtonLabel`, and `hasAutoFocus`, but does NOT expose `hasSurface` or `hasLightDismiss` (which are `usePopover`-only options). There is no documentation explaining which features are only available via the hook. Consumers who need `hasSurface={false}` or `hasLightDismiss={false}` must use `usePopover` directly, but this is not mentioned anywhere.

### 3. `width` prop only applies to the inner content div, not the popover layer (low)

- **File:** `Popover.tsx`, lines 243-246, 253
- The `width` prop sets an inline style on the inner content `<div>`, not on the popover layer element. This means the surface border/shadow wraps a potentially different width than the content div, depending on CSS box model interactions. The prop name `width` does not clarify which element it sizes.

### 4. `content` is required but `children` is optional -- naming is potentially confusing (low)

- **File:** `Popover.tsx`, lines 28-29, 38-42
- In React convention, `children` is typically the primary content. Here, `children` is the trigger and `content` is the popover body. This is a reasonable design but inverts the typical expectation. A consumer might try `<Popover>body</Popover>` expecting the body to be the popover content.

---

## Missing Tests

### 1. No test for closing the popover (high)

- **File:** `Popover.test.tsx`
- The test suite verifies opening (line 34-53) but never tests closing. There is no test for: clicking the trigger again to toggle closed, pressing Escape to close, light-dismiss behavior, or the close button. These are core behaviors.

### 2. No test for controlled `isOpen` prop (high)

- **File:** `Popover.test.tsx`
- The `isOpen` prop enables controlled mode (lines 231-241 of `Popover.tsx`), but there are no tests for: opening via `isOpen={true}`, closing via `isOpen={false}`, or switching between controlled and uncontrolled modes.

### 3. No test for `isEnabled={false}` (medium)

- **File:** `Popover.test.tsx`
- The `isEnabled` prop (default `true`) prevents the popover from opening when set to `false`. No test verifies this behavior.

### 4. No test for `placement` and `alignment` props (medium)

- **File:** `Popover.test.tsx`
- No test verifies that different `placement` or `alignment` values are passed through to the layer positioning. While visual positioning is hard to test in JSDOM, at minimum the CSS custom properties (`positionArea`) or class names could be asserted.

### 5. No test for `width` prop (low)

- **File:** `Popover.test.tsx`
- No test verifies that `width={280}` results in `style="width: 280px"` or that `width="50%"` passes through as a string.

### 6. No test for `hasAutoFocus` behavior (medium)

- **File:** `Popover.test.tsx`
- No test verifies that focus moves into the popover on open (or doesn't when `hasAutoFocus={false}`).

### 7. No test for `usePopover` hook directly (medium)

- **File:** `Popover.test.tsx`
- The `usePopover` hook is exported as a public API (via `index.ts`) but has zero direct tests. Consumers using the hook directly (e.g., for custom popover implementations) have no test coverage verifying the hook's contract.

### 8. No test for `ref` forwarding (low)

- **File:** `Popover.test.tsx`
- The `ref` prop is forwarded to the content div (line 252 of `Popover.tsx`) but is not tested.

### 9. No test for `displayName` (low)

- **File:** `Popover.tsx`, line 273
- `Popover.displayName = 'Popover'` is set but never verified.

---

## Missing Stories

### 1. No story for `placement` variations (high)

- **File:** `Popover.stories.tsx`
- The `placement` prop accepts `'above' | 'below' | 'start' | 'end'` and is exposed as a Storybook control, but no dedicated story shows all four placements side-by-side. The `Default` story only shows `below`. A visual grid of all placements would be valuable for review and regression testing.

### 2. No story for `alignment` variations (high)

- **File:** `Popover.stories.tsx`
- The `alignment` prop accepts `'start' | 'center' | 'end'` and is exposed as a control, but no story demonstrates different alignments. A story showing `start`, `center`, and `end` alignment for a given placement would clarify the behavior.

### 3. No story for controlled `isOpen` (medium)

- **File:** `Popover.stories.tsx`
- No story demonstrates the controlled pattern with `isOpen` and `onOpenChange`. This is important for consumers who need to manage open state externally (e.g., opening the popover from a keyboard shortcut or an API response).

### 4. No story for `anchorRef` (external trigger) (medium)

- **File:** `Popover.stories.tsx`
- The `anchorRef` prop enables attaching the popover to an external element, but no story demonstrates this pattern. This is the only way to use Popover with triggers that are not direct children.

### 5. No story for `isEnabled={false}` (low)

- **File:** `Popover.stories.tsx`
- The `isEnabled` prop is exposed as a boolean control but no story explicitly demonstrates the disabled state.

### 6. No story for `hasCloseButton={false}` (low)

- **File:** `Popover.stories.tsx`
- The close button is enabled by default, but no story shows the popover without it, which is useful for popovers that should only close via external action or light dismiss.

### 7. No story for `hasAutoFocus={false}` (low)

- **File:** `Popover.stories.tsx`
- No story demonstrates the behavior difference when auto-focus is disabled.

### 8. No story for `usePopover` hook (medium)

- **File:** `Popover.stories.tsx`
- The `usePopover` hook is a public export intended for custom popover implementations, but no story demonstrates its usage. A story showing a custom popover built with the hook would serve as both documentation and a visual test.

---

## Summary

The Popover component provides a solid foundation with good use of the native Popover API, focus trapping, and ARIA attributes. However, it has significant gaps in test coverage and story coverage, a notable accessibility error, and some performance concerns from unstable object references causing excessive effect re-runs.

| Category        | Severity   | Count |
| --------------- | ---------- | ----- |
| Performance     | Medium     | 3     |
| Accessibility   | High-Low   | 5     |
| Logic Bugs      | Medium-Low | 4     |
| Unclear API     | Medium-Low | 4     |
| Missing Tests   | High-Low   | 9     |
| Missing Stories | High-Low   | 8     |

**Top recommendations (by impact):**

1. **Fix `aria-modal="true"`** -- this is actively harmful to screen reader users. Remove it or make it conditional on a true modal mode.
2. **Add tests for close behavior, controlled mode, and `isEnabled`** -- the test suite currently only covers opening and attribute attachment, missing the majority of the component's interactive behavior.
3. **Stabilize the `popover` object reference** -- destructure or memoize `usePopover`'s return to prevent cascading re-renders and effect re-runs on every render.
4. **Fix duplicate `styles.surface` class** on two nested elements in `usePopover.render()` to eliminate double borders/shadows.
5. **Add stories for placement/alignment grid, controlled mode, and `anchorRef`** -- these are core features with no visual documentation.
6. **Ensure focus returns to trigger on close** to comply with the WAI-ARIA dialog pattern.
