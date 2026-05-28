# Table Component Audit

Audit date: 2026-05-28
Scope: `/Users/agoder/silver-ui/src/components/Table/` (all `.tsx`, `.ts`, `.test.tsx` files)

---

## 1. Performance Problems

### 1.1 `areRowPropsEqual` shallow-compares only the _next_ item's keys (Medium)

**File:** `BaseTable.tsx`, lines 155-178

The custom memo comparator iterates `Object.keys(next.item)` but never checks `Object.keys(previous.item)`. If a row update _removes_ a key from the item object, the comparator will return `true` (equal) even though the items differ, producing stale renders. This is unlikely with typed data, but the comparator is generic and would silently mask the bug.

**Suggested fix:** Also compare key counts, or iterate the union of both key sets.

### 1.2 Plugin array identity changes on every render when using object form (Low)

**File:** `useBaseTablePlugins.ts`, lines 8-14

`Object.values(userPlugins ?? {})` always returns a new array, so the `useMemo` dependency `userPlugins` (the object reference) determines whether the memoized array is reused. If the consumer passes an inline object literal `plugins={{ sort, selection }}`, the object reference is new every render, which creates a new plugins array every render, which in turn invalidates the `MemoizedDataRow` memo for every row (because `plugins` is compared by reference in `areRowPropsEqual`). This is the most common usage pattern shown in the tests. The `Record<string, TablePlugin>` form should either be documented with a warning to memoize, or the hook should do a shallow comparison of the object values.

### 1.3 `buildTableStylePlugin` is memoized with an empty deps array (Negligible)

**File:** `Table.tsx`, line 82

`useMemo(() => buildTableStylePlugin<T>(), [])` is fine functionally but the eslint `react-hooks/exhaustive-deps` rule would flag this (no external deps to capture). This is intentional and correct; just noting it.

### 1.4 `generateColumns` samples only 5 rows (Negligible)

**File:** `columnUtils.ts`, line 154

Auto-generated columns sample at most 5 rows, which is a reasonable heuristic. If early rows contain nulls, the column widths may be sub-optimal. This is an acceptable trade-off.

---

## 2. Accessibility Concerns

### 2.1 No `role="table"` or ARIA labeling on the `<table>` element (Medium)

**File:** `BaseTable.tsx`, lines 311-324

The `<table>` element does not have `role`, `aria-label`, or `aria-labelledby` attributes. While native `<table>` elements get an implicit `table` role, an explicit `aria-label` (or a mechanism to pass one) would help screen-reader users distinguish multiple tables on a page. Neither `BaseTableProps` nor `TableProps` expose an `aria-label` prop, though it can be passed through `tableProps`.

**Suggested fix:** Document the `tableProps` escape hatch, or add an explicit `aria-label` prop.

### 2.2 Selection checkboxes all share the same label "Select row" (Medium)

**File:** `plugins/selection/useTableSelection.tsx`, line 66

Every row's selection checkbox has the identical label `"Select row"`. Screen-reader users cannot distinguish which row a given checkbox controls. The label should incorporate identifying information from the row (e.g., the id or first column value).

**Suggested fix:** Accept an optional `getRowLabel` callback in the selection config, or default to something like `"Select row {index}"`.

### 2.3 Empty-state row lacks a meaningful role (Low)

**File:** `BaseTable.tsx`, lines 364-369

When the table has no data, an empty-state `<tr><td colSpan={...}>` is rendered with no `role` attribute. Screen readers will announce this as a data row, which may confuse users.

### 2.4 Column resize handle hidden on touch devices (Low-Info)

**File:** `plugins/columnResize/useTableColumnResize.tsx`, lines 67-69

`@media (pointer: coarse)` sets `display: none` on resize handles, meaning touch-device users cannot resize columns at all. This is a conscious UX decision but should be documented.

### 2.5 Sort button uses string concatenation for `className` instead of `cx` (Cosmetic)

**File:** `plugins/sortable/useTableSortable.tsx`, line 184

```tsx
className={`${styles.icon} ${direction == null ? '' : styles.iconActive}`}
```

This produces an extra space when `direction` is null. Functionally harmless but inconsistent with the rest of the codebase which uses `cx()`.

---

## 3. Logic Bugs

