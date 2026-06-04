# DateRangeInput Audit

## Summary

A date range picker that pairs a read-only text input with a calendar popover for selecting start and end dates. Supports single or dual-month calendar, min/max constraints, custom disabled dates, clear, loading, validation status, and all standard Field props. Unlike `DateInput`, the text input is read-only (no manual typing).

## Issues

### Critical

- None.

### High

- **Read-only input prevents keyboard date entry.** The text input has `readOnly` set, so users can only select dates via the calendar popover. While this avoids the date-parsing complexity, it means keyboard-only users must open the popover and navigate the calendar to select dates. This is a notable accessibility limitation compared to `DateInput`, which allows typing. Consider adding keyboard shortcuts or documenting this trade-off.

### Medium

- **No `aria-haspopup` or `aria-expanded` on the input.** Same issue as `DateInput` -- screen reader users have no indication that a calendar popover exists or is open. The input has no ARIA attributes linking it to the popover.
- **No test for calendar popover interaction.** No test opens the calendar, selects dates, or verifies the range is committed. The tests only verify the rendered text input and static props.
- **`hasClear` hides clear button during loading but input remains interactive.** When `isLoading` is true, `DateInput` hides the clear button, but `DateRangeInput` does not (the condition is `hasClear && value != null && !isDisabled`, missing `!isLoading`). This means a user could clear a value while a loading operation is in progress, which may cause inconsistent state.
- **`status` icon renders even without a status message.** Same issue as DateInput -- `status != null` renders the icon slot, but `status.message` could be undefined, leading to an icon with no accompanying message.
- **Missing `role="combobox"` on the input.** Since the input controls a popover selection, adding a combobox or equivalent ARIA pattern would improve accessibility.

### Low

- **No story for `isRequired` or `isOptional`.** These props are tested but not demonstrated in stories.
- **No story for `labelTooltip` or `labelIcon`.** These props are inherited from Field but never shown in DateRangeInput stories.
- **`numberOfMonths` only supports 1 or 2.** This is fine for the current use case but the type constraint is restrictive. Not a real issue, just noting the design decision.
- **No ref forwarding test.** The `ref` prop is forwarded to the read-only input but never tested.
- **No test for `getIsDateDisabled`.** The `DisabledWeekends` story exists but no test verifies the behavior.

## Recommendations

1. Add `aria-haspopup="dialog"` and `aria-expanded` on the input to improve screen reader experience.
2. Add `!isLoading` to the clear button visibility condition for consistency with DateInput.
3. Add integration tests for the calendar popover interaction (opening, selecting a range, closing).
4. Add stories for `isRequired`, `isOptional`, `labelTooltip`, and `labelIcon`.
5. Consider documenting the intentional read-only design decision and its accessibility implications.

## SVA Conversion

**Benefit: Low / None**

DateRangeInput uses the same pattern as DateInput: it delegates almost all styling to the shared `Field` wrapper, `inputRecipe` (size/status/isDisabled variants on the wrapper), and `inputStyles` (`control`, `clearButton`, `iconSlot`), with only a one-line local `const styles = {wrapper: css({ps: '1', gap: '1'})}`. The multi-element input styling already lives centrally in `Field`, so an `sva` conversion at this component would consolidate nothing; the shared `Field` input styles are the only place a slot recipe could help.
