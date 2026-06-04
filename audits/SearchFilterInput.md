# SearchFilterInput Audit

## Summary

SearchFilterInput is a complex structured search control where each tag represents a field/operator/value filter. It is composed of 10+ files: the main component, an edit popover, a value editor (supporting 13+ value types), a tag renderer, a search source builder, types, format utilities, config helpers, and an internal config cache. The component supports string, number, boolean, date (absolute/relative/range), enum, enum list, entity list, string list, custom, and nested filter types. It builds on `TagsInput`, `AutocompleteInput`, `Popover`, `Select`, `DateInput`, `TimeInput`, `NumberInput`, and `TextInput`.

## Issues

### Critical

- None

### High

- **`onEnter` prop is accepted but silently unused in `SearchFilterInputValueEditor`**: At line 635 of `SearchFilterInputValueEditor.tsx`, the `onEnter` prop is consumed via a bare `void onEnter;` statement, meaning it is never actually wired up to any input's Enter key handler. The `SearchFilterInputEditPopover` passes `onEnter={handleSave}` (line 628), expecting that pressing Enter in the value editor would save the filter. Instead, the Enter key is only handled by the popover-level `onKeyDown` handler (line 570-584), which works but is a separate mechanism. This means the `onEnter` prop on `SearchFilterInputValueEditor` is dead code.

### Medium

- **`syncToParent` in `NestedEditor` references stale `partialFilter`**: In `SearchFilterInputEditPopover.tsx` at line 335-357, `syncToParent` is a `useCallback` that depends on `partialFilter`. However, it is called inside `setSubFilters` state updater callbacks. Because `setSubFilters` uses the functional updater form, it always has the latest `subFilters`, but `syncToParent` captures `partialFilter` from the render when the callback was created. If `partialFilter` changes between renders, `syncToParent` may use a stale value. This could cause the parent to receive outdated field/operator info when sub-filters are rapidly modified.
- **No recipe file for any of the SearchFilterInput sub-components**: All styling uses inline `css()` calls. Given the complexity of this component, extracting styles into recipe files would improve maintainability and consistency.
- **`handleTagClick` is not wrapped in `useCallback`**: The `handleTagClick` function (lines 354-371 in `SearchFilterInput.tsx`) is defined as a regular function inside the component body. It references `isReadOnly`, `isDisabled`, `filters`, and `openEditor`, so it is recreated on every render. Since it is passed as an event handler to tags, this causes tag re-renders.
- **`renderTag` and `renderItem` are not memoized**: Both `renderTag` (line 373) and `renderItem` (line 460) are defined as plain functions inside the component body. They capture multiple closures and are passed to `TagsInput`. If `TagsInput` memoizes its children based on prop identity, these would defeat that memoization.
- **Tag ID uses array index, which is unstable**: The tag `id` at line 264 is `filter-${index}-${filter.field}-${filter.operator}`. When filters are removed from the middle, all subsequent filter indices shift, changing their IDs. This can cause React to incorrectly re-use DOM nodes or break animation transitions.
- **Tests are largely render-only, missing interaction tests**: The test file tests rendering, prop forwarding, and static output, but does not test the core interactive flows: adding a filter via the combobox, editing a filter by clicking a tag, removing a filter via the tag close button, or the edit popover save/cancel/delete flow. These are the most important behaviors to test.
- **`formatFilterValue` unused first parameter**: The `_config` parameter (line 20 of `formatFilterValue.ts`) is unused (prefixed with underscore). It was likely intended for future use but currently adds confusion.

### Low

- **`SearchFilterInputTag` calls `useInternalSearchFilterInputConfig` on every render**: The `SearchFilterInputTag` sub-component (line 52 of `SearchFilterInputTag.tsx`) wraps the public `config` in the internal config helper via a hook, which creates a new `useMemo` computation per tag. If there are many tags, this results in many memo computations with the same input config. The parent could pass the already-computed internal config instead.
- **No story for `components` (custom tag/editor overrides)**: The `components` prop for custom tag and editor rendering is a key extension point but has no story demonstrating it.
- **No story for `handleRef` (imperative focus)**: The `handleRef` prop for imperative focus/blur control has no story.
- **No story for `onBlur`/`onFocus` callbacks**: These event handlers are accepted but not demonstrated in stories.
- **`timezoneID` prop not demonstrated in stories**: While the prop exists and is threaded through to date formatters, there is no story showing timezone-aware behavior.
- **`popoverSaveButtonLabel` only tested implicitly**: The custom save button label prop is not tested or demonstrated.
- **`Intl.NumberFormat` called without locale**: The `resultCount` formatter at line 538 uses `new Intl.NumberFormat()` without specifying a locale, defaulting to the browser locale. This is fine for most cases but could produce unexpected results in SSR.
- **`resolveRangePart` uses approximate month/year durations**: The `RELATIVE` range part uses `month = 2592000` (30 days) and `year = 31536000` (365 days), which are approximations. Leap years and varying month lengths are not accounted for. This is acceptable for a filter UI but worth documenting.

## Recommendations

1. Wire up the `onEnter` prop in `SearchFilterInputValueEditor` or remove it from the interface to avoid dead code confusion.
2. Add integration tests for the core interactive flows: adding a filter, editing a filter, removing a filter, and the save/cancel/delete actions in the edit popover.
3. Consider using stable IDs for filter tags (e.g., based on field+operator+value hash) rather than array indices.
4. Wrap `handleTagClick`, `renderTag`, and `renderItem` in `useCallback`/`useMemo` to prevent unnecessary re-renders.
5. Fix the stale closure in `syncToParent` by using a ref for `partialFilter` or restructuring the callback.
6. Add stories for `components`, `handleRef`, `timezoneID`, and `onBlur`/`onFocus` to improve documentation coverage.
7. Despite these issues, the component is impressively comprehensive: it supports 13+ filter value types, nested filters, custom editors/tags, entity photos, combobox aliases, content search, and a well-structured configuration system. The type safety through discriminated unions is excellent.

## SVA Conversion

**Benefit: Low / None**

SearchFilterInput is primarily a composition/orchestration component that delegates its visuals to `TagsInput`, `Popover`, `Field`, and the dedicated editor/tag sub-components. Its own `styles` object in `SearchFilterInput.tsx` is just five small, variant-free atomic helpers (entityPhoto, root, popover, resultCount, value) applied directly with no conditional branching. The companion `SearchFilterInputEditPopover.tsx` has more `css()` blocks, but they are layout-shell styles for the popover/nested-filter editor with no shared variant axis. There are no multi-element styled clusters with duplicated size/orientation/state variants that an `sva` recipe would consolidate, so slot recipes offer little here.
