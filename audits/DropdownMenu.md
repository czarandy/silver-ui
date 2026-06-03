# DropdownMenu Audit

## Summary

DropdownMenu is a button-triggered menu for grouped actions, built on top of the Popover component. It supports both data-driven (`items` array) and compound (`children` JSX) patterns, controlled and uncontrolled open state, and customizable trigger button props. The implementation delegates menu rendering and keyboard navigation to shared utilities in `menuUtils.tsx`. The DropdownMenuItem component renders individual action items with support for icons, descriptions, end content, and disabled states.

## Issues

### Critical

- None.

### High

- **Trigger button does not set `aria-haspopup` or `aria-expanded`.** The `Button` rendered as the trigger (line 183-191) does not receive `aria-haspopup="menu"` or `aria-expanded={isOpen}`. Screen reader users have no indication that this button opens a menu or what its current state is. The Popover component may handle some of this, but the Button's own ARIA attributes are not set. This is a significant accessibility gap.

### Medium

- **`button` prop endContent is silently overridden.** The `Button` spread at line 183 applies `{...button}` first, then `endContent={hasChevron ? ... : undefined}` after. If a consumer passes `endContent` in the `button` prop, it will be overridden by the chevron. The `DropdownMenuButtonProps` type does not omit `endContent`, so this override is invisible to consumers.
- **No validation when neither `items` nor `children` is provided.** The dev-mode check (line 126-129) only validates the case where both are provided. If neither is passed, the menu renders empty with no warning.
- **Disabled items are excluded from keyboard navigation but not via `aria-disabled`.** In `menuUtils.tsx` line 96-98, the selector `[role="menuitem"]:not(:disabled)` filters by the HTML `disabled` attribute. DropdownMenuItem uses the native `disabled` attribute (line 126), which is correct, but if a consumer uses `aria-disabled="true"` instead, those items would still receive keyboard focus. This is a minor inconsistency with the ContextMenu, which checks for both `:disabled` and `[aria-disabled="true"]` in its `focusFirstItem` selector.
- **`textContent` may include description text in type-ahead search.** In `menuUtils.tsx` line 147, the type-ahead character search reads `menuItems[index].textContent.trim().toLowerCase()`. Because each menu item contains both the label and description text (rendered via `<Item>`), the text content includes the description. This could cause unexpected type-ahead matching -- typing "m" might match a description that starts with "m" rather than the visible label.
- **No test for keyboard navigation (arrow keys, Home, End, type-ahead).** The `useMenuKeyboard` hook handles ArrowDown, ArrowUp, Home, End, Escape, Enter, Space, and character-based search, but the DropdownMenu tests do not test any of these keyboard interactions. Only ContextMenu tests cover some keyboard behavior.

### Low

- **`onClick` prop on DropdownMenu is passed to the trigger Button, not menu items.** This is correct behavior but the prop name is potentially confusing. A consumer might expect `onClick` to fire when a menu item is selected. The JSDoc says "Click handler for the trigger button" which is clear, but the prop name alone is ambiguous.
- **No story for controlled `isMenuOpen` state.** The component supports a controlled open state via `isMenuOpen` + `onOpenChange`, but no story demonstrates this pattern. Only the test touches it.
- **No story for `hasAutoFocus={false}` or `hasChevron={false}`.** These are meaningful behavioral/visual options with no story coverage.
- **Redundant `cx` import.** `DropdownMenu.tsx` imports `cx` from `styled-system/css` at line 2, while other components in the library use the internal `../../internal/cx`. This works but is inconsistent with the codebase pattern.
- **`menuRef` inner div has `tabIndex={-1}` but no `role`.** The inner `div` wrapping menu items (line 164-167) has `tabIndex={-1}` for focus management but does not have `role="menu"`. The `role="menu"` is applied to the Popover surface (line 181). This is likely correct since the Popover handles the role, but the structure means the keyboard handler is on a different element than the one with the menu role.

## Recommendations

1. Pass `aria-haspopup="menu"` and `aria-expanded={isOpen}` to the trigger Button. This is a critical accessibility fix.
2. Either omit `endContent` from `DropdownMenuButtonProps` or merge the consumer's `endContent` with the chevron instead of overriding it.
3. Add keyboard navigation tests for arrow keys, Home/End, Escape, and character search within the DropdownMenu test suite.
4. Add a dev-mode warning when neither `items` nor `children` is provided.
5. Consider using a label-specific selector or data attribute for type-ahead search instead of `textContent`, to avoid matching description text.
6. Add stories for controlled state, `hasChevron={false}`, and `hasAutoFocus={false}`.
