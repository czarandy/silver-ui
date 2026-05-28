# SearchFilterInput Audit

Audited implementation in `src/components/SearchFilterInput/`, plus repo-wide references for tests, stories, and docs. No dedicated `SearchFilterInput` story, doc, or test file exists; the only current test reference I found is the table inline-filter integration in `src/components/Table/Table.test.tsx:203`.

## Findings

### High: `isReadOnly` and per-filter `isReadOnly` do not block all mutations

`SearchFilterInput` prevents tag click/remove affordances for read-only filters, but the shared `handleTagsInputChange` path still accepts add and remove events without checking either component-level `isReadOnly` or `filter.isReadOnly` (`src/components/SearchFilterInput/SearchFilterInput.tsx:268`, `src/components/SearchFilterInput/SearchFilterInput.tsx:273`, `src/components/SearchFilterInput/SearchFilterInput.tsx:303`, `src/components/SearchFilterInput/SearchFilterInput.tsx:312`). Because the underlying `TagsInput` remains enabled for read-only mode (`src/components/SearchFilterInput/SearchFilterInput.tsx:524`, `src/components/SearchFilterInput/SearchFilterInput.tsx:526`), users can still add filters via typeahead/content search. They can also remove the last tag via Backspace or clear-button flows from `TagsInput` (`src/components/TagsInput/TagsInput.tsx:420`, `src/components/TagsInput/TagsInput.tsx:440`), bypassing the read-only guards in `renderTag` (`src/components/SearchFilterInput/SearchFilterInput.tsx:364`).

Add tests for component read-only mode, read-only individual filters, Backspace removal, clear-all behavior, and direct add suggestions.

### High: The edit popover dialog is unlabeled

`SearchFilterInput` renders `Popover` without a `label` and disables the built-in close button (`src/components/SearchFilterInput/SearchFilterInput.tsx:544`, `src/components/SearchFilterInput/SearchFilterInput.tsx:548`, `src/components/SearchFilterInput/SearchFilterInput.tsx:549`). `Popover` renders `role="dialog"` with `aria-label={label}` (`src/components/Popover/usePopover.tsx:125`, `src/components/Popover/usePopover.tsx:130`), so this dialog has no accessible name. The visible controls inside the editor also use hidden labels, so screen reader users do not get a clear dialog context.

Provide a dialog label, likely derived from the `SearchFilterInput` label or explicit editor text, and cover it with an accessibility-focused render test.

### Medium: Controlled popover still attaches trigger behavior to the first nested button

The `Popover` is controlled by `popoverState`, but because `anchorRef` is passed without `isEnabled={false}`, `Popover` still searches the anchor for a button and attaches `aria-haspopup`, `aria-expanded`, `aria-controls`, and click toggling (`src/components/Popover/Popover.tsx:210`, `src/components/Popover/Popover.tsx:216`, `src/components/Popover/Popover.tsx:224`). In this component, the first nested button can be a tag label, remove button, or clear button rendered inside `TagsInput` (`src/components/SearchFilterInput/SearchFilterInput.tsx:544`, `src/components/Tag/Tag.tsx:318`, `src/components/Tag/Tag.tsx:331`, `src/components/TagsInput/TagsInput.tsx:440`). That can put dialog-trigger ARIA on the wrong control and can conflict with the component's explicit tag editing/removal behavior.

Disable Popover trigger attachment for this controlled usage or provide an explicit trigger element.

### Medium: `tagOverflowBehavior` is exposed but currently ineffective

`SearchFilterInput` documents and forwards `tagOverflowBehavior` (`src/components/SearchFilterInput/SearchFilterInput.tsx:152`, `src/components/SearchFilterInput/SearchFilterInput.tsx:540`), but `TagsInput` declares the prop and never destructures or uses it (`src/components/TagsInput/TagsInput.tsx:189`, `src/components/TagsInput/TagsInput.tsx:231`). Consumers setting `unfocusedInline` or `unfocusedLayer` will see no behavior change.

This needs either an implementation in `TagsInput` or removal/deprecation from `SearchFilterInput` until it works.

### Medium: No dedicated tests for the component or its helpers

There is no `src/components/SearchFilterInput/SearchFilterInput.test.tsx`, `useSearchFilterInputSource.test.ts`, `useSearchFilterInputConfig.test.ts`, edit-popover test, or value-editor test. The component has significant untested behavior: add/edit/remove callbacks and indices, read-only/disabled handling, empty operators, content search, custom editor/tag overrides, date formatting, nested filters, keyboard save/cancel, focus restoration, and source matching. `XDS_src/PowerSearch/` has analogous tests, but they do not protect this exported component.

### Medium: No stories or docs for important props

There is no `SearchFilterInput.stories.tsx` or component doc file. Important props and behavior are not demonstrated: `config`, `filters`, `onChange`, `isReadOnly`, `isDisabled`, `hasClear`, `hasAutoFocus`, `size`, `startIcon`, `endContent`, `resultCount`, `maxTagLength`, `tagOverflowBehavior`, `timezoneID`, `components` overrides, `contentSearchFieldKey`, empty operators, enum/entity/list values, nested filters, and `useSearchFilterInputConfig`.

### Low: Custom tag overrides cannot mirror size or timezone formatting

The built-in inline tag renderer applies `size` and passes `timezoneID` into `formatFilterValue` (`src/components/SearchFilterInput/SearchFilterInput.tsx:389`, `src/components/SearchFilterInput/SearchFilterInput.tsx:399`, `src/components/SearchFilterInput/SearchFilterInput.tsx:420`), but the public `SearchFilterInputTagProps` type lacks `size` and `timezoneID` (`src/components/SearchFilterInput/types.ts:269`). `SearchFilterInput` does not pass those props to `TagOverride` (`src/components/SearchFilterInput/SearchFilterInput.tsx:376`), and the exported `SearchFilterInputTag` therefore always renders the default tag size and formats dates without the component timezone (`src/components/SearchFilterInput/SearchFilterInputTag.tsx:34`, `src/components/SearchFilterInput/SearchFilterInputTag.tsx:42`).

### Low: `contentSearchFieldKey` can create invalid filters if the default operator is not string-valued

`useSearchFilterInputSource` always creates a `{type: 'string'}` filter value for `contentSearchFieldKey` suggestions (`src/components/SearchFilterInput/useSearchFilterInputSource.ts:152`, `src/components/SearchFilterInput/useSearchFilterInputSource.ts:170`) without checking that the field's default operator accepts string values. This API either needs validation/documentation or a guard that only emits content-search suggestions for compatible operators.

## Category Notes

- Performance: No high-confidence runtime performance bug found in the component itself. The main avoidable churn risk is consumer-created unstable `config`/`definitions` arrays, since internal config/source memoization depends on object identity (`src/components/SearchFilterInput/internalConfig.ts:58`, `src/components/SearchFilterInput/useSearchFilterInputConfig.ts:451`).
- Accessibility: Issues found above for dialog labeling and accidental trigger ARIA. Select/input labels are present, though usually visually hidden.
- Logic: Read-only mutation bypass and content-search type mismatch are the main logic risks.
- API clarity: Override props and `tagOverflowBehavior` are unclear because exposed props do not fully work.
- Tests/stories: Dedicated coverage is missing.
