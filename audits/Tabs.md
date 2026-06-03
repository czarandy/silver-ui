# Tabs Audit

## Summary

Tabs is a controlled tab bar component with full keyboard navigation (arrow keys, Home, End), support for link-based and button-based tabs, disabled tab handling, and a TabMenu overflow component for additional tab options rendered as a popover menu. It follows WAI-ARIA tablist/tab patterns.

## Issues

### Critical

- None.

### High

- **Tab panels are not managed by the component**: The component provides `controls` and `id` props on individual Tabs for consumers to wire up their own `role="tabpanel"` elements, but there is no built-in TabPanel component. This means every consumer must manually implement panel rendering with correct `hidden`, `id`, `role="tabpanel"`, and `aria-labelledby` attributes. This is error-prone and reduces the value of the component. While this is a deliberate design choice (controlled component), it increases the surface area for accessibility mistakes.

### Medium

- **`tabIndex={-1}` on the tablist container**: On line 162 of Tabs.tsx, the `<div role="tablist">` has `tabIndex={-1}`. While this prevents the tablist itself from being a tab stop (tabs inside manage their own tabIndex), some screen readers may behave unexpectedly with a negative tabIndex on a tablist container. The WAI-ARIA Tabs pattern does not recommend making the tablist itself focusable.
- **Arrow key navigation both moves focus AND selects**: The `handleKeyDown` in Tabs.tsx moves focus to the next tab and immediately calls `onChange(nextValue)`. This implements the "automatic activation" pattern. While valid, some designs prefer "manual activation" where arrow keys only move focus and Enter/Space selects. There is no prop to toggle between these modes.
- **TabMenu does not set `role="menu"` on the popover content container**: The Popover receives `role="menu"` as a prop, but the actual `<div>` containing the menu items (line 243) does not have `role="menu"`. Instead, it relies on Popover to apply the role. Individual items have `role="menuitem"`. If Popover does not forward the role to the content wrapper, the menu structure may be incomplete. This needs verification.
- **TabMenu keyboard navigation fires `onKeyDown` on each item individually**: The `handleMenuKeyDown` function is attached to each `<button>` via `onKeyDown` (line 259). It queries the menu for all `menuitem` elements to navigate. This pattern works but could be simplified by lifting the handler to the menu container.
- **Link tabs prevent default on disabled click but still navigate**: In Tab.tsx (line 219-222), disabled link tabs call `event.preventDefault()` on click, but the `<a>` element still has an `href` attribute. Similar to the Link component issue, keyboard Enter on a disabled link tab could still trigger navigation if the event handler is bypassed.

### Low

- **Label sizer technique for layout stability**: The Tab component renders the label twice (lines 195-199) -- once visible and once hidden with `fontWeight: 'semibold'` -- to prevent width shifts when the tab becomes selected (and bold). This is a clever technique but doubles the DOM nodes for labels and could be confusing to developers reading the code. A comment explaining this would help.
- **No `aria-orientation` on the tablist**: The tablist defaults to horizontal orientation per WAI-ARIA, which is correct for this component. However, explicitly setting `aria-orientation="horizontal"` would make the intent clearer and prevent issues if a vertical variant is added later.
- **TabMenu `aria-current="true"` instead of `aria-current="page"`**: Selected menu items use `aria-current="true"` (line 248 of TabMenu.tsx) instead of a more specific value. While `"true"` is valid, `"page"` would be more appropriate if these options represent page navigation.
- **No test for Home/End keys in TabMenu**: The TabMenu test covers ArrowDown and Escape but not Home/End key navigation within the menu, even though the handler supports it.
- **No story for RTL with TabMenu**: While there is an RTL story for basic tabs, it does not include a TabMenu to verify proper RTL behavior of the popover.

## Recommendations

- Consider providing a `TabPanel` convenience component that handles the `role="tabpanel"`, `aria-labelledby`, and `hidden` attributes automatically, wired to the Tabs context.
- Add a `mode` prop (e.g., `"automatic" | "manual"`) to control whether arrow key navigation also selects the tab.
- Add a code comment explaining the label sizer technique.
- Add tests for Home/End keys in TabMenu and RTL behavior.
- Test coverage is strong with 14 tests covering: onChange, tab semantics (tablist, aria-selected), labels, data-testid, divider/fill/size styling, panels with controls, tabIndex management, href tabs, custom link components, end content with selected icon swap, keyboard navigation (arrows, Home, End), disabled tab skipping, TabMenu open/close/select/keyboard, disabled TabMenu, refs, out-of-context error, and re-click firing.
- Story coverage is excellent with 12 stories covering default, fill layout, sizes, divider, link tabs, custom link, selected icons, disabled, TabMenu only, many tabs, controlled, panels, and RTL.
