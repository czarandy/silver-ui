# TreeView Audit

## Summary

TreeView renders a hierarchical tree of expandable and selectable items with full WAI-ARIA tree pattern compliance (roving tabindex, arrow key navigation, type-ahead, Home/End). It supports action items (buttons), link items (anchors), descriptions, start/end content, density variants, and visual branch connector lines. The expansion state is semi-controlled: `isExpanded` in the data provides initial state, and user interactions create overrides tracked in component state.

## Issues

### Critical

- None

### High

- None

### Medium

- **`collectExpandedKeys` and `collectVisibleItems` are called on every render with new items:** These recursive functions are called inside `useMemo` with `[items]` as the dependency. Since `items` is an array prop that is often recreated on every parent render (inline array literals), these expensive recursive scans will run on every render unless consumers memoize their `items` prop. The JSDoc comment on `items` warns about this, but it is still a performance concern for large trees.
- **`registerItem` creates a new callback on every call:** The `registerItem` function (line 243) returns a new closure for each item ID on every render. While the function itself is stable (wrapped in `useCallback` with `[]` deps), the returned closure is not memoized. This means every `TreeViewItem` receives a new `ref` callback on every render, which triggers the ref cleanup/attach cycle. This is a minor performance issue for large trees.
- **No controlled expansion API:** The tree only supports semi-controlled expansion through `isExpanded` on initial data plus internal override state. There is no `onExpandChange` callback or way to fully control expansion from outside the component. Consumers who need to programmatically expand/collapse nodes or sync expansion state with external storage cannot easily do so.
- **Disabled parent items cannot be expanded but the UI does not communicate this clearly:** When a parent item is disabled, clicking it does not expand its children (verified in tests). However, the expand/collapse chevron is still visible, which could confuse users. The chevron should either be hidden or visually dimmed for disabled parent items.

### Low

- **Branch connector lines use absolute positioning that may misalign at extreme zoom levels:** The branch lines use `calc(${branchOffset} + ${level} * 16px)` for positioning. At very high zoom levels or with non-standard font sizes, these pixel-based calculations may not align perfectly with the tree item content.
- **No test for `ariaLabel` prop on items with non-string labels:** While the `ariaLabel` prop is defined in the types and used in `getTextLabel`, there is no test verifying it works correctly for items with ReactNode labels.
- **No story for `ariaLabel` prop:** The `ariaLabel` prop is not demonstrated in any story.
- **`_isLast` is destructured but unused in `TreeViewItem`:** The `isLast` prop is received as `_isLast` (line 279) and never used within `TreeViewItem`. It is only used in the parent's `renderItems` to compute `childAncestorsIsLast`. While this is intentional (the prop is passed for potential future use or extension), the unused destructured variable is a code cleanliness issue.
- **No test for `style` prop forwarding:** While `className` and `ref` are tested, the `style` prop forwarding to the root element is not tested.
- **Type-ahead navigation only matches the first character:** The type-ahead implementation (lines 330-345) matches a single character typed. Multi-character type-ahead (buffering characters within a timeout) is not supported, which is inconsistent with some other tree implementations but is compliant with the WAI-ARIA tree pattern minimum.

## Recommendations

- Consider adding an `onExpandChange` callback to support controlled expansion use cases.
- Add visual indication (dimming or hiding the chevron) for disabled parent items that cannot be expanded.
- Consider memoizing the `registerItem` return value per item ID to avoid unnecessary ref callback churn.
- Add tests for `ariaLabel` with non-string labels and `style` prop forwarding.
- The test suite is thorough, covering tree rendering, header association, descriptions/content slots, expansion/collapse (both click and keyboard), roving tabindex, full keyboard navigation (arrows, Home/End, type-ahead), focus visibility, link items, disabled items, selected items, deep nesting, density variants, prop forwarding, and the separation between item click and child toggle.