### 3.1 `getIsAllSelected` comparison is incorrect when non-actionable items are selected (Medium)

**File:** `plugins/selection/useTableSelectionState.tsx`, lines 80-83

```ts
const getIsAllSelected = useCallback(
  () =>
    allSelectableIDs.size > 0 && allSelectableIDs.size === selectedKeys.size,
  [allSelectableIDs, selectedKeys],
);
```

`allSelectableIDs` is the union of `selectedKeys` and `actionableIDs`. So `allSelectableIDs.size === selectedKeys.size` is true when `selectedKeys` is a superset of `actionableIDs`, which is the correct intention. However, this comparison breaks when `selectedKeys` contains IDs not present in `allSelectableIDs` (e.g., stale keys from previously removed rows): `allSelectableIDs` includes all of `selectedKeys`, so the sizes would match even if some actionable rows are unselected.

Actually on closer inspection, `allSelectableIDs = new Set([...selectedKeys, ...actionableIDs])` always includes all of `selectedKeys` by construction, so `allSelectableIDs.size >= selectedKeys.size` is always true and they are equal iff `actionableIDs` is a subset of `selectedKeys`. This logic is correct but subtle; a comment would help.

### 3.2 `NumberFilterControl` passes `hasClear` twice (Low)

**File:** `plugins/filtering/useTableFiltering.tsx`, lines 250-265

The component always sets `hasClear` to `true` on line 251, then conditionally spreads `{hasClear: false}` on line 264. This works but is confusing. The `hasClear` prop is also received as a component prop (line 241) but the hardcoded `true` on line 251 overrides it before the conditional spread can take effect. The logic should be simplified.

### 3.3 Header cell `title` attribute uses resolved content, which may be a ReactNode (Negligible)

**File:** `BaseTable.tsx`, lines 252-255

```ts
const title =
  typeof resolvedContent === 'string' && resolvedContent.length > 0
    ? resolvedContent
    : undefined;
```

This is guarded correctly (only sets title if content is a non-empty string). No bug, just noting the guard is present.

### 3.4 `scope` prop on `TableCell` is accepted but never forwarded (Low)

**File:** `TableCell.tsx`, line 14

`TableCellProps` declares a `scope` property, but the `TableCell` component destructures it (line 65 does not include `scope`). `scope` is semantically invalid on `<td>` elements (it belongs on `<th>`), so the prop should be removed from the interface.

---

## 4. Unclear API

### 4.1 `plugins` accepts `Record<string, TablePlugin>` or `TablePlugin[]` but behavior differs (Medium)

**File:** `Table.tsx`, line 26; `useBaseTablePlugins.ts`, lines 4-14

The `Record<string, TablePlugin>` form uses `Object.values()`, which in V8 returns values in insertion order, but this is not an ECMAScript guarantee for all key types. Consumers who care about plugin ordering should use the array form, but this distinction is not documented.

### 4.2 `emptyState` accepts `ReactNode | false` (Low)

**File:** `types.ts`, line 123

Passing `false` disables the empty state, while `undefined` renders the default. This `| false` sentinel is a somewhat unusual pattern; `null` is more idiomatic in React. Worth a JSDoc comment explaining the distinction.

### 4.3 `idKey` dual-type signature (Low)

**File:** `types.ts`, line 124

`idKey` accepts either a string key of `T` or a function `(item: T) => number | string`. This is flexible but the string form returns `String(item[idKey])`, which could produce `"undefined"` or `"[object Object]"` for non-primitive values. A runtime warning would help.

### 4.4 `BaseTable` vs `Table` relationship is not obvious (Low)

`BaseTable` is exported and usable directly, but the relationship between the two (Table = BaseTable + context + scroll wrapper + style plugin) is implicit. There is no documentation or JSDoc explaining when to use which.

---

## 5. Missing Tests

### 5.1 No test for `density`, `dividers`, `isStriped`, `hasHover`, `verticalAlign`, or `textOverflow` props

The test file covers the data-driven rendering, children mode, and all plugins, but does not test any of the visual/theming context props that flow through `TableContext`. While these primarily affect CSS classes, a test confirming the correct classes are applied would prevent regressions.

### 5.2 No test for `generateColumns` (auto-column inference)

**File:** `columnUtils.ts`, lines 147-178

