# DateInput Audit

Audited:

- `src/components/DateInput/DateInput.tsx`
- `src/components/DateInput/DateInput.stories.tsx`
- `src/components/DateInput/DateInput.test.tsx`
- `XDS_src/DateInput/XDSDateInput.tsx`
- `XDS_src/DateInput/DateInput.doc.mjs`
- `XDS_src/DateInput/XDSDateInput.test.tsx`
- Calendar/popover dependencies where DateInput behavior is delegated

## Findings

### High - The public `src` DateInput exposes a focusable read-only textbox that cannot open or edit the picker

`src/components/DateInput/DateInput.tsx:117-160` renders the calendar popover trigger as a separate icon button and then renders the labeled input as `readOnly`. The label targets the input (`Field` receives `inputId` at `DateInput.tsx:95-107`), so clicking the label or tabbing to the textbox lands on a control that cannot type, does not open the calendar, and has no combobox/dialog ARIA state. Keyboard users must discover the separate `Choose {label}` button instead.

This is an accessibility and UX issue for a component named `DateInput`: the primary labeled control behaves like a dead read-only display. `XDSDateInput` has a more complete combobox model (`XDS_src/DateInput/XDSDateInput.tsx:533-553`), which makes the `src` API behavior especially unclear.

Coverage gap: `src/components/DateInput/DateInput.test.tsx:7-25` only verifies formatted display and clearing; it does not cover opening from the input/label, keyboard interaction, ARIA attributes, or date selection.

### Medium - `hasClear` remains interactive during loading in the `src` component

`src/components/DateInput/DateInput.tsx:137-153` disables the calendar button and input while `isLoading` is true, but the clear button condition only checks `hasClear && value != null && !isDisabled` at `DateInput.tsx:161-166`. A loading field can still fire `onChange(undefined)`, bypassing the disabled/loading interaction model shown by the rest of the component.

Coverage gap: there is no `isLoading` test or story for `DateInput`.

### Medium - Stories do not demonstrate most important props or user states

`src/components/DateInput/DateInput.stories.tsx:13-16` has only `Default` and `WithConstraints`. Important props with visible or behavioral impact are not demonstrated: `isDisabled`, `isLoading`, `status`, `description`, `isRequired`, `isOptional`, `isLabelHidden`, `labelTooltip`, `placeholder`, `size`, `numberOfMonths`, and a custom `dateConstraints` example.

The XDS docs list these props (`XDS_src/DateInput/DateInput.doc.mjs:10-126`), but there is no matching XDS story file found by `rg` for DateInput. This makes visual review of states and interaction contracts thin.

### Medium - XDS docs claim focus opens the calendar, but implementation opens on click only

`XDS_src/DateInput/DateInput.doc.mjs:143-148` describes a text input and says the calendar popover appears when the icon is clicked or the input is focused. The implementation opens from the input `onClick` (`XDS_src/DateInput/XDSDateInput.tsx:379-384`, `:541`) and does not open on focus. The test suite has a placeholder comment for arrow-down/popover behavior but no assertion (`XDS_src/DateInput/XDSDateInput.test.tsx:450-454`).

This is an API/docs mismatch and a keyboard affordance gap.

### Low - XDS typed-input change semantics can duplicate `onChange` for controlled-lag or value-less usage

`XDS_src/DateInput/XDSDateInput.tsx:420-437` fires `onChange` immediately when typed text parses to a valid, allowed date. `commitPendingInput` then compares against the `value` prop only (`XDS_src/DateInput/XDSDateInput.tsx:442-464`), so if the parent has not yet reflected the new value, Enter or blur can fire the same date again. The existing test explicitly exercises the second Enter call after clearing the first call (`XDS_src/DateInput/XDSDateInput.test.tsx:438-447`) instead of asserting dedupe.

If controlled-only usage is required, the docs/API should say so clearly; otherwise the component needs internal dedupe against the last emitted value.

### Low - Shared Calendar semantics can put disabled outside-month days in the roving focus set

DateInput delegates selection to `Calendar`. Outside-month days are treated as effectively disabled (`src/components/Calendar/Calendar.tsx:861-866`, `:914-942`) but only receive `aria-disabled`; the native `disabled` attribute is based on constraints only (`Calendar.tsx:928`). The grid focus selector uses `button:not([disabled])` (`Calendar.tsx:688-715`), so keyboard navigation can include outside-month days that look and announce disabled.

This is lower risk for DateInput because click selection is guarded, but it can create confusing keyboard movement inside the DateInput popover.

## Category Notes

- Performance: no significant DateInput-local performance problems found. Formatting is memoized in `src` (`DateInput.tsx:92`), and the calendar work is bounded to one or two months.
- Accessibility: issues noted above. Label/description/status wiring is otherwise present (`DateInput.tsx:86-90`, `:146-150`; `XDSDateInput.tsx:324-330`, `:545-552`).
- Logic bugs: loading clear interaction and XDS duplicate emission are the main concerns.
- API clarity: `src` behaves like a read-only date picker while XDS docs describe a typeable input. Controlled-only expectations are not explicit.
- Missing tests: `src` needs tests for popover open/select, disabled/loading, min/max/dateConstraints, status/description ARIA, required/optional, `numberOfMonths`, hidden label, and clear behavior under loading/disabled states. XDS needs tests for focus/click/keyboard popover behavior and duplicate emission.
- Missing stories: `src` needs stories for the important states listed above; no XDS DateInput story was found.

## Verification

Ran `pnpm vitest run src/components/DateInput/DateInput.test.tsx XDS_src/DateInput/XDSDateInput.test.tsx`. Vitest discovered and ran only `src/components/DateInput/DateInput.test.tsx`: 1 file, 1 test passed.
