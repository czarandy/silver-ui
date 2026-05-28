# CheckboxInput Audit

Reviewed:

- `src/components/CheckboxInput/CheckboxInput.tsx`
- `src/components/CheckboxInput/CheckboxInput.stories.tsx`
- `src/components/CheckboxInput/CheckboxInput.test.tsx`
- `src/components/CheckboxInput/index.ts`
- Reference/parity files in `XDS_src/CheckboxInput/`

## Findings

### High: keyboard focus indicator likely never renders

`CheckboxInput.tsx:83-87` styles the visible box with `_peerFocusVisible`, but the hidden input at `CheckboxInput.tsx:151-158` only receives `className={styles.input}`. Panda's peer focus selector depends on the input being marked as a peer, so keyboard users can focus the checkbox without seeing the required visual focus cue. This is especially important because the native input is transparent.

### Medium: loading state blocks interaction without disabling the native control

`CheckboxInput.tsx:152` sets `aria-busy`, but `CheckboxInput.tsx:160` only disables for `isDisabled`; `CheckboxInput.tsx:163-168` silently returns for `isLoading`. The control remains focusable and visually cursor-clickable while user input is ignored. `Switch` disables while busy (`src/components/Switch/Switch.tsx:302`) and exposes hidden loading status text (`src/components/Switch/Switch.tsx:324-328`), so CheckboxInput should either disable while loading or clearly document and test why it remains focusable.

### Medium: read-only behavior is easy to miss and weakly specified

`CheckboxInput.tsx:156-172` sets `checked`, `aria-readonly`, and `readOnly`, then suppresses `onChange` when `isReadOnly` is true. Native checkbox `readOnly` is not a browser-enforced state, and the component provides no visual read-only treatment, so sighted users get a normal-looking interactive checkbox that does nothing. This should be documented, tested, and probably given a visible/cursor treatment if the prop remains.

### Medium: important accessibility states are untested

`CheckboxInput.test.tsx:6-25` only covers click change and `aria-checked="mixed"`. Missing tests for label click, keyboard Space interaction, disabled no-op behavior, read-only no-op behavior, loading no-op/ARIA behavior, description `aria-describedby`, status message `aria-describedby` plus `aria-invalid`, hidden-label accessibility, required state, and ref forwarding. The XDS reference has broader coverage for several of these in `XDS_src/CheckboxInput/XDSCheckboxInput.test.tsx:18-235`.

### Medium: stories do not demonstrate most public states

`CheckboxInput.stories.tsx:13-15` only has Default, Checked, and Indeterminate, all static. Public props with no story coverage include `description`, `isDisabled`, `isLoading`, `isReadOnly`, `isRequired`, `isOptional`, `isLabelHidden`, `size="sm"`, `status`, and `labelIcon`. There is also no controlled/interactive story, unlike `Switch.stories.tsx:19-40` and `RadioGroup.stories.tsx:6-40`.

### Low: local component docs are missing

There is no `src/components/CheckboxInput/*.doc.*` file; only `XDS_src/CheckboxInput/CheckboxInput.doc.mjs` exists. If `src/components` is expected to carry docs alongside stories, CheckboxInput currently lacks API/usage docs for props such as `value="indeterminate"`, `isReadOnly`, and `isLoading`.

### Low: API is less complete and less documented than sibling form controls

`CheckboxInputProps` at `CheckboxInput.tsx:23-43` has no JSDoc comments, while TextInput, Switch, and RadioGroup document their props. It also lacks `labelTooltip`, despite `Field` supporting it (`src/components/Field/Field.tsx:82-84`) and sibling controls exposing it (`src/components/TextInput/TextInput.tsx:77-79`, `src/components/Switch/Switch.tsx:84-86`, `src/components/RadioGroup/RadioGroup.tsx:56-59`). Native form submission is also limited because there is no `name`/`htmlName` prop, unlike TextInput (`src/components/TextInput/TextInput.tsx:49-51`, `src/components/TextInput/TextInput.tsx:189`).

### Low: error status has no visual treatment on the checkbox box

`CheckboxInput.tsx:155` sets `aria-invalid` and `CheckboxInput.tsx:207-211` passes the status message to `Field`, but the visible box styles at `CheckboxInput.tsx:72-95` do not change for error/warning/success. This is not an accessibility failure by itself because the message is exposed, but it makes validation harder to scan and differs from TextInput's status border styling (`src/components/TextInput/TextInput.tsx:169`).

## Categories With No Issues Found

- Performance: no material performance problem found. The inline handler and merged refs are minor leaf-component costs and not worth calling out as defects without profiling.
- Logic correctness for core checked/indeterminate state: the controlled `checked` value and native `indeterminate` DOM property are set in the expected places (`CheckboxInput.tsx:137-145`, `CheckboxInput.tsx:157`).
- Exports: `src/components/CheckboxInput/index.ts:1-6` exports the component and public types.
