# Popover Audit

## Summary

Popover is a click-triggered floating dialog anchored to a trigger element. It supports both inline triggers (wrapping children) and external anchor refs. It features a focus trap, light dismiss (click-outside), keyboard close button (visually hidden), controlled/uncontrolled modes, and configurable placement, alignment, width, padding, and ARIA role. The `usePopover` hook encapsulates the core behavior.

## Issues

### Critical

- None identified.

### High

- None identified.

### Medium

- **Race condition mitigation with `nowMonotonicMilliseconds` is fragile**: The `handleTriggerClick` uses a 50ms debounce (`nowMonotonicMilliseconds() - lastHideTimeRef.current < 50`) to prevent the popover from immediately reopening when the trigger click fires after a light-dismiss close. While this works in practice, time-based debouncing is fragile across different CPU speeds and event loop delays. A flag-based approach (e.g., `isClosing` reset in `requestAnimationFrame`) would be more robust.
- **`attachTrigger` imperatively mutates DOM attributes**: The `attachTrigger` function uses `setAttribute`/`removeAttribute` to manage `aria-haspopup`, `aria-expanded`, and `aria-controls` on the trigger button. This bypasses React's rendering model and can lead to attribute inconsistencies if React re-renders the trigger. While this is necessary for the external anchor ref pattern, it's risky for inline children managed by React.
- **Controlled mode sync in `useIsomorphicLayoutEffect` can cause infinite loops**: The effect that syncs `isOpen` with `popover.isOpen` calls `popover.show()` or `popover.hide()`, which trigger `onShow`/`onHide` callbacks that call `onOpenChange`, which may update `isOpen`, triggering the effect again. While `popover.isOpen` state would match and break the loop, this relies on the internal state being synchronously updated.
- **`hasAutoFocus` uses `requestAnimationFrame` which skips focus in tests**: The `usePopover` hook focuses the first element via `requestAnimationFrame(() => focusFirst())`. In test environments without proper `requestAnimationFrame` mocking, this focus call may not execute. The test file does not test auto-focus behavior.

### Low

- **No test for `hasLightDismiss` behavior**: The `hasLightDismiss` prop is not tested. Tests use mocked `showPopover`/`hidePopover` which don't simulate actual light dismiss.
- **No test for `hasAutoFocus` behavior**: Auto-focus is not tested due to the `requestAnimationFrame` challenge.
- **No test for keyboard-accessible close button**: The hidden close button (`hasCloseButton`) is not tested.
- **No test for `role="menu"` variant**: The `role` prop accepts `'menu'` but this is not tested.
- **No test for `padding` prop**: The padding prop's visual effect is not tested.
- **No story for `hasAutoFocus={false}`**: All stories use the default auto-focus behavior.
- **No story for `role="menu"`**: The menu role variant has no story.
- **`handleTriggerKeyDown` adds Enter/Space handling to non-button triggers**: This is correct for `[role="button"]` elements but the handler calls `event.preventDefault()` on Space, which could interfere with scrolling if attached to the wrong element.
- **Close button has no visible focus indicator in its wrapper**: The close button is wrapped in a `clipPath: 'inset(50%)'` container, making it visually hidden. While this is accessible via keyboard, the `1px` by `1px` visible area means the focus ring will be invisible to sighted keyboard users.

## Recommendations

- Replace the time-based 50ms debounce with a flag-based approach for toggle prevention.
- Add tests for `hasLightDismiss`, `hasAutoFocus`, close button keyboard access, `role="menu"`, and `padding`.
- Consider using React-managed ARIA attributes for inline children instead of imperative DOM manipulation, falling back to imperative only for external anchor refs.
- The test coverage (7 tests) is adequate for core behavior but has gaps around accessibility features. Stories are comprehensive for visual props (8 stories covering placements, alignments, controlled mode, disabled, no close button, match width, and custom width).

## SVA Conversion

**Benefit: Low / None**

Popover is primarily a behavior/positioning component (trigger wiring, light-dismiss, focus management via `usePopover`) rather than a styled multi-element one. Its standalone `styles` object in `Popover.tsx` is minimal: an `anchor` wrapper (`display: inline-flex`), an empty `content` block, and a small `gap` map of four directional margins (`above`/`below`/`start`/`end`) selected by `placement`. The placement gap is the only "variant"-like branch, applied via `styles.gap[placement]`. Spacing/width/padding are handled through inline `style` and the `token()` helper, and the floating surface chrome comes from the layer rendering, not local recipes. With only a couple of trivial styled wrappers and a four-entry directional gap map, an `sva` recipe would add structure without consolidating meaningful styling.
