# DropdownMenu Audit

Audited files:

- `src/components/DropdownMenu/DropdownMenu.tsx`
- `src/components/DropdownMenu/DropdownMenuItem.tsx`
- `src/components/DropdownMenu/DropdownMenuContext.ts`
- `src/components/DropdownMenu/DropdownMenu.stories.tsx`
- `src/components/DropdownMenu/DropdownMenu.test.tsx`
- `src/components/DropdownMenu/index.ts`

No dedicated docs file was found for the current `src/components/DropdownMenu` implementation; the only docs are prop comments and Storybook stories.

## Findings

### High: trigger and popup use generic dialog semantics instead of menu-button semantics

`DropdownMenu` renders a `role="menu"` inside `Popover` (`DropdownMenu.tsx:221-228`), but the trigger attributes are attached by the generic `Popover`, which sets `aria-haspopup="dialog"` and `aria-controls` to the outer popover id (`Popover.tsx:175-188`, `usePopover.tsx:159-163`). The rendered popover surface is also a `role="dialog"` with `aria-modal="true"` (`usePopover.tsx:125-130`), so assistive tech sees a dialog trigger/dialog containing a menu rather than a menu button controlling a menu. This is inconsistent with the component's own `role="menu"`/`role="menuitem"` contract and with sibling menu components such as `ContextMenu`, which explicitly uses `aria-haspopup="menu"` (`ContextMenu.tsx:393-412`).

### High: menu keyboard behavior is incomplete

The menu container has `role="menu"` but no menu key handler (`DropdownMenu.tsx:221-253`). `Popover`/`useFocusTrap` only cover Escape and Tab trapping (`useFocusTrap.ts:48-63`); they do not implement ArrowDown/ArrowUp/Home/End item navigation, nor ArrowDown/Enter/Space opening from the trigger and moving focus into the menu. `DropdownMenuItem` renders native buttons with `role="menuitem"` (`DropdownMenuItem.tsx:103-117`), so users can tab through items, but that is not the expected keyboard model for a menu widget.

### High: `isMenuOpen` is not a strict controlled source of truth

`DropdownMenu` passes `isOpen={isOpen}` to `Popover` (`DropdownMenu.tsx:232-239`), but the `Popover` trigger always calls its internal `popover.toggle()` on click (`Popover.tsx:153-163`, `Popover.tsx:189`). That mutates internal open state via `useLayer.show()` (`useLayer.tsx:101-109`) before or regardless of the parent updating `isMenuOpen`. A controlled `isMenuOpen={false}` menu can therefore open transiently if the parent ignores or delays `onOpenChange`, which violates controlled-component expectations.

### Medium: data-driven item keys are unstable and can collide

Data-driven items use `key={String(item.label)}` and section items do the same (`DropdownMenu.tsx:154-160`, `DropdownMenu.tsx:168-174`). Duplicate text labels collide, and ReactNode labels such as elements stringify to `[object Object]`. This can cause incorrect reconciliation, remounts, or state/focus association bugs. The data API also has no explicit `key`/`id` field to let callers avoid this.

### Medium: `items` and `children` can both be supplied, but `items` silently wins

The props allow both `items` and `children` at the same time (`DropdownMenu.tsx:44-99`), and rendering chooses `items` whenever it is non-null (`DropdownMenu.tsx:218`). That makes the API ambiguous and can hide caller mistakes. A discriminated prop type or runtime warning would make the two supported modes clearer.

### Medium: selected items do not return focus to the trigger

`DropdownMenuItem` closes the menu by calling `context?.closeMenu()` after `onClick` (`DropdownMenuItem.tsx:107-113`). For uncontrolled menus, `closeMenu` only updates internal React state or calls `onOpenChange` (`DropdownMenu.tsx:205-216`); no focus restoration is performed. After a menu action, focus can be left on a now-hidden menu item instead of returning to the trigger.

### Low: section accessibility is weaker than it needs to be

Sections render the visible title as plain text and separately set `aria-label={item.title}` on the group (`DropdownMenu.tsx:140-152`). This works for simple string titles, but it duplicates label text and cannot support non-string headings. Using `aria-labelledby` tied to the visible heading would be more robust.

## Tests

Current tests only cover basic data-driven item click/disabled state and compound item click (`DropdownMenu.test.tsx:23-61`). Missing important coverage:

- menu-button ARIA: `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls` targeting the actual menu
- keyboard behavior: trigger ArrowDown/Enter/Space, menu ArrowUp/ArrowDown/Home/End/Escape, and disabled-item skipping
- controlled mode: `isMenuOpen`, `onOpenChange`, and no internal open when controlled false
- menu closes after item selection and focus returns to trigger
- sections/groups and dividers, including `role="group"`/`role="separator"`
- `hasChevron`, `hasAutoFocus`, `menuWidth`, `className`, `style`, `ref`, and `data-testid`
- item `description`, `endContent`, icon rendering, and duplicate/non-string labels

## Stories

Current stories cover only basic data-driven and compound usage (`DropdownMenu.stories.tsx:15-33`). Missing stories for important props and states:

- sections with headings, dividers, disabled items, descriptions, icons, and trailing/end content
- controlled open state via `isMenuOpen`/`onOpenChange`
- `menuWidth`
- `hasChevron={false}` and icon-only trigger
- button sizes/variants/tooltips
- long or scrollable menus

## Performance

No standalone performance issue was found for normal menu sizes. The key-collision issue above can still cause unnecessary remounts or incorrect reconciliation in data-driven menus.
