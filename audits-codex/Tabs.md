# Tabs Audit

Scope: `src/components/Tabs/Tabs.tsx`, `Tab.tsx`, `TabMenu.tsx`, `TabsContext.ts`, `Tabs.stories.tsx`, and `Tabs.test.tsx`.

Verification: `pnpm vitest run src/components/Tabs/Tabs.test.tsx` passes.

## Findings

### High: Tabs semantics are ambiguous and can be inaccessible for content tabs

- `Tabs` renders a labeled `<nav>` with child buttons/links, and `Tab` marks selection with `aria-current="page"` (`src/components/Tabs/Tabs.tsx:96`, `src/components/Tabs/Tab.tsx:195`, `src/components/Tabs/Tab.tsx:211`). There is no `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, associated `tabpanel`, roving `tabIndex`, or Arrow/Home/End keyboard handling.
- If consumers use this as a true tabs widget for switching panels, assistive tech will not announce it as tabs and keyboard behavior will not match expected tablist behavior. If this is intentionally page navigation, the API/docs should make that explicit because the component name, prop names, and button rendering invite panel-tabs usage.

### Medium: `TabMenu` uses menu roles without menu keyboard behavior

- `TabMenu` renders `role="menu"` and `role="menuitem"` (`src/components/Tabs/TabMenu.tsx:186`, `src/components/Tabs/TabMenu.tsx:204`) inside a `Popover` whose trigger is announced as `aria-haspopup="dialog"` by `usePopover` (`src/components/Popover/usePopover.tsx:159`).
- The menu items are plain buttons with normal Tab navigation. There is no ArrowUp/ArrowDown, Home/End, typeahead, or roving focus behavior expected for ARIA menus. Either remove menu roles and treat the popover as a simple dialog/list of buttons, or implement the menu interaction model and align the trigger popup role.

### Medium: Link-tab API bypasses existing link accessibility features

- `Tab` renders `LinkComponent` directly when `href` is set (`src/components/Tabs/Tab.tsx:195`) instead of using the library `Link` component. `TabProps` exposes `href` and `as` but not `target`, `rel`, `isExternalLink`, `isDisabled`, `label`, or tooltip props (`src/components/Tabs/Tab.tsx:9`).
- This means link tabs cannot opt into the existing external-link/new-tab accessibility behavior from `Link` (`src/components/Link/Link.tsx:114`, `src/components/Link/Link.tsx:145`) and cannot express disabled link state. The API is also unclear for router links because `Tab` always passes both `href` and `to` (`src/components/Tabs/Tab.tsx:201`, `src/components/Tabs/Tab.tsx:205`).

### Low: Link tabs call `onChange` for every click, including already-selected and modified clicks

- Both button and link tabs call `context.onChange(value)` unconditionally (`src/components/Tabs/Tab.tsx:202`, `src/components/Tabs/Tab.tsx:216`).
- For links, Ctrl/Cmd-click and other modified navigation can still mutate controlled tab state before the browser/router handles navigation. For all tabs, clicking the already-selected value still fires `onChange`, which can trigger unnecessary parent work or analytics noise.

### Low: Selected state in `TabMenu` is not strongly conveyed

- The selected menu option uses a check icon and `aria-current="true"` (`src/components/Tabs/TabMenu.tsx:193`, `src/components/Tabs/TabMenu.tsx:212`). For a selectable menu/list, `aria-checked` with `menuitemradio` or `aria-selected` in an appropriate listbox pattern would communicate selection more directly than a generic current marker.

## Tests

- Existing tests cover clicking a button tab and `aria-current` on the selected button (`src/components/Tabs/Tabs.test.tsx:10`, `src/components/Tabs/Tabs.test.tsx:25`).
- Missing coverage: `TabMenu` open/select/close behavior, selected option trigger label, menu option icons, `href`/custom `as` link rendering, modified-click behavior, `selectedIcon`, custom `label`, `hasDivider`, `layout="fill"`, all `size` variants, `className`/`style`/`ref`/`data-testid`, and the out-of-context error from `useTabsContext`.

## Stories and Docs

- Stories currently include only `Default` and `Fill` (`src/components/Tabs/Tabs.stories.tsx:40`, `src/components/Tabs/Tabs.stories.tsx:43`).
- Missing stories for important props and variants: `size="sm"`/`"lg"`, `hasDivider={false}`, custom `label`, `selectedIcon`, link/router tabs via `href`/`as`, a selected `TabMenu` option as the initial value, and a focused overflow/menu example.

## Performance

- No significant performance issue found. `Tabs` memoizes its context value (`src/components/Tabs/Tabs.tsx:91`), and the `TabMenu` `options.find`/`options.map` work is linear in the number of overflow options and likely negligible for this component.

## Logic Bugs

- No confirmed state corruption or rendering crash found in the current implementation. The main logic risks are the unconditional `onChange` behavior and the underspecified link/menu semantics noted above.
