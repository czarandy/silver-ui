# AppShell Component Audit

Audited files:

- `src/components/AppShell/AppShell.tsx`
- `src/components/AppShell/AppShell.recipe.ts`
- `src/components/AppShell/AppShell.stories.tsx`
- `src/components/AppShell/AppShell.test.tsx`
- `src/components/AppShell/AppShellMobileContext.tsx`
- `src/components/AppShell/index.ts`
- `src/components/AppShell/useSlotPresence.tsx`

---

## Performance Problems

### P1. `mobileNavConfig` object in `useCallback` dependency array (AppShell.tsx, line 270)

`setMobileNavOpen` depends on `mobileNavConfig`, which is derived inline every render (line 240-245). Because `mobileNavConfig` is a new object reference on each render (even when the underlying `mobileNav` prop is stable), `setMobileNavOpen` is recreated every render, defeating the `useCallback`. This also cascades into `mobileContextValue` (line 306), which depends on `setMobileNavOpen`, causing the context value to be recreated every render and triggering re-renders in all consumers (`MobileNavToggle`, `TopNav`, `SideNavItem`, etc.).

**Fix:** Extract `mobileNavConfig?.onOpenChange` into a variable and use that plus `isControlled` as dependencies instead of the entire config object. Alternatively, stabilize `mobileNavConfig` with `useMemo`.

### P2. `mobileContentValue` and `drawerMobileContentValue` allocate JSX via `useMemo` (AppShell.tsx, lines 326-345)

These memoized values contain JSX trees with `sideNav` in their dependency arrays. Since `sideNav` is a `ReactNode` prop, it will typically be a new reference on each parent render, causing these memos to recompute every render. The `useMemo` here gives a false sense of optimization.

**Fix:** Consider whether memoization is needed here at all, or lift the side nav content higher so its reference is stable.

### P3. `topNavPresenceRef` is attached to two different DOM elements (AppShell.tsx, lines 350, 366)

The `topNavPresenceRef` callback ref is assigned to a `<div>` on line 350 (mobile path) and again on line 366 (desktop path). These are in mutually exclusive branches of the `topNavContent` / `headerContent` logic, so only one is rendered at a time, which avoids a hard bug. However, when the breakpoint changes and the component transitions between mobile and desktop, the ref will be called with `null` (old element unmounts) then with the new element. During the `null` phase, `hasTopNavContent` will briefly flip to `false`, which could cause a flash of incorrect layout.

### P4. `sideNavPresenceRef` is attached to three different DOM elements (AppShell.tsx, lines 330, 385, 395)

Same pattern as P3 but worse -- `sideNavPresenceRef` appears in three locations: `mobileContentValue` (line 330), `autoMobileTopBar` (line 385), and `sideNavPanel` (line 395). While the rendering branches are mostly exclusive, the one in `mobileContentValue` (line 330) is inside a `useMemo` that could keep a stale ref assignment. When multiple elements try to claim the same callback ref, only the last one wins, and the MutationObserver from `useSlotPresence` will only track one element.

### P5. `useSlotPresence` creates a MutationObserver with `subtree: true` (useSlotPresence.tsx, line 38)

Observing the full subtree for mutations is expensive for deeply nested slot content. Given that the hook only checks for direct `childNodes` (line 4-14), `subtree: true` is unnecessary and causes the observer to fire on every descendant mutation (text changes, attribute changes in children, etc.) when only direct child additions/removals matter.

**Fix:** Change `{childList: true, subtree: true}` to `{childList: true}`.

---

## Accessibility Concerns

### A1. Skip link target uses `role="main"` on a `<div>` (AppShell.tsx, line 420)

`LayoutContent` renders a `<div role="main">` rather than a semantic `<main>` element. While functionally equivalent for screen readers, using the native `<main>` element is preferred per WAI-ARIA best practices ("prefer native semantics"). This is a minor concern since `role="main"` is still valid.

### A2. `autoMobileTopBar` uses `role="navigation"` on a `<div>` without a unique label (AppShell.tsx, lines 381-383)

The auto-generated mobile top bar has `aria-label="Mobile navigation"`, which is good. However, if a `topNav` with its own `aria-label` is also present (hidden but in the DOM), there could be duplicate navigation landmarks. The test on line 85-103 only tests with `sideNav`, not the combined `topNav + sideNav` mobile scenario.

