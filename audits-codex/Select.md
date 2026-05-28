# Select Audit

Audited:

- `src/components/Select/Select.tsx`
- `src/components/Select/SelectOption.tsx`
- `src/components/Select/Select.stories.tsx`
- `src/components/Select/Select.test.tsx`
- `src/components/Select/index.ts`
- Related primitives: `src/components/Popover/Popover.tsx`, `src/components/Popover/usePopover.tsx`, `src/internal/useLayer.tsx`

Verification:

- `pnpm vitest run src/components/Select/Select.test.tsx` passed: 3 tests.

## Findings

### High: Combobox/listbox semantics are inconsistent with the rendered popover

`Select` renders the trigger as `role="combobox"` with `aria-haspopup="listbox"` and `aria-controls={`${inputId}-listbox`}` (`src/components/Select/Select.tsx:450`-`462`), but the controlled popup listbox has no matching `id` (`src/components/Select/Select.tsx:421`-`434`). When `Popover` attaches behavior to the trigger, it mutates the first button and overwrites those attributes with its own dialog-oriented trigger props (`src/components/Popover/Popover.tsx:175`-`188`), where `usePopover` always reports `aria-haspopup: 'dialog'` and controls the layer id (`src/components/Popover/usePopover.tsx:159`-`163`). The actual layer also wraps content in `role="dialog"` with `aria-modal="true"` (`src/components/Popover/usePopover.tsx:122`-`137`).

That leaves assistive tech seeing a combobox whose popup is effectively a modal dialog containing a nested listbox, not a combobox that controls a listbox. The existing tests do not assert `aria-haspopup`, `aria-controls`, the controlled element, or popup role (`src/components/Select/Select.test.tsx:23`-`80`).

Recommendation: either use a listbox-specific popover path that does not overwrite the trigger/listbox attributes, or make Select use an actual dialog/disclosure pattern instead of `role="combobox"`.

### High: Keyboard support is incomplete for a `role="combobox"` select

The trigger has `role="combobox"` (`src/components/Select/Select.tsx:450`-`462`), but `Select` does not implement `ArrowDown`, `ArrowUp`, active option tracking, `aria-activedescendant`, typeahead, or `Enter` selection from a highlighted option. `Popover` only toggles native button triggers on click because it adds explicit key handling only for non-button `[role="button"]` triggers (`src/components/Popover/Popover.tsx:165`-`195`). The options themselves are separate buttons rendered inside the popup (`src/components/Select/Select.tsx:355`-`369`), so keyboard users must leave the combobox and tab into the popup rather than use standard combobox/listbox navigation.

The colocated `BaseCombobox` shows the expected pattern: listbox ids, option ids, `aria-activedescendant`, arrow-key movement, Enter selection, and Escape close are all handled explicitly (`src/components/Combobox/BaseCombobox.tsx:413`-`475`). Select has no comparable tests; current coverage opens and selects only with pointer-style `user.click` (`src/components/Select/Select.test.tsx:23`-`39`).

Recommendation: add full keyboard handling for the selected pattern, then cover ArrowDown/ArrowUp, Enter, Escape, disabled options, and focus restoration in tests.

### Medium: Duplicate keys are generated for multiple dividers

Every divider is rendered with the same React key, `key="divider"` (`src/components/Select/Select.tsx:396`-`399`). Any options array containing more than one divider will produce duplicate keys, which can cause React warnings and unstable reconciliation when filtering or changing option groups.

Recommendation: include the option index or a caller-provided divider id in the key. Add a regression test with multiple dividers.

### Medium: Search can leave empty section headings and separators visible

Filtering is value-set based (`src/components/Select/Select.tsx:334`-`346`), and each section wrapper, heading, and divider is rendered regardless of whether any child option survives the filter (`src/components/Select/Select.tsx:391`-`433`). A query with no matches can show section headers and separators with no selectable options, and there is no empty-results message.

Recommendation: derive filtered option groups before rendering so empty groups/dividers are removed, and add an empty state. Test section filtering and no-result behavior.

### Low: Loading does not disable the clear action

The main trigger is disabled while loading (`src/components/Select/Select.tsx:450`-`459`), but the clear button remains enabled whenever `hasClear`, `selectedOption`, and `!isDisabled` are true (`src/components/Select/Select.tsx:471`-`479`). This lets users change the value while the field otherwise presents as loading/disabled.

Recommendation: decide whether loading should freeze value changes. If so, hide or disable clear while `isLoading` and add a test.

### Low: Public API expectations are underdocumented

`SelectOptionData.value` is the identity used for selection, filtering sets, and React option keys (`src/components/Select/Select.tsx:18`-`23`, `331`-`345`, `362`). The type and stories do not state that values must be unique. Duplicate values would make multiple options selected together and share keys. `children` is documented only as a render function (`src/components/Select/Select.tsx:41`-`45`), but there is no docs page explaining how it interacts with labels, filtering, or trigger display.

Recommendation: document uniqueness requirements and custom-rendering behavior, or enforce uniqueness in development.

## Missing Tests

- ARIA contract: trigger `aria-haspopup`, `aria-controls`, expanded state, popup role/id, description/status wiring, and hidden-label behavior.
- Keyboard behavior: open/close from keyboard, arrow navigation, Enter selection, Escape close, focus behavior, and disabled options.
- Search behavior: filtering, clearing query after selection, no-results state, sections, dividers, and custom option labels.
- State/props: `isDisabled`, `isLoading`, `isRequired`, `isOptional`, status messages, `startIcon`, `placeholder`, unknown `value`, object options, section options, and duplicate divider regression.

## Missing Stories

Stories cover default, searchable, and custom option rendering (`src/components/Select/Select.stories.tsx:29`-`48`). Missing important props/states:

- Disabled and loading.
- Validation status, description, required/optional, hidden label, and label tooltip.
- Clearable as an explicit story rather than always folded into the default render helper (`src/components/Select/Select.stories.tsx:24`-`31`).
- Sections, dividers, disabled options, icons/start icon, placeholder/empty value, no-results search, and long labels/truncation.

## Category Notes

- Performance: no major hot-path performance issue found. The component does rebuild `optionNodes` and per-option handlers on each render (`src/components/Select/Select.tsx:348`-`419`), but the dominant risk is correctness/accessibility unless option lists are expected to be very large.
- Accessibility: high-severity issues are the mismatched combobox/listbox/dialog semantics and missing combobox keyboard model.
- Logic bugs: duplicate divider keys, empty filtered groups, and loading clear behavior are the main implementation bugs found.
- API clarity: uniqueness requirements and custom rendering/filtering behavior need clearer documentation.
