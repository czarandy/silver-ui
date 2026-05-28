# Table Component Audit

Audit date: 2026-05-28
Scope: public Table implementation in `src/components/Table/`, plus discovered docs/stories/tests.

## Findings

### High

- No high-severity issues found in the audited implementation.

### Medium

- Row memoization can keep stale cells when item keys are removed. `areRowPropsEqual` only iterates `Object.keys(next.item)` and returns true when all next keys match, so `{name: 'A', role: 'Admin'}` -> `{name: 'A'}` is treated as unchanged even though a rendered column may still read `role`. Compare key counts or the union of keys.  
  `src/components/Table/BaseTable.tsx:155`

- Selection checkboxes have indistinguishable accessible names. Every body checkbox is labelled `"Select row"`, so screen-reader users cannot tell which row a control selects. Add a config callback for row labels or include a stable row identifier/index in the label.  
  `src/components/Table/plugins/selection/useTableSelection.tsx:62`

- Header plugin composition can drop classes from earlier plugins. `useTableColumnResize` returns `className: styles.headerCell` and `useTableFiltering` returns `className: styles.afterInline` without merging `props.className`, so combining resize with inline filtering or other header-cell plugins can silently lose styles depending on plugin order.  
  `src/components/Table/plugins/columnResize/useTableColumnResize.tsx:239`  
  `src/components/Table/plugins/filtering/useTableFiltering.tsx:631`

- Public docs/stories are missing for the exported component. The only discovered Table doc is `XDS_src/Table/Table.doc.mjs`, which documents `XDSTable`; no `src/components/Table` doc or `Table.stories.*` file exists. Important props and plugins therefore have no visible examples for `density`, `dividers`, `isStriped`, `hasHover`, `textOverflow`, `verticalAlign`, children mode, generated columns, custom cells, sorting, selection, filtering, pagination, column settings, or resizing.

### Low

- Object-form `plugins` has unclear ordering and can defeat row memoization when passed inline. `TableProps` accepts `Record<string, TablePlugin<T>> | TablePlugin<T>[]`; `useBaseTablePlugins` turns records into `Object.values(...)`. Consumers who care about plugin ordering need the array form, and inline records create a new plugins array that causes memoized rows to re-render. Document this or prefer one API shape.  
  `src/components/Table/Table.tsx:26`  
  `src/components/Table/useBaseTablePlugins.ts:4`

- Auto-generated columns can miss later-row fields. `generateColumns` builds columns from `Object.keys(data[0])`, so keys that only appear in subsequent rows are omitted. This is surprising for heterogeneous data and is untested.  
  `src/components/Table/columnUtils.ts:147`

- `TableCellProps.scope` is accepted but never forwarded. The prop is also invalid for the rendered `<td>` in most cases, so keeping it in the API is misleading.  
  `src/components/Table/TableCell.tsx:6`  
  `src/components/Table/TableCell.tsx:56`

- Number filter clear handling is unnecessarily indirect. `NumberFilterControl` passes `hasClear` and then conditionally spreads `{hasClear: false}` later, making the final behavior harder to read than `hasClear={hasClear}`.  
  `src/components/Table/plugins/filtering/useTableFiltering.tsx:250`

- Touch users cannot resize columns. Resize handles are hidden for coarse pointers, so the feature becomes keyboard/mouse-only on touch devices. If intentional, this should be documented in the resize API/story.  
  `src/components/Table/plugins/columnResize/useTableColumnResize.tsx:67`

## Category Notes

- Performance: main risks are stale row memoization and avoidable rerenders from inline object plugins/generated columns. No obvious expensive synchronous work beyond column inference and sorting was found.
- Accessibility: native table semantics are mostly preserved, sortable headers use buttons and `aria-sort`, and resize handles are keyboard reachable. Main issue is repeated row checkbox labels; table labelling relies on the `tableProps` escape hatch rather than a first-class prop.
- Logic bugs: no data-loss or crash-level bug found. The stale memo comparator and dropped plugin classes are the most concrete behavior bugs.
- API clarity: `BaseTable` vs `Table`, `emptyState={false}`, object-vs-array plugins, and `idKey` coercion would benefit from docs or JSDoc.

## Test Coverage Gaps

- Current public tests are concentrated in `src/components/Table/Table.test.tsx` and cover basic rendering, children mode, and one happy path for each plugin. The richer `XDS_src/Table/**.test.tsx` files target `XDSTable`, not the exported `src/components/Table` API.
- Missing tests for visual/context props: `density`, `dividers`, `isStriped`, `hasHover`, `verticalAlign`, and `textOverflow`.
- Missing tests for utilities and edge cases: `generateColumns`, `resolveColumnWidths`, `defaultCellRenderer`, and `paginateData`.
- Missing tests for state hooks: `useTableFilterState` and `useTableColumnSettingsState`.
- Missing plugin behavior tests: multi-sort and `allowUnsortedState`, custom sort comparators, disabled/non-selectable selection rows, select-all with frozen selected IDs, filter variants/operator types, combined filtering + resizing, column resize Home/End/Shift+Arrow, `emptyState={false}`, and `data={undefined}`.

## Stories/Docs Gaps

- No `Table.stories.*` file was found.
- No public docs file was found for `src/components/Table`; only `XDS_src/Table/Table.doc.mjs` exists for `XDSTable`.
- Stories should demonstrate at least: default table, empty/custom empty state, densities, divider modes, striped/hover rows, truncate vs wrap, vertical alignment, generated columns, custom `renderCell`, children mode, sorting including multi-sort, selection including disabled rows, pagination positions/variants, column settings, column resizing, filtering variants/operator types, and combined plugins.
