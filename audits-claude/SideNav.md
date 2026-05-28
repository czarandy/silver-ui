# SideNav Component Audit

Audited: 2026-05-28
Files reviewed:

- `src/components/SideNav/SideNav.tsx`
- `src/components/SideNav/SideNavItem.tsx`
- `src/components/SideNav/SideNavSection.tsx`
- `src/components/SideNav/SideNavHeading.tsx`
- `src/components/SideNav/SideNavContext.ts`
- `src/components/SideNav/SideNav.recipe.ts`
- `src/components/SideNav/SideNav.stories.tsx`
- `src/components/SideNav/SideNav.test.tsx`
- `src/components/SideNav/index.ts`

---

## Performance

### Issue 1: `collapsibleConfig` useMemo creates a new object every render when `isCollapsible` is `false`

**File:** `SideNav.tsx`, lines 82-86
**Severity:** Low

When `isCollapsibleFromProps` is `false` (the default), the expression `typeof isCollapsibleFromProps === 'object'` is false, so the memo returns `{}` -- a new empty object every time the dependency changes. However, the dependency is `isCollapsibleFromProps` which is the stable value `false`, so in practice the memo does not recompute. This is functionally correct but the intent is slightly misleading. No action required.

### Issue 2: `toggle` callback is recreated when `isCollapsed` changes

**File:** `SideNav.tsx`, lines 95-101
**Severity:** Low

The `toggle` callback depends on `[collapsibleConfig, isCollapsed, isControlled]`. Every time the collapse state toggles, a new `toggle` function is created, which in turn causes the `collapseContext` memo (line 102) to produce a new object, re-rendering all consumers of `SideNavCollapseContext`. This is inherent to the pattern of reading current state inside a callback, but could be avoided by using a ref for `isCollapsed` or `useReducer`. In practice this only fires on user-initiated toggle actions, so the impact is negligible.

### No other performance issues found.

Module-level `css()` calls in all sub-components ensure styles are computed once. The recipe (`sideNavRecipe`) uses Panda CSS `cva()` at module scope. Context values are memoized. The component tree is straightforward with no expensive computations.

---

## Accessibility

### Issue 3: Redundant `role="navigation"` on `<nav>` element

**File:** `SideNav.tsx`, line 149
**Severity:** Low

The `<nav>` element already has an implicit ARIA role of `navigation`. The explicit `role="navigation"` is redundant. It is harmless, but removing it would reduce noise.

### Issue 4: `SideNavHeading` renders a `<div>` when there is no href, but a link when there is one, with no accessible role distinction

**File:** `SideNavHeading.tsx`, lines 74-108
**Severity:** Low

When `resolvedHref` is null, the heading renders as a plain `<div>`. When it has an href, it renders as a link. Neither case has an explicit heading role (e.g., `<h2>`). The heading text is rendered via the `Text` component with `type="large"` and `weight="semibold"`, which is a visual heading but not a semantic one. Screen reader users navigating by headings will not discover the nav heading.

**Recommendation:** Consider wrapping the heading text in an element with `role="heading"` and an appropriate `aria-level`, or use a semantic heading element (`<h2>`, etc.).

### Issue 5: `SideNavHeading` always passes `href` to a `<div>` element when no link is needed

**File:** `SideNavHeading.tsx`, line 80
**Severity:** Medium

When `resolvedHref` is null and `Element` resolves to `'div'`, the JSX `<Element href={resolvedHref} ...>` passes `href={undefined}` and `to={undefined}` to a `<div>`. React will not render `href={undefined}` as an HTML attribute, so this does not produce invalid HTML at runtime, but it is semantically sloppy. The `to` prop (line 83) is also passed to `<div>` unconditionally when `Element !== 'a'`, which could cause warnings with some custom link components.

**Recommendation:** Only pass `href` and `to` when `Element` is not `'div'`.

### Issue 6: Disabled `SideNavItem` links are excluded from tab order via `pointerEvents: 'none'` but remain focusable

**File:** `SideNavItem.tsx`, lines 57-61, 144-158
**Severity:** Medium

