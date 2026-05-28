# TreeView Component Audit

**Files reviewed:**

- `src/components/TreeView/TreeView.tsx`
- `src/components/TreeView/TreeViewItem.tsx`
- `src/components/TreeView/TreeViewBranches.tsx`
- `src/components/TreeView/types.ts`
- `src/components/TreeView/index.ts`
- `src/components/TreeView/TreeView.test.tsx`

---

## Performance Problems

### P1: `collectExpandedKeys` rebuilds on every `items` reference change (TreeView.tsx:86-89)

`expandedKeysFromProps` is recomputed via `useMemo` whenever `items` changes. Because `items` is an array prop, if the consumer does not memoize it (e.g. inline `items={[...]}`), the full recursive traversal runs on every render. This is a common pitfall but is correctly guarded by `useMemo` -- the real concern is that consumers are likely passing unstable references.

**Recommendation:** Document in the JSDoc for `items` that it should be a stable reference (or memoized) to avoid unnecessary work.

### P2: `renderItems` creates new arrays on every expansion toggle (TreeView.tsx:120-121)

`childAncestorsIsLast` is constructed via spread (`[...ancestorsIsLast, isLast]`) for every branch node on every render. For deeply nested trees, this creates O(n \* d) intermediate arrays where d is depth. This is minor but worth noting.

### P3: `handleToggle` and `handleRowClick` recreated via `useMemo` instead of `useCallback` (TreeViewItem.tsx:203-225)

`handleToggle` and `handleRowClick` are created with `useMemo` returning a function. While functionally equivalent to `useCallback`, this is an unusual pattern. `useMemo` is semantically for computed values, not callbacks. React documentation explicitly recommends `useCallback` for functions. Using `useMemo` here obscures intent and may confuse contributors.

### P4: `expandedKeyOverrides` state grows without bound (TreeView.tsx:90-106)

Every toggle appends to `expandedKeyOverrides`. Over a long session with many expand/collapse interactions, this Map accumulates entries for every ID ever toggled, even if the override now matches the prop default. There is no cleanup mechanism. For very large trees with heavy interaction, this could accumulate thousands of entries.

**Recommendation:** In `handleToggle`, remove the override entry when it matches the prop-derived default rather than storing the redundant value.

---

## Accessibility Concerns

### A1: Missing keyboard navigation for the tree pattern (TreeViewItem.tsx, TreeView.tsx)

