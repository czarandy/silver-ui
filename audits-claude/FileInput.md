# FileInput Component Audit

**Files reviewed:**

- `src/components/FileInput/FileInput.tsx`
- `src/components/FileInput/FileInput.stories.tsx`
- `src/components/FileInput/FileInput.test.tsx`
- `src/components/FileInput/index.ts`

**Missing files:**

- No `.recipe.ts` file exists. The component uses inline `css()` calls instead of the `cva` recipe pattern used by Button and other components.

---

## Performance Problems

### 1. `styles` object is module-level (no issue)

- **File:** `FileInput.tsx`, lines 52-130
- The styles object is created once at module scope via `css()`. This is correct and efficient.

### 2. `handleFiles` callback is recreated on every render

- **File:** `FileInput.tsx`, lines 237-253
- The `handleFiles` function is defined inline in the component body and closes over `isDisabled`, `accept`, `isMultiple`, `maxFiles`, `maxSize`, and `onChange`. It is recreated on every render. If the surface `div` or `input` were memoized children, this would defeat memoization. In practice this is unlikely to cause a measurable performance issue for this component, but wrapping in `useCallback` would be more correct if the component grows.

### 3. `dragProps` object is recreated on every render

- **File:** `FileInput.tsx`, lines 255-279
- The drag event handlers are allocated in a new object every render. This is a minor concern for the same reasons as above. Wrapping in `useMemo` would prevent unnecessary object allocations when `isDropzone` is false (the common case), since the empty `{}` object is also recreated each time.

**Verdict:** No meaningful runtime performance issues for a file input component. The inline allocations are standard React patterns and unlikely to cause problems at this scale.

---

## Accessibility Concerns

### 1. Missing `aria-invalid` on the hidden input

- **File:** `FileInput.tsx`, lines 321-336
- The `<input type="file">` does not set `aria-invalid` when the status is `error`. The sibling `TextInput` component sets `aria-invalid={status?.type === 'error' || undefined}` on its input (TextInput.tsx, line 180). This inconsistency means screen readers will not announce the error state on the file input.

### 2. The clickable `div` surface uses `role="button"` but the hidden `<input>` is the real form control

- **File:** `FileInput.tsx`, lines 296-320
- The component renders a `<div role="button" tabIndex={0}>` that wraps a visually hidden `<input type="file">`. Both elements are in the tab order (the div via `tabIndex={0}`, the input because it is not `tabIndex={-1}`). This creates a **double tab stop**: users must press Tab twice to get past the FileInput. The hidden input should have `tabIndex={-1}` since all keyboard interaction is handled by the wrapping div's `onKeyDown`.

### 3. The `div[role="button"]` surface lacks an accessible name

- **File:** `FileInput.tsx`, lines 296-320
- The `<div role="button">` does not have an `aria-label` or `aria-labelledby` pointing at the Field's label. Screen readers will announce it as "button" without context. Consider adding `aria-labelledby={inputId + '-label'}` or `aria-label={label}` to the surface div to give it an accessible name. Alternatively, you could use `aria-labelledby` pointing to the `<label>` element rendered by `<Field>`.

### 4. Clear button is not hidden when `hasClear` is false but a file is selected

- **File:** `FileInput.tsx`, lines 350-362
- The clear button is shown whenever `fileNames != null`, regardless of the `hasClear` prop. The `hasClear` prop is declared in the interface (line 32) but never read in the component body. This means the clear button always appears when a file is selected, and the `hasClear` prop is a dead prop that does nothing. If the intention is to let consumers hide the clear button, the condition on line 350 should also check `hasClear !== false`.

### 5. Drag-and-drop area has no `aria-dropeffect` or accessible announcement

- **File:** `FileInput.tsx`, lines 255-279
- When `mode='dropzone'`, the component supports drag and drop, but there is no ARIA attribute to indicate that the region accepts drops. While `aria-dropeffect` is deprecated in ARIA 1.1, a live region announcement when `isDragOver` changes to `true` would help screen reader users understand that a file is being dragged over the target.

### 6. `onDrop` does not check `isDisabled`

- **File:** `FileInput.tsx`, lines 273-277
- The `onDrop` handler calls `handleFiles(...)` without checking `isDisabled`. While `handleFiles` has an early return for `isDisabled` (line 239), the `setIsDragOver(false)` call still runs, and more importantly the visual `active` style will have been applied during the drag (since `onDragOver` does check `isDisabled`, but `onDragEnter` sets `isDragOver` even if the guard was added). The `onDrop` should also guard against disabled state for consistency, and the `isDragOver` visual feedback should not appear when disabled.

---

## Logic Bugs

### 1. `hasClear` prop is declared but never used

- **File:** `FileInput.tsx`, line 32 (declaration), lines 196-218 (destructuring absent)
- The `hasClear` prop is in the `FileInputProps` interface but is never destructured or referenced in the component function. The clear button always renders when a file is selected. This is a dead prop that will confuse consumers. Either implement the behavior (conditionally render the clear button based on `hasClear`) or remove the prop from the interface.

