# TimeInput Audit

## Summary

Time picker input field using the native `<input type="time">` element with Temporal API (`Temporal.PlainTime`) for value representation. Supports optional seconds granularity, min/max constraints, step increments, clear button, loading state, and validation status. Uses the shared `Field` wrapper and `inputRecipe` styles.

## Issues

### Critical

- None.

### High

None

### Medium

- **Extremely sparse test coverage.** The test file has only 2 tests: one for basic onChange and one for clearing. There are no tests for: `hasSeconds`, `hasClear` button, `min`/`max` constraints, `step` prop, `isDisabled`, `isLoading`, `status` (aria-invalid), `description` (aria-describedby), `isLabelHidden`, `ref` forwarding, `size` variants, `isRequired`/`isOptional`, `labelTooltip`, `labelIcon`, `hasAutoFocus`, `htmlName`, `placeholder`, `className`, `style`, `data-testid`, or the clock icon rendering. This is by far the least tested component in this batch.
- **`placeholder` prop may not work as expected.** The `<input type="time">` in most browsers ignores the `placeholder` attribute entirely, as the browser provides its own time-entry UI. The prop defaults to `'Select a time'` but will likely never be visible. This could mislead consumers into thinking the placeholder is rendered.
- **No `onBlur`/`onFocus` callbacks.** Unlike `TextInput` and `TextArea`, `TimeInput` does not accept `onBlur` or `onFocus` event handlers. This limits consumer ability to implement validation-on-blur patterns.
- **No `startIcon` prop for customization.** The clock icon is hardcoded (line 215). Unlike `TextInput` and `TextArea` which accept a `startIcon` prop, `TimeInput` always shows the clock icon with no way to override or hide it.
- **Native time picker indicator is hidden but no custom picker provided.** Line 24-26 hides the native webkit calendar picker indicator via CSS, but no custom time picker UI is provided. Users must type the time manually or use their browser's fallback input method. On non-webkit browsers, the native picker may still appear. This creates an inconsistent cross-browser experience.

### Low

- **No recipe file.** Styles are minimal (just the webkit calendar picker suppression). Using shared `inputRecipe` and `inputStyles`.
- **No test for `data-testid` passthrough.**
- **No test for `ref` forwarding.**
- **No `onKeyDown` handler.** Unlike TextInput which supports `onEnter` and `onKeyDown`, TimeInput does not expose keyboard event hooks.
- **`step` prop defaults to `60` when `hasSeconds` is false and `1` when true.** This is correct behavior for `<input type="time">` (step is in seconds), but the prop's JSDoc says "Step increment in seconds for the time picker" which is accurate. However, the interaction between `step` and `hasSeconds` is not obvious and should be documented more clearly.
- **Clock icon color is not customizable.** The clock icon uses the default `Icon` color (no explicit color prop), unlike other components that use `color="secondary"`. This may result in a slightly different visual weight compared to icons in TextInput or TextArea.
- **`toInputString` called multiple times per render.** The functions `toInputString(value, hasSeconds)` and `toInputString(min/max, hasSeconds)` are called inline during render. These are cheap string operations, but could be memoized if performance ever becomes a concern.

## Recommendations

1. Significantly expand test coverage. At minimum add tests for: `hasClear` button, `isDisabled`, `isLoading` (aria-busy + spinner), `status` (aria-invalid), `hasSeconds`, `ref` forwarding, and `data-testid`.
2. Either remove the `placeholder` prop or document that it may not be visible in browsers with native time input UI.
3. Consider adding `onBlur`/`onFocus` callbacks for parity with other input components.
4. Document the `step`/`hasSeconds` interaction in JSDoc or stories.
5. Consider whether hiding the native time picker indicator is desirable without providing an alternative UI.
