# NumberInput Audit

## Summary

NumberInput is a numeric input field with optional min/max clamping, integer-only mode, step control, units display, clear button, loading state, and InputGroup integration. It uses a "pending input" pattern where the raw string is tracked while typing, with validation and commit on blur. The component uses the shared `Field` wrapper, `inputRecipe`, and integrates with `InputGroupContext`.

## Issues

### Critical

- None

### High

- **`onChange` called with `null` on clear but type says `number` for non-clearable variant**: The discriminated union (`NumberInputClearableProps | NumberInputNonClearableProps`) correctly types `onChange` as `(value: number) => void` when `hasClear` is not `true`. However, inside the component body at line 354, `onChange(null)` is called without a type guard -- this compiles because TypeScript sees the union of both onChange signatures. In practice this is safe because the clear button only renders when `hasClear === true`, but the code structure relies on runtime behavior rather than compile-time safety. If someone refactors the clear button guard, `null` could leak to a non-nullable onChange.
- **`aria-invalid` set to `true` when input is temporarily invalid during typing**: At line 295, `aria-invalid` is set when `!isInputValid`, which fires while the user is still typing (e.g., typing "1" then "0" then "0" for "100" in a min=50 field -- "1" and "10" would be invalid). This causes screen readers to announce errors during typing, which is a poor accessibility experience. Consider only applying `aria-invalid` based on the committed value, not the pending input.

### Medium

- **No recipe file**: Similar to MultiSelect, NumberInput uses the shared `inputRecipe` from Field but defines its own `styles` object with `css()`. The `units` style is a one-off `css()` call. This is minimal but slightly inconsistent with the recipe pattern used by InputGroup.
- **`parseNumberInput` returns `null` for out-of-range values, silently rejecting input**: When a user types a value outside min/max, `parseNumberInput` returns `null` and the `onChange` is never called. The user gets no feedback about why their input was rejected until they blur and the pending input is discarded, reverting to the previous value. This can be confusing. Consider clamping to min/max on blur instead of silently rejecting.
- **Missing story for `hasClear`**: While there is `WithUnits` which incidentally sets `hasClear`, there is no dedicated `Clearable` story that demonstrates the clear button as the primary feature.
- **No test for InputGroup integration**: The component has InputGroup integration code (lines 258-261, 369-371) but no test verifying that size/disabled/status propagate correctly from an InputGroup parent.

### Low

- **`step` prop passed through but no story demonstrates it**: The `step` prop is accepted and forwarded to the native input but has no story showing its effect on the stepper arrows.
- **`onKeyDown` test missing**: While `onEnter` is tested, the `onKeyDown` prop is not directly tested.
- **`autoComplete` and `htmlName` have no stories**: These HTML-passthrough props are accepted but not demonstrated.
- **`displayValue` memo has simple logic**: The `useMemo` for `displayValue` (lines 263-268) wraps trivial logic (a ternary). This is unlikely to cause performance issues but the memoization may be unnecessary for such a simple computation.

## Recommendations

1. Consider only setting `aria-invalid` based on the committed value (the `status?.type === 'error'` condition), not the pending input validity, to avoid screen reader noise during typing.
2. Add a user-visible indication (e.g., a brief status message or visual cue) when input is rejected due to min/max bounds, rather than silently ignoring it.
3. Add a dedicated `Clearable` story and an `InputGroupIntegration` story.
4. Add a test for the InputGroup integration path to verify that group-level disabled/size/status propagation works correctly.
5. Overall the component is solid with good pending-input UX, clean discriminated union typing for clearable/non-clearable, and thorough test coverage of core scenarios.

## SVA Conversion

**Benefit: Low / None**

NumberInput delegates almost all of its styling to the shared Field input recipes: the wrapper uses `inputRecipe({size, status, isDisabled})` and the input, icon slots, and clear button use `inputStyles.control` / `inputStyles.iconSlot` / `inputStyles.clearButton` from the Field module. Its own standalone `styles` object in `NumberInput.tsx` contains exactly one block (`units`, a small text span). There are no per-element `cx()` conditional style branches local to this component and no orientation/variant logic of its own. Because the multi-element styling already lives in the shared `inputRecipe`/`inputStyles` (which Field owns), an `sva` here would add nothing -- the single local `units` style is trivial. Any consolidation effort belongs in the Field input recipes, not in a NumberInput slot recipe.
