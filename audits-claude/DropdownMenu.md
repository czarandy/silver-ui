# DropdownMenu Component Audit

Files reviewed:

- `src/components/DropdownMenu/DropdownMenu.tsx`
- `src/components/DropdownMenu/DropdownMenuContext.ts`
- `src/components/DropdownMenu/DropdownMenuItem.tsx`
- `src/components/DropdownMenu/DropdownMenu.stories.tsx`
- `src/components/DropdownMenu/DropdownMenu.test.tsx`
- `src/components/DropdownMenu/index.ts`
- `src/components/Popover/Popover.tsx` (dependency)
- `src/components/Popover/usePopover.tsx` (dependency)

---

## Performance Problems

### 1. `renderItems` is called on every render without memoization

**File:** `DropdownMenu.tsx`, line 218  
The `renderItems(items)` call on line 218 executes on every render of `DropdownMenu`, even when `items` has not changed. Since `renderItems` iterates the entire items array and creates React elements, this could be wasteful for large menus. Consider wrapping it with `useMemo`:

```ts
const menuContent = useMemo(
  () => (items == null ? children : renderItems(items)),
  [items, children],
);
```

### 2. `contextValue` useMemo has a stale dependency

**File:** `DropdownMenu.tsx`, lines 205-217  
The `useMemo` for `contextValue` includes `onOpenChange` in its dependency array, but omits `setInternalOpen`. While `setInternalOpen` is stable (React guarantees this for `useState` setters), the `closeMenu` closure captures `isControlled` which IS in the dependency array, so this is technically correct. However, if `onOpenChange` is not memoized by the consumer, `contextValue` will be recreated on every render, defeating the purpose of `useMemo` and causing all `DropdownMenuItem` children to re-render. This is a common pitfall worth documenting.

### 3. Inline `content` prop creates new JSX on every render

**File:** `DropdownMenu.tsx`, lines 222-228  
The `content` prop passed to `<Popover>` is a new JSX tree on every render. Since `Popover` receives this as a prop, it will always see a new reference. This is a minor issue since the popover is typically only rendered when open, but could be optimized.

### 4. Inline arrow function in `onClick` handler

**File:** `DropdownMenuItem.tsx`, line 107  
The `onClick` handler creates a new arrow function on every render: `() => { ... onClick?.(); context?.closeMenu(); }`. This is a minor concern but could be wrapped in `useCallback` if item re-renders become measurable.

---

## Accessibility Concerns

### 1. Missing keyboard navigation for `role="menu"` (Critical)

**File:** `DropdownMenu.tsx`, line 225; `DropdownMenuItem.tsx`, line 115  
The component uses `role="menu"` on the container and `role="menuitem"` on items, but does not implement the required keyboard interactions per the [WAI-ARIA Menu Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/). Specifically:

- **Arrow Up/Down** should move focus between menu items
- **Home/End** should move focus to the first/last menu item
- **Escape** should close the menu and return focus to the trigger
- **Type-ahead** (typing a character should move focus to the next item starting with that letter)

Currently, focus management relies entirely on `Tab` via the Popover's focus trap. While Tab-based navigation works, it violates the ARIA menu pattern expectations. Screen reader users who encounter `role="menu"` will expect arrow key navigation.

### 2. `aria-haspopup` is set to `"dialog"` instead of `"menu"`

**File:** `usePopover.tsx`, line 163  
The Popover always sets `aria-haspopup="dialog"` on the trigger button. For a dropdown menu, the correct value is `aria-haspopup="menu"`. This tells assistive technology that the button opens a menu, not a dialog. The DropdownMenu does not override this value.

### 3. Menu container uses `role="dialog"` instead of complementing `role="menu"`

**File:** `usePopover.tsx`, line 127  
The Popover wraps content in a `<div role="dialog" aria-modal="true">`, and the menu `<div role="menu">` is nested inside. Having a `role="menu"` inside a `role="dialog"` creates a confusing ARIA tree. Ideally, the menu surface itself should be the `role="menu"` element without an intervening `role="dialog"`.

### 4. Section groups use `aria-label` but should use `aria-labelledby`

