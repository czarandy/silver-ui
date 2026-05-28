# MetadataList Component Audit

Audit date: 2026-05-28

Files reviewed:

- `src/components/MetadataList/MetadataList.tsx`
- `src/components/MetadataList/MetadataListItem.tsx`
- `src/components/MetadataList/MetadataListContext.ts`
- `src/components/MetadataList/index.ts`
- `src/components/MetadataList/MetadataList.stories.tsx`
- `src/components/MetadataList/MetadataList.test.tsx`

---

## Performance Problems

### 1. `Children.toArray` called on every render (low severity)

**File:** `MetadataList.tsx`, line 112

`Children.toArray(children)` is called unconditionally on every render, even when `maxNumOfItems` is not set and the array is never sliced. When `maxNumOfItems` is undefined and orientation is not horizontal, `effectiveMax` is undefined, `isCollapsible` is false, and `visibleChildren` falls through to the full `childArray` -- but the allocation still happens.

**Suggestion:** Guard with a condition or memoize:

```tsx
const childArray = effectiveMax != null ? Children.toArray(children) : null;
```

Then use `childArray ?? children` when rendering.

### 2. Context object identity is stable (no issue)

The `contextValue` is correctly wrapped in `useMemo` (line 95-109), preventing unnecessary re-renders of consumers. No issue here.

---

## Accessibility Concerns

### 1. Missing accessible label on the `<dl>` element (medium severity)

**File:** `MetadataList.tsx`, lines 148-153

The `<dl>` element has no `aria-label` or `aria-labelledby` connecting it to the `title` rendered above it. Screen readers will announce the definition list but won't associate it with its title. The `title` div (line 147) should get an `id`, and the `<dl>` should reference it via `aria-labelledby`.

**Suggestion:**

```tsx
const titleId = useId();
// ...
{title != null ? <div id={titleId} className={styles.title}>{title}</div> : null}
<dl aria-labelledby={title != null ? titleId : undefined} ...>
```

### 2. `ref` type mismatch in MetadataListItem (low severity)

**File:** `MetadataListItem.tsx`, line 69

The `ref` prop is typed as `Ref<HTMLElement>` but is cast to `Ref<HTMLDivElement>` in the stacked branch. In the non-stacked branch (line 83), it is attached to a `<dt>` element, not the wrapping fragment. This means the ref points to different element types depending on layout mode, which could confuse consumers. This is a usability concern rather than a strict accessibility issue, but the type cast on line 69 suppresses a real type discrepancy.

### 3. Collapsed items are removed from the DOM entirely (low severity)

**File:** `MetadataList.tsx`, lines 117-119

When `maxNumOfItems` truncates the list, hidden items are completely removed from the DOM rather than being visually hidden. This means screen reader users who navigate by definition terms will not discover the hidden content until they activate "Show more." This is an acceptable pattern (the toggle button with `aria-expanded` and `aria-controls` provides the right cues), but worth noting that the collapsed items are not findable via in-page search either.

### 4. `title` prop renders a generic `<div>` (low severity)

**File:** `MetadataList.tsx`, line 147

The `title` prop renders inside a plain `<div>`. If the component is used as a section of a page, a heading element (`<h2>`, `<h3>`, etc.) would provide better document outline semantics. Consider accepting a `titleAs` or `headingLevel` prop, or documenting that consumers should pass a heading element as the `title` ReactNode.

---

## Logic Bugs

### 1. `maxNumOfItems` silently ignored for horizontal orientation (medium severity)

**File:** `MetadataList.tsx`, line 113

```tsx
const effectiveMax = orientation === 'horizontal' ? undefined : maxNumOfItems;
```

When `orientation="horizontal"` is set, `maxNumOfItems` is silently discarded. There is no runtime warning, TypeScript narrowing, or documentation indicating this restriction. A consumer could set both props and never realize their `maxNumOfItems` is being ignored.

**Suggestion:** Either:

- Make the type system enforce this (e.g., discriminated union props), or
- Log a development-mode warning when both are set, or
- Document the restriction clearly.

### 2. No validation that `columns` number is positive (low severity)

**File:** `MetadataList.tsx`, lines 93-94, 125-133

`columns` accepts `number` but there is no guard against `0`, negative numbers, or non-integer values. Passing `columns={0}` would produce `repeat(0, auto 1fr)` in the inline style (line 133), which is invalid CSS and results in a broken layout. Passing `columns={1.5}` would produce `repeat(1.5, ...)` which is also invalid.

### 3. Stacked multi-column layout ignores `label.width` (no bug, but worth noting)

**File:** `MetadataList.tsx`, lines 131-138

