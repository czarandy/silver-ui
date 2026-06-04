# FileInput Audit

## Summary

A file input supporting both inline input and drag-and-drop dropzone modes. Uses a discriminated union type for single (`File | null`) vs. multiple (`File[]`) file selection. Includes client-side validation for accepted file types, max file size, and max file count. Renders within a `Field` wrapper with label, description, and validation status.

## Issues

### Critical

- None.

### High

- **Accessible name conflict between the button role and the hidden file input.** The outer `<div>` has `role="button"` and the hidden `<input type="file">` is a separate interactive element. Both are linked to the same label via `inputId`. The `<label>` targets the hidden file input, but the visible button-role div is not properly labeled. Screen readers may announce the button without a name, or the label click may target the hidden input while the button div is the visually apparent control. Consider using `aria-labelledby` on the button div to reference the Field label, or restructuring so the `<label>` wraps the button div.
- **`aria-describedby` is duplicated on both the outer div and the hidden input.** Both elements have `aria-describedby={describedBy}`, which means screen readers will announce the description twice if both elements are in the accessibility tree. Since the hidden input is visually hidden but still focusable, this is a real concern.

### Medium

- **Validation errors from file selection override external `status` prop.** The component computes an internal `validationError` state and uses it as the status if `statusFromProps` is not set. But `statusFromProps` always takes precedence when set. This means: if an external status prop says "File is required" (error) and the user then selects an oversized file, the internal validation error is silently swallowed because the external status wins. Consider merging or surfacing both.
- **Validation error state is never cleared on successful file selection.** When `handleFiles` is called and `result.error` is null, it calls `setValidationError(null)`. This is correct. However, if the user selects an invalid file (error shown), then clicks the clear button, `handleClear` clears the validation error. But if the user selects another invalid file, the error updates. The issue is that `handleClear` resets `validationError` to null -- if the consumer has an external status, the error disappears even though the field is now empty and potentially still invalid.
- **`handleFiles` and `handleClear` use type assertions for `onChange`.** The code casts `onChange` as `(files: File[]) => void` or `(file: File | null) => void` depending on `isMultiple`. While the discriminated union type makes this safe at the type level, the assertions bypass TypeScript's flow analysis. A cleaner approach would use a helper or conditional structure.
- **No test for drag-and-drop with valid files.** The test for disabled dropzone verifies `onChange` is NOT called, but there is no test verifying drag-and-drop actually works with valid files in a non-disabled state.
- **No story for `maxSize` or `maxFiles`.** These validation features are tested but not demonstrated in stories.
- **Dropzone mode does not show the status icon.** The condition `status != null && !isDropzone` explicitly excludes the status icon in dropzone mode. The status message still appears (via Field), but the inline icon is hidden. This may confuse users who see an error message without the corresponding error icon in the dropzone.

### Low

- **Clear button is always visible when a file is selected, regardless of `isLoading`.** Unlike `DateInput` which hides the clear button during loading, `FileInput` always shows it. This is inconsistent.
- **`tabIndex={isDisabled ? -1 : 0}` on the div, but the hidden input can also receive focus.** Two focusable elements for one logical control can cause confusing tab behavior. Keyboard users may tab through the button div and then the hidden input.
- **No story for `isLabelHidden`.** Supported via Field but not demonstrated.
- **No story for `labelIcon` or `labelTooltip`.** Inherited from Field but not shown.
- **`event.currentTarget.value = ''` after file selection.** This is a common pattern to allow re-selecting the same file, but it should be documented as intentional behavior.
- **No ref forwarding test.**

## Recommendations

1. **Fix the accessible name issue** by adding `aria-label` or `aria-labelledby` on the `role="button"` div, and removing the duplicate `aria-describedby` from one of the two elements.
2. Add drag-and-drop integration test for valid file drops.
3. Add stories for `maxSize`, `maxFiles`, and dropzone with validation errors.
4. Consider merging internal validation errors with external status props, or documenting the precedence behavior.
5. Address the double-focusable-element issue by making the hidden input `tabIndex={-1}` (it is already triggered programmatically).

## SVA Conversion

**Benefit: Strong**

`FileInput.tsx` renders a multi-element control: the clickable surface (`div role="button"`), a hidden `input`, an upload icon span, the filename `Text`, a clear `button`, and a status-icon span. Styling currently lives in an 8-block standalone `css()` object (`surface`, `dropzone`, `disabled`, `active`, `hiddenInput`, `fileName`, `icon`, `clearButton`) composed onto elements via long `cx()` chains with per-element conditional branches (`isDropzone ? styles.dropzone : inputRecipe(...)`, `isDisabled ? styles.disabled`, `isDragOver ? styles.active`). The relevant states/variants are `mode` (input vs dropzone), `size`, `status`, `isDisabled`, and drag-over — currently applied as runtime ternaries rather than recipe variants. An `sva` with slots like `surface`/`hiddenInput`/`icon`/`fileName`/`clearButton` and variants for `mode`/`size`/`status`/`isDisabled`/`isDragOver` (with compoundVariants for dropzone+state) would consolidate all of this into one recipe, mirroring the Divider migration.
