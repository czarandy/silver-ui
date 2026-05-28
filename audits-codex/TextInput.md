# TextInput Audit

Scope:

- `src/components/TextInput/TextInput.tsx`
- `src/components/TextInput/TextInput.stories.tsx`
- `src/components/TextInput/TextInput.test.tsx`
- `src/components/TextInput/index.ts`
- Related shared behavior in `src/components/Field/*` and `src/components/InputGroup/*`
- Parallel XDS reference files: `XDS_src/TextInput/*`

## Findings

### High: Important native input props are not exposed

`TextInputProps` exposes a custom, narrow API but does not include `onBlur`, `onFocus`, `autoComplete`, `inputMode`, `maxLength`, or pass-through native input attributes (`src/components/TextInput/TextInput.tsx:23-127`, `src/components/TextInput/TextInput.tsx:177-200`). This is a practical accessibility and integration gap for a text input: consumers cannot implement validation-on-blur, focus tracking, form-library touched state, browser autofill tokens like `email` / `current-password`, or input-purpose metadata. The gap is more visible because sibling components already expose some of these hooks/attributes: `NumberInput` supports `autoComplete`, `onBlur`, and `onFocus` (`src/components/NumberInput/NumberInput.tsx:24-44`, `src/components/NumberInput/NumberInput.tsx:172-208`), and `TextArea` supports `maxLength`, `onBlur`, and `onFocus` (`src/components/TextArea/TextArea.tsx:21-48`, `src/components/TextArea/TextArea.tsx:140-142`).

### Medium: Clear button can drop focus after clearing

The clear button calls `onChange?.('', null)` but never restores focus to the input (`src/components/TextInput/TextInput.tsx:202-207`). Once the parent updates `value` to `''`, the button unmounts (`value !== ''`), so keyboard/screen-reader focus can be lost or move unpredictably. The XDS implementation documents that clear should return focus and does call `inputRef.current?.focus()` (`XDS_src/TextInput/XDSTextInput.tsx:205-207`, `XDS_src/TextInput/XDSTextInput.tsx:314-318`), so the main component is behind the expected behavior.

### Medium: `isOptional` and `isRequired` can create contradictory accessibility state

The component allows both `isOptional` and `isRequired` to be true (`src/components/TextInput/TextInput.tsx:139-140`). `Field` then visually prefers the Optional indicator (`src/components/Field/Field.tsx:191`), while the input still gets `aria-required` from `TextInput` (`src/components/TextInput/TextInput.tsx:181-182`). That can present an "Optional" label to sighted users while exposing a required field to assistive tech. The API should make the states mutually exclusive or define a clear precedence.

### Medium: InputGroup integration loses group-level field semantics

When rendered inside `InputGroup`, `TextInput` returns only the input wrapper (`src/components/TextInput/TextInput.tsx:221-223`) and only reads `isDisabled` and `label` from context (`src/components/TextInput/TextInput.tsx:161-182`). `InputGroup` can have `description`, `status`, and `isRequired` (`src/components/InputGroup/InputGroup.tsx:13-27`, `src/components/InputGroup/InputGroup.tsx:88-98`), but those IDs/states are not propagated to the child input. Result: a group-level error message is visible but the input does not get `aria-describedby` or `aria-invalid`; a group-level required field does not set `aria-required` unless duplicated on the child.

### Low: `onEnter` ordering and signature are hard to compose

`onEnter` fires before `onKeyDown` and receives no keyboard event (`src/components/TextInput/TextInput.tsx:191-195`). Consumers cannot inspect modifier keys or prevent `onEnter` from running in their normal `onKeyDown` handler. This is not necessarily broken, but it should be documented or changed to pass the event and/or run after user key handling.

### Low: Main component docs are missing or mismatched

There is no docs file for `src/components/TextInput`. The only TextInput docs found are for the separate XDS component under `XDS_src/TextInput/TextInput.doc.mjs`, and those describe props/behavior not present in the main implementation, such as `changeAction` (`XDS_src/TextInput/TextInput.doc.mjs:36-40`). They also do not document main-only props like `endContent` (`src/components/TextInput/TextInput.tsx:37-39`). If `src/components/TextInput` is the public export (`src/components/TextInput/index.ts:1`, `src/index.ts:527-530`), it needs matching docs.

## Stories

Existing stories cover only default rendering, one error status, and start icon plus clear (`src/components/TextInput/TextInput.stories.tsx:14-20`). Missing story coverage for important visible/API states:

- `description`, `isRequired`, `isOptional`, and `isLabelHidden`
- `isDisabled` and `isLoading`
- all sizes (`sm`, `md`, `lg`)
- `type="email"` / `type="password"`
- `labelTooltip`
- `endContent`
- success and warning statuses, not just error
- grouped usage through `InputGroup`

## Tests

Existing tests cover only typing and clear callback behavior (`src/components/TextInput/TextInput.test.tsx:6-25`). Missing tests for key behavior:

- label/description/status `aria-describedby`
- `aria-invalid`, `aria-required`, disabled, loading, hidden label, and autofocus
- `onEnter` and `onKeyDown` composition
- `ref`, `htmlName`, `type`, size, `startIcon`, `endContent`, and `labelTooltip`
- clear-button focus restoration if fixed
- InputGroup propagation/integration behavior
- optional/required conflict behavior

## Performance

No concrete performance issue found. The component does no expensive work per render and uses simple derived IDs/classes (`src/components/TextInput/TextInput.tsx:156-164`). Memoization is not necessary for the current implementation.

## No Issues Found

- Export surface: `src/components/TextInput/index.ts:1` correctly exports the component and public types.
- Basic controlled value flow: text changes call `onChange(value, event)` as intended (`src/components/TextInput/TextInput.tsx:190`, `src/components/TextInput/TextInput.test.tsx:7-15`).