### 2. Validation error is not cleared when `statusFromProps` is provided

- **File:** `FileInput.tsx`, lines 222-227
- When `statusFromProps` is provided, it takes precedence over `validationError` (line 223). However, if the user first triggers a validation error (e.g., oversized file) and then the parent provides a `statusFromProps`, the internal `validationError` state is never cleared. If `statusFromProps` is later removed (set to `undefined`), the stale validation error will reappear even if the user has since selected a valid file. The `validationError` should be cleared when `statusFromProps` is provided, or when `value` changes.

### 3. Validation silently accepts valid files alongside rejected ones

- **File:** `FileInput.tsx`, lines 141-163 (accept validation)
- When some files pass the `accept` filter and some do not, the function returns only the valid files plus an error message. The `handleFiles` function then calls `onChange` with the valid subset. This means the consumer receives files silently filtered down without knowing which files were rejected. While an error message is shown, the consumer's `onChange` is called with a partial set, which may be surprising. Consider whether this should reject the entire batch or provide more detailed error information.

### 4. `maxSize` validation stops at the first oversized file

- **File:** `FileInput.tsx`, lines 164-173
- The `maxSize` check uses `.find()` to locate the first oversized file and reports its name in the error message. But the filter on line 170 removes all oversized files. If multiple files exceed the limit, only the first one is mentioned in the error. This is a minor UX issue but could confuse users who uploaded multiple oversized files.

### 5. `event.currentTarget.value = ''` resets the native input after every selection

- **File:** `FileInput.tsx`, line 331
- After `handleFiles`, the native input's value is cleared. This is actually correct behavior -- it allows re-selecting the same file -- but it means the native input never reflects the current selection. Since the component is fully controlled via the `value` prop, this is fine but worth noting.

---

## Unclear API

### 1. `onChange` signature varies by `isMultiple` -- returns `File | File[] | null`

- **File:** `FileInput.tsx`, line 44
- When `isMultiple` is true, `onChange` is called with `File[]`. When false, it is called with a single `File`. The union return type `File | File[] | null` forces consumers to narrow the type at every call site. Consider using a discriminated union via overloads or separate `onChangeSingle` / `onChangeMultiple` callbacks, or always returning `File[]` for consistency.

### 2. `value` prop has the same union type issue

- **File:** `FileInput.tsx`, line 49
- `value: File | File[] | null` mirrors the `onChange` issue. Consumers must know whether they passed `isMultiple` to know the shape of `value`. This is a common pattern in file inputs, but it reduces type safety.

### 3. No JSDoc comments on any props

- **File:** `FileInput.tsx`, lines 28-50
- The `TextInput` component has JSDoc comments on every prop (TextInput.tsx, lines 26-127). `FileInput` has none, making it harder for consumers to understand the API without reading the source. Every prop should have a brief JSDoc comment.

### 4. `maxFiles` is only enforced when `isMultiple` is true

- **File:** `FileInput.tsx`, lines 174-183
- The `maxFiles` prop is silently ignored when `isMultiple` is false. This is logically correct but not obvious. A JSDoc comment or runtime warning would help.

### 5. No `size` prop

- **File:** `FileInput.tsx`, lines 28-50
- Unlike `TextInput` which supports `size: 'sm' | 'md' | 'lg'`, `FileInput` has no size variant. This limits its use in layouts where other inputs have size variants. Consider adding a `size` prop for consistency with the input family.

---

## Missing Tests

### 1. No test for disabled state

- **File:** `FileInput.test.tsx`
- The `isDisabled` prop changes cursor, opacity, tabIndex, and blocks file selection, but no test verifies any of this behavior.

### 2. No test for multiple file selection

- **File:** `FileInput.test.tsx`
- The `isMultiple` prop changes whether `onChange` receives a single `File` or `File[]`, but this is not tested.

### 3. No test for `accept` validation

- **File:** `FileInput.test.tsx`
- The `accept` prop triggers custom validation logic (lines 142-163) that filters files by extension and MIME type. This non-trivial logic has zero test coverage.

### 4. No test for `maxSize` validation

- **File:** `FileInput.test.tsx`
- The `maxSize` prop triggers validation (lines 164-173) that rejects oversized files and sets an error message. No test coverage.

### 5. No test for `maxFiles` validation

- **File:** `FileInput.test.tsx`
- The `maxFiles` prop truncates the file list (lines 174-183). No test coverage.

### 6. No test for the clear button

- **File:** `FileInput.test.tsx`
- The clear button is a key interactive element. No test verifies that clicking it calls `onChange(null)` and clears the validation error.

### 7. No test for dropzone mode

- **File:** `FileInput.test.tsx`
- The `mode='dropzone'` variant adds drag-and-drop handling, changes layout, and shows different text during drag. No test coverage.

### 8. No test for validation error display

- **File:** `FileInput.test.tsx`
- Internal validation errors (from `accept`, `maxSize`, `maxFiles`) should be displayed via the `Field` status message. No test verifies the error message appears in the DOM.

