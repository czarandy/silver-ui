# ContextMenu Audit

## Summary

ContextMenu provides a right-click context menu using the Popover API (`popover="manual"`). It supports both data-driven (`items` array) and compound (`menuContent` JSX) patterns, inherits menu item rendering and keyboard navigation from DropdownMenu utilities, and positions the menu at cursor coordinates. The component reuses `DropdownMenuContext`, `DropdownMenuItem`, and shared keyboard/rendering utilities from the DropdownMenu module.

## Issues

### Critical

- None.

### High

- **Menu can overflow the viewport with no repositioning.** The menu is positioned at `position: fixed` using the raw `clientX`/`clientY` of the right-click event. If the user right-clicks near the bottom or right edge of the viewport, the menu will be clipped or extend off-screen. There is no boundary detection or repositioning logic. This is a usability problem in practice.

### Medium

- **Trigger wrapper uses `role="button"` with `display: contents`, creating a semantic container with no visual box.** The trigger `div` at line 265 has `role="button"` and `tabIndex={0}`, making it focusable and interactive. However, `display: contents` removes its box from the layout, meaning the element has no dimensions for focus indicators. The `:focus-visible` outline will not be visible because there is no box to outline. This means keyboard users who Tab to the trigger get no visual feedback.
- **No `aria-label` on the trigger.** The trigger wrapper has `role="button"` but no `aria-label` or `aria-labelledby`. Screen reader users will hear "button" with no indication of what the button does. The content inside (`children`) may provide text, but if children are an image or icon, there is no accessible name.
- **Missing test for `hasAutoFocus={false}`.** The `hasAutoFocus` prop defaults to `true` and controls whether the first menu item is focused on open. There is no test verifying that `hasAutoFocus={false}` prevents auto-focus.
- **Missing test for `menuWidth` prop.** The `menuWidth` prop controls the width of the menu surface and is passed through `formatMenuWidth()`, but no test verifies the resulting style.
- **No story for `menuWidth` or `hasAutoFocus` props.** These are documented props with no story coverage.

### Low

- **`onOpenChange` callback is not called when menu closes via outside click.** The `hide()` function (line 163) calls `onOpenChange?.(false)`, and `hide()` is invoked from the mousedown handler. However, the test for `onOpenChange` only tests the context-menu-open and item-click-close paths. An explicit test for outside-click closing calling `onOpenChange(false)` would strengthen coverage.
- **No `role="none"` or similar on the trigger when children already have interactive semantics.** If `children` is an interactive element (e.g., a card with links), nesting it inside a `div[role="button"]` creates an invalid ARIA hierarchy (interactive inside interactive). The `display: contents` partially mitigates layout issues but does not resolve the semantic nesting problem.
- **`useImperativeHandle` returns `triggerRef.current` which may be null initially.** The `useImperativeHandle` at line 218 casts `triggerRef.current` to `HTMLDivElement`, but on the first render `triggerRef.current` is null. The `as HTMLDivElement` cast suppresses the type error but means the forwarded ref may initially be null (which is acceptable React behavior but the cast is misleading).
- **No `Escape` key handling to return focus to trigger.** When the menu is closed via `Escape`, focus is not explicitly returned to the trigger element. The `hide()` function closes the popover but does not call `triggerRef.current?.focus()`. Users who opened the menu via keyboard lose their focus position.

## Recommendations

1. Implement viewport boundary detection to reposition the menu when it would overflow. Consider using `getBoundingClientRect()` on the menu after positioning to adjust.
2. Add an `aria-label` prop to the trigger, or derive one from context. At minimum, document that consumers should ensure `children` provides accessible text.
3. Return focus to the trigger element when closing the menu via `Escape` key.
4. Add `_focusVisible` styling to the trigger wrapper, or reconsider the `display: contents` approach for keyboard accessibility.
5. Add tests for `hasAutoFocus={false}`, `menuWidth`, and outside-click closing with `onOpenChange`.