This non-trivial function samples data rows, estimates content lengths, and produces proportional widths. It has no dedicated test. A unit test with varied data shapes would be valuable.

### 5.3 No test for `resolveColumnWidths`

**File:** `columnUtils.ts`, lines 30-89

The width resolution logic (pixel vs proportional, `minWidth` calculations) is moderately complex and untested.

### 5.4 No test for `defaultCellRenderer` edge cases

**File:** `columnUtils.ts`, lines 97-117

`bigint`, `Date`, and `null` branches are not tested.

### 5.5 No test for `paginateData`

**File:** `plugins/pagination/paginateData.ts`

A simple function but with edge-case guards (`Math.max(1, page)`, etc.) that should be verified.

### 5.6 No test for `useTableFilterState`

**File:** `plugins/filtering/useTableFilterState.tsx`

The `clearAll` and `onFilterChange` (with null-removal) logic is untested.

### 5.7 No test for `useTableColumnSettingsState`

**File:** `plugins/columnSettings/useTableColumnSettingsState.tsx`

The `toggleColumn`, `showAllColumns`, `resetToDefault`, `setActiveColumnKeys`, and `isAlwaysVisible` guard logic are untested.

### 5.8 No test for multi-sort behavior

The sortable test only tests single-column sort. Multi-sort (shift+click), `allowUnsortedState`, and custom comparators are not tested.

### 5.9 No test for keyboard column resize (Home/End/Shift+Arrow keys)

The test only verifies basic ArrowRight keyboard resize. Home, End, and Shift+Arrow (large step) are not tested.

### 5.10 No test for `toSearchFilters` with various operator types

Only the `string`/`contains` path is tested. Date, enum, number, and list filter types are not covered.

### 5.11 No test for empty `data` vs `undefined` data

`BaseTable.tsx` lines 362-369 distinguish between `data={[]}` (shows empty state) and `data={undefined}` (renders nothing). Only `data={[]}` is tested (line 46).

---

## 6. Missing Stories

### 6.1 No Storybook stories file exists at all

There is no `Table.stories.tsx` anywhere in the project. For a component of this complexity (with 6 plugins, 7+ visual props, and two rendering modes), stories are essential for visual QA and documentation.

The following stories should be created:

1. **Default** - Basic table with data and columns
2. **Empty State** - Table with `data={[]}` and custom `emptyState`
3. **Density** - Variants: `balanced`, `compact`, `spacious`
4. **Dividers** - Variants: `rows`, `columns`, `grid`, `none`
5. **Striped** - `isStriped={true}`
6. **Hover** - `hasHover={true}`
7. **Text Overflow** - `truncate` vs `wrap` with long content
8. **Vertical Align** - `top`, `middle`, `bottom`
9. **Column Widths** - `pixel()` and `proportional()` helpers
10. **Custom Cell Rendering** - Columns with `renderCell`
11. **Auto Columns** - Omitting `columns` prop (uses `generateColumns`)
12. **Children Mode** - Manual `<thead>/<tbody>` children
13. **Sortable** - Single and multi-sort
14. **Selection** - Checkboxes with disabled/non-selectable rows
15. **Pagination** - Various positions and variants
16. **Column Settings** - Showing/hiding/reordering columns
17. **Column Resize** - Drag and keyboard resizing
18. **Filtering** - Inline, inline-compact, and popover variants
19. **Combined Plugins** - Multiple plugins composed together

---

## 7. Summary

| Category        | Critical | Medium | Low |
| --------------- | -------- | ------ | --- |
| Performance     | 0        | 1      | 1   |
| Accessibility   | 0        | 2      | 2   |
| Logic Bugs      | 0        | 1      | 2   |
| Unclear API     | 0        | 1      | 3   |
| Missing Tests   | 0        | 11     | 0   |
| Missing Stories | 0        | 1      | 0   |

**Top priorities:**

1. Add a `Table.stories.tsx` covering all major props and plugin combinations.
2. Add unit tests for `columnUtils` functions (`generateColumns`, `resolveColumnWidths`, `defaultCellRenderer`).
3. Fix selection checkbox labels to include row-identifying information (a11y).
4. Document or warn about the `plugins={{ ... }}` inline-object performance pitfall.
5. Remove the invalid `scope` prop from `TableCellProps`.