**File:** `DropdownMenu.tsx`, lines 141-144  
Section groups use `aria-label={item.title}`, but the title text is also rendered visually as a `<Text>` element. Best practice is to give the heading an `id` and reference it via `aria-labelledby` on the group, avoiding duplication and ensuring the label stays in sync with the visual text.

### 5. Disabled items are still clickable at the native level

**File:** `DropdownMenuItem.tsx`, lines 103-117  
The `disabled` attribute is correctly set on the `<button>`, which prevents native clicks. However, the `onClick` handler on line 107 also manually checks `isDisabled` (line 108-110). This is redundant since `disabled` buttons don't fire click events natively. The guard is harmless but suggests the author was uncertain about the behavior.

### 6. No `aria-label` or `aria-labelledby` on the `role="menu"` container

**File:** `DropdownMenu.tsx`, line 225  
The `<div role="menu">` has no accessible name. It should have an `aria-label` or `aria-labelledby` pointing to the trigger button so screen readers can announce what the menu is for.

---

## Logic Bugs

### 1. Duplicate labels in sections produce duplicate React keys

**File:** `DropdownMenu.tsx`, line 159  
Section items use `key={String(sectionItem.label)}` (line 159), and top-level items use `key={String(item.label)}` (line 175). If two items share the same label (e.g., two "Edit" items in different sections, or same label at the top level), React will produce a key collision warning and may exhibit incorrect update behavior.

### 2. `String(sectionItem.label)` may produce `"[object Object]"` for ReactNode labels

**File:** `DropdownMenu.tsx`, lines 159, 175  
The `label` prop is typed as `ReactNode`, which can be a JSX element. Calling `String()` on a JSX element produces `"[object Object]"`, which will lead to key collisions when multiple items have JSX labels. The top-level items also have this issue on line 175.

### 3. `renderItems` is defined outside the component but references `DropdownMenuItem`

**File:** `DropdownMenu.tsx`, line 132  
This is not a bug per se, but `renderItems` is a module-level function that creates `DropdownMenuItem` elements. If the items data is referentially stable, React will still re-render these items because `renderItems` produces new JSX on each call (see Performance #1). Additionally, the `onClick` callbacks in item data are not guarded against being called after the menu closes, though the `closeMenu` call happens synchronously after `onClick`.

### 4. Controlled mode can desync if `onOpenChange` is not provided

**File:** `DropdownMenu.tsx`, lines 233-239  
When `isMenuOpen` is provided (controlled mode) but `onOpenChange` is not, the Popover's light-dismiss (clicking outside) will call `onOpenChange?.(false)` which is a no-op. The popover will hide visually (via the Popover's internal state), but the parent's `isMenuOpen` will remain `true`, causing a desync. The next render will try to re-open the popover.

---

## Unclear API

### 1. `button` prop vs. `children` for trigger customization

The `button` prop accepts `DropdownMenuButtonProps` (which is `Omit<ButtonProps, 'onClick'>`), and `onClick` is a separate top-level prop. This separation is somewhat unexpected -- a consumer might try to pass `onClick` inside the `button` prop and find it stripped. The reason is clear (to separate trigger click from item selection), but it could benefit from documentation or a more explicit naming like `onTriggerClick`.

### 2. `items` vs. `children` -- no runtime guard

**File:** `DropdownMenu.tsx`, line 218  
If both `items` and `children` are provided, `items` silently wins (`items == null ? children : renderItems(items)`). There is no warning or documentation about this precedence. A dev mistake of providing both would silently ignore `children`.

### 3. `menuWidth` vs. `style.width`

Both `menuWidth` and `style` are passed to the Popover surface (line 240). If both specify a width, the `style` spread will override `menuWidth` because `...style` comes after `width: formatWidth(menuWidth)`. This precedence is correct but undocumented and could surprise users.

### 4. `hasChevron` is not applicable when `button.isIconOnly` is true

**File:** `DropdownMenu.tsx`, line 246  
The chevron is suppressed when `button.isIconOnly` is true, which makes sense, but `hasChevron` defaults to `true` even in that case. This means `hasChevron={false}` is a no-op when `isIconOnly` is true. Minor, but the interaction could be documented.

