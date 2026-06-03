# TextInput Audit

## Summary

Single-line text input field supporting text, email, and password types. Built on the shared `Field` wrapper and `inputRecipe` styles. Features include clear button, start icon, end content slot, loading state, validation status, description, onEnter callback, InputGroup integration (inherits size, disabled, and status from parent InputGroup), and all standard input props.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **`onChange` event parameter is `null` when clearing.** The `onChange` signature is `(value: string, event: ChangeEvent<HTMLInputElement> | null) => void`. When the clear button is clicked, `onChange('', null)` is called. The `null` event is unusual and forces consumers to handle a nullable event parameter. Consider dispatching a synthetic change event on the input instead, or at minimum documenting this behavior clearly. Consumers who destructure the event (e.g., `event.target`) without null-checking will get runtime errors.
- **InputGroup mode skips the `Field` wrapper.** When `useInputGroup()` returns a non-null context, the component renders only the raw input wrapper without `Field`. This means `description`, `isLabelHidden`, `labelIcon`, `labelTooltip`, `status` message text, and necessity indicators are all silently ignored in InputGroup mode. The `label` is rendered as `aria-label` instead. This is probably intentional for InputGroup composition, but consumers may not realize their props are being dropped.
- **No test for InputGroup integration.** The InputGroup code path (`if (inputGroup != null)`) is completely untested. This includes `effectiveDisabled`, `effectiveStatusType`, `aria-label` instead of field label, and the class/style passthrough.
- **Missing `@default` annotations in JSDoc.** Several boolean props (`hasAutoFocus`, `hasClear`, `isDisabled`, `isLabelHidden`, `isLoading`) lack `@default` annotations in their JSDoc, unlike other form components that consistently document defaults. This inconsistency makes the API harder to scan.

### Low

- **No recipe file.** Styles are from shared `inputRecipe` and `inputStyles`. No custom styles, so no recipe needed. Clean.
- **No test for `autoComplete` prop.** The `autoComplete` HTML attribute is passed through but never tested.
- **No test for `onFocus` / `onBlur` callbacks.** These are passed through to the input but not tested.
- **No test for `htmlName` prop.** Direct HTML passthrough, low risk.
- **No test for `isLabelHidden` behavior.** This is handled by `Field` and likely works, but no explicit test.
- **No test for `labelTooltip` or `labelIcon`.** These are `Field` passthrough props, untested.
- **Story for `StatusVariants` uses hardcoded render.** The story does not use Storybook args, so the controls panel is not functional for that story. This is a story quality issue, not a code issue.
- **`type` prop is limited to three values.** `TextInputType` only allows `'email' | 'password' | 'text'`. Other common types like `'url'`, `'tel'`, and `'search'` are excluded. This is a deliberate API surface decision but may force consumers to work around it for valid use cases.

## Recommendations

1. Document the `onChange(value, null)` behavior when clearing, or consider dispatching a synthetic event to avoid the null event parameter.
2. Add tests for InputGroup integration to cover the code path where `Field` is skipped.
3. Add `@default` annotations to boolean prop JSDoc comments for consistency with other form components.
4. Consider expanding `TextInputType` to include `'url'`, `'tel'`, and `'search'` if those use cases arise.
5. Add tests for `onFocus`/`onBlur` callbacks and `autoComplete` passthrough.
