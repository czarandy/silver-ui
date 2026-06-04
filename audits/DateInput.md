# DateInput Audit

## Summary

A date picker combining a text input with a calendar popover. Users can type a date string (parsed on change and committed on blur/Enter) or select from a Calendar component. Supports min/max constraints, custom date disabling, clear, loading, validation status, and all standard Field props.

## Issues

### Critical

- None.

### High

- **Invalid typed input is silently discarded on blur.** When a user types a date string that cannot be parsed (e.g., "not a date"), `commitPendingInput` calls `parseDateInput` which returns null, and the pending input is cleared (`setPendingInput(null)`). The display then reverts to the previous value (or empty) with no error message shown to the user. There is no feedback that the typed input was rejected. This is confusing UX -- the user's text silently disappears. Consider showing a validation error (e.g., "Invalid date format") when the parsed result is null and the input is non-empty.
- **No keyboard interaction tests.** The Enter key handling (`commitPendingInput`) and general keyboard interaction with the calendar popover are not tested. Since date parsing and commitment on Enter is a key code path, this is a gap.

### Medium

- **Calendar popover accessibility for the text input.** The text `<input>` does not have `role="combobox"` or `aria-haspopup="dialog"`, and there is no `aria-expanded` attribute indicating whether the calendar popover is open. Screen reader users interacting with the text input will not know that a calendar is available or currently open.
- **`parseDateInput` behavior is opaque.** The parsing function is imported from `../../internal/parseDateInput` but its accepted formats are not documented in the component's API or in a placeholder prop. The default placeholder "Select a date" does not hint at accepted formats. Consider showing an example format like "May 21, 2026" or "5/21/2026".
- **Date typed in the text input that is out of bounds (min/max or disabled) is silently ignored.** If the user types a valid date that violates constraints, `handleInputChange` updates `pendingInput` but does not call `onChange`. On blur, `commitPendingInput` also silently drops it (reverting the display). No error message explains why the date was rejected.
- **No test for `getIsDateDisabled` integration.** While `min`/`max` are implicitly tested through the calendar, the `getIsDateDisabled` callback is never tested with the text input path.
- **`status` icon always renders when `status` is defined, even without a message.** If a consumer passes `status={{ type: 'error' }}` (with no message), the status icon appears but there is no corresponding message, which could be visually confusing. The `InputStatus` type allows `message` to be optional.

### Low

- **`hasClear` defaults to `false`.** This is inconsistent with `AutocompleteInput` where `hasClear` defaults to `true`. For date inputs, a clear button is often expected. Consider aligning defaults or documenting the reasoning.
- **No story for `getIsDateDisabled`.** The `WithConstraints` story demonstrates `min`/`max`, but there is no story showing custom disabled dates (e.g., weekends). The `DateRangeInput` stories do have this, so it is inconsistent.
- **No test for the Calendar popover opening/closing.** The test file does not open the calendar or verify that selecting a date via the calendar calls `onChange`.
- **`ref` is forwarded to the input but there is no test for it.**
- **`className` is passed to `Field` but `data-testid` goes to the text input.** This inconsistency is documented via tests but not in prop docs.

## Recommendations

1. Show a user-facing validation error when typed text is a non-empty string that cannot be parsed as a valid date, or when the parsed date is outside min/max bounds.
2. Add `aria-haspopup="dialog"` and `aria-expanded` to the text input to inform screen readers about the calendar popover.
3. Add integration tests for the calendar popover interaction and for `getIsDateDisabled`.
4. Add a story for `getIsDateDisabled` (e.g., disabled weekends).
5. Improve the placeholder to hint at expected date format.

## SVA Conversion

**Benefit: Low / None**

DateInput is a composition that delegates virtually all styling to the shared `Field` wrapper, `inputRecipe` (the wrapper class with `size`/`status`/`isDisabled` variants), and `inputStyles` (`control`, `clearButton`, `iconSlot`) — all of which live in `Field`. Its only local styling is a one-line `const styles = {wrapper: css({ps: '1', gap: '1'})}` merged onto the input-recipe wrapper. The multi-element styling (input, clear button, icon slot) is already centralized in `Field`, so converting DateInput itself to an `sva` would not consolidate anything; any slot-recipe work belongs in `Field`'s shared input styles, not here.