When `isStacked` is true, `dlStyle` is always `undefined` because the condition on line 132 requires `!isStacked`. This is intentional (stacked labels don't need a fixed width), but it means `label.width` is silently ignored when `label.position` is `'top'` or when `columns` is `'multi'`. No warning is given.

---

## Unclear API

### 1. `columns` prop type is overloaded (medium severity)

**File:** `MetadataList.tsx`, line 17

```tsx
export type MetadataListColumns = 'multi' | 'single' | number;
```

The `'multi'` and `'single'` strings overlap with numbers `1` (equivalent to `'single'`) and `>1` (similar to `'multi'` but with fixed column count). The distinction between `columns="multi"` (auto-fill responsive) and `columns={3}` (fixed 3-column) is non-obvious. The behavior when `columns={1}` is used (treated as single) is also implicit. Consider adding JSDoc to the type or prop.

### 2. `label` prop naming is ambiguous (low severity)

**File:** `MetadataList.tsx`, line 24

The `label` prop on `MetadataList` configures the layout of labels within items (position and width), not a label for the list itself. The name `label` could be confused with an ARIA label. Consider renaming to `labelLayout` or `labelConfig` for clarity, or adding JSDoc.

### 3. `MetadataListItem` does not export from context-aware hook

**File:** `index.ts`

The `useMetadataList` hook is not exported from `index.ts`. This is likely intentional (internal use only), but if consumers ever need to build custom items that respond to the list context, they would need to import from the internal path.

---

## Missing Tests

### 1. No test for multi-column layout

There is no test verifying that `columns="multi"` or `columns={3}` produces the correct grid layout or CSS classes.

### 2. No test for horizontal orientation

There is no test for `orientation="horizontal"`, which changes both the layout and the label position behavior (forces stacked labels).

### 3. No test for `label` prop configuration

The `label` prop (with `position` and `width` sub-properties) is untested. No test verifies that `label={{ position: 'top' }}` changes the rendering to stacked mode, or that `label={{ width: 200 }}` applies an inline grid template.

### 4. No test for `icon` prop on MetadataListItem

The `icon` prop on `MetadataListItem` is untested. No test verifies that passing an icon renders it alongside the label.

### 5. No test for `title` prop rendering

While the existing test checks that the title text appears (line 16), there is no test verifying it renders in the correct position or that omitting the title removes the wrapper div.

### 6. No test for `data-testid` propagation

The `data-testid` prop is supported on both `MetadataList` and `MetadataListItem` but is never tested. The `MetadataListItem` has interesting behavior where in non-stacked mode it appends `-label` and `-value` suffixes (lines 81, 88) -- this is untested.

### 7. No test for `className` and `style` passthrough

Standard prop forwarding (`className`, `style`) is untested.

### 8. No test for `ref` forwarding

The `ref` prop is accepted by both components but never tested.

### 9. No test for `maxNumOfItems` being ignored in horizontal mode

Given the silent behavior described in the logic bugs section, a test documenting this intentional behavior would be valuable.

---

## Missing Stories

### 1. No story for `label` configuration

The `label` prop (with `position: 'top'` and `width` options) has no story. This is a significant configuration axis that changes the visual layout but is not demonstrated.

### 2. No story for `maxNumOfItems` (show more/less)

The collapsible behavior via `maxNumOfItems` is untested in stories. This is interactive behavior that would benefit from a story for visual QA and documentation.

### 3. No story for `icon` prop on items

Icons are included in the default story's children, but there is no dedicated story highlighting the icon prop or showing items with and without icons for comparison.

### 4. No story for fixed numeric columns

Only `columns="multi"` has a story. A story with `columns={2}` or `columns={3}` (fixed column count) is missing, which behaves differently from `"multi"` (fixed vs. auto-fill).

### 5. No story for `label.width` customization

The `label.width` prop allows fixed-width labels in the side-by-side layout, but no story demonstrates this.

### 6. No story for stacked single-column layout

`label={{ position: 'top' }}` with `columns="single"` produces a distinct single-column stacked layout (`gridStackedSingle`), but this combination is not shown in any story.

### 7. No story without a title

All stories use a title. A story without `title` would document that the component works without a header.

---

## Summary

The MetadataList component is well-structured with good semantic HTML usage (`<dl>`/`<dt>`/`<dd>`) and solid fundamentals (context for child communication, `useMemo` for context stability, proper `aria-controls`/`aria-expanded` on the toggle). The main gaps are:

- **Accessibility:** The `<dl>` lacks `aria-labelledby` to connect it to its title.
- **API clarity:** The `columns` type is overloaded and the `label` prop name is ambiguous.
- **Testing:** Only 2 tests exist, covering basic rendering and collapse/expand. Major features like multi-column, horizontal orientation, icons, label configuration, data-testid suffixing, and ref forwarding are untested.
- **Stories:** Only 3 stories (Default, MultiColumn, Horizontal). The `maxNumOfItems`, `label` configuration, fixed column counts, and `label.width` features have no visual documentation.
