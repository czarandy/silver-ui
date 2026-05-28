# TopNav Component Audit

Audit date: 2026-05-28

Files reviewed:

- `src/components/TopNav/TopNav.tsx`
- `src/components/TopNav/TopNav.recipe.ts`
- `src/components/TopNav/TopNav.stories.tsx`
- `src/components/TopNav/TopNav.test.tsx`
- `src/components/TopNav/TopNavContext.ts`
- `src/components/TopNav/TopNavHeading.tsx`
- `src/components/TopNav/TopNavItem.tsx`
- `src/components/TopNav/index.ts`

---

## Performance Problems

### P1: Static `css()` calls are already module-level (no issues)

The `styles` objects in `TopNav.tsx`, `TopNavHeading.tsx`, and `TopNavItem.tsx` are all declared at module scope, so Panda CSS class generation runs once. No performance concerns here.

### P2: No memoization concerns

The component is a function component without expensive computations. The `cx()` calls and boolean checks are trivial. Context reads via `use()` are lightweight. No memoization needed.

### P3: No issues found

Overall performance posture is clean.

---

## Accessibility Concerns

### A1: Redundant `role="navigation"` on `<nav>` element

**File:** `TopNav.tsx`, lines 108 and 155  
The `<nav>` element has an implicit ARIA role of `navigation`. Adding `role="navigation"` explicitly is redundant. Not harmful, but unnecessary.

**Severity:** Low (noise, not a bug)

### A2: Missing `aria-label` default or required enforcement

**File:** `TopNav.tsx`, lines 14 and 103/148  
The `label` prop maps to `aria-label` on the `<nav>` element and is optional. If omitted, the navigation landmark will be unlabeled, which is a problem when a page has multiple `<nav>` elements (e.g., TopNav + SideNav). Consider making `label` required or providing a default value like `"Top navigation"`.

**Severity:** Medium

### A3: `TopNavHeading` link has no accessible name when only `logo` is provided

**File:** `TopNavHeading.tsx`, lines 69-98  
If a consumer passes only `logo` (no `heading`, `superheading`, or `subheading`), and the logo is an `<img>` or SVG without alt text, the resulting link/div will have no accessible name. Consider accepting an `aria-label` prop or requiring `heading` when `logo` is used.

**Severity:** Medium

### A4: `TopNavItem` uses `aria-disabled` but remains a link

**File:** `TopNavItem.tsx`, lines 102-103, 109, 116-119, 126  
When `isDisabled` is true, the component sets `aria-disabled`, `tabIndex={-1}`, `pointer-events: none`, and prevents the click via `event.preventDefault()`. However, the element is still rendered as an `<a>` tag (or custom link component), not a `<span>`. Screen readers may still announce it as a link. Consider rendering a `<span>` instead of a link when disabled, or adding `role="link"` to the span for clarity.

**Severity:** Low-Medium

### A5: Drawer content lacks landmark role

**File:** `TopNav.tsx`, lines 121-143  
When `renderMode === 'drawer'`, the content is rendered inside `<MobileNav>` without an explicit `role` or `aria-label` on the surrounding wrapper. If `MobileNav` itself does not provide landmark semantics, the drawer items lack proper navigation context.

**Severity:** Low (depends on MobileNav implementation)

---

## Logic Bugs

### L1: `TopNavHeading` passes `href` to a `<div>` when no link is needed

**File:** `TopNavHeading.tsx`, lines 67-73  
When `resolvedHref` is `null`, `Element` is set to `'div'`. However, `href={resolvedHref}` and `to={...}` are still spread onto the `<div>`, which results in `href={undefined}` and `to={undefined}` being passed to a `<div>`. While React will not render `undefined` attributes, `to` is not a valid HTML attribute for a `<div>` and may produce a console warning.

**Severity:** Low

### L2: `TopNavHeading` `to` prop logic is fragile

**File:** `TopNavHeading.tsx`, line 76  
`to={Element === 'a' ? undefined : resolvedHref}` checks against the string `'a'`, but if a consumer passes a custom link component via `as` and `headingHref` is set, `Element` will be the custom component (not `'a'`), and both `href` and `to` will be set. This may cause issues in some router link components. The same pattern exists in `TopNavItem.tsx` line 128, but there `LinkComponent` comes from `useLinkComponent` which falls back to `'a'` only when no provider is set, so the check `LinkComponent === 'a'` is slightly more robust since it checks the actual resolved value.

**Severity:** Low

### L3: `TopNavItem` default `href="#"` may cause unwanted scroll

**File:** `TopNavItem.tsx`, line 86  
The default value for `href` is `'#'`, which causes the browser to scroll to the top of the page when clicked. This is a common footgun. Consider using `href="javascript:void(0)"` or better yet, rendering a `<button>` when no `href` is provided.

**Severity:** Medium

### L4: `TopNavItem` `closeMobileNav()` fires on every non-disabled click

**File:** `TopNavItem.tsx`, lines 115-121  
`closeMobileNav()` is called on every click, even when not in a mobile/drawer context. The default context value is a no-op function so this is not a runtime error, but it is semantically incorrect. Consider guarding with `renderMode === 'drawer'`.

**Severity:** Low (no runtime impact)

---

## Unclear API

