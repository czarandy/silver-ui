# TagsInput Audit

## Summary

Multi-select combobox that renders selected values as removable tags. Built on `BaseAutocompleteInput` for search/dropdown functionality. Supports create-from-text, max entries limit, clear-all, overflow truncation (none, unfocusedInline, unfocusedLayer), custom tag and item renderers, async search sources, and imperative focus/blur via `handleRef`. Uses shared `Field` wrapper.

## Issues

### Critical

- None.

### High

- **Creatable item type assertion is unsafe.** At line 386-389, the code creates a "creatable" placeholder item by casting an ad-hoc object `as T`. The generic `T extends SearchableItem` may require additional properties that this cast silently ignores. If a consumer uses `TagsInput<MyCustomItem>` where `MyCustomItem` has required fields beyond `id`/`label`/`auxiliaryData`, this cast produces an incomplete object that will pass type checking but may cause runtime errors when the consumer accesses those fields. Consider requiring a `createItem` callback prop for creatable mode instead of the unsafe cast.

### Medium

- **`filteredSource` has stale closure risk.** The `filteredSource` useMemo (line 362) captures `searchSource` in its dependency array but accesses `selectedIDsRef` and `isAtMaxRef` via refs. This is intentional (to avoid recreating the source on every value change), but if `searchSource` changes identity frequently (e.g., inline object in parent), the memoized source will be recreated anyway. Document that `searchSource` should be stable (memoized by the caller).
- **`handleWrapperPointerDown` registers a global document click listener.** At line 462-466, a one-time `click` event listener is added to `document` with `requestAnimationFrame` to focus the input. This works but has subtle issues: (1) if the user pointer-downs but does not complete a click (drag away), the listener persists until the next click anywhere in the document, which will unexpectedly focus the input; (2) multiple rapid pointer-downs could register multiple listeners.
- **No story for `isReadOnly`.** The `isReadOnly` prop prevents typing and hides the clear button, but there is no story demonstrating this state.
- **No story or test for `handleRef` imperative handle.** The `handleRef` prop exposes `focus()` and `blur()` methods but neither stories nor tests exercise this.
- **No test for `onFocus`/`onBlur` callbacks.** The component accepts `onFocus` and `onBlur` props and manages focus-within state, but no test verifies these callbacks fire correctly.
- **Announcements for screen readers use a two-frame trick.** The `announce` function (line 413) clears the announcement text and then sets it in a `requestAnimationFrame`. This is a common workaround for ARIA live regions, but it can be unreliable if `requestAnimationFrame` fires before the DOM update from the state clear is committed. A more robust approach is to toggle between two live regions.

### Low

- **No recipe file.** All styles are inline `css()` calls. Consistent within the component.
- **Wrapper content wrapped in unnecessary `<>...</>` fragment.** Line 487 wraps `wrapperContent` in an empty fragment (`<> ... </>`). The fragment contains only one child (the div), making it unnecessary.
- **`popoverOverrideStyle` sets `positionArea: undefined`.** Line 616 explicitly sets `positionArea` and `positionTryFallbacks` to `undefined`. Setting CSS properties to `undefined` in React's style prop is a no-op (it removes the property), so this is intentional but reads oddly. A comment explaining why these are overridden would help.
- **No test for `renderTag` custom rendering.** The `renderTag` prop allows custom tag rendering but no test verifies it.
- **No test for `endContent` rendering.** The `endContent` prop renders trailing content but is untested.
- **No test for `startIcon` rendering.** Demonstrated in stories but not tested.
- **No test for `onQueryChange` callback.** This prop is passed to `BaseAutocompleteInput` but untested.

## Recommendations

1. Replace the unsafe `as T` cast for creatable items with a `createItem?: (query: string) => T` callback prop that lets the consumer construct a properly-typed item.
2. Add tests for `handleRef`, `onFocus`/`onBlur`, `renderTag`, and `onQueryChange`.
3. Add a story for `isReadOnly` mode.
4. Document that `searchSource` should be a stable/memoized reference to avoid unnecessary source recreation.
5. Consider replacing the global document click listener pattern with a more controlled focus management approach.

## SVA Conversion

**Benefit: Moderate**

TagsInput renders many styled elements (the input wrapper, tag span, hidden input, end content, overflow "+N more" text, live region, layer popover) but most are wired through the shared `inputRecipe`/`inputStyles` from Field plus a large local `const styles = {...}` object in `TagsInput.tsx` (~14 `css()` blocks). The local styles include size-keyed maps (`wrapperWithTagsSize[size]`, `truncatedSize[size]`) and several `cx()` conditional branches (`isTruncated`, `value.length > 0`, `isAtMax`) applied to the wrapper and input. An `sva` could consolidate the wrapper/input/tag/overflowText/liveRegion slots and express the `size` plus truncated/hasTags states as variants and compoundVariants, removing the manual size-map lookups and conditional `cx` plumbing. Benefit is tempered because the visual chrome (border, focus, status colors) is owned by Field's `inputRecipe` rather than this component, so an sva here would mostly cover layout adjustments layered on top rather than the core input styling.