### 9. No test for `status` prop

- **File:** `FileInput.test.tsx`
- The `status` prop displays a status icon and message. Not tested.

### 10. No test for `isLoading` state

- **File:** `FileInput.test.tsx`
- The `isLoading` prop swaps the upload icon for a Spinner and sets `aria-busy`. Not tested.

### 11. No test for keyboard interaction

- **File:** `FileInput.test.tsx`
- The `onKeyDown` handler (lines 311-315) triggers file selection on Enter and Space. Not tested.

### 12. No unit tests for `validateFiles` function

- **File:** `FileInput.test.tsx`
- The `validateFiles` function (lines 132-185) contains the most complex logic in the component, including MIME type matching, extension matching, wildcard matching (`image/*`), size checking, and file count enforcement. It is not exported and has no direct tests. Consider either exporting it for unit testing or adding comprehensive integration tests.

**Summary:** The test file has exactly 1 test (basic `onChange` call). For a component with this much validation logic, drag-and-drop handling, loading states, and accessibility attributes, the test coverage is critically insufficient.

---

## Missing Stories

### 1. No story for disabled state

- **File:** `FileInput.stories.tsx`
- The `isDisabled` prop changes the visual appearance significantly (opacity, cursor) but has no story.

### 2. No story for loading state

- **File:** `FileInput.stories.tsx`
- The `isLoading` prop replaces the icon with a spinner but has no story.

### 3. No story for status/error states

- **File:** `FileInput.stories.tsx`
- The `status` prop shows error/warning/success indicators. No story demonstrates these states.

### 4. No story for file selected state

- **File:** `FileInput.stories.tsx`
- No story shows what the component looks like when a file is selected (file name displayed, clear button visible). Both existing stories use `value: null`.

### 5. No story for `accept` prop

- **File:** `FileInput.stories.tsx`
- The `accept` prop restricts file types and is a key feature. No story demonstrates it.

### 6. No story for `maxSize` prop

- **File:** `FileInput.stories.tsx`
- No story demonstrates the file size validation behavior.

### 7. No story for `description` prop

- **File:** `FileInput.stories.tsx`
- The `description` prop renders helper text below the label. No story.

### 8. No story for `isRequired` / `isOptional` props

- **File:** `FileInput.stories.tsx`
- These props affect the Field label display. No story.

### 9. No interactive/controlled story

- **File:** `FileInput.stories.tsx`
- Both stories use `onChange: () => {}` (no-op). There is no story demonstrating the component in a controlled state where selecting a file updates `value`. A story using `useArgs` or React state would let Storybook users actually interact with the component.

**Summary:** The stories file has exactly 2 stories (Default and Dropzone). For a component with 15+ props, validation logic, drag-and-drop, loading states, and multiple modes, the story coverage is minimal.

---

## Additional Observations

### 1. No `.recipe.ts` file

- The project's CLAUDE.md and Button component establish a convention of extracting styles to a `.recipe.ts` file using `cva`. The FileInput component uses inline `css()` calls in a `styles` object. While this works, it breaks from the established pattern and does not support recipe variants (e.g., a `size` variant). Consider migrating to a recipe file.

### 2. Duplicate style definitions

- **File:** `FileInput.tsx`, lines 106-120
- The `icon` and `statusIcon` styles are identical. They should be consolidated into a single style.

### 3. `hasClear` is exported in the type but never functional

- **File:** `index.ts`, line 1
- `FileInputProps` is exported, including the `hasClear` prop. Consumers may try to use it and find it does nothing.

---

## Summary

The FileInput component has solid foundational structure but significant gaps in testing, stories, and some accessibility issues.

| Category        | Severity    | Count                  |
| --------------- | ----------- | ---------------------- |
| Performance     | Low         | 2 (inline allocations) |
| Accessibility   | Medium-High | 6                      |
| Logic Bugs      | Medium      | 4                      |
| Unclear API     | Low-Medium  | 5                      |
| Missing Tests   | High        | 12                     |
| Missing Stories | Medium      | 9                      |

**Top recommendations (by impact):**

1. **Fix the dead `hasClear` prop** -- either implement it or remove it from the interface. This is a clear bug visible to consumers.
2. **Fix the double tab stop** -- add `tabIndex={-1}` to the hidden `<input>` so keyboard users only encounter one focusable element.
3. **Add `aria-invalid` to the hidden input** for screen reader parity with TextInput.
4. **Add `aria-label` or `aria-labelledby` to the surface div** so screen readers announce the button's purpose.
5. **Dramatically expand test coverage** -- the component has 1 test for ~370 lines of code with complex validation logic. At minimum, add tests for: disabled state, multiple files, accept/maxSize/maxFiles validation, clear button, dropzone mode, keyboard interaction, and status display.
6. **Add stories for all major props** -- disabled, loading, status, file selected, description, required/optional, and a controlled interactive story.
7. **Consolidate the duplicate `icon`/`statusIcon` styles** (lines 106-120).
8. **Add JSDoc comments** to all props for consistency with TextInput.
