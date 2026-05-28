# Combobox Audit

## Scope

- Implementation: `src/components/Combobox/Combobox.tsx`, `BaseCombobox.tsx`, `ComboboxItem.tsx`, `types.ts`
- Stories/docs: `src/components/Combobox/Combobox.stories.tsx`
- Tests: `src/components/Combobox/Combobox.test.tsx`
- Verification: `pnpm vitest run src/components/Combobox/Combobox.test.tsx` passes, 2 tests.

## Findings

### High: Selected value can disappear visually after editing is cancelled

`Combobox` hides the selected tag whenever `isEditing` is true (`Combobox.tsx:199-200`). Clicking the selected tag sets `isEditing` to true and focuses the hidden input (`Combobox.tsx:235-245`), but nothing resets `isEditing` on blur, Escape, outside click, or an empty search close. The state is only reset when `BaseCombobox` selects/clears through `onChange` (`Combobox.tsx:258-261`, `Combobox.tsx:271-280`). Result: a user can click the selected tag, tab/click away without selecting anything, and the selected value remains in `value` but is no longer shown as a tag.

Suggested coverage: render with a selected value, click the tag, blur without selecting, and assert the selected label is visible again.

### Medium: Error status is not exposed as invalid to assistive tech

`Combobox` computes `aria-describedby` for status text (`Combobox.tsx:193-196`) and passes it into `BaseCombobox` (`Combobox.tsx:247-250`), but `BaseCombobox` never sets `aria-invalid` on the actual input (`BaseCombobox.tsx:412-481`). `Select` does expose this state on its combobox trigger (`Select.tsx:451-456`), so error styling/status can be visually present without the control being announced as invalid.

Suggested coverage: render with `status={{type: 'error', message: '...'}}` and assert the input has `aria-invalid="true"` plus the status description.

### Medium: Bootstrap results can race ahead of typed search results

When `hasEntriesOnFocus` is true, focus immediately starts a bootstrap search (`BaseCombobox.tsx:430-432`). If the user types before that bootstrap promise resolves, `updateQuery` schedules the real search but does not invalidate the in-flight bootstrap generation until `runSearch` actually executes after the debounce (`BaseCombobox.tsx:290-317`). During that debounce window, late bootstrap results can pass the generation check (`BaseCombobox.tsx:256-275`) and display unfiltered results for a non-empty query.

Suggested coverage: use fake timers/deferred promises to focus, type before bootstrap resolves, resolve bootstrap, and assert stale bootstrap results are ignored once the query has changed.

### Medium: `onOpenChange` can fire duplicate events for internal open/close calls

`BaseCombobox.setOpen` updates local state and invokes the public `onOpenChange` (`BaseCombobox.tsx:244-248`). The controlled `Popover` then syncs `isOpen` by calling `popover.show()`/`hide()` (`Popover.tsx:231-241`), whose `onShow`/`onHide` calls the same `onOpenChange` path again (`Popover.tsx:141-150`). Consumers using `onOpenChange` for analytics or side effects can receive duplicate open/close notifications from one user action.

Suggested coverage: pass `onOpenChange`, trigger one search that opens the menu, and assert the callback is called once with `true`.

### Low: Static source scans all items before limiting results

`createStaticSource().search` filters the full item list (`types.ts:52-69`), while `BaseCombobox` applies `maxMenuItems` only after the source returns (`BaseCombobox.tsx:271`). Large static arrays pay the full filter cost on every query even when only the first 10 items are rendered.

Suggested improvement: add an optional limit-aware static source path or stop scanning after enough matches when using `createStaticSource`.

## Stories And Docs Coverage

Current stories cover only default usage and custom result rendering (`Combobox.stories.tsx:42-72`). Missing stories for important props/behaviors:

- Selected value with `hasClear` and `hasClear={false}`.
- `isDisabled`, `isRequired`/`isOptional`, `description`, `labelTooltip`, `status`, and `isLabelHidden`.
- `hasEntriesOnFocus` behavior versus search-only behavior.
- Async/loading, empty results, `emptySearchResultsText`, `debounceMs`, and `maxMenuItems`.
- `size`, `startIcon`, `onQueryChange`, and `onOpenChange`.

No separate docs beyond Storybook autodocs were found.

## Test Coverage Gaps

Existing tests cover selecting a searched item and clearing a selected item (`Combobox.test.tsx:27-64`). Missing key behavior tests:

- Keyboard navigation: ArrowUp/ArrowDown, Enter selection, Escape close, and focus behavior.
- Accessibility attributes: `aria-expanded`, `aria-activedescendant`, `aria-controls`, `aria-invalid`, status/description IDs, disabled state.
- `hasEntriesOnFocus`, empty state, loading state, `maxMenuItems`, `renderItem`, `onQueryChange`, and `onOpenChange`.
- Debounce and async race/cancellation behavior.
- Selected tag edit/cancel behavior.

## Categories With No Additional Issues Found

- Basic selection and clear flows are covered by passing tests.
- `ComboboxItem` is a straightforward layout helper; no separate implementation issue found beyond missing story/test coverage for custom item content.
