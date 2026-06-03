# List Audit

## Summary

List is a semantic vertical list container that supports ordered/unordered lists, list markers (disc, circle, decimal), dividers, headers, and interactive items. It uses a context-based architecture with `ListContext` to pass styling configuration down to `ListItem` children, which are built on the shared `Item` primitive.

## Issues

### Critical

- None

### High

- None

### Medium

- **Marker is always rendered even when `listStyle` is `'none'`:** In `ListItem`, the `Marker` component is always passed as `leadingContent` to `Item`, even when the list style is `'none'`. The `Marker` function returns `null` for the `'none'` case, so no visible marker is rendered. However, passing it as `leadingContent` may still affect layout spacing in the `Item` component. It would be cleaner to conditionally pass `leadingContent` only when `listStyle !== 'none'`.
- **`ListContext` uses `createContext` (React 18 pattern) but `ListItem` uses `use()` (React 19 pattern):** This mixing works in React 19 but the context is created with `createContext` from React rather than being defined with the newer pattern. The `use()` call in `ListItem` is fine but differs from the `MetadataList` pattern which defines a custom `useMetadataList` hook. Being consistent across components would improve maintainability.

### Low

- **`counterReset` style is applied even for `disc` and `circle` markers:** The `withCounter` class (which sets `counterReset: 'silver-list'`) is applied whenever `listStyle !== 'none'`, including for `disc` and `circle` markers. While this is harmless (disc/circle markers use CSS pseudo-elements, not counters), it is unnecessary for non-decimal list styles.
- **No recipe file:** Unlike most other components in the library, List does not have a `.recipe.ts` file. Styles are defined inline. This is fine for simpler components but differs from the codebase convention seen in Tag, Text, etc.
- **Test for "renders disc markers by default" is misleading:** The test at line 89 is named "renders disc markers by default" but it does not set `listStyle="disc"` -- it uses the actual default (`'none'`). The test merely verifies the list is rendered, which does not validate marker rendering. This test name should be corrected.
- **No test for `header` accessibility association via `aria-labelledby`:** While the test at line 25 checks that a named list is found, it could more explicitly verify the `aria-labelledby` attribute is set on the list element pointing to the header element.

## Recommendations

- Fix the misleading test name "renders disc markers by default" to accurately reflect what it tests.
- Consider conditionally passing `leadingContent` in `ListItem` only when the list style requires a marker.
- Add a test verifying that visual markers are actually rendered for `disc`, `circle`, and `decimal` list styles (e.g., checking for the marker DOM elements).
- Story coverage is good, with stories for all marker styles, dividers, headers, clickable/link items, disabled/selected states, custom start values, and long content.
