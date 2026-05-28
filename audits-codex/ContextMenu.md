# ContextMenu Audit

Audited:

- `src/components/ContextMenu/ContextMenu.tsx`
- `src/components/ContextMenu/ContextMenu.stories.tsx`
- `src/components/ContextMenu/ContextMenu.test.tsx`
- `src/components/ContextMenu/index.ts`

## Findings

### High: Trigger focus indicator is removed

`src/components/ContextMenu/ContextMenu.tsx:110-113` sets the focusable trigger wrapper to `outline: 'none'`, and `src/components/ContextMenu/ContextMenu.tsx:393-403` gives that wrapper `role="button"` and `tabIndex={0}`. There is no replacement focus style. Keyboard users can tab to the context-menu trigger but cannot see where focus is.

### High: Closing from the keyboard does not restore focus

`src/components/ContextMenu/ContextMenu.tsx:368-370` closes on `Escape` by calling `hide()`, but `hide()` only hides the popover and updates state (`src/components/ContextMenu/ContextMenu.tsx:237-244`). It never returns focus to `triggerRef.current`. When the menu was opened via `ContextMenu` or `Shift+F10`, focus moves into the menu (`src/components/ContextMenu/ContextMenu.tsx:246-264`) and can be left on an element inside a hidden popover after close.

### Medium: Menu can render off-screen near viewport edges

`src/components/ContextMenu/ContextMenu.tsx:253-259` stores the raw cursor coordinates, and `src/components/ContextMenu/ContextMenu.tsx:413-417` applies them directly as fixed `left`/`top`. There is no clamp or flip logic. Right-clicking near the bottom or right edge can place part of the menu outside the viewport.

### Medium: Clicking the trigger while open does not dismiss the menu

The outside-click handler intentionally ignores both menu and trigger descendants (`src/components/ContextMenu/ContextMenu.tsx:274-283`). After opening the menu, a normal click back on the trigger area leaves it open. Most context menus dismiss on any click outside the menu surface, including the original target area.

### Medium: `onOpenChange` can report "open" when state did not change

`show()` calls `onOpenChange?.(true)` unconditionally (`src/components/ContextMenu/ContextMenu.tsx:253-267`). If the menu is already open and the user right-clicks again to reposition it, the component hides and re-shows the native popover but never reports `false`; consumers receive another `true` even though the public open state did not transition.

### Medium: Disabled component remains exposed as an enabled menu button

When `isDisabled` is true, the event handlers return early (`src/components/ContextMenu/ContextMenu.tsx:302-328`), but the wrapper still renders with `aria-haspopup="menu"`, `aria-expanded={false}`, `role="button"`, and `tabIndex={0}` (`src/components/ContextMenu/ContextMenu.tsx:393-403`). Assistive tech still sees an enabled menu button that does nothing.

### Low: Data-driven items use unstable/duplicate-prone keys

Data-driven items use `String(item.label)` and `String(sectionItem.label)` as React keys (`src/components/ContextMenu/ContextMenu.tsx:186-207`). Duplicate labels or ReactNode labels such as icons/fragments can collapse to identical strings like `[object Object]`, which can cause incorrect reconciliation if the menu changes.

### Low: Trigger semantics are unclear for interactive children

The component always wraps `children` in a focusable `role="button"` div (`src/components/ContextMenu/ContextMenu.tsx:393-405`). If consumers pass interactive children such as rows with buttons, links, or inputs, this creates nested/extra interactive semantics and an additional tab stop. The API docs only say "Trigger area" (`src/components/ContextMenu/ContextMenu.tsx:39-43`) and do not warn about this constraint.

## Performance

No significant runtime performance problems found for typical menu sizes. The component does query menu items on each menu keydown (`src/components/ContextMenu/ContextMenu.tsx:331-339`), but that is acceptable unless very large menus are expected.

## Accessibility

Issues found: missing visible trigger focus, missing focus restoration, disabled state semantics, and unclear wrapper semantics for interactive children. Keyboard navigation supports arrows, Home/End, Escape, Enter/Space (`src/components/ContextMenu/ContextMenu.tsx:341-387`), but typeahead is not implemented.

## API Clarity

The `items` vs `menuContent` union is reasonable, but the trigger-child constraints are not documented. `menuWidth` accepts number or string (`src/components/ContextMenu/ContextMenu.tsx:62-66`, `src/components/ContextMenu/ContextMenu.tsx:143-148`), but the prop comment does not say numbers are pixels.

## Tests

Existing tests cover rendering, cursor positioning, disabled right-click pass-through, data items/sections/dividers, item click close, compound content, and the `ContextMenu` key (`src/components/ContextMenu/ContextMenu.test.tsx:21-158`).

Missing test coverage:

- `Shift+F10` opening path (`src/components/ContextMenu/ContextMenu.tsx:318-326`).
- Arrow, Home, and End menu navigation (`src/components/ContextMenu/ContextMenu.tsx:349-367`).
- Escape close and focus restoration (`src/components/ContextMenu/ContextMenu.tsx:368-370`).
- Enter/Space activation (`src/components/ContextMenu/ContextMenu.tsx:372-377`).
- Outside-click dismissal (`src/components/ContextMenu/ContextMenu.tsx:269-290`).
- `onOpenChange`, including repeated open/reposition behavior.
- `hasAutoFocus={false}`, `menuWidth`, `size`, `style`, disabled menu items, and ref forwarding.

## Stories And Docs

Stories demonstrate default data items, sections, and compound content (`src/components/ContextMenu/ContextMenu.stories.tsx:32-95`). I did not find a dedicated Silver docs file for this component beyond the story and inline prop comments.

Missing story coverage:

- `isDisabled`.
- `menuWidth`.
- `size`.
- `hasAutoFocus={false}`.
- disabled menu items.
- item descriptions.
- a realistic complex trigger such as a row/card/image region.
