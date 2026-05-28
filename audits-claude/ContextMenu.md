# ContextMenu Component Audit

Audited files:

- `src/components/ContextMenu/ContextMenu.tsx`
- `src/components/ContextMenu/ContextMenu.stories.tsx`
- `src/components/ContextMenu/ContextMenu.test.tsx`
- `src/components/ContextMenu/index.ts`

---

## Performance Problems

### P1. Duplicate `renderItems` function (ContextMenu.tsx:164-211)

`renderItems` is a standalone function identical to the one in `DropdownMenu.tsx:132-179`. Both import the same `Divider`, `Text`, and `DropdownMenuItem` components and produce the same JSX. This is duplicated code rather than a performance issue at runtime, but it means fixes or optimizations to item rendering must be applied in two places. Extract to a shared utility.

### P2. `requestAnimationFrame` without cleanup (ContextMenu.tsx:263)

In the `show` callback, `requestAnimationFrame(focusFirstItem)` is called but the returned frame ID is never stored or cancelled. If the component unmounts before the frame fires, `focusFirstItem` will attempt to query a detached DOM node. This is a minor leak risk rather than a crash, but it could cause React warnings in strict mode.

### P3. `hide` callback recreated on every `isOpen` change (ContextMenu.tsx:237-244)

`hide` depends on `isOpen` in its dependency array, which means it is recreated every time `isOpen` toggles. This in turn causes `contextValue` (line 294) to recreate, which propagates a new context value to all menu items on every open/close. Consider guarding with a ref (`isOpenRef.current`) instead so `hide` is stable.

### P4. `getMenuItems` queries the DOM on every keydown (ContextMenu.tsx:331-339)

`getMenuItems` runs `querySelectorAll` each time a key is pressed. For typical menu sizes this is fine, but the function itself is wrapped in `useCallback` with an empty dependency array, which gives a false impression it is memoizing the result -- it is only memoizing the function reference. This is not a real problem, but worth a clarifying comment.

---

## Accessibility Concerns

### A1. No `aria-label` or `aria-labelledby` on the `role="menu"` element (ContextMenu.tsx:408-409)

The menu surface has `role="menu"` but no accessible name. Screen readers will announce it as an unlabeled menu. Add an `aria-label` (e.g. "Context menu") or connect it to a labeling element via `aria-labelledby`.

### A2. Trigger wrapper uses `role="button"` with `tabIndex={0}` (ContextMenu.tsx:401-403)

The trigger `<div>` has `role="button"` and `tabIndex={0}`. This means the `children` content has an extra focusable wrapper around it. If `children` already contains focusable elements (links, buttons, inputs), users will encounter a redundant tab stop. Consider whether `role="button"` is appropriate here -- the WAI-ARIA `menu` pattern typically uses a trigger that is itself the interactive element. At minimum, document that `children` should be non-interactive content.

### A3. Arrow key navigation does not wrap around (ContextMenu.tsx:353-359)

`ArrowDown` clamps at `menuItems.length - 1` and `ArrowUp` clamps at `0`. The WAI-ARIA Menu pattern recommends that arrow keys wrap from the last item back to the first and vice versa. Users who reach the end of the menu and press ArrowDown again will get stuck.

### A4. No type-ahead / character search (ContextMenu.tsx:341-387)

The WAI-ARIA menu pattern specifies that typing a printable character should move focus to the next item whose label starts with that character. This is not implemented. The `default` case at line 379 simply returns.

### A5. Focus is not returned to the trigger on Escape (ContextMenu.tsx:368-370)

When `Escape` is pressed, `hide()` is called but focus is not explicitly returned to `triggerRef.current`. The user's focus will be lost (sent to `<body>`). The WAI-ARIA pattern requires returning focus to the triggering element.

### A6. Section groups use `aria-label` for the title, but no `aria-labelledby` linking (ContextMenu.tsx:173-174)

Sections render `aria-label={item.title}` on the `role="group"` div. If `item.title` is `undefined`, the group will have `aria-label={undefined}` which renders no attribute -- this is correct but worth noting. More importantly, since a visible `<Text>` heading is rendered inside, best practice would be to use `aria-labelledby` pointing at the heading's `id` instead of duplicating the string in `aria-label`.

### A7. `outline: 'none'` on the trigger wrapper (ContextMenu.tsx:112)

The trigger has `outline: 'none'`, which removes the default focus indicator. There is no replacement focus style defined. Keyboard users cannot see when the trigger area is focused.

---

## Logic Bugs

### B1. `useImperativeHandle` may forward `null` (ContextMenu.tsx:292)

```ts
useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);
```

