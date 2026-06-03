# RadioGroup Audit

## Summary

RadioGroup is a controlled radio group for single-value selection, composed of `RadioGroup.tsx` (container with context), `RadioGroupItem.tsx` (individual radio option), and `RadioGroupContext.tsx` (shared context). It uses visually hidden native radio inputs overlaid with custom visual indicators and delegates label/status rendering to the shared `Field` component. The `RadioGroupItem` uses the `Item` layout component for consistent spacing.

## Issues

### Critical

- None

### High

- None

### Medium

- **`onChange` not memoized causes context churn**: The JSDoc for `onChange` correctly warns "Memoize with useCallback to avoid unnecessary re-renders of radio items", but the context value includes `onChange` directly. Since `useMemo` on the context value (line 132-143) includes `onChange` in its dependency array, every parent re-render that passes a new `onChange` function will recreate the context value, causing all `RadioGroupItem` children to re-render. This is a known pattern trade-off, but the component could mitigate it by storing `onChange` in a ref internally.
- **No `lg` size variant**: `RadioGroupSize` only supports `'sm' | 'md'`, while other input components in the library (TextInput, NumberInput, Select) support `'sm' | 'md' | 'lg'`. This inconsistency may confuse consumers who expect all inputs to support the same size scale.
- **`RadioGroupItem` description ID uses `useId()` but is always generated**: At line 143, `const descriptionId = useId()` is always called even when `description` is `null`. The ID is only used when a description is present. This is harmless (React hooks must be called unconditionally) but the generated ID is wasted when no description exists.
- **Missing story for `isOptional`**: The stories demonstrate `Required` but not `Optional`.

### Low

- **No test for `orientation` layout**: The `Horizontal` story exists but there is no test verifying that `aria-orientation="horizontal"` is set on the radiogroup.
- **No test for `className`, `style`, `ref`, or `data-testid` forwarding on RadioGroup**: These props are accepted and forwarded through `Field` but are not directly tested on `RadioGroup`.
- **No test for `startContent` and `endContent` on RadioGroupItem**: Stories demonstrate these (WithIcons, WithEndContent) but tests do not verify them.
- **String concatenation for className**: At line 174-175, `${styles.group} ${styles.vertical}` uses template string concatenation instead of the `cx()` utility used elsewhere. This is functionally equivalent but inconsistent.
- **`RadioGroupContext` does not use `use()` hook**: The context file uses `createContext` directly, while `RadioGroupItem` calls `use(RadioGroupContext)` (the new React 19 API). This is correct -- just noting the modern API usage.
- **No `displayName` on RadioGroupContext**: While `RadioGroupContext.displayName` is set (line 20), the `RadioGroupItem` and `RadioGroup` both have their own `displayName` set properly.

## Recommendations

1. Consider adding a `lg` size variant for consistency with other input components.
2. Consider storing `onChange` in a ref inside `RadioGroup` to prevent context churn when consumers forget to memoize their callback.
3. Add a test for `orientation` to verify `aria-orientation` is set correctly.
4. Add an `Optional` story for completeness.
5. Use `cx()` consistently instead of template string concatenation for className merging.
6. The component has excellent accessibility: proper `role="radiogroup"`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-required`, `aria-orientation`, native radio inputs for keyboard navigation, and a good error boundary (`RadioGroupItem` throws if used outside `RadioGroup`).
