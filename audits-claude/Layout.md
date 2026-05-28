# Layout Component Audit

Audit date: 2026-05-28

Files reviewed:

- `src/components/Layout/Layout.tsx`
- `src/components/Layout/LayoutContent.tsx`
- `src/components/Layout/LayoutContext.ts`
- `src/components/Layout/LayoutHeader.tsx`
- `src/components/Layout/LayoutPanel.tsx`
- `src/components/Layout/Layout.recipe.ts`
- `src/components/Layout/Layout.stories.tsx`
- `src/components/Layout/Layout.test.tsx`
- `src/components/Layout/types.ts`
- `src/components/Layout/index.ts`

---

## Performance Problems

### 1. `rootStyle` object is recreated on every render (Layout.tsx, lines 153-159)

The `rootStyle` object in `Layout` is computed inline on every render. While `slots` and `dividerValue` are correctly memoized with `useMemo`, `rootStyle` is not. This is a minor concern since object spread is cheap, but it means the `style` prop on the root `<div>` is always a new reference, preventing React from skipping the style diff. In practice this is negligible for a layout shell, so **low severity**.

### 2. Duplicated `paddingByStep` / `spacingByStep` maps (Layout.tsx:89, LayoutContent.tsx:33, LayoutHeader.tsx:41, LayoutPanel.tsx:43)

The same `Record<SpacingStep, string>` spacing map is defined four times across the Layout module. This is not a runtime performance issue, but it inflates bundle size and violates DRY. A single shared constant in `types.ts` or a new `spacing.ts` internal file would eliminate the duplication.

### 3. `AreaProvider` renders a context provider per slot (Layout.tsx, lines 108-120)

Five `AreaProvider` wrappers are rendered (header, start, content, end, footer). Each wraps a context provider. This is architecturally fine, but the `LayoutAreaContext` default value `'content'` (LayoutContext.ts:16) means that `LayoutPanel` will silently fall back to `'content'` if used outside a `Layout`, which could lead to incorrect divider placement. This is more of a logic concern (see Logic Bugs below).

---

## Accessibility Concerns

### 4. No landmark roles on the Layout shell (Layout.tsx)

The root `<div>` and the middle row `<div>` have no ARIA roles or landmarks. The `content` area wrapper (line 179) is a plain `<div>`. While sub-components like `LayoutContent` and `LayoutHeader` accept `role` and `label` props, the top-level `Layout` does not guide users toward correct landmark structure. Consider documenting that consumers should pass `role="main"` to `LayoutContent` and `role="banner"` to `LayoutHeader`, or provide defaults/warnings.

### 5. `aria-label` without a role (LayoutContent.tsx:70, LayoutPanel.tsx:83, LayoutHeader.tsx:81)

All three sub-components pass `aria-label={label}` to a `<div>`. An `aria-label` on a `<div>` has no effect unless the element also has a role (explicit or implicit). If `label` is provided but `role` is not, the label is silently ignored by screen readers. Consider:

- Logging a dev warning when `label` is provided without `role`.
- Defaulting to `role="region"` when `label` is provided, which is the standard pattern for labelled landmark regions.

### 6. LayoutHeader has no default role (LayoutHeader.tsx)

A header region would typically use `role="banner"` or render a `<header>` element. Currently it renders a plain `<div>`. Consumers must remember to pass `role="banner"` explicitly.

---

## Logic Bugs

### 7. LayoutPanel does not respect `hasDefaultDividers` from Layout (LayoutPanel.tsx)

`LayoutHeader` reads `useLayoutDivider()` (line 71) to resolve `hasDivider` against the `hasDefaultDividers` prop from `Layout`. However, `LayoutPanel` does **not** read this context -- it has `hasDivider` hardcoded to `false` as a default (line 66) and never checks `useLayoutDivider()`. This means `<Layout hasDefaultDividers>` will enable dividers on headers but **not** on panels, which is inconsistent and likely a bug.

**Fix:** Import and use `useLayoutDivider()` in `LayoutPanel` the same way `LayoutHeader` does.

### 8. `AreaProvider` returns `null` for falsy-but-valid children (Layout.tsx, line 115)

`AreaProvider` checks `children == null` (loose equality), which correctly catches both `null` and `undefined`. However, passing `content={0}` or `content=""` or `content={false}` would render the context provider with no visible output, which could subtly affect layout (the flex child wrapper at line 179 still renders). This is minor since these values are unlikely for slot content, but the behavior is inconsistent with how React treats `0` (renders it) vs `false`/`""` (does not render them).

### 9. `data-divider` attribute set to `undefined` rather than omitted (LayoutHeader.tsx, line 87)

`data-divider={resolvedHasDivider || undefined}` uses `||` which converts `false` to `undefined`, correctly removing the attribute. This is fine. No bug here, but worth noting for reviewers.

---

## Unclear API

### 10. `height` prop naming is ambiguous (Layout.tsx, types.ts)

`height: 'fill' | 'auto'` is not immediately intuitive. `'fill'` means "take 100% of parent height with internal scrolling" and `'auto'` means "grow to fit content". Consider renaming to something more descriptive (e.g., `overflow: 'scroll' | 'grow'`) or adding JSDoc descriptions to the `LayoutHeight` type.

