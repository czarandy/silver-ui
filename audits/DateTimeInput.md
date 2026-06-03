# DateTimeInput Audit

## Summary

A compound input composing `DateInput` and `TimeInput` side by side within a single `Field` wrapper. Splits a `Temporal.PlainDateTime` into date and time parts, merging them back on change. Supports min/max constraints (split into date and time min/max), seconds toggle, loading, disabled, and validation status.

## Issues

### Critical

None

### High

- **`combineDateTime` uses `Temporal.Now` as fallback, introducing non-determinism.** When only a date or only a time is set, the other part is filled with the current wall-clock date/time. This means: (1) the component's output depends on when the user interacts, not just what they select, (2) testing is harder because of time sensitivity, (3) the auto-filled value is not visible to the user -- they see an empty time/date field but the emitted `PlainDateTime` has a hidden current-time/date component. This is tested but the test just asserts the current-time behavior rather than flagging it as potentially surprising.
- **Outer `Field` label is not associated with either inner input.** The `Field` wrapper receives `inputId={fieldId}` but neither the `DateInput` nor `TimeInput` uses `fieldId` as their `id`. The outer `<label>` points to a non-existent element. Screen readers will not associate the "Meeting" label with either input. The inner inputs have their own labels ("Meeting date", "Meeting time") which are visually hidden, so the main label is decorative only. This is a moderate accessibility concern.

### Medium

- **No `hasClear` prop.** Unlike `DateInput`, `DateTimeInput` does not expose a way to clear the value. Once a date-time is set, the user can only change it, not remove it. For optional fields, this is a UX gap.
- **`className` and `style` are applied to the inner grid row, not the Field root.** This is inconsistent with other input components where `className`/`style` go to the Field wrapper. The outer `Field` receives no className/style, which means consumer styling will not affect the field's outer spacing.
- **No test for min/max constraint behavior.** The constraints are decomposed into date and time parts, but no test verifies that the time constraints are correctly applied/removed as the date changes.
- **Status is passed to outer Field but not to inner DateInput/TimeInput.** The error styling (border color, icon) only appears on the outer Field, not on the individual inputs. This may look odd since the outer Field does not have an input-style border -- the status message floats below the two inputs without any visual connection to either.
- **Only 2 stories beyond Default.** Missing stories for: `isRequired`, `isOptional`, `labelTooltip`, `isLabelHidden`, sizes, and combined min/max constraint interaction.

### Low

- **Heavy dependency on `@js-temporal/polyfill`.** This polyfill is large (~40KB). The rest of the library uses the internal `PlainDate`/`PlainTime` types. `DateTimeInput` is the only component that exposes `Temporal.PlainDateTime` in its public API. Consider whether a lighter-weight type could be used, or document the bundle cost.
- **`data-testid` is applied to the grid row div, not to either input.** Tests use `getByLabelText` instead, so this is fine, but the semantics may surprise consumers.
- **No ref forwarding test.**

## Recommendations

1. Reconsider the `Temporal.Now` fallback behavior -- consider requiring both date and time before emitting a value, or visually showing the auto-filled value.
2. Fix the outer `<label>` to associate with at least one input, or use `labelAs="span"` with `aria-labelledby` on a group element.
3. Add a `hasClear` prop to allow clearing the value.
4. Add comprehensive stories and tests for constraint behavior, sizes, and optional/required states.