The WAI-ARIA Treeview pattern (https://www.w3.org/WAI/ARIA/apd/patterns/treeview/) requires the following keyboard interactions:

- **Arrow Down** -- move focus to next visible treeitem
- **Arrow Up** -- move focus to previous visible treeitem
- **Arrow Right** -- expand collapsed node / move to first child / do nothing on leaf
- **Arrow Left** -- collapse expanded node / move to parent / do nothing at root
- **Home** -- move focus to first treeitem
- **End** -- move focus to last visible treeitem
- **Enter** -- activate the focused item
- Type-ahead character navigation

**None of these are implemented.** The component uses `role="tree"` and `role="treeitem"` which sets the expectation that these keyboard interactions exist. A screen reader user navigating via arrow keys will find the tree completely non-functional.

This is the most critical accessibility issue in the component.

### A2: No `aria-label` fallback when `header` is not provided (TreeView.tsx:171)

When `header` is `null`, the `<ul role="tree">` has no `aria-labelledby` and no `aria-label`. Screen readers will announce it as an unlabelled tree. There should be an `aria-label` prop or a fallback label.

### A3: Inconsistent `tabIndex` strategy (TreeViewItem.tsx:291, 345)

- Links get `tabIndex={isDisabled ? -1 : undefined}` (line 291) -- so enabled links have no explicit tabIndex (browser default 0).
- Toggle rows get `tabIndex={togglesOnRow && !isDisabled ? 0 : undefined}` (line 345).
- Buttons inside `onClick` items have no explicit tabIndex (browser default).
- Non-interactive leaf items have no tabIndex at all.

Per the treeview pattern, only **one** treeitem should be in the tab order at a time (roving tabindex or `aria-activedescendant`). Currently, every interactive item and toggle row is independently tabbable, creating a potentially very long tab sequence.

### A4: `aria-expanded` set on both `<li>` and nested `<button>` (TreeViewItem.tsx:266, 321)

When an item has both `onClick` and `children`, `aria-expanded` is placed on the `<li role="treeitem">` (line 321) and also on the inner toggle `<button>` (line 266). Having `aria-expanded` on both the treeitem and a descendant button is redundant and can cause screen readers to announce the expanded state twice.

### A5: Toggle button has a generic label (TreeViewItem.tsx:267)

The toggle button uses `aria-label="Toggle children"`. This is not descriptive enough -- screen readers would benefit from knowing _which_ item's children are being toggled, e.g. `aria-label="Toggle ${label} children"`. Since `label` can be a `ReactNode`, this would require a separate `ariaLabel` or text extraction.

### A6: Disabled links are not truly disabled (TreeViewItem.tsx:286-292)

`<a aria-disabled>` with `tabIndex={-1}` still allows click activation. There is no `onClick` handler to `preventDefault()` on disabled links, so a user could still navigate to the `href` via assistive technology or other means.

---

## Logic Bugs

### B1: `handleRowClick` closure over stale `onToggle` when `togglesOnRow` is false (TreeViewItem.tsx:214-225)

`handleRowClick` is wrapped in `useMemo` with `[id, isDisabled, onToggle, togglesOnRow]` dependencies. When `togglesOnRow` is `false`, the function returns `undefined`, but `onToggle` is still in the dependency array. This is not a bug per se but `onToggle` is called unconditionally inside the returned function without a null check:

```ts
return () => {
  if (isDisabled) {
    return;
  }
  onToggle(id); // onToggle could be undefined if togglesOnRow check changes
};
```

At line 224, `onToggle(id)` is called without checking if `onToggle` is defined. TypeScript's type narrowing relies on `togglesOnRow` being `true` (which requires `onToggle != null`), but since `togglesOnRow` is captured at memo creation time and the memo re-runs when dependencies change, this is safe in practice. However, the code would be more robust with an explicit null check.

### B2: `isExpanded` state resets when `items` prop reference changes (TreeView.tsx:86-106)

The expansion state uses a two-layer system: `expandedKeysFromProps` (derived from `items`) plus `expandedKeyOverrides` (user toggles). If the consumer provides a new `items` array with different `isExpanded` values, `expandedKeysFromProps` updates, but `expandedKeyOverrides` retains stale entries. This means a user's toggle will continue to override even a deliberately changed `isExpanded` prop.

For example: if a parent sets `isExpanded: true` on an item, the user collapses it (adding an override of `false`), and then the parent sets `isExpanded: false`, the override still says `false` -- which happens to match, but the intent is different. If the parent then sets `isExpanded: true` again, the override still says `false`, fighting the parent's intent.

**Recommendation:** Consider clearing overrides for items whose prop-level `isExpanded` changes, or offer a controlled `expandedKeys` prop.

### B3: `_isLast` prop is destructured but never used (TreeViewItem.tsx:188)

The `isLast` prop is renamed to `_isLast` and never read. It is passed from TreeView.tsx (line 143) but only used to compute `childAncestorsIsLast` in the parent. The prop appears to be vestigial.

---

## Unclear API

### U1: No controlled expansion mode

The component only supports "uncontrolled with initial values" via `isExpanded` on each item. There is no `onExpandChange` callback or controlled `expandedKeys` prop. Consumers who need to programmatically expand/collapse nodes (e.g., "expand all", "collapse all", or URL-driven expansion) cannot do so.

### U2: No selection callback

Items can be marked `isSelected` but there is no `onSelect` callback at the TreeView level. Selection is entirely managed externally, which is fine, but combined with the lack of keyboard navigation, there is no built-in way to select items via keyboard.

### U3: `onClick` and `href` are mutually exclusive but not enforced

An item with both `onClick` and `href` would render an `<a>` tag (the `href` branch wins at line 284) and the `onClick` would be silently ignored. The type system allows both simultaneously. This should either be a discriminated union or documented.

### U4: `isExpanded` on leaf items is silently ignored

Setting `isExpanded: true` on an item with no `children` is meaningless but not flagged. A dev-mode warning would help.

### U5: `target` without `href` is silently ignored

The `target` prop is only meaningful with `href`, but the type allows it on any item.

---

## Missing Tests

### T1: No keyboard interaction tests

There are no tests for keyboard navigation (Enter, Space, Arrow keys). The `handleRowKeyDown` handler (TreeViewItem.tsx:227-238) is untested.

### T2: No test for disabled item behavior

The test at line 124 checks that `aria-disabled` and `aria-selected` attributes are set, but does not verify that clicking a disabled item does **not** trigger its `onClick` or toggle.

### T3: No test for link items with `target`

The test for link items (line 115) checks `href` but not `target`. The `target` prop is not tested.

### T4: No test for deeply nested trees

All tests use at most 2 levels. There are no tests verifying that 3+ levels of nesting render correctly with proper branch lines and indentation.

### T5: No test for density prop

The `density` prop (`balanced`, `compact`, `spacious`) is never tested.

### T6: No test for `data-testid` or `className` passthrough

These common passthrough props are not tested.

### T7: No test for `ref` forwarding

The `ref` prop on `TreeView` is not tested.

### T8: No test for item with both `onClick` and `children`

While the test at line 143 ("separates item click from child toggle") covers this scenario for _clicking_, it does not test keyboard activation of the toggle button.

### T9: No test for toggling via keyboard (Enter/Space) on row

`handleRowKeyDown` supports Enter and Space keys but this is not tested.

### T10: No test for expansion state override behavior

There is no test verifying what happens when `items` prop changes with different `isExpanded` values after the user has manually toggled items.

---

## Missing Stories

### S1: No stories file exists

There is no `TreeView.stories.tsx` file at all. This means the component has zero Storybook coverage. The following stories should be created:

- **Basic** -- simple flat list of items
- **Nested** -- multi-level tree with expand/collapse
- **InitiallyExpanded** -- tree with `isExpanded: true` items
- **WithDescriptions** -- items with `description` text
- **WithStartAndEndContent** -- items with icons and badges
- **ActionItems** -- items with `onClick` handlers
- **LinkItems** -- items with `href` (and `target`)
- **DisabledItems** -- items with `isDisabled: true`
- **SelectedItems** -- items with `isSelected: true`
- **Density** -- side-by-side comparison of `balanced`, `compact`, `spacious`
- **WithHeader** -- tree with a header element
- **DeeplyNested** -- 4+ levels to verify branch line rendering
- **MixedInteractive** -- items with both `onClick` and `children` to demonstrate toggle button separation

---

## Summary

| Category        | Critical   | Moderate            | Minor          |
| --------------- | ---------- | ------------------- | -------------- |
| Performance     | 0          | 1 (P4)              | 3 (P1, P2, P3) |
| Accessibility   | 2 (A1, A3) | 2 (A2, A6)          | 2 (A4, A5)     |
| Logic Bugs      | 0          | 1 (B2)              | 2 (B1, B3)     |
| Unclear API     | 0          | 2 (U1, U2)          | 3 (U3, U4, U5) |
| Missing Tests   | 1 (T1)     | 4 (T2, T9, T10, T8) | 5 (T3-T7)      |
| Missing Stories | 1 (S1)     | 0                   | 0              |

**Top priority items:**

1. **A1** -- Implement full WAI-ARIA treeview keyboard navigation (Arrow keys, Home, End, type-ahead)
2. **A3** -- Switch to roving tabindex or `aria-activedescendant` so only one item is in the tab order
3. **S1** -- Create a stories file covering all major props and interactions
4. **T1** -- Add keyboard interaction tests
5. **B2/U1** -- Consider a controlled expansion API to resolve the stale-override problem
