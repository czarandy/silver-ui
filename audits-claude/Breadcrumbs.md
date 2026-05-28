# Breadcrumbs Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/Breadcrumbs/Breadcrumbs.tsx`
- `src/components/Breadcrumbs/BreadcrumbItem.tsx`
- `src/components/Breadcrumbs/BreadcrumbsContext.ts`
- `src/components/Breadcrumbs/index.ts`
- `src/components/Breadcrumbs/Breadcrumbs.test.tsx`

---

## Performance Problems

### 1. `Array.from` and DOM queries on every render cycle (Medium)

**File:** `BreadcrumbItem.tsx`, lines 152-173

The `useEffect` in the auto-detection logic runs `Array.from(list.children)` and `list.querySelector('[aria-current="page"]')` on every mount. While this is only O(n) where n is the number of breadcrumb items (typically small), the effect's dependency array `[isAutoCandidate]` is a boolean derived from a prop, meaning it will not re-run when siblings are added or removed. This is not a performance problem per se, but a correctness concern -- see the Logic Bugs section below.

### 2. `mergeRefs` creates a new callback on every render (Low)

**File:** `BreadcrumbItem.tsx`, lines 196, 216

`mergeRefs(ref, itemRef)` is called inline during render, producing a new function reference each time. React will call the old ref cleanup and the new ref callback on every re-render. This is low-impact since refs are cheap, but wrapping the result in `useMemo` or `useCallback` with stable inputs would avoid unnecessary ref detach/reattach cycles.

### 3. No concerns with `useMemo` in Breadcrumbs (None)

**File:** `Breadcrumbs.tsx`, lines 72-75

The context value is correctly memoized with `useMemo` keyed on `[separator, variant]`. This prevents unnecessary re-renders of children when the parent re-renders with the same props.

---

## Accessibility Concerns

### 1. Auto-detected current item uses DOM mutation instead of React state (High)

**File:** `BreadcrumbItem.tsx`, lines 152-173

The auto-detection of the "current" item uses `item.setAttribute('aria-current', 'page')` via a `useEffect`. This means:

- The `aria-current` attribute is set _after_ the initial render, so assistive technology may briefly see the item without the attribute during the first paint.
- The attribute is applied to the `<li>` element, but when `isCurrent` is explicitly `true`, the `aria-current` is applied to the inner `<span>` (line 202). This inconsistency means the attribute appears at different DOM depths depending on how the current item is designated, which could produce different screen reader announcements.
- The auto-detected item renders as a plain `<span>` (lines 234-241) but without the `styles.current` class applied by the explicit `isCurrent` path, so it does receive current styling. However, it does not get the `aria-current` attribute in the React tree -- only via the post-render DOM mutation.

**Recommendation:** Consider a React-level mechanism (e.g., a context-based registration of items or explicit `isCurrent` prop guidance) rather than post-render DOM manipulation.

### 2. Separator `aria-hidden` is correctly applied (None)

**File:** `BreadcrumbItem.tsx`, lines 198-200 and 219-221

Separators are wrapped in `<span aria-hidden="true">`, which correctly hides them from assistive technology.

### 3. Button items lack `aria-current` when auto-detected as current (Medium)

**File:** `BreadcrumbItem.tsx`, lines 230-232

When the last item has an `onClick` but no `href` and no explicit `isCurrent`, it renders as a `<button>`. The auto-detection effect sets `aria-current` on the parent `<li>`, but the button itself has no `aria-current` attribute. Screen readers may not announce the button as the current page because `aria-current` on a `<li>` inside an `<ol>` may not propagate semantically to the interactive child.

### 4. Missing `aria-label` or visible text requirement for icon-only items (Low)

**File:** `BreadcrumbItem.tsx`

If a `BreadcrumbItem` is rendered with only a `startIcon` and no text `children`, it would produce an interactive element (link or button) with no accessible name. The component does not enforce or warn about this. Consider adding an `aria-label` prop or documenting that `children` must be non-empty.

---

## Logic Bugs

### 1. Auto-detection effect has stale dependency array (High)

**File:** `BreadcrumbItem.tsx`, line 174

The `useEffect` depends only on `[isAutoCandidate]`. Since `isAutoCandidate` is derived from `isCurrentProp == null`, this boolean is `true` on mount and never changes unless the consumer toggles `isCurrent` between `undefined` and an explicit value. Critically, the effect does **not** re-run when:

- Sibling items are added or removed (the "last item" check could become stale).
- Another sibling gains an explicit `aria-current="page"` (the `hasExplicitCurrent` guard could become stale).

In practice, breadcrumb trails are usually static, so this may rarely manifest, but it is a latent bug for dynamic breadcrumb scenarios.

### 2. Auto-detected current item still renders as a link or button (Medium)

**File:** `BreadcrumbItem.tsx`, lines 213-244

When the auto-detection logic determines an item is the last (and therefore current), it only sets `aria-current` on the `<li>`. However, the item's _rendered content_ is still a link (`<a>`) or button (`<button>`) based on `href`/`onClick` props. This means the "current" page could be rendered as a clickable link -- which is semantically questionable (the current page should not link to itself). The explicit `isCurrent` path correctly renders a non-interactive `<span>`.

### 3. `to` prop passed unconditionally when `LinkComponent !== 'a'` (Low)

**File:** `BreadcrumbItem.tsx`, line 227

```tsx
to={LinkComponent === 'a' ? undefined : href}
```

