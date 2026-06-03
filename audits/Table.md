# Table Audit

## Summary

Table is a complex, plugin-based data table component supporting configurable density, dividers, hover, striping, text overflow, vertical alignment, sorting, selection, pagination, column settings, column resizing, and filtering. It is built on a `BaseTable` core with a flexible plugin architecture that transforms columns, header cells, body cells, body rows, and the overall table via composable hooks. This is the most complex component in the library.

## Issues

### Critical

- None

### High

- **Plugin error swallowing via `console.error`:** In `BaseTable.tsx`, plugin exceptions in `applyPlugins` and `transformTableContext` are caught and logged with `console.error`, then silently swallowed. While this prevents the entire table from crashing, it masks bugs during development. Consider at minimum rethrowing in development mode.

### Medium

- **`@js-temporal/polyfill` as a runtime dependency:** Both `columnUtils.ts` and `useTableSortableState.tsx` import `Temporal` from `@js-temporal/polyfill`. This is a large polyfill (~40KB+ minified). If most consumers do not use Temporal date types in their table data, this is unnecessary bundle weight. Consider lazy-loading or making this opt-in.
- **`isTouchDevice` in `useTooltip.tsx` is evaluated once at module load:** This is in the Tooltip component (used by Table filtering), but the touch device detection happens at module evaluation time. If the module is loaded during SSR or in an environment where `window.matchMedia` is not accurate at load time, this could be incorrect. This applies to Table filtering tooltips.
- **Selection plugin calls `store.notify()` on every render (no dependency array):** In `useTableSelection.tsx` line 214, `useEffect(() => { store.notify(); })` runs after every render without a dependency array. This means every parent re-render triggers all selection subscribers to re-evaluate, even if nothing changed. The `useSyncExternalStore` snapshot comparison mitigates re-renders downstream, but the notification itself is wasteful.
- **No ARIA live region or announcement for sort changes:** When a user clicks a sort button, the sort state changes and the table re-renders, but there is no ARIA live region to announce the sort change to screen reader users. The `aria-sort` attribute on the header cell is updated, but screen readers may not automatically announce this change.

### Low

- **`generateColumns` samples only the first 5 rows:** For auto-generated columns (when no `columns` prop is provided), the function samples up to 5 rows to estimate column proportions. For data with highly variable content, this may produce suboptimal widths. This is a reasonable default but should be documented.
- **`defaultCellRenderer` returns empty string for unsupported types silently:** Objects, arrays, and native `Date` instances are silently rendered as empty strings. This could be confusing if a consumer passes complex data without custom `renderCell` functions.
- **No story for `emptyState={false}` to suppress the empty state:** The `emptyState` prop accepts `false` to suppress the default "No data" message, but this is not demonstrated in stories.
- **TableFooter has no test coverage:** While `TableFooter` is a simple passthrough component, it has no dedicated test. It is used in the `ChildrenMode` story but not tested for prop forwarding.
- **Missing test for custom `idKey` function:** While `idKey` as a string is tested, `idKey` as a function (e.g., `(item) => item.id`) is not tested directly.
- **Column resize handles are hidden on touch devices via `@media (pointer: coarse)`:** This is intentional UX, but there is no alternative touch-based resize mechanism, meaning column resizing is not available on mobile/tablet devices.

## Recommendations

- Consider adding development-mode re-throw for plugin errors in `applyPlugins`.
- Evaluate whether the `@js-temporal/polyfill` import can be made lazy or optional to reduce bundle size for consumers who do not use Temporal types.
- Add an ARIA live region or `aria-live="polite"` announcement when sort state changes for better screen reader support.
- The test suite is exceptionally thorough, covering rendering, visual context props, cell overflow classes, divider behavior, children mode, plugin ordering, sorting with multi-sort and custom comparators, selection with external store optimization, pagination, column settings, column resize with keyboard/pointer/RTL, filtering with inline and popover variants, and all state management hooks. This is one of the best-tested components in the library.
