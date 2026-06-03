# AppShell Audit

## Summary

AppShell is a comprehensive application-level layout shell providing top navigation, side navigation, banner, skip-to-content accessibility, and responsive mobile navigation. It is the largest and most complex of the Layout & Structure components, composing Layout, SideNav, TopNav, and MobileNav internally. It uses a context-based mobile state system (`AppShellMobileContext`), a `useSlotPresence` hook for detecting rendered content in slots, and a shared resize observer for dynamic header height tracking.

## Issues

### Critical

- None identified.

### High

None

### Medium

- **`useSlotPresence` MutationObserver does not watch `subtree`**: The MutationObserver in `useSlotPresence.tsx` (line 38) only observes `{childList: true}` on the wrapper element. If children are rendered deeper in the tree (e.g., a portal or nested component that mounts asynchronously), changes below the immediate child level will not be detected. This is likely acceptable for the current usage pattern but could cause subtle bugs if slot content is conditionally rendered by a child component.
- **Multiple slot refs for the same slot**: The `sideNav` content is rendered in multiple render contexts (inline, drawer, mobile top bar, drawer-content). Each render context wraps it with its own `ref={sideNavPresenceRef}` container. Since `useSlotPresence` uses a callback ref that disconnects the previous observer when called with a new node, the ref will track whichever container was most recently mounted/updated. If multiple containers are mounted simultaneously (which the current conditional logic prevents), the observer would only track the last one. This is not a bug with the current logic, but the pattern is fragile.
- **`eslint-disable` for unstable context value**: Lines 258-271 disable `@eslint-react/no-unstable-context-value` for `mobileContentValue` and `drawerMobileContentValue`. These are ReactNode values created on every render, which means consumers of `TopNavMobileContentContext` will re-render on every parent render even if nothing changed. This is mitigated by the fact that these contexts hold ReactNode elements (not callbacks or state), but it could cause unnecessary re-renders in the TopNav mobile drawer.
- **Missing story for `mobileBreakpoint` prop**: The `mobileBreakpoint` prop (with values 'sm', 'md', 'lg', 'none') has no dedicated story demonstrating different breakpoint configurations. Only the default 'md' is exercised.
- **No test for `contentPadding` prop**: The `contentPadding` prop is not tested. Tests verify other props like `height`, `variant`, `className`, `style`, but `contentPadding` is only shown in stories via args.

### Low

- **`setMobileNavOpen` callback wrapper is unnecessary**: `setMobileNavOpen` (line 208) is wrapped in `useCallback` but simply delegates to `setIsMobileNavOpen`, which is already a stable setter from `useState`. The wrapper adds no value since it has an empty dependency array and `setIsMobileNavOpen` is already referentially stable.
- **`breakpointQuery` for `mobileBreakpoint="none"` evaluates to `(max-width: 0px)`**: When `mobileBreakpoint` is `'none'`, the breakpoint value is `0`, producing the query `(max-width: 0px)`. This works correctly (no viewport is 0px wide), but using a semantically clearer approach (like skipping the media query entirely) would be more readable.
- **No story for `ref` forwarding**: While ref forwarding is tested, there is no story demonstrating or documenting it.

## Recommendations

1. Add stories for `mobileBreakpoint` variations and `contentPadding`.
2. Add a test that verifies `contentPadding` propagates to the main content area.
3. Consider removing the unnecessary `useCallback` wrapper around `setMobileNavOpen`.
4. Document the multiple-render-context pattern for sideNav with inline comments explaining the lifecycle.
