# TimeInput Audit

Scope reviewed:

- `src/components/TimeInput/TimeInput.tsx`
- `src/components/TimeInput/TimeInput.stories.tsx`
- `src/components/TimeInput/TimeInput.test.tsx`
- `src/components/TimeInput/index.ts`
- Parallel implementation/docs/tests under `XDS_src/TimeInput` and shared `XDS_src/utils/timeParser.ts`

Note: the package export in `src/index.ts` points at `src/components/TimeInput`; `XDS_src/TimeInput` appears to be a parallel implementation with its own docs and tests.

## Findings

### High: XDS text parser accepts malformed time strings

`parseTimeInput` uses `parseInt` on colon-separated parts without verifying that the full token is numeric (`XDS_src/utils/timeParser.ts:225-256`). As a result, inputs such as `3:45 pmx`, `12:30junk`, or `9x:15` can parse to valid-looking ISO values instead of being rejected. `XDSTimeInput` calls this parser during typing and blur (`XDS_src/TimeInput/XDSTimeInput.tsx:408-417`, `XDS_src/TimeInput/XDSTimeInput.tsx:428-455`), so malformed user text can be emitted through `onChange`.

Existing parser tests cover obvious invalid values like `abc`, `25:00`, and `13:00 PM` (`XDS_src/utils/timeParser.test.ts:147-152`), but not trailing or embedded garbage after numeric prefixes. Add full-token regex validation for each accepted format and tests for malformed suffixes.

### Medium: Loading state disables the input but leaves clear active

The exported `TimeInput` disables the native input when `isLoading` is true (`src/components/TimeInput/TimeInput.tsx:103-112`), but the clear button still renders and remains clickable whenever `hasClear && value != null && !isDisabled` (`src/components/TimeInput/TimeInput.tsx:129-134`). The wrapper also only applies disabled styling for `isDisabled`, not `isLoading` (`src/components/TimeInput/TimeInput.tsx:91-96`).

This creates a mixed state where the field appears partly disabled/busy but still allows value changes through the clear button. Hide or disable clear while loading, or document that loading is non-blocking and keep the native input enabled consistently.

### Medium: Native validity for `min`, `max`, and `step` is not surfaced

The component passes `min`, `max`, and `step` to the native time input (`src/components/TimeInput/TimeInput.tsx:113-125`) and then casts any non-empty `event.target.value` to `ISOTimeString` (`src/components/TimeInput/TimeInput.tsx:116-121`). The component does not check `event.target.validity`, does not set `aria-invalid` from native validity, and does not prevent an out-of-range or step-mismatched value from reaching `onChange`.

This may be acceptable if consumers are expected to validate externally, but the API shape suggests `min`, `max`, and `step` are meaningful constraints. Add tests documenting whether invalid native values should be emitted, rejected, or emitted with status left to the caller.

### Low: `isOptional` and `isRequired` can create conflicting semantics

`TimeInputProps` exposes both `isOptional` and `isRequired` (`src/components/TimeInput/TimeInput.tsx:28-29`). `Field` displays only `Optional` when both are true because optional takes precedence (`src/components/Field/Field.tsx:191`), while the input still receives `aria-required` from `isRequired` (`src/components/TimeInput/TimeInput.tsx:106`). That can produce a field visually marked optional but announced as required.

This is inherited from shared `Field` patterns, but TimeInput should either guard this combination, document precedence, or align visual and ARIA semantics.

### Low: `placeholder` is a weak API on native `type="time"`

`placeholder` is exposed and defaults to `Select a time` (`src/components/TimeInput/TimeInput.tsx:35`, `src/components/TimeInput/TimeInput.tsx:64`, `src/components/TimeInput/TimeInput.tsx:123`), but native time inputs generally render browser-specific controls and often ignore placeholders. Consumers may expect a visible hint that never appears.

Document this limitation, remove the default, or provide a story/test that shows the intended browser behavior.

### Low: `hasSeconds` and `step` interaction is unclear

`hasSeconds` only changes the default `step` from `60` to `1`; an explicit `step` overrides that behavior (`src/components/TimeInput/TimeInput.tsx:23`, `src/components/TimeInput/TimeInput.tsx:39`, `src/components/TimeInput/TimeInput.tsx:125`). A consumer can pass `hasSeconds` with a step that prevents second-level entry, or pass a sub-minute step without `hasSeconds`. The component has no docs explaining which prop controls display versus granularity.

## Accessibility

No major TimeInput-specific accessibility issue found beyond the loading/clear mixed state and optional/required conflict above. The input is labeled through `Field`, `aria-describedby` connects description/status IDs, `aria-invalid` is set for error status, and decorative icons are hidden by the shared `Icon` component (`src/components/Icon/Icon.tsx:119-131`).

## Performance

No material performance problem found. The exported component does simple render-time ID/string work only. The XDS implementation recreates small status maps each render (`XDS_src/TimeInput/XDSTimeInput.tsx:329-343`), but that is not a meaningful performance concern.

## Tests

Coverage is too thin for the exported component. `src/components/TimeInput/TimeInput.test.tsx` has one test covering a basic change event (`src/components/TimeInput/TimeInput.test.tsx:5-15`). Missing tests include:

- clearing via `hasClear` and empty input mapping to `undefined`
- disabled and loading behavior, including whether clear is available
- `hasSeconds` default step and custom `step`
- `min`/`max` and native validity expectations
- `status`, `description`, `isRequired`, and `isLabelHidden` ARIA behavior
- `htmlName`, `data-testid`, and ref forwarding

XDS tests are broader, but they do not cover malformed numeric-prefix input, `min`/`max` rejection in the component, arrow-key increment behavior, `changeAction`/busy behavior, or loading plus clear interaction.

## Stories and Docs

Stories are too sparse. `TimeInput.stories.tsx` only includes `Default` and `WithSeconds` (`src/components/TimeInput/TimeInput.stories.tsx:13-16`). Important missing stories include `hasClear`, `min`/`max`, custom `step`, `status`, `description`, `labelTooltip`, `isRequired`, `isOptional`, `isDisabled`, `isLoading`, and sizes.

No docs file was found for the exported `src/components/TimeInput` implementation. The only TimeInput docs found are for the parallel XDS implementation (`XDS_src/TimeInput/TimeInput.doc.mjs`), whose documented props do not match the exported native component exactly.

## Exports

`src/components/TimeInput/index.ts` correctly re-exports `TimeInput`, `ISOTimeString`, and `TimeInputProps`.
