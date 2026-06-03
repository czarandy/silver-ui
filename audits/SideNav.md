# SideNav Audit

## Summary

SideNav is a vertical side navigation panel with sections, items, headings, and optional collapse behavior. It adapts to multiple render modes (default/inline, topbar, drawer, drawer-content) via context from AppShell. Items support nested sub-items with expand/collapse, link or button rendering, custom link components, and icon-only collapsed states.

## Issues

### Critical

- None.

### High

- **Redundant `role="navigation"` on `<nav>` element**: On line 180 of SideNav.tsx, the `<nav>` element has both `aria-label="Side navigation"` and an explicit `role="navigation"`. The `<nav>` element already has an implicit `role="navigation"`, so the explicit attribute is redundant. While harmless, it signals a potential misunderstanding and some screen readers may announce the role twice.
- **`closeMobileNav` called on every item click regardless of render mode**: In SideNavItem.tsx (line 242), `closeMobileNav()` is called in the `handleClick` handler unconditionally. This means clicking any SideNavItem -- even in the default (non-mobile) render mode -- calls `closeMobileNav()`. While the AppShell context likely handles this gracefully, it is semantically incorrect and adds unnecessary overhead.

### Medium

- **Collapsible state is uncontrolled with no external control**: The `isCollapsed` state in SideNav is managed internally with `useState(false)`. There is no `isCollapsed` prop or `onCollapseChange` callback, so consumers cannot programmatically control or respond to the collapse state (e.g., to persist it in localStorage or sync it with a URL parameter). The `isCollapsible` prop only enables/disables the feature.
- **SideNavItem `isDefaultExpanded` only works on initial render**: The `isDefaultExpanded` prop sets the initial state via `useState(isDefaultExpanded)`, so changing it after mount has no effect. There is no controlled `isExpanded`/`onExpandedChange` pair for items. This is a common pattern but may surprise consumers who expect reactive behavior.
- **No ARIA tree pattern for nested items**: Nested SideNavItem children are rendered in a `<div role="group">` without `role="tree"` / `role="treeitem"` semantics. While this is acceptable for simple nesting, deeply nested navigation structures would benefit from proper tree widget semantics per WAI-ARIA.
- **Topbar render mode does not include a `<nav>` element**: When `renderMode === 'topbar'`, the component renders a plain `<div>` without navigation landmark semantics (`<nav>` or `role="navigation"`). This means the topbar mode is not discoverable as a navigation region by assistive technology.
- **Drawer render mode does not forward `ref`**: When `renderMode === 'drawer'` or `'drawer-content'`, the `ref` prop is not forwarded to any element.

### Low

- **`SideNavSection` uses `useId()` for group labeling**: This generates a React ID for `aria-labelledby`, which is correct. However, the `data-testid={undefined}` on the `Text` element (line 77 of SideNavSection.tsx) is explicitly set to `undefined` rather than being omitted, which is a minor code smell.
- **No test for topbar render mode**: The test suite does not test the `renderMode === 'topbar'` branch. This means the non-semantic `<div>` rendering is untested.
- **No test for drawer or drawer-content render modes**: Tests do not cover SideNav in drawer or drawer-content modes. The interactions with MobileNav in drawer mode are untested.
- **`SideNavHeading` returns `null` when collapsed with no logo**: This behavior (lines 76-78 of SideNavHeading.tsx) could cause layout shifts and is not documented or tested.
- **No story for disabled collapsible items**: While `DisabledItems` story exists, there is no story combining `isCollapsible` and `isDisabled` on the same item.

## Recommendations

- Remove the redundant `role="navigation"` from the `<nav>` element.
- Guard `closeMobileNav()` behind a render mode check so it only fires in drawer modes.
- Consider adding `isCollapsed`/`onCollapseChange` controlled props to allow external state management.
- Add a `<nav>` wrapper or `role="navigation"` for the topbar render mode.
- Add tests for topbar and drawer render modes.
- Test coverage is strong overall with 33 tests across SideNav, SideNavItem, SideNavSection, SideNavHeading, collapsed state, and collapsible items. Key behaviors are well-covered.
- Story coverage is excellent with 13 stories covering basic, collapsible, footer, top content, disabled items, end content, button items, multiple sections, logo, collapsible items with and without links, and scrollable overflow.
