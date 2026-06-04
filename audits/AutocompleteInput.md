# AutocompleteInput Audit

## Summary

A search-as-you-type combobox for selecting a single item from a `SearchSource`. Composed of `BaseAutocompleteInput` (the core combobox engine), `AutocompleteInputItem` (default result row layout), and `AutocompleteInput` (the full field wrapper with label, tag, clear button). Also exports `createStaticSource` for simple in-memory search. The component is well-architected with clear separation of concerns.

## Issues

### Critical

- None.

### High

- **Swallowed search errors with no user feedback.** In `BaseAutocompleteInput.runSearch`, the `catch` block silently resets results and closes the menu. The user sees no indication that the search failed -- the menu simply disappears. For async search sources (e.g., API calls), this can be confusing. At minimum, the empty-results message should appear, or an `onError` callback should be exposed.
- **`pointerActiveRef` / `showMenu` race condition.** The `showMenu` function registers a one-time `click` event listener on `document` inside a `requestAnimationFrame` to defer menu opening. Meanwhile, `onPointerDown` on the input also registers a one-time `click` listener to reset `pointerActiveRef`. Both rely on the same `click` event, and the order of listener execution is not guaranteed. In edge cases (fast double-clicks, or pointer events without corresponding clicks on some touch devices), `pointerActiveRef` could get stuck as `true`, causing the menu to never open synchronously on subsequent focus events.

### Medium

- **Stale closure risk in `runSearch`.** `runSearch` captures `searchSource` via `useCallback` dependencies, but `searchSource` is an object reference. If the consumer creates a new `searchSource` on every render (common mistake), the generation check protects against stale results, but the `cancel()` call in the cleanup `useEffect` may call cancel on a stale source while the new source's search is in flight. This is mitigated by the generation counter but could still leak cancelled-but-not-really requests.
- **`AutocompleteInputItem` ignores most of its own props when `item.element` is set.** When `item.element` is non-null, the component returns `<>{item.element}</>`, completely ignoring `className`, `data-testid`, `description`, `icon`, `isDisabled`, `ref`, and `style` props. This silent discard could confuse consumers. At minimum, it should wrap the element in a container that applies the passthrough props, or document this clearly.
- **No `aria-required` on the combobox input.** Even when `isRequired` is true (passed through `FieldNecessity`), the combobox `<input>` does not receive `aria-required`. The `Field` component shows the "Required" indicator visually, but screen readers will not announce the input as required.
- **Missing test for `ref` forwarding on `AutocompleteInput`.** `AutocompleteInput` accepts a `ref` that is forwarded to the `Field` root (`HTMLDivElement`), but there is no test verifying this.
- **No loading/disabled story for selected state.** When a value is pre-selected and the component is disabled, the tag should still render. This is tested implicitly but not demonstrated in a story.

### Low

- **Debounce timer is not cleaned up on unmount in all paths.** The `useEffect` cleanup in `BaseAutocompleteInput` calls `clearTimeout` and `searchSource.cancel()`, which is correct. However, the `updateQuery` function sets a new timeout but does not update `timeoutRef` synchronously in a way that guarantees cleanup if the component unmounts between the `clearTimeout` and `setTimeout` calls. In practice this is unlikely to cause issues, but it is worth noting.
- **`BaseAutocompleteInput` renders a `<Spinner>` inline after the input when loading, separate from the loading state inside the menu.** This means two loading indicators can appear simultaneously (the inline spinner and the menu's loading row). Consider removing the inline spinner when the menu is open and showing loading.
- **`createStaticSource.search` performs a linear scan.** For very large item lists, this could be slow. Consider documenting the expected scale or offering a more efficient search option.
- **No story for `isLabelHidden`.** The prop is supported but not demonstrated.

## Recommendations

1. Add error handling feedback -- either show an error state in the menu, or expose an `onError` callback prop.
2. Review and simplify the `pointerActiveRef`/`showMenu` pattern. Consider using `event.type` checks or a simpler focus/click coordination approach.
3. Add `aria-required` to the `<input>` when `isRequired` is true.
4. Document that `item.element` bypasses `AutocompleteInputItem` props, or change the behavior to apply wrapper props.
5. Add a ref-forwarding test for `AutocompleteInput`.

## SVA Conversion

**Benefit: Strong**

The combobox styling concentrates in `BaseAutocompleteInput.tsx`, which renders many distinct styled elements (input, menu listbox, option `<button>`, check `<span>`, loading row, empty state) via a standalone `const styles` object of ~10 css() blocks, including a size sub-map `optionSize: {sm, md, lg}` and per-option `cx()` conditionals (`optionHighlighted`, `optionSelected`, `optionSize[size]`). `AutocompleteInput.tsx` adds its own wrapper/tag/inputHidden/clearButton css() blocks layered onto the shared `inputRecipe`, and `AutocompleteInputItem.tsx` has a 4-block styles object with an `isDisabled` conditional. An `sva` recipe (slots input/menu/option/check/loading/empty) with a `size` variant and `isHighlighted`/`isSelected` boolean variants would fold the manual `optionSize` map and the highlighted/selected `cx()` branches into proper recipe variants.
