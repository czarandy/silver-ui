# Tabs Component Audit

**Files reviewed:**

- `src/components/Tabs/index.ts`
- `src/components/Tabs/Tab.tsx`
- `src/components/Tabs/TabMenu.tsx`
- `src/components/Tabs/Tabs.tsx`
- `src/components/Tabs/TabsContext.ts`
- `src/components/Tabs/Tabs.stories.tsx`
- `src/components/Tabs/Tabs.test.tsx`

No `.recipe.ts` file exists for this component (some other components in the project use recipe files, but this is not necessarily required).

---

## Accessibility Concerns

### Critical: Missing WAI-ARIA Tabs Pattern

The component does not implement the [WAI-ARIA Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). None of the following roles or attributes are present anywhere in the component:

- **`role="tablist"`** on the container (`Tabs.tsx`, line 98: `<nav>` is used instead)
- **`role="tab"`** on individual tabs (`Tab.tsx`, lines 211-222: renders as plain `<button>`)
- **`aria-selected`** on tabs (`Tab.tsx`, lines 198, 211: uses `aria-current="page"` instead)
- **`aria-controls`** linking tabs to their panels
- **`role="tabpanel"`** (no panel concept exists)

Using `aria-current="page"` (Tab.tsx, line 198 and line 213) is semantically incorrect for tabs. `aria-current="page"` is for navigation landmarks indicating the current page, not for indicating a selected tab within a tablist. The correct attribute is `aria-selected="true"`.

The `<nav>` wrapper (Tabs.tsx, line 98) with `aria-label` partially compensates by treating tabs as navigation, which may be intentional for route-based tabs. However, when tabs are used as non-navigational selection controls (the button-based path), the navigation landmark is misleading to screen readers.

### Missing Keyboard Navigation

The WAI-ARIA Tabs pattern requires Arrow key navigation between tabs. Currently, keyboard users must use Tab key to move between tabs sequentially, which is the incorrect interaction model for a tablist. Expected behavior:

- Arrow Left/Right to move focus between tabs
- Home/End to jump to first/last tab
- The tablist should be a single tab stop (only the active tab receives focus via Tab key)

### TabMenu Accessibility Issues

- **TabMenu.tsx, line 186:** The menu uses `role="menu"` and `role="menuitem"`, but lacks keyboard support (Arrow key navigation within the menu, Escape to close).
- **TabMenu.tsx, line 187:** The heading uses `role="presentation"`, which is correct for hiding it from the accessibility tree, but the heading text is the same as the trigger label, so the context is redundant for screen reader users.
- **TabMenu.tsx, line 227:** The trigger button has no `aria-haspopup` or `aria-expanded` attributes. These are needed so screen reader users know the button opens a menu and whether it is currently open.

### No `disabled` State

Neither `Tab` nor `TabMenu` supports a `disabled` prop. There is no way to render a tab that is visually and functionally disabled (`aria-disabled`).

---

## Performance Problems

### Minor: `onChange` in Context Memoization

- **Tabs.tsx, line 91-94:** The `useMemo` for context includes `onChange` in its dependency array. If the parent passes an inline arrow function (common pattern: `onChange={v => setValue(v)}`), the context value will be recreated on every render, causing all `Tab` and `TabMenu` children to re-render. This is a known React pattern issue. Consider documenting that `onChange` should be a stable reference, or split the context so `onChange` is provided separately (e.g., via a ref).

### Minor: Tab Renders Unconditionally

- **Tab.tsx, lines 171-193:** The `content` JSX is constructed on every render even if no props have changed. Since `Tab` is not wrapped in `React.memo`, every parent re-render triggers all tabs to re-render. For a typical tab bar (3-8 tabs) this is negligible, but it could matter in extreme cases.

---

## Logic Bugs

### No Validation of `value`

- **Tabs.tsx / Tab.tsx:** There is no runtime check or dev-mode warning if the `value` prop on `Tabs` does not match any child `Tab`'s `value`. If an invalid value is passed, no tab will appear selected, and there will be no error or console warning.

### TabMenu Does Not Reflect Selection in Trigger Consistently

- **TabMenu.tsx, line 179-180:** `selectedOption` is found by matching `context.value` against `options`. If the current `context.value` matches one of the menu options, the trigger shows that option's label and the indicator. However, the trigger button does not receive `aria-current` unlike regular `Tab` components, creating an inconsistency.

---

## Unclear API

### `as` Prop Naming

