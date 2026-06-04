# TopNav Audit

## Summary

TopNav is a horizontal top navigation bar with heading, start, center, and end content slots. It supports three render modes: default (flex/grid layout), mobile-bar (heading + end content only), and drawer (content inside a MobileNav). TopNavItem renders as polymorphic links with selected, disabled, and icon-only states. TopNavHeading supports logo, super/sub-heading, linked heading, and end content.

## Issues

### Critical

- None.

### High

- **`startContent` silently overrides `children` with no warning**: When both `startContent` and `children` are provided, `children` is silently ignored (line 132: `const resolvedStartContent = startContent ?? children`). The test `'uses startContent over children when both are provided'` validates this, but consumers may not expect their children to be discarded. A console warning in development mode would help catch this.

### Medium

- **TopNavItem always renders as a link (no button fallback)**: Unlike SideNavItem, TopNavItem always renders as a `<LinkComponent>` with a required `href` prop. There is no `onClick`-only button mode. Consumers who want action-only items in the TopNav must use a separate Button component, which creates visual inconsistency. Consider making `href` optional and rendering a `<button>` when only `onClick` is provided.
- **Disabled link items use `pointer-events: none` in the recipe**: The `topNavItemRecipe` sets `pointerEvents: 'none'` when `isDisabled` is true (line 39 of TopNavItem.recipe.ts). This prevents the click handler from firing at all, which means the `event.preventDefault()` guard in the click handler (line 116 of TopNavItem.tsx) is unreachable for pointer interactions. While the test uses `dispatchEvent` to verify `preventDefault` is called, in practice `pointer-events: none` makes the element unclickable. This is a belt-and-suspenders approach, but the recipe-level disabling means the component-level handler never runs for mouse users.
- **Mobile-bar mode does not include start/center content in a dropdown or accessible way**: In mobile-bar mode, `startContent` and `centerContent` are completely hidden. The only access is through the MobileNavToggle and drawer. If the drawer has no content (no `hasMobileDrawerContent`), the start/center links are simply inaccessible on mobile.
- **TopNavHeading passes `href` to `<div>` elements when `resolvedHref` is null**: When no href is provided, `Element` is `'div'`, but the component still passes `href={resolvedHref}` (which is `undefined`) and `to={...}` to the div. While React ignores `undefined` attributes, it adds noise. More importantly, `to` is set to `undefined` only when `Element === 'a'`, but when Element is `'div'`, `to` is also `undefined` (since `resolvedHref` is null), so this works correctly but the logic is confusing.

### Low

- **No recipe file for TopNavHeading**: TopNavHeading uses inline `css()` calls rather than a `cva` recipe, unlike TopNavItem which has `TopNavItem.recipe.ts`.
- **`TopNavSlotContext` is provided but `useTopNavSlot()` is never consumed by TopNavItem**: The `TopNavSlotContext` is set in TopNav.tsx (lines 196, 202, 208-209) but `useTopNavSlot()` is exported from TopNavContext.ts and never called by TopNavItem or any file in the TopNav directory. It appears to be intended for future use or external consumers, but this is undocumented.
- **No story for mobile-bar or drawer render modes**: The stories only cover default desktop layout. Mobile-specific rendering requires AppShell context, making it harder to test TopNav's responsive behavior in isolation.
- **No test for `ref` forwarding on TopNav or TopNavHeading**: While TopNavItem has no explicit ref test either, the TopNav `ref` prop and TopNavHeading `ref` prop are untested.
- **No test for TopNavItem `rel` and `target` props**: These anchor attributes are accepted but not tested.
- **`TopNavItem` does not integrate with `linkAccessibility` helpers**: Unlike the `Link` component, `TopNavItem` does not call `useRel()` or `getAriaLabel()`, so it does not automatically add `noopener noreferrer` for `target="_blank"` or "(opens in new tab)" text. Consumers must handle this manually.

## Recommendations

- Consider adding a development-mode console warning when both `children` and `startContent` are provided.
- Add button fallback for TopNavItem when `href` is omitted, similar to SideNavItem's pattern.
- Integrate `useRel()` from `linkAccessibility` into TopNavItem for consistent external link handling with the Link component.
- Add stories for mobile-bar and drawer render modes to improve visual testing coverage.
- Add tests for ref forwarding, `rel`/`target` props on TopNavItem, and the unused `TopNavSlotContext`.
- Test coverage is good with 17 tests covering: heading/start/end content, center content, startContent vs children priority, no heading, className/style/data-testid, mobile-bar mode, TopNavItem selected/disabled/icon-only states, TopNavHeading variants (div vs link, logo/super/sub/end content, aria-label), drawer mode with content/dividers/null, and onClick with mobile context.
- Story coverage is decent with 8 stories covering basic, center content, start content, no heading, disabled items, icon-only items, items with icons, and heading variants.

## SVA Conversion

**Benefit: Moderate**

The TopNav family spans three files. `TopNav.tsx` renders the `nav` root via a `cva` recipe (`topNavRecipe`, with a `layout` variant: flex/grid/mobile) plus a standalone `const styles = {...}` object of ~10 layout `css()` blocks for its section wrappers (`leftSection`, `heading`, `startContent`, `centerContent`, `rightSection`, `endContent`, `mobileEnd`, `drawerItems`, `drawerDivider`). An `sva` with slots `root`/`leftSection`/`heading`/`startContent`/`centerContent`/`rightSection`/`endContent` and the existing `layout` variant would consolidate the root recipe and these section styles into one place and could drive layout-dependent section visibility/styling through variants. `TopNavHeading.tsx` similarly has a 4-block `styles` object (`root`/`logo`/`text`/`endContent`) with no recipe — a modest standalone sva candidate. `TopNavItem.tsx`, by contrast, is a single styled element fully driven by `topNavItemRecipe` (cva, with `isSelected`/`isDisabled`/`isIconOnly`/`isDrawer` variants) and needs no change. Overall moderate: the section wrappers are mostly static layout with few variants, so consolidation improves cohesion more than it removes conditional logic.
