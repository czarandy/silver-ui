# DropdownMenu Audit

## Summary

DropdownMenu is a button-triggered menu for grouped actions, built on top of the Popover component. It supports both data-driven (`items` array) and compound (`children` JSX) patterns, controlled and uncontrolled open state, and customizable trigger button props. The implementation delegates menu rendering and keyboard navigation to shared utilities in `menuUtils.tsx`. The DropdownMenuItem component renders individual action items with support for icons, descriptions, end content, and disabled states.

## Issues

### Critical

- None.

### High

None

**Note:** A previously reported issue about the trigger button not setting `aria-haspopup` or `aria-expanded` was a false positive -- the Popover component already handles these attributes imperatively via `attachTrigger`.

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

1. Either omit `endContent` from `DropdownMenuButtonProps` or merge the consumer's `endContent` with the chevron instead of overriding it.
2. Add keyboard navigation tests for arrow keys, Home/End, Escape, and character search within the DropdownMenu test suite.
3. Add a dev-mode warning when neither `items` nor `children` is provided.
4. Consider using a label-specific selector or data attribute for type-ahead search instead of `textContent`, to avoid matching description text.
5. Add stories for controlled state, `hasChevron={false}`, and `hasAutoFocus={false}`.

## SVA Conversion

**Benefit: Moderate**

`DropdownMenu` is a composition spread across several files. The menu surface in `DropdownMenu.tsx` uses a single standalone `css()` block (`styles.menu`, applied via `cx`) and delegates the trigger to `Button` and the floating surface to `Popover`. `menuUtils.tsx` holds a 3-block `css()` object (`section`/`heading`/`divider`) for section grouping, and `DropdownMenuItem.tsx` has its own `cva` (`menuItemRecipe`, size variants sm/md/lg) plus a single-block `css()` (`styles.icon`). The styled DOM elements are genuinely multi-element (menu container, section wrapper, section heading, divider, item button, item icon) but they live in different React components and are driven by a context-supplied `menuSize`, so a single `sva` would only cleanly consolidate within each file. The strongest candidate is `DropdownMenuItem` (recipe + icon css with a real `size` variant), which an `sva` with `root`/`icon` slots could merge; the rest is loose layout glue that gains little.