The `to` prop is set to `href` for any custom link component. This assumes all custom link components accept a `to` prop with the same semantics as `href`. While this matches React Router's API, it may not be universally correct. This is documented behavior in `LinkComponentProps`, so it is a design choice rather than a bug.

---

## Unclear API

### 1. Relationship between `isCurrent` and `href`/`onClick` is implicit (Medium)

When `isCurrent={true}`, the item always renders as a non-interactive `<span>`, ignoring `href` and `onClick`. This is not documented in the prop JSDoc comments. A consumer might expect that setting both `isCurrent` and `href` would render a link styled as current.

**File:** `BreadcrumbItem.tsx`, lines 191-211

### 2. Auto-detection behavior is undocumented (Medium)

The auto-detection of the current item (last item without explicit `isCurrent`) is a significant behavior that is not documented in any prop JSDoc or component-level comment.

**File:** `BreadcrumbItem.tsx`, lines 149, 152-174

### 3. `as` prop only used with `href` (Low)

**File:** `BreadcrumbItem.tsx`, lines 146, 222-229

The `as` prop (custom link component) is consumed via `useLinkComponent` at line 146, but the `LinkComponent` is only used when `href` is provided. If a consumer passes `as` without `href`, it silently has no effect. This could be surprising.

### 4. `BreadcrumbsContext` is exported but is an implementation detail (Low)

**File:** `index.ts`, lines 3-7

The `BreadcrumbsContext`, `BreadcrumbsContextValue`, and `BreadcrumbsVariant` types are all publicly exported. Unless there is a use case for consuming the context outside of `BreadcrumbItem`, these are implementation details that increase API surface area.

---

## Missing Tests

### 1. No test for `variant="supporting"` (High)

The `variant` prop changes font size and current-item color styles. There is no test verifying that variant is passed through context and applied to items.

### 2. No test for `startIcon` prop (Medium)

`BreadcrumbItem` accepts a `startIcon` prop that renders an icon before the label. No test verifies this renders correctly.

### 3. No test for items with `onClick` but no `href` as non-current items (Medium)

The test at line 42 tests `onClick` on a non-current button item, but only verifies the click handler fires. It does not verify the item renders as a `<button>` element (it checks by role, which is good) or that it has `type="button"`.

### 4. No test for `BreadcrumbItem` ref forwarding (Low)

While `Breadcrumbs` ref forwarding is tested (line 100), `BreadcrumbItem` ref forwarding is not tested.

### 5. No test for `BreadcrumbItem` className/style pass-through (Low)

The test at line 100 verifies these props on `Breadcrumbs`, but not on individual `BreadcrumbItem` components.

### 6. No test for auto-detection skipped when explicit `isCurrent` exists (Medium)

The auto-detection test (line 63) only checks the happy path. There is no test verifying that auto-detection does _not_ apply `aria-current` to the last item when another item has explicit `isCurrent={true}`.

### 7. No test for `BreadcrumbItem` used outside `Breadcrumbs` context (Low)

`BreadcrumbItem` uses `use(BreadcrumbsContext)` which will fall back to the default context value. There is no test verifying behavior when used outside a `Breadcrumbs` wrapper.

### 8. No test for default `label` prop (Low)

The test at line 35 checks `aria-label` is `'Breadcrumb'`, which implicitly tests the default, but there is no test for a custom `label` value.

---

## Missing Stories

### No stories file exists (Critical)

**There is no `Breadcrumbs.stories.tsx` file.** Other components in the library (e.g., `Tag`, `Icon`, `MultiSelect`, `FileInput`, `AlertDialog`) all have stories. The Breadcrumbs component has none.

The following stories should be added to achieve parity with other components and demonstrate all important props:

1. **Default** -- Basic breadcrumb trail with links and a current item.
2. **CustomSeparator** -- Demonstrates the `separator` prop with a custom character or icon.
3. **SupportingVariant** -- Demonstrates `variant="supporting"` with smaller text.
4. **WithIcons** -- Demonstrates the `startIcon` prop on items.
5. **WithCustomLink** -- Demonstrates the `as` prop with a custom link component (e.g., React Router).
6. **WithLinkProvider** -- Demonstrates global link customization via `LinkProvider`.
7. **ButtonItems** -- Demonstrates items with `onClick` but no `href`.
8. **AutoCurrentDetection** -- Demonstrates auto-detection of the current item when `isCurrent` is omitted.
9. **LongTrail** -- Demonstrates wrapping behavior with many items.

---

## Summary

| Category        | Critical | High | Medium | Low |
| --------------- | -------- | ---- | ------ | --- |
| Performance     | 0        | 0    | 1      | 1   |
| Accessibility   | 0        | 1    | 1      | 1   |
| Logic Bugs      | 0        | 1    | 1      | 1   |
| Unclear API     | 0        | 0    | 2      | 2   |
| Missing Tests   | 0        | 1    | 2      | 4   |
| Missing Stories | 1        | 0    | 0      | 0   |

**Top priorities:**

1. **Add a stories file** -- the component has zero Storybook coverage, making it impossible to visually verify or document behavior.
2. **Fix the auto-detection `useEffect` dependency array** (`BreadcrumbItem.tsx:174`) -- the effect uses stale DOM state and applies `aria-current` inconsistently with the explicit `isCurrent` path.
3. **Add test coverage for `variant="supporting"`** and auto-detection edge cases.
4. **Document the `isCurrent` / auto-detection behavior** and the interaction between `isCurrent` and `href`/`onClick`.