On initial render, `triggerRef.current` is `null`. The `as HTMLDivElement` cast silences TypeScript but the consumer will receive `null` from the ref. This is a timing issue -- `useImperativeHandle` runs after layout effects, so `triggerRef.current` should be assigned by then, but the non-null assertion is fragile. If the ref is accessed during render (e.g., in a parent's `useLayoutEffect` before ContextMenu mounts), it will be `null`.

### B2. Menu can open on top of itself without closing (ContextMenu.tsx:253-267)

`show` calls `hidePopover` then `showPopover` if the popover is already open. However, `setIsOpen(true)` and `onOpenChange?.(true)` are called unconditionally. If the menu is already open and a second right-click fires, `onOpenChange` will be called with `true` again (it was never called with `false` for the intermediate hide). This could cause confusion in consumers tracking open state.

### B3. Stale closure risk: outside-click handler captures `hide` (ContextMenu.tsx:269-290)

The `useEffect` that attaches the `mousedown` listener depends on `[hide, isOpen]`. Since `hide` changes every time `isOpen` changes (see P3), this effect tears down and re-attaches the listener on every toggle. This works correctly but is wasteful. If `hide` were stabilized with a ref, the effect could depend only on `isOpen`.

### B4. No viewport boundary clamping for menu position (ContextMenu.tsx:413-416)

The menu is positioned at `position: 'fixed'; left: clientX; top: clientY`. If the user right-clicks near the bottom or right edge of the viewport, the menu will overflow off-screen. There is no logic to clamp or flip the menu position within the viewport.

---

## Unclear API

### U1. `menuWidth` default is 160 but unit is ambiguous (ContextMenu.tsx:66)

The `menuWidth` prop defaults to `160`. The JSDoc does not specify units. The `formatWidth` helper converts numbers to `px`, but a consumer reading only the prop documentation would not know whether `160` means pixels, rems, or something else.

### U2. `size` prop has no visible effect inside ContextMenu itself (ContextMenu.tsx:79)

The `size` prop is passed through to `DropdownMenuContext` as `menuSize`, which `DropdownMenuItem` reads to choose density. However, this is not documented in the `size` JSDoc, and the prop name "size" is vague. The JSDoc says "Menu item size" but does not explain what sizes are available or what visual change to expect.

### U3. Discriminated union pattern for `items` vs `menuContent` (ContextMenu.tsx:86-108)

The type uses `items?: undefined` / `menuContent?: undefined` to create a discriminated union. This is a valid TypeScript pattern but can be confusing. A consumer who passes both `items` and `menuContent` will get a type error, which is the intent, but the error message may be opaque. Consider adding a brief note in the JSDoc.

---

## Missing Tests

### T1. No test for `onOpenChange` callback

The `onOpenChange` prop is not exercised in any test. There is no verification that it is called with `true` on open or `false` on close.

### T2. No test for keyboard navigation within the menu

Arrow key navigation (`ArrowDown`, `ArrowUp`, `Home`, `End`) inside the open menu is untested. The `handleMenuKeyDown` handler (lines 341-387) has no coverage.

### T3. No test for `Escape` key closing the menu

Pressing `Escape` while the menu is open should close it. This behavior is untested.

### T4. No test for `Enter` / `Space` key activating a menu item

The keyboard activation path (lines 372-377) is not tested.

### T5. No test for `Shift+F10` keyboard shortcut

Only the `ContextMenu` key is tested (line 152). The `Shift+F10` alternative (line 320) is not covered.

### T6. No test for outside-click dismissal

Clicking outside the menu should close it. The `mousedown` listener logic (lines 274-284) has no test coverage.

### T7. No test for `hasAutoFocus` prop

Neither `hasAutoFocus={true}` (default) nor `hasAutoFocus={false}` behavior is verified.

### T8. No test for disabled items within the menu

Items with `isDisabled: true` should not be focusable via keyboard navigation (they are filtered by the `:not(:disabled)` selector) and should not trigger `onClick`. This is untested for ContextMenu specifically.

### T9. No test for `menuWidth` or `style` props

The menu surface styling props are not verified.

### T10. No test for `size` prop

The `size` prop's effect on item density is not tested.

### T11. No test for `ref` forwarding

The `useImperativeHandle` ref forwarding (line 292) is not verified.

---

## Missing Stories

### S1. No story for `isDisabled` prop

There is no story demonstrating the disabled state where right-click falls through to the native browser context menu.

### S2. No story for `size` variants

The `size` prop (`'sm' | 'md' | 'lg'`) is not demonstrated in any story.

### S3. No story for `menuWidth` prop

Custom menu widths are not shown.

### S4. No story for disabled menu items

Items with `isDisabled: true` are not demonstrated.

### S5. No story for `hasAutoFocus={false}`

The auto-focus behavior difference is not demonstrated.

### S6. No story for items with descriptions

The `description` field on `ContextMenuItemData` is not shown in any story.

### S7. No story for `endContent` on menu items

`DropdownMenuItemProps.endContent` (keyboard shortcut hints, badges, etc.) is not demonstrated in ContextMenu stories.

### S8. No story for nested/complex trigger content

All stories use a simple `<div>` as the trigger. A story with a more realistic trigger (e.g., a card, a table row, or an image) would help demonstrate real-world usage.

---

## Summary

| Category        | Issues                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Performance     | 4 (duplicated code, leaked rAF, unstable callback, DOM queries on keydown)                                                                 |
| Accessibility   | 7 (no menu label, redundant tab stop, no arrow wrap, no type-ahead, lost focus on Escape, suboptimal group labeling, invisible focus ring) |
| Logic Bugs      | 4 (null ref forwarding, double-open notification, effect churn, no viewport clamping)                                                      |
| Unclear API     | 3 (ambiguous width units, vague size prop, opaque union errors)                                                                            |
| Missing Tests   | 11 (keyboard nav, escape, enter/space, shift+F10, outside click, callbacks, props)                                                         |
| Missing Stories | 8 (disabled, sizes, width, disabled items, autoFocus, descriptions, endContent, complex triggers)                                          |

The most impactful issues to address first are:

1. **A5** (focus not returned on Escape) and **A3** (arrow keys don't wrap) -- these are WAI-ARIA compliance gaps that affect keyboard-only users.
2. **A7** (no visible focus indicator on trigger) -- keyboard users cannot see focus.
3. **B4** (no viewport clamping) -- menus can render off-screen.
4. **T2/T3/T4** (keyboard navigation untested) -- the most complex logic in the component has zero test coverage.