### A3. No `aria-live` announcements for mobile nav state changes

When the mobile nav opens or closes, there is no announcement for screen reader users. The drawer component (via `SideNav`/`TopNav` in `"drawer"` render context) may handle this, but AppShell itself provides no mechanism to announce navigation state transitions.

### A4. Skip link text is hardcoded in English (AppShell.tsx, line 447)

The "Skip to content" text is not internationalized. If the library is intended for multilingual applications, this should accept a prop or use an i18n mechanism.

### A5. Hardcoded `MAIN_CONTENT_ID` could collide (AppShell.tsx, line 133)

The ID `silver-app-shell-main` is a static string. If multiple `AppShell` instances are rendered (e.g., in nested micro-frontends or testing), the ID will be duplicated, which is invalid HTML and will confuse screen readers and `#`-based skip link navigation.

---

## Logic Bugs

### L1. `defaultIsMobile` prop is declared but never used (AppShell.tsx, line 51)

The `MobileNavConfig` interface defines `defaultIsMobile?: boolean` with a JSDoc comment ("Initial mobile-layout hint for server-rendered apps"), but the value is never read anywhere in `AppShell.tsx` or any other file in the codebase. This is dead API surface.

### L2. `breakpoint === 'none'` produces `(max-width: 0px)` which still matches at 0px (AppShell.tsx, line 256)

When breakpoint is `'none'`, the media query `(max-width: 0px)` is used, which is intended to never match. However, `max-width: 0px` technically matches when the viewport width is exactly 0 (e.g., in some test environments or SSR contexts). A safer approach would be to use a query that never matches, such as `not all` or to short-circuit the `useMediaQuery` call entirely.

### L3. `mobileNav` type discrimination misses arrays (AppShell.tsx, lines 240-250)

The logic distinguishes `MobileNavConfig` objects from React elements by checking `typeof mobileNav === 'object' && !isValidElement(mobileNav)`. However, arrays are also `typeof === 'object'` and are valid `ReactNode` values. Passing an array as `mobileNav` (e.g., `mobileNav={[<A />, <B />]}`) would be incorrectly interpreted as a `MobileNavConfig` object, leading to undefined behavior when accessing `.content`, `.breakpoint`, etc.

**Fix:** Add `&& !Array.isArray(mobileNav)` to the config check.

### L4. `mobileNavReactNode` check excludes numbers and booleans (AppShell.tsx, line 248)

The `mobileNavReactNode` assignment only recognizes `isValidElement(mobileNav) || typeof mobileNav === 'string'`. React's `ReactNode` type also includes `number`. Passing `mobileNav={42}` (admittedly unlikely) would fall through to neither `mobileNavConfig` nor `mobileNavReactNode`, resulting in both being `null` and the prop being silently ignored.

---

## Unclear API

### U1. `mobileNav` prop is a discriminated union without clear documentation (AppShell.tsx, line 103)

The `mobileNav` prop accepts either a `MobileNavConfig` object or a `ReactNode`. This overloaded API is not immediately obvious from the type signature (`MobileNavConfig | ReactNode`). Consumers must understand the internal type discrimination logic to predict behavior. Consider splitting into `mobileNavConfig` and `mobileNavContent` as separate props, or document the behavior more explicitly.

### U2. `isMobileNavDisabled` interacts non-obviously with `mobileNav` (AppShell.tsx, line 99)

When `isMobileNavDisabled` is `true`, the auto-generated mobile nav is suppressed, but the `breakpoint` and media query logic still runs. The relationship between `isMobileNavDisabled`, `mobileNav`, and `mobileNavEnabled` involves three separate boolean expressions that are hard to reason about together.

### U3. `variant` values have non-obvious visual differences

The `variant` prop accepts `'wash' | 'surface' | 'section' | 'elevated'`, but the actual visual differences depend on complex interactions with `hasTopNavContent` and `showSideNavInline` (lines 407-413, 425). For example, `'elevated'` only shows the rounded corner backdrop when there is both a top nav with content and an inline side nav. This conditional behavior is not documented.

### U4. `contentPadding` defaults differently than documented

The `contentPadding` prop's JSDoc says "Default is `0`" (line 85), which matches the implementation (`contentPadding ?? 0` on line 419). However, the stories default to `contentPadding: 4` (stories line 13), so the documented and demonstrated defaults disagree, which may confuse consumers referencing the stories.

