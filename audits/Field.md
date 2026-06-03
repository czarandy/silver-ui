# Field Audit

## Summary

A foundational form field wrapper that renders a label, optional description, a control slot (`children`), and a validation status message. Used by virtually every input component in the library. Also provides shared recipes (`fieldLabelRecipe`, `fieldStatusRecipe`), input styles (`inputRecipe`, `inputStyles`), utility functions (`getDescribedBy`, `getStatusMessageID`, `getStatusIcon`), and types (`InputStatus`, `InputStatusType`, `InputSize`, `FieldNecessity`).

## Issues

### Critical

- None.

### High

None

### Medium

- **Both `isOptional` and `isRequired` can be true simultaneously.** The props are independent booleans with no runtime validation. If both are set to `true`, the ternary `isOptional ? 'Optional' : isRequired ? 'Required' : null` means `'Optional'` wins silently. The `FieldNecessity` type documents that they are mutually exclusive, but TypeScript does not enforce this (both are optional booleans). A runtime warning or a discriminated union type would prevent misuse.
- **Only one story (Default) for a foundational component.** Field is used everywhere but has minimal story coverage. Missing stories for: `isRequired`, `isOptional`, `isDisabled`, `isLabelHidden`, `labelAs="span"`, `labelIcon`, `labelTooltip`, `statusVariant="detached"`, error/warning/success status, and nested input patterns.
- **Only two tests for a critical component.** The tests verify label/description/status rendering and root props, but do not test: `isLabelHidden`, `isDisabled` label cursor, `labelAs="span"`, `isOptional`/`isRequired` indicator text, `statusVariant` variations, `labelTooltip`, `labelIcon`, `descriptionID` association, or `aria-live` behavior.
- **`data-testid={undefined}` hardcoded on the description `Text` element.** Line 202 has `data-testid={undefined}` explicitly set, which is unnecessary and likely a leftover. It does not cause harm but is dead code.

### Low

- **`isOptional` and `isRequired` default to `false` in the function signature but are typed as optional booleans.** The defaults (`isOptional = false`, `isRequired = false`) are fine for the component itself, but child components spread `FieldNecessity` and may not apply the same defaults, leading to inconsistency.
- **`inputStyles.clearButton` lacks a hover state.** The clear button style has `_focusVisible` but no `_hover` style for visual feedback.
- **`getStatusIcon` does not handle unknown status types.** It falls through to the error icon for any unrecognized type. This is a reasonable default but could mask bugs if new status types are added.
- **`fieldStatusRecipe` uses `mt: '-1'` for attached variant.** This negative margin overlaps the status message with the input border. While intentional (creating a visual attachment), it could cause clipping issues with certain input border-radius values.

## Recommendations

1. Add significantly more stories to demonstrate all states of this foundational component, especially since other component audits reference Field behavior.
2. Add comprehensive tests for `isLabelHidden`, `labelAs`, `statusVariant`, and necessity indicator text.
3. Consider using a discriminated union for `FieldNecessity` to make `isOptional` and `isRequired` truly mutually exclusive at the type level.
4. Remove the `data-testid={undefined}` on the description element.