When `isDisabled` is true and `href` is provided, the component renders a link (`<a>` tag, line 144 condition: `href != null && !isDisabled`). So disabled items with an href fall through to the `<button>` branch (line 161) which correctly uses the `disabled` attribute. This is good. However, for items rendered as buttons, the `pointerEvents: 'none'` CSS (line 60) is applied alongside `disabled`, which is redundant -- `disabled` already prevents clicks. No actual bug here, but the CSS-based disabled style on the `disabled` class suggests it was designed for elements that cannot be natively disabled (like `<a>` tags). Since disabled links are routed to the button path, the `disabled` CSS class is only applied to `<button>` elements where `disabled` already handles it.

### Issue 7: No `aria-label` on the SideNav in `topbar` and `drawer` render modes

**File:** `SideNav.tsx`, lines 107-128
**Severity:** Medium

In the default render mode, the `<nav>` element has `aria-label="Side navigation"` (line 148). However, in `topbar` mode (line 109), the component renders a plain `<div>` with no role or aria-label. In `drawer` mode (line 121), the nav landmark responsibility is delegated to `MobileNav`, which may or may not provide its own landmark. In `drawer-content` mode (line 132), a bare React fragment is returned with no landmark at all. Consumers using these render modes lose the navigation landmark.

**Recommendation:** Ensure the topbar mode uses a `<nav>` element with an appropriate aria-label (e.g., "Top navigation"). Verify that `MobileNav` provides its own navigation landmark for the drawer mode.

### Issue 8: `SideNavSection` uses `aria-labelledby` referencing a visually hidden element, which is correct

**File:** `SideNavSection.tsx`, lines 91-101
**Severity:** No issue (positive note)

The section correctly uses `role="group"` with `aria-labelledby` pointing to the title element. When the header is visually hidden (collapsed or `isHeaderHidden`), it is wrapped in `<VisuallyHidden>`, preserving screen reader access. This is well done.

---

## Logic Bugs

### Issue 9: `SideNavHeading` has two competing href props: `href` and `headingHref`

**File:** `SideNavHeading.tsx`, lines 18, 17, 73
**Severity:** Medium

The component accepts both `href` and `headingHref`, with `headingHref` taking precedence (line 73: `headingHref ?? href`). This is confusing -- it is unclear what the semantic difference is between the two. Looking at the interface definition, both are optional strings with no JSDoc explaining the distinction.

**Recommendation:** Deprecate one in favor of the other, or add JSDoc comments explaining when each should be used. If `headingHref` exists because `href` was the original prop and `headingHref` was added later for clarity, consider deprecating `href` with a console warning.

### Issue 10: `SideNav` does not use `collapsibleConfig.hasButton` or `collapsibleConfig.buttonLabel`

**File:** `SideNav.tsx`, lines 16-24
**Severity:** Low

The `isCollapsible` object type declares `buttonLabel` and `hasButton` properties (lines 19-20), but neither is referenced anywhere in `SideNav.tsx`. The collapse toggle button is presumably rendered elsewhere (possibly in `AppShell`), but having these props accepted and ignored by the `SideNav` component itself is misleading.

**Recommendation:** Verify these props are consumed elsewhere. If they are only passed through to a parent component, consider documenting this clearly or moving these props to the consuming component's API.

### Issue 11: `SideNavItem` `children` silently overrides `label` for display text

**File:** `SideNavItem.tsx`, line 126
**Severity:** Low

The display text is `{children ?? label}` (line 126). The `label` prop is required (line 22), but if `children` is also provided, `children` takes precedence with no warning. Meanwhile, `label` is still used for `aria-label` when collapsed (line 148). This could lead to a mismatch where the visible text and the accessible label differ.

**Recommendation:** Document that `children` overrides the visible display of `label`, and that `label` is always used as the accessible name when collapsed. Alternatively, consider using `children` for the accessible label when it is a string.

---

## API Clarity

### Issue 12: `isCollapsible` prop has a complex union type that is hard to discover

**File:** `SideNav.tsx`, lines 16-24
**Severity:** Low

The `isCollapsible` prop accepts either a `boolean` or an object with five optional properties. This is a flexible pattern but can be surprising. Consumers may not realize they can pass an object. IDE tooltips for union types can also be hard to read.