### U1: `children` vs `startContent` ambiguity

**File:** `TopNav.tsx`, line 95  
`const resolvedStartContent = startContent ?? children;` means `children` is an alias for `startContent`. This is not documented and may confuse consumers who expect to use both independently, or who pass children expecting them to appear somewhere other than the start slot. If children and startContent are both set, children are silently ignored.

**Severity:** Medium

### U2: `headingHref` vs `href` on TopNavHeading

**File:** `TopNavHeading.tsx`, lines 16-17, 66  
Both `headingHref` and `href` exist; `headingHref` takes priority (`headingHref ?? href`). The reason for having two is unclear. If `headingHref` was introduced for backward compatibility, consider deprecating one of them.

**Severity:** Medium

### U3: `headerEndContent` naming inconsistency

**File:** `TopNavHeading.tsx`, line 14  
The prop is named `headerEndContent`, but the parent component uses `endContent`. The `header` prefix is slightly confusing because the component is `TopNavHeading`, not `TopNavHeader`. Consider renaming to `endContent` for consistency across the component family.

**Severity:** Low

### U4: `isIconOnly` hides children but icon is still optional

**File:** `TopNavItem.tsx`, lines 19, 134  
When `isIconOnly` is true, the label text is hidden and only the icon is shown. But `icon` is optional, so a consumer could set `isIconOnly={true}` without passing `icon`, resulting in an empty, unlabeled element (only `aria-label` would be set). Consider making `icon` required when `isIconOnly` is true, or at least documenting this expectation.

**Severity:** Low

---

## Missing Tests

### T1: Only one test exists

**File:** `TopNav.test.tsx`  
There is a single test that verifies basic rendering of heading, a link, and a button. The following scenarios are untested:

### T2: `centerContent` layout

No test verifies that passing `centerContent` produces the grid layout or renders the center slot.

### T3: `startContent` prop (vs `children`)

No test verifies that `startContent` works as an alternative to `children`, or that `startContent` takes precedence when both are provided.

### T4: `isSelected` state on TopNavItem

No test verifies that `aria-current="page"` is set when `isSelected` is true.

### T5: `isDisabled` behavior on TopNavItem

No test verifies that disabled items receive `aria-disabled`, `tabIndex={-1}`, and that click is prevented.

### T6: `isIconOnly` rendering

No test verifies that icon-only items hide the label text and set `aria-label`.

### T7: TopNavHeading link behavior

No test verifies that `TopNavHeading` renders as a link when `href` or `headingHref` is provided, or as a div when neither is set.

### T8: TopNavHeading subcomponent props

No test covers `logo`, `superheading`, `subheading`, or `headerEndContent`.

### T9: Mobile/drawer render modes

No tests exercise the `mobile-bar` or `drawer` render modes. These code paths (TopNav.tsx lines 101-143) are completely untested.

### T10: `className` and `style` forwarding

No test verifies that custom `className` and `style` are forwarded to the root element (a stated convention of the library).

### T11: `data-testid` forwarding

No test verifies `data-testid` passthrough, despite it being a supported prop.

---

## Missing Stories

### S1: Only one story (`Basic`)

**File:** `TopNav.stories.tsx`  
There is a single story. The following props/states have no dedicated story:

### S2: No `centerContent` story

The three-column grid layout triggered by `centerContent` is not demonstrated.

### S3: No `startContent` story

The explicit `startContent` prop (as opposed to `children`) is not shown.

### S4: No `isDisabled` story for TopNavItem

Disabled navigation items are not demonstrated.

### S5: No `isIconOnly` story for TopNavItem

Icon-only nav items are not demonstrated.

### S6: No `icon` story for TopNavItem

Nav items with icons (but not icon-only) are not shown.

### S7: No TopNavHeading subcomponent stories

`TopNavHeading` has rich props (`logo`, `superheading`, `subheading`, `headerEndContent`, `headingHref`) that are not demonstrated in any story. Consider adding a dedicated `TopNavHeading.stories.tsx` or additional stories in the existing file.

### S8: No mobile/drawer story

The mobile bar and drawer render modes are not shown in isolation. The AppShell stories show TopNav integrated, but there is no standalone story showing how TopNav adapts to mobile.

### S9: No story without heading

There is no story demonstrating TopNav without a heading (heading is optional).

---

## Summary of Priority Items

| Priority | Issue                                                      | Category      |
| -------- | ---------------------------------------------------------- | ------------- |
| High     | Only 1 test covers the entire component family (T1-T11)    | Testing       |
| High     | Only 1 story demonstrates the component (S1-S9)            | Stories       |
| Medium   | `label` (aria-label) should arguably be required (A2)      | Accessibility |
| Medium   | Logo-only TopNavHeading can produce inaccessible link (A3) | Accessibility |
| Medium   | Default `href="#"` scrolls to top on click (L3)            | Logic         |
| Medium   | `children` vs `startContent` undocumented precedence (U1)  | API Clarity   |
| Medium   | `headingHref` vs `href` redundancy (U2)                    | API Clarity   |
| Low      | Redundant `role="navigation"` (A1)                         | Accessibility |
| Low      | `to` prop passed to `<div>` (L1)                           | Logic         |
| Low      | `closeMobileNav()` called outside mobile context (L4)      | Logic         |
