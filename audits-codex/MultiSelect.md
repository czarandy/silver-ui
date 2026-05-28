# MultiSelect Audit

## Scope

- Implementation: `src/components/MultiSelect/MultiSelect.tsx`
- Stories/docs: `src/components/MultiSelect/MultiSelect.stories.tsx`
- Tests: `src/components/MultiSelect/MultiSelect.test.tsx`
- Public export: `src/components/MultiSelect/index.ts`
- Verification: `pnpm vitest run src/components/MultiSelect/MultiSelect.test.tsx` passes, 2 tests.

## Findings

### High: Searchable "select all" selects hidden options

`filteredValues` correctly tracks the options visible after search (`MultiSelect.tsx:399-411`), but `allSelected` and `toggleAll` operate on every enabled option (`MultiSelect.tsx:412-447`). When `hasSearch` and `hasSelectAll` are both true, a user can filter to one visible match, click "Select all", and unexpectedly select hidden options too.

Suggested coverage: render with `hasSearch` and `hasSelectAll`, type a query matching only one option, click "Select all", and assert `onChange` receives only the visible enabled value.

### High: Listbox accessibility model is incomplete

Options are rendered as focusable `<button role="option">` elements inside `role="listbox"` (`MultiSelect.tsx:493-500`, `MultiSelect.tsx:555-590`), but the component does not implement listbox keyboard behavior such as ArrowUp/ArrowDown, Home/End, or active-descendant management. Keyboard users can Tab through buttons, but assistive tech is told this is a listbox, where arrow-key navigation is expected.

The checkbox visuals are also `aria-hidden` (`MultiSelect.tsx:501-508`), so selection state relies entirely on `aria-selected`. That can be acceptable for listbox options, but it increases the need for a correct listbox interaction model.

Suggested coverage: open the popup and assert arrow keys move focus/active option, Space toggles the active option, Escape closes, and selection state is announced through the chosen ARIA model.

### Medium: Search input is nested inside the listbox

When `hasSearch` is true, the `<input type="search">` is rendered as a child of the `role="listbox"` container (`MultiSelect.tsx:555-569`). A listbox should contain options/groups/presentational children, not an editable text input. This can produce confusing announcements or make the search field harder to discover for screen reader users.

Suggested fix: render a wrapper/popover body containing the search input and a separate `role="listbox"` for only option/group children.

### Medium: Trigger ARIA relationship is inconsistent

The trigger initially declares `aria-haspopup="listbox"` and `aria-controls={`${inputId}-listbox`}` (`MultiSelect.tsx:607-610`), but the listbox has no matching `id` (`MultiSelect.tsx:555-560`). `Popover` then imperatively overwrites trigger attributes with `aria-haspopup="dialog"` and controls the popover layer instead (`src/components/Popover/Popover.tsx:177-188`). The result is a combobox trigger whose popup relationship does not clearly point at the listbox users interact with.

Suggested fix: choose one ARIA model and make IDs match it. If this is a dialog popover containing a listbox, avoid exposing the trigger as a listbox combobox. If it is a combobox/listbox, give the listbox a stable ID and avoid the dialog override.

### Medium: Search query persists after close

`query` is local state (`MultiSelect.tsx:386-387`) and is never reset when the popover closes (`MultiSelect.tsx:651-656`). A user can search, close the dropdown, and reopen it to a stale filtered list with options missing until the query is manually cleared.

Suggested coverage: open with `hasSearch`, type a query, close and reopen, and assert the full option list is visible or document that sticky search is intentional.

### Medium: Duplicate divider keys

Every divider is rendered with `key="divider"` (`MultiSelect.tsx:530-533`). Multiple dividers in one options array will produce duplicate React keys and can lead to incorrect reconciliation.

Suggested coverage: render options with two dividers and assert no React key warning, or generate divider keys from index/context.

### Medium: `changeAction` rejection handling is undefined

`commitChange` calls `onChange(nextValue)` and then fire-and-forgets `changeAction` with `void changeAction?.(nextValue)` (`MultiSelect.tsx:416-419`). If `changeAction` rejects, consumers get an unhandled promise rejection unless they catch internally, and the component provides no loading/error contract around the async path.

Suggested fix: document this as a fire-and-forget side effect that must handle its own errors, or accept/report errors through a defined callback.

### Low: Loading does not fully lock the control

The main trigger is disabled while loading (`MultiSelect.tsx:614`), but the clear button remains active whenever `hasClear`, selected values, and not `isDisabled` are true (`MultiSelect.tsx:621-627`). If `isLoading` means the field is busy or temporarily immutable, users can still clear values mid-load.

### Low: Large option lists do extra work

There is no virtualization, and every render re-filters selected/enabled options (`MultiSelect.tsx:393-398`) while `renderOption` normalizes data that was often already normalized by callers (`MultiSelect.tsx:486-488`, `MultiSelect.tsx:527-552`). This is fine for small lists, but `hasSearch` plus large option sets will allocate and scan on each keystroke.

## API Clarity

- `changeAction` is unclear as a public prop (`MultiSelect.tsx:58-61`): it overlaps with `onChange`, exists only on `MultiSelect` rather than `Select`, and does not specify ordering, error handling, or loading expectations.
- `maxBadges` only applies when `triggerDisplay="badges"` (`MultiSelect.tsx:132-135`, `MultiSelect.tsx:463-476`), but the prop docs do not say it is ignored for `count` and `labels`.
- Duplicate option values are not guarded or documented. Selection state and React keys are value-based (`MultiSelect.tsx:388`, `MultiSelect.tsx:497`, `MultiSelect.tsx:468-470`), so duplicate values merge behavior and collide.

## Story Coverage

Current stories cover default/count display, search, badges, and select-all (`MultiSelect.stories.tsx:35-49`). Missing important stories:

- `triggerDisplay="labels"`.
- Badge overflow with more selected values than `maxBadges`; current `Badges` starts with only two selected values (`MultiSelect.stories.tsx:22-30`, `MultiSelect.stories.tsx:42-44`).
- `hasSearch` combined with `hasSelectAll`.
- Disabled options and whole-component `isDisabled`.
- `isLoading`.
- Sections and dividers.
- Custom option rendering through `children`.
- Validation `status`, `description`, `labelTooltip`, `isRequired`/`isOptional`, and `isLabelHidden`.

No separate docs beyond Storybook autodocs/stories were found.

## Test Coverage

Existing tests cover selecting an unselected option and clearing all values (`MultiSelect.test.tsx:21-58`). Missing key behavior tests:

- Search filtering and stale search reset behavior.
- Select-all, including disabled options and active search filters.
- Deselecting an already-selected option.
- Disabled option click behavior.
- `triggerDisplay` modes: `count`, `labels`, `badges`, and `maxBadges` overflow.
- Sections and dividers.
- Custom option rendering through `children`.
- Accessibility attributes and keyboard behavior.
- `isDisabled`, `isLoading`, status/description wiring, and clear-button availability.
- `changeAction` call order and rejection behavior.
- `ref` forwarding to the trigger button.

## Categories With No Additional Issues Found

- Public export coverage looks complete for the component and its public types (`index.ts:1-9`).
- Basic controlled selection and clear flows are covered by passing tests.