**Recommendation:** Consider adding JSDoc documentation for each property in the object variant. Alternatively, split into separate props (e.g., `isCollapsible`, `defaultIsCollapsed`, `onCollapsedChange`) for better discoverability, though this is a larger API change.

### Issue 13: `SideNavSection` `endContent` is hidden when collapsed but there is no documentation of this

**File:** `SideNavSection.tsx`, lines 85-88, 66, 99
**Severity:** Low

When `isCollapsed` is true, `shouldHideHeader` is true (line 66), so the entire header (including `endContent`) is wrapped in `VisuallyHidden`. This behavior is not documented and could surprise consumers who expect their section-level actions to remain visible.

---

## Missing Tests

### Issue 14: No tests for `SideNavItem` as a button (without `href`)

**File:** `SideNav.test.tsx`
**Severity:** Medium

Both existing tests render `SideNavItem` with `href`, which produces a link. There are no tests for the button rendering path (no `href`, with `onClick`). The button path has distinct behavior: it renders `<button type="button">`, uses the `disabled` attribute, etc.

### Issue 15: No tests for disabled state

**File:** `SideNav.test.tsx`
**Severity:** Medium

The `isDisabled` prop is not tested. Important behaviors to verify: the button renders with `disabled` attribute, disabled links fall through to the button path, the `onClick` handler is blocked via `event.preventDefault()`, and disabled styling is applied.

### Issue 16: No tests for collapsed state

**File:** `SideNav.test.tsx`
**Severity:** Medium

The entire collapsible feature is untested. Key behaviors to verify: collapsed items show only icons, `aria-label` is set to `label` when collapsed, the toggle function works in both controlled and uncontrolled modes, and section headers are visually hidden when collapsed.

### Issue 17: No tests for `SideNavSection`

**File:** `SideNav.test.tsx`
**Severity:** Medium

The `SideNavSection` component is used in the first test but its own behavior is not asserted. Missing coverage: `role="group"` is present, `aria-labelledby` points to the title, `isHeaderHidden` works, `subtitle` renders, and `endContent` renders.

### Issue 18: No tests for `SideNavHeading`

**File:** `SideNav.test.tsx`
**Severity:** Medium

`SideNavHeading` is used in the first test but its behavior is not asserted. Missing coverage: heading text renders, subheading renders, superheading renders, logo renders, link rendering when `href` or `headingHref` is provided, `headerEndContent` renders.

### Issue 19: No tests for topbar, drawer, or drawer-content render modes

**File:** `SideNav.test.tsx`
**Severity:** Medium

The `SideNav` component has four render modes (default, topbar, drawer, drawer-content) controlled by `SideNavRenderContext`. Only the default mode is tested. The topbar mode renders a completely different structure (a `<div>` instead of `<nav>`). The drawer mode delegates to `MobileNav`. None of these alternate paths are covered.

### Issue 20: No tests for `className`, `style`, `data-testid`, or `ref` forwarding

**File:** `SideNav.test.tsx`
**Severity:** Low

Standard prop-forwarding tests are present for other components in the library (e.g., Breadcrumbs) but missing here.

### Issue 21: No tests for `footer` or `footerIcons` rendering

**File:** `SideNav.test.tsx`
**Severity:** Low

The footer area is conditionally rendered (lines 157-162 in `SideNav.tsx`) and is not tested.

### Issue 22: No tests for custom `LinkComponent` via `as` prop or `LinkProvider`

**File:** `SideNav.test.tsx`
**Severity:** Low

`SideNavItem` and `SideNavHeading` both accept an `as` prop for custom link components and use `useLinkComponent`. This integration is untested.

---

## Missing Stories

### Issue 23: Only one story (`Basic`) -- many important props and states are not demonstrated

**File:** `SideNav.stories.tsx`
**Severity:** High

The stories file contains a single `Basic` story (28 lines total). For a complex multi-part component with collapsible behavior, multiple render modes, and several sub-components with their own prop surfaces, this is insufficient. The following stories are missing:

**Props/states not demonstrated in any story:**

