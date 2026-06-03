# MobileNav Audit

## Summary

MobileNav is an internal slide-out drawer for mobile navigation, built on the native `<dialog>` element with `showModal()`. It integrates with AppShell's mobile context for open/close state management. A companion `MobileNavToggle` component renders a hamburger button that conditionally appears at mobile breakpoints.

## Issues

### Critical

- None.

### High

- **Focus management after close is not handled**: When the dialog is closed, the component calls `dialog.close()` but does not restore focus to the element that triggered the open. This is a WCAG 2.1 requirement (Success Criterion 2.4.3 Focus Order). The toggle button or previously focused element should receive focus when the dialog closes.

### Medium

- **`useEffect` dependencies are incomplete for focus management**: The first `useEffect` (lines 150-168) depends only on `[isOpen]`, but it references `dialogRef.current` and queries for focusable elements. If the dialog content changes while open, focus management won't update. More importantly, the focus logic runs on every open but the `CLOSE_BUTTON_SELECTOR` exclusion is brittle -- it depends on the exact `aria-label="Close navigation"` string matching the Button's label.
- **No escape key test**: While the `onCancel` handler prevents default and calls `onOpenChange(false)`, there is no test verifying that pressing Escape closes the drawer. The `onCancel` handler also calls `event.preventDefault()` which prevents the native dialog close, but relies on `onOpenChange` to trigger a re-render to actually close the dialog. This is correct but error-prone.
- **No stories file**: MobileNav has no `.stories.tsx` file. As an internal component, this is less critical, but it makes it harder to visually develop and test the drawer behavior in isolation. It must currently be tested only through TopNav or SideNav stories.
- **Body overflow manipulation is a side effect that can conflict**: The `useEffect` that sets `document.body.style.overflow = 'hidden'` (lines 171-180) stores and restores the previous overflow value, but if multiple MobileNav instances exist or if other code also modifies body overflow, the restore logic can produce incorrect results.

### Low

- **`side="start"` uses CSS `translateX(-100%)` which does not account for RTL**: For RTL languages, a "start" drawer should slide from the right. The hardcoded `translateX` values may not work correctly with logical properties in RTL layouts.
- **`size` prop accepts `number | string` but formatting is minimal**: `formatSize` converts numbers to `px` strings but does not validate that string values are valid CSS values. An invalid string like `"abc"` would produce a broken `maxWidth`.
- **`MobileNavToggle` sets a hardcoded `data-testid="mobile-nav-toggle"` when no testid is provided**: This default test ID is non-standard; most other components in the library do not set default test IDs.
- **No test for the `side` prop or `size` prop**: The test suite covers open/close and body overflow but does not test that `side="start"` vs `side="end"` produces the correct drawer position, or that the `size` prop affects the drawer width.
- **No test for backdrop click closing the drawer**: The `onClick` handler checks `event.target === event.currentTarget` to detect backdrop clicks, but this behavior is not tested.

## Recommendations

- Add focus restoration logic: when the dialog closes, return focus to the element that was focused before the dialog opened (or to the toggle button).
- Add an `.stories.tsx` file even for internal components, to enable visual testing in Storybook.
- Add tests for: Escape key closing, backdrop click closing, `side` prop, and `size` prop.
- Consider using CSS logical properties (`insetInlineStart`/`insetInlineEnd`) with logical transforms for proper RTL support. The `drawerStart`/`drawerEnd` classes already use logical inset properties, but the `translateX` transform direction may not adapt to RTL.
- The existing 3 tests are basic but cover the core contract (renders when open, close button fires callback, body overflow restoration).