- **Tab.tsx, line 13:** The `as` prop is used to provide a custom link component, but it only applies when `href` is set. The name `as` is commonly associated with polymorphic components (render as a different element), which is not quite what this does. A name like `linkComponent` would be clearer and match `useLinkComponent`.

### Navigation vs. Selection Ambiguity

The component mixes two paradigms:

1. **Navigation tabs** (when `href` is provided) -- renders links, uses `aria-current="page"`
2. **Selection tabs** (button-based) -- renders buttons, uses the same `aria-current="page"`

There is no documented guidance on which pattern to use or how they differ semantically. The component could benefit from clarifying whether it is a navigation component or a selection component (or both, with clear documentation).

### `to` Prop on Link

- **Tab.tsx, line 205:** `to={LinkComponent === 'a' ? undefined : href}` passes `to` to custom link components (e.g., React Router `Link`). This assumes the custom link component accepts `to`, which is framework-specific and undocumented.

---

## Missing Tests

The test file (43 lines, 2 tests) has very thin coverage:

### Tests Present

1. `onChange` callback fires when a tab is clicked
2. Selected tab has `aria-current="page"`

### Tests Missing

- **TabMenu component:** No tests at all. Menu opening, option selection, closing behavior, and selected state display are untested.
- **`href` / link rendering:** No test that tabs render as `<a>` elements when `href` is provided.
- **`as` (custom link component):** No test for custom link component rendering.
- **`icon` and `selectedIcon` props:** No test that icons render or swap when selected.
- **`endContent` prop:** No test that end content (e.g., badges) renders.
- **`hasDivider` prop:** No test for divider styling.
- **`layout="fill"` prop:** No test for fill layout.
- **`size` prop:** No test for size variants (`sm`, `md`, `lg`).
- **`data-testid` prop:** No test that test IDs are forwarded.
- **`ref` forwarding:** No test for ref forwarding on `Tabs`, `Tab`, or `TabMenu`.
- **`label` prop on Tabs:** No test that `aria-label` is set on the `<nav>`.
- **Context error:** No test that using `Tab` outside `Tabs` throws the expected error (TabsContext.ts, line 19-21).
- **Multiple clicks / re-selection:** No test for clicking an already-selected tab.
- **Keyboard interaction:** No keyboard navigation tests (though the component currently lacks keyboard support).

---

## Missing Stories

The stories file (46 lines, 2 stories) covers only two variants:

### Stories Present

1. `Default` -- hug layout, md size, with icon, endContent (Badge), and TabMenu
2. `Fill` -- fill layout variant

### Stories Missing

- **Sizes:** No story for `size="sm"` or `size="lg"`.
- **With Divider vs. Without:** `hasDivider` is set to `true` in meta args but there is no explicit story contrasting with/without divider.
- **Link Tabs:** No story demonstrating `href`-based tabs.
- **Selected Icon:** No story demonstrating the `selectedIcon` prop.
- **Disabled State:** N/A (no disabled support exists).
- **Custom Link Component (`as`):** No story demonstrating a custom link adapter.
- **TabMenu Only:** No isolated story for `TabMenu` to showcase its dropdown behavior independently.
- **Many Tabs / Overflow:** No story demonstrating behavior with many tabs that might overflow.
- **Controlled State:** Both stories use the same `TabsStory` wrapper. No story explicitly shows the controlled nature with Storybook `args` wired to `value`.
- **Icon-Only Tabs:** No story demonstrating tabs with icons and no labels (which the current API does not support since `label` is required, but could be discussed).
- **RTL Layout:** No story demonstrating right-to-left rendering.

---

## Summary

| Category        | Severity | Count                                                                                |
| --------------- | -------- | ------------------------------------------------------------------------------------ |
| Accessibility   | Critical | 3 (missing tablist/tab roles, missing keyboard nav, TabMenu missing aria attributes) |
| Accessibility   | Moderate | 2 (no disabled state, aria-current misuse)                                           |
| Performance     | Minor    | 2 (context re-creation, no memoization)                                              |
| Logic Bugs      | Minor    | 2 (no value validation, TabMenu aria-current inconsistency)                          |
| Unclear API     | Low      | 3 (as prop naming, nav vs selection ambiguity, undocumented `to` prop)               |
| Missing Tests   | Moderate | 13+ scenarios untested                                                               |
| Missing Stories | Low      | 8+ prop/variant combinations not demonstrated                                        |

The most impactful improvement would be implementing the WAI-ARIA Tabs pattern (roles, aria-selected, keyboard navigation), followed by expanding test coverage -- particularly for the completely untested `TabMenu` component.