- `isCollapsible` (boolean or object form) -- the entire collapsible feature
- `isCollapsible` with controlled state (`isCollapsed` + `onCollapsedChange`)
- `footer` and `footerIcons` props
- `topContent` prop
- `SideNavItem` `isDisabled` state
- `SideNavItem` `endContent` prop
- `SideNavItem` as a button (no `href`, with `onClick`)
- `SideNavItem` `children` overriding `label`
- `SideNavSection` `isHeaderHidden`
- `SideNavSection` `subtitle`
- `SideNavSection` `endContent`
- `SideNavHeading` `superheading`
- `SideNavHeading` `logo`
- `SideNavHeading` as a link (`href` or `headingHref`)
- `SideNavHeading` `headerEndContent`
- Multiple sections with different titles
- Scrollable content (many items overflowing the scrollable area)
- Custom link component via `as` prop

**Recommended stories to add:**

1. `Collapsible` -- demonstrates the toggle behavior
2. `CollapsibleControlled` -- demonstrates controlled collapse state
3. `WithFooter` -- demonstrates `footer` and `footerIcons`
4. `WithTopContent` -- demonstrates `topContent`
5. `DisabledItems` -- demonstrates `isDisabled`
6. `WithEndContent` -- demonstrates `endContent` on items and sections
7. `MultipleSections` -- demonstrates grouping with visible and hidden headers
8. `WithLogo` -- demonstrates `SideNavHeading` with `logo` and `headerEndContent`
9. `Scrollable` -- demonstrates overflow behavior with many items

---

## Summary

The SideNav component is well-structured with clean separation of concerns across sub-components, proper context usage for collapse state, and good accessibility in the default render mode. However, it has significant gaps in test and story coverage relative to its complexity.

| #   | Category      | Severity | Summary                                                                                |
| --- | ------------- | -------- | -------------------------------------------------------------------------------------- |
| 1   | Performance   | Low      | `collapsibleConfig` memo intent is unclear when `isCollapsible` is false               |
| 2   | Performance   | Low      | `toggle` callback recreated on every collapse state change                             |
| 3   | Accessibility | Low      | Redundant `role="navigation"` on `<nav>` element                                       |
| 4   | Accessibility | Low      | `SideNavHeading` has no semantic heading role                                          |
| 5   | Accessibility | Medium   | `SideNavHeading` passes `href`/`to` to `<div>` when no link                            |
| 6   | Accessibility | Medium   | Disabled link items rely on CSS `pointerEvents: 'none'` (mitigated by button fallback) |
| 7   | Accessibility | Medium   | No navigation landmark in topbar/drawer-content render modes                           |
| 8   | Accessibility | --       | `SideNavSection` visually-hidden header pattern is well done (positive)                |
| 9   | Logic         | Medium   | Two competing href props (`href` and `headingHref`) with unclear distinction           |
| 10  | Logic         | Low      | `hasButton` and `buttonLabel` in `isCollapsible` config are accepted but unused        |
| 11  | Logic         | Low      | `children` silently overrides `label` display but `label` is still used for a11y       |
| 12  | API           | Low      | `isCollapsible` union type is hard to discover without docs                            |
| 13  | API           | Low      | `endContent` hidden when collapsed is undocumented                                     |
| 14  | Tests         | Medium   | No tests for button rendering path (no `href`)                                         |
| 15  | Tests         | Medium   | No tests for `isDisabled`                                                              |
| 16  | Tests         | Medium   | No tests for collapsible behavior                                                      |
| 17  | Tests         | Medium   | No tests for `SideNavSection` behavior                                                 |
| 18  | Tests         | Medium   | No tests for `SideNavHeading` behavior                                                 |
| 19  | Tests         | Medium   | No tests for alternate render modes (topbar, drawer, drawer-content)                   |
| 20  | Tests         | Low      | No tests for className/style/ref/data-testid forwarding                                |
| 21  | Tests         | Low      | No tests for footer/footerIcons rendering                                              |
| 22  | Tests         | Low      | No tests for custom link component integration                                         |
| 23  | Stories       | High     | Only 1 story for a complex multi-part component; ~18 props/states undemonstrated       |
