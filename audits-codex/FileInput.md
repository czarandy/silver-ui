# FileInput Audit

Scope reviewed:

- `src/components/FileInput/FileInput.tsx`
- `src/components/FileInput/FileInput.stories.tsx`
- `src/components/FileInput/FileInput.test.tsx`
- `src/components/FileInput/index.ts`
- Related reference points: `src/components/Field/*`, `src/components/TextInput/TextInput.tsx`, and the separate `XDS_src/FileInput/*` copy.

## Findings

### High: disabled file inputs can still be cleared

`FileInput` disables the native input and removes the wrapper from the tab order, but the clear button still renders and remains enabled whenever a value exists (`src/components/FileInput/FileInput.tsx:350`). Clicking it always calls `onChange(null)` (`src/components/FileInput/FileInput.tsx:354-358`). This lets users mutate a disabled field. The sibling `TextInput` hides its clear button while disabled (`src/components/TextInput/TextInput.tsx:202`), and the XDS copy also gates clear on `!isDisabled && !isLoading` (`XDS_src/FileInput/XDSFileInput.tsx:709`).

### High: focus and accessible-name model has multiple problems

The visual control is a tabbable `<div role="button">` (`src/components/FileInput/FileInput.tsx:295-319`) while the visually hidden native `<input type="file">` remains tabbable because it has no `tabIndex={-1}` (`src/components/FileInput/FileInput.tsx:321-335`). That creates two keyboard stops for one field. The field label is associated with the hidden input via `htmlFor` in `Field` (`src/components/Field/Field.tsx:193-198`), but the tabbable wrapper has no `aria-label`/`aria-labelledby`, so the visual control is announced from its content, such as "Choose file", not the field label. The clear `<button>` is also nested inside the `role="button"` wrapper (`src/components/FileInput/FileInput.tsx:295-361`), which creates nested interactive controls.

### Medium: error state is not exposed with `aria-invalid`

Validation and explicit status can produce an error state (`src/components/FileInput/FileInput.tsx:223-227`), but the native file input does not set `aria-invalid` (`src/components/FileInput/FileInput.tsx:321-335`). `TextInput` does this for error statuses (`src/components/TextInput/TextInput.tsx:177-183`), and the XDS copy does as well (`XDS_src/FileInput/XDSFileInput.tsx:701-705`).

### Medium: `hasClear` is a dead public prop

`FileInputProps` declares `hasClear?: boolean` (`src/components/FileInput/FileInput.tsx:27-33`), but the component never destructures or reads it (`src/components/FileInput/FileInput.tsx:196-218`). The clear button always appears for any non-null displayed value (`src/components/FileInput/FileInput.tsx:350-362`). Consumers cannot use the prop to hide clear affordance, and no story/test documents the intended behavior.

### Medium: rejected files clear the current controlled value

When validation rejects every selected file, `validateFiles` returns an error with an empty `files` array (`src/components/FileInput/FileInput.tsx:157-161`, `src/components/FileInput/FileInput.tsx:166-171`). `handleFiles` then calls `onChange(null)` (`src/components/FileInput/FileInput.tsx:247-250`). If a user already has a valid selected value and then selects or drops an invalid file, the component asks the parent to clear the existing value instead of preserving it while showing the validation error.

### Low: empty array values render as an empty selected state

`getFileNames([])` returns an empty string, not `null` (`src/components/FileInput/FileInput.tsx:187-193`). Because `displayText` uses nullish fallback (`src/components/FileInput/FileInput.tsx:232-234`) and the clear button checks `fileNames != null` (`src/components/FileInput/FileInput.tsx:350`), a controlled `value={[]}` renders a blank primary-text state with a clear button instead of the placeholder.

## Performance

No significant performance issue found. Validation is linear in selected file count, and the inline handlers/style lookups are negligible for a file input. Very large multi-file values could produce a long comma-joined filename string (`src/components/FileInput/FileInput.tsx:191-193`), but the UI truncates it and this is not a primary concern.

## API and Docs

The API is unclear around `hasClear` because the prop exists but has no effect. The `value`/`onChange` union shape also requires consumers to manually keep `isMultiple` aligned with whether they pass/receive `File` or `File[]` (`src/components/FileInput/FileInput.tsx:36`, `src/components/FileInput/FileInput.tsx:44`, `src/components/FileInput/FileInput.tsx:49`). There is no `src/components/FileInput/*.doc.mjs`; only the separate `XDS_src/FileInput/FileInput.doc.mjs` documents FileInput props. The main `FileInputProps` interface also lacks JSDoc, unlike `TextInputProps`.

## Tests

Existing coverage is one happy-path file selection test (`src/components/FileInput/FileInput.test.tsx:7-16`). Missing key tests:

- disabled state blocks all mutation, including clear
- `hasClear` behavior
- clear button behavior and focus/propagation
- multiple file selection shape
- accept, maxSize, maxFiles validation
- preserving existing value after rejected files, if that is the intended behavior
- dropzone drag/drop handling
- keyboard activation with Enter/Space
- `aria-invalid`, `aria-describedby`, required, label-hidden, status, loading
- `value={[]}` display behavior

## Stories

Stories cover only default and dropzone (`src/components/FileInput/FileInput.stories.tsx:13-16`). Missing stories for important props and states:

- selected single file and selected multiple files
- `accept`, `maxSize`, and `maxFiles`
- validation/error, warning, and success statuses
- disabled, loading, required, optional, hidden label, label tooltip
- custom placeholder
- clear hidden/visible behavior once `hasClear` is implemented or removed