---

## Missing Tests

### 1. No test for controlled mode (`isMenuOpen` / `onOpenChange`)

The test file does not verify that passing `isMenuOpen` and `onOpenChange` correctly controls the open state. This is a critical code path (lines 201-239) that should be tested.

### 2. No test for sections (`DropdownMenuSection` type)

The `renderItems` function handles sections with titles (lines 138-165), but no test renders items with `type: 'section'`. This is a significant feature gap.

### 3. No test for dividers

While dividers are included in the data-driven test, there is no assertion that a divider actually renders. The test only checks item clicks and disabled state.

### 4. No test for `hasChevron={false}`

The chevron rendering logic (lines 244-249) is untested.

### 5. No test for `menuWidth`

The `formatWidth` utility (lines 125-130) and the `menuWidth` prop are untested.

### 6. No test for `hasAutoFocus={false}`

The auto-focus behavior is untested in either direction.

### 7. No test for keyboard navigation

No tests verify keyboard behavior (Escape to close, Tab order, etc.).

### 8. No test for `DropdownMenuItem` in isolation

`DropdownMenuItem` is only tested indirectly through `DropdownMenu`. There are no tests for:

- `description` prop rendering
- `endContent` prop rendering
- `icon` prop rendering
- `className` / `style` / `data-testid` pass-through
- Behavior when used outside a `DropdownMenuContext` (context is nullable, line 99)

### 9. No test for `onClick` on the trigger button

The `onClick` prop on `DropdownMenu` (separate from item clicks) is untested.

### 10. No test that clicking an item closes the menu

While `onArchive` is asserted to be called, there is no assertion that the menu closes after clicking an item.

---

## Missing Stories

### 1. No story for sections

The `DropdownMenuSection` type with `type: 'section'` and grouped items with titles is a significant feature with no story.

### 2. No story for disabled items

Disabled items (`isDisabled: true`) have no dedicated story showing the visual treatment.

### 3. No story for item descriptions

The `description` prop on `DropdownMenuItemData` / `DropdownMenuItemProps` is undocumented in stories.

### 4. No story for `endContent` on menu items

`DropdownMenuItemProps.endContent` (trailing content like keyboard shortcuts) has no story.

### 5. No story for `menuWidth`

No story demonstrates controlling the menu surface width.

### 6. No story for `hasChevron={false}`

The chevron suppression has no visual demonstration.

### 7. No story for `hasAutoFocus={false}`

Auto-focus control has no story.

### 8. No story for controlled mode

Controlled open/close (`isMenuOpen` + `onOpenChange`) has no story.

### 9. No story for icon-only trigger

Using `button={{ isIconOnly: true, icon: <MoreVertical /> }}` pattern has no story.

### 10. No story for different button sizes

The `menuSize` context value (which affects item density) varies with `button.size`, but no story demonstrates `sm`, `md`, or `lg` button sizes and their effect on menu item layout.

### 11. No story for `button.variant` combinations

No story shows how different button variants (ghost, outline, etc.) look as menu triggers.

---

## Summary

| Category        | Severity   | Count |
| --------------- | ---------- | ----- |
| Performance     | Low-Medium | 4     |
| Accessibility   | High       | 6     |
| Logic Bugs      | Medium     | 4     |
| Unclear API     | Low        | 4     |
| Missing Tests   | Medium     | 10    |
| Missing Stories | Low-Medium | 11    |

**Highest priority items:**

1. **Keyboard navigation for `role="menu"`** -- the component declares ARIA menu semantics but does not implement the expected keyboard interaction pattern. This is the most impactful accessibility gap.
2. **`aria-haspopup="dialog"` should be `"menu"`** -- incorrect ARIA attribute on the trigger.
3. **Nested `role="dialog"` > `role="menu"`** -- confusing ARIA hierarchy.
4. **Controlled mode desync** -- `isMenuOpen` without `onOpenChange` leads to broken state.
5. **Duplicate/invalid React keys** when labels are JSX elements or non-unique strings.