---

## Missing Tests

### T1. No test for `height="auto"` behavior

The `height` prop's `"auto"` mode triggers the `ResizeObserver` effect (lines 288-304) and the sticky side nav wrapper (lines 401-405). Neither path is tested.

### T2. No test for `variant` prop

None of the four variant values (`wash`, `surface`, `section`, `elevated`) are tested. The elevated variant's conditional rounded-corner backdrop (lines 425-433) is complex conditional logic with no test coverage.

### T3. No test for `mobileNav` as a config object

The `MobileNavConfig` code path (controlled open state, `onOpenChange` callback, custom `content`, `breakpoint` override) is entirely untested. Only the auto-generated mobile nav (via `sideNav` alone) is tested.

### T4. No test for `mobileNav` as a custom ReactNode

Passing a fully custom mobile nav element is untested.

### T5. No test for `banner` content rendering position

The test on line 76 checks that banner text is in the document, but does not verify it appears before/above the top nav.

### T6. No test for `isMobileNavDisabled`

The prop that disables auto-generated mobile navigation has no test coverage.

### T7. No test for `contentPadding` prop

No test verifies that padding is applied to the main content area.

### T8. No test for `ref` forwarding

The component accepts a `ref` prop that is merged via `mergeRefs`. No test verifies the ref is correctly attached.

### T9. No test for `className` or `style` prop pass-through

Standard passthrough props are untested.

### T10. No test for `useSlotPresence` hook

The hook has no dedicated tests. Its MutationObserver-based content detection, cleanup on unmount, and callback ref behavior are all untested.

### T11. No test for `AppShellMobileContext` / `useAppShellMobile`

The context and its consumer hook have no tests, despite being used by `SideNavItem`, `TopNavItem`, `TopNav`, `MobileNavToggle`, and `MobileNav`.

### T12. No test for breakpoint transitions

The behavior when `isBelowBreakpoint` changes (e.g., window resize crossing the breakpoint) is untested. This transition involves swapping between inline side nav and drawer, which is a critical responsive behavior.

---

## Missing Stories

### S1. No story for `height="auto"`

The meta `argTypes` include a select control for height, but no dedicated story demonstrates the auto-height behavior with scrollable content.

### S2. No story for side nav only (without top nav)

The existing stories always include both `sideNav` and `topNav`. The auto-generated mobile top bar (lines 373-392) only appears when there is a side nav but no top nav content. This layout variant has no story.

### S3. No story for mobile breakpoint behavior

No story demonstrates or documents the responsive mobile navigation behavior. A story with viewport controls or a mobile viewport would be valuable.

### S4. No story for `mobileNav` as a config object

The controlled mobile nav configuration (custom breakpoint, controlled open state) has no story.

### S5. No story for `variant="wash"`, `variant="section"`, or `variant="surface"`

Although `variant` has an `argTypes` control, only the default `elevated` is shown. Dedicated stories for each variant would help document the visual differences.

### S6. No story for `isMobileNavDisabled`

Disabling mobile nav while having nav content is not demonstrated.

### S7. No story demonstrating skip-to-content link

The skip link is an important accessibility feature but is not visually demonstrated in any story.

### S8. No story for content-only shell (no nav)

A minimal shell with only `children` and no `sideNav`/`topNav`/`banner` is not demonstrated, even though it is a valid and common use case.

---

## Summary

| Category        | Count | Severity                         |
| --------------- | ----- | -------------------------------- |
| Performance     | 5     | P1 high, P2-P5 medium            |
| Accessibility   | 5     | A5 medium, A1-A4 low             |
| Logic Bugs      | 4     | L1 medium (dead code), L2-L4 low |
| Unclear API     | 4     | U1 medium, U2-U4 low             |
| Missing Tests   | 12    | T1-T4 high, T5-T12 medium        |
| Missing Stories | 8     | S1-S4 high, S5-S8 medium         |

The component's core structure is solid -- the skip-to-content link, `<main>` landmark, responsive breakpoint system, and Layout composition are well-designed. The primary concerns are: (1) the `mobileNavConfig` reference instability causing unnecessary re-renders across multiple context consumers, (2) the `subtree: true` MutationObserver flag in `useSlotPresence`, (3) the dead `defaultIsMobile` prop, and (4) very thin test and story coverage relative to the component's complexity.
