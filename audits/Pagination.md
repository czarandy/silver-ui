# Pagination Audit

## Summary

Pagination provides page navigation controls with four display variants: numbered pages, count summary, compact label, and none (arrows only). It supports known total pages, derived totals from item counts, and unknown totals with a `hasMore` flag. The component uses the `Button` component internally for all interactive controls.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **`onChange` can fire with out-of-bounds values in edge cases**: The `handlePageChange` function passes `newPage` directly to `onChange` without clamping. When a user clicks "next" on the last page, the handler is technically protected by the `isDisabled || !hasNext` check on the button, but if `onChange` is called programmatically or props change between render and click, the value could exceed bounds. Consider clamping in `handlePageChange`.
- **`count` variant does not work with `totalPages` (only `totalItems`)**: When using `variant="count"`, if only `totalPages` is provided (without `totalItems`), the count variant renders `null` because it checks `totalItems == null`. This is not documented and could confuse consumers who provide `totalPages` and expect to see a count display.
- **No keyboard navigation between page buttons**: Unlike tabs, there is no arrow key navigation between page buttons. Users must Tab through each page button individually, which can be slow for large page ranges. Consider adding `role="navigation"` (already present) with grouped keyboard navigation.

### Low

- **No recipe file**: Like Breadcrumbs, Pagination uses inline `css()` calls instead of a `cva` recipe, which is inconsistent with many other components in the library.
- **`generatePageRange` is not memoization-safe for all call sites**: The function is called inside `useMemo` which is correct, but the algorithm could generate arrays with duplicate `'...'` entries in theory (it doesn't currently due to the logic guards, but the key generation using adjacent pages is fragile).
- **Ellipsis elements are not semantically grouped**: The `...` spans use `aria-hidden="true"` which is correct, but they have no semantic meaning. Some implementations wrap page buttons in a `<ul>` with `<li>` items for better screen reader experience.
- **No story for single page**: There is no story showing the component when `totalPages={1}`, which would help document that prev/next are both disabled in that case.
- **Missing `data-testid` in stories**: None of the stories use `data-testid`, which is fine for visual stories but reduces their utility as integration test references.

## Recommendations

- Add validation or clamping inside `handlePageChange` to guard against out-of-bounds page values.
- Document that `variant="count"` requires `totalItems` (not just `totalPages`).
- Consider adding a single-page story and an edge case story for `totalItems` with `variant="count"` where `totalPages` is used instead.
- Test coverage is excellent with 20 tests covering: landmarks, page buttons, current page marking, onChange callbacks, boundary disabling, all variants (count, compact, none), totalItems derivation, siblingCount, clamping, keyboard activation, ref/className/style forwarding, prev/next buttons, custom labels, and data-testid.
- Story coverage is good with 10 stories covering default, all variants, sizes, disabled, unknown total, many pages, custom sibling count, and controlled usage.