### 11. `padding` vs sub-component `padding` (Layout.tsx:57, LayoutContent.tsx:13, LayoutHeader.tsx:17, LayoutPanel.tsx:14)

`Layout.padding` controls outer edge padding of the entire shell, while sub-component `padding` controls inner region padding. These are independent systems using CSS custom properties (`--layout-padding` vs `--layout-region-padding`), but sharing the same prop name `padding` with the same `SpacingStep` type could confuse consumers who expect them to interact.

### 12. Context hooks exported from LayoutContext.ts but not from index.ts

`useLayoutArea`, `useLayoutSlots`, and `useLayoutDivider` are defined in `LayoutContext.ts` but are not exported from `index.ts` or the package root. If these are intentionally internal, this is fine. If consumers are expected to use them (e.g., to build custom layout regions), they should be exported. Currently `AppShell` imports from `'../Layout'` which resolves to `index.ts` and does not use these hooks, suggesting they are internal-only. Consider adding an explicit `@internal` JSDoc annotation.

### 13. `LayoutHeader` used for both header and footer (Layout.test.tsx, line 14)

In the test file, `footer={<LayoutHeader>Footer</LayoutHeader>}` uses `LayoutHeader` for the footer slot. While this works, it suggests the API lacks a dedicated `LayoutFooter` component, or that `LayoutHeader` should be renamed to something more generic (e.g., `LayoutBar` or `LayoutStrip`) if it is intended for both roles.

---

## Missing Tests

### 14. No tests for `LayoutContent`, `LayoutHeader`, or `LayoutPanel` individually

The test file only tests the `Layout` shell component. There are no tests for:

- `LayoutContent` scrollability (`isScrollable` prop)
- `LayoutContent` padding
- `LayoutHeader` divider rendering (`hasDivider` prop)
- `LayoutHeader` height prop
- `LayoutPanel` width prop
- `LayoutPanel` divider rendering with `hasDivider` and area context
- `LayoutPanel` scrollability

### 15. No test for `hasDefaultDividers` behavior

The `hasDefaultDividers` prop on `Layout` is untested. Given the bug identified in item 7 (LayoutPanel does not respect it), a test would have caught this inconsistency.

### 16. No test for `contentWidth` prop

The `contentWidth` prop sets a CSS custom property and applies a max-width style, but this is not tested.

### 17. No test for `padding` prop on Layout

The outer padding behavior is not tested.

### 18. No test for `height="auto"` variant

Only the default `height="fill"` is implicitly tested. The `auto` variant is not covered.

### 19. No test for slot omission

When slots like `start`, `end`, `header`, `footer` are omitted, `AreaProvider` returns `null`. There is no test verifying that omitted slots do not render unnecessary DOM nodes.

### 20. No test for `LayoutSlotsContext` values

The `slots` context provides `hasEnd`, `hasFooter`, `hasHeader`, `hasStart` booleans to children. There is no test that these values are correctly set based on which slots are provided.

---

## Missing Stories

### 21. Only one story exists (`Basic`)

The stories file contains a single `Basic` story. The following prop combinations and use cases are not demonstrated:

- **`height="auto"`** -- No story showing auto-height behavior where the layout grows with content.
- **`contentWidth`** -- No story showing a constrained content width with centered content.
- **`padding`** -- No story showing outer padding on the layout.
- **`hasDefaultDividers`** -- No story showing automatic dividers on all regions.
- **`end` panel** -- No story showing an end (right) panel.
- **`footer`** -- No story showing a footer slot.
- **All slots populated** -- No story showing header + start + content + end + footer together.
- **Content-only** -- No minimal story showing just content with no header or panels.
- **`LayoutPanel` with `hasDivider`** -- No story demonstrating panel dividers.
- **`LayoutPanel` with custom `width`** -- No story showing different panel widths.
- **`LayoutContent` with `isScrollable={false}`** -- No story showing non-scrollable content.
- **`LayoutContent` with `padding` variations** -- No story showing different content padding.
- **Nested layouts** -- No story showing whether layouts can be nested.

---

## Summary of Severity

| #   | Category        | Severity   | Item                                             |
| --- | --------------- | ---------- | ------------------------------------------------ |
| 7   | Logic Bug       | **High**   | LayoutPanel ignores `hasDefaultDividers` context |
| 5   | Accessibility   | **Medium** | `aria-label` without `role` is silently ignored  |
| 14  | Missing Tests   | **Medium** | No tests for sub-components                      |
| 21  | Missing Stories | **Medium** | Only 1 story for a multi-slot component          |
| 2   | Performance     | **Low**    | `paddingByStep` duplicated 4 times               |
| 4   | Accessibility   | **Low**    | No landmark guidance at shell level              |
| 6   | Accessibility   | **Low**    | LayoutHeader has no default role                 |
| 10  | API Clarity     | **Low**    | `height` naming is ambiguous                     |
| 13  | API Clarity     | **Low**    | No `LayoutFooter` component                      |
