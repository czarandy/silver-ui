# Spinner Audit

## Summary

Spinner is a compact loading indicator that renders a spinning circle with an optional visible label. It uses a recipe for size/variant/label layout variants and provides good accessibility defaults (`role="status"`, computed `aria-label`). The implementation is clean, the recipe pattern is well-applied, and the test coverage is thorough.

## Issues

### Critical

- None

### High

- None

### Medium

- **`prefers-reduced-motion: reduce` sets `animation: none` with no fallback indication.** When reduced motion is preferred, the spinner circle becomes completely static with no visual indication of loading. Unlike Skeleton (which removes the shimmer but keeps the placeholder visible), the Spinner just shows a static partial circle. Consider adding an alternative indicator (e.g., opacity pulse, or a text-only "Loading" fallback) for users who prefer reduced motion.
- **Spinner announces to screen readers but may be noisy.** Like Skeleton, when multiple Spinners appear on a page, each one has `role="status"` and an `aria-label`. If a consumer renders several Spinners (e.g., in a table with loading cells), screen readers may announce "Loading" repeatedly.

### Low

- **`SpinnerProps` interface has JSDoc on the interface declaration itself.** The JSDoc block is on the `export interface SpinnerProps` rather than on the component function. This is fine but unconventional -- most JSDoc tools associate documentation with the function/component declaration.
- **`label` prop only accepts `string`, but runtime guards against non-string values.** The TypeScript type is `string`, but the implementation checks `typeof label === 'string'` which also handles `false as never` (tested). This is good defensive coding but suggests the type could be `string | undefined` to be clearer about optional usage.
- **No test for the `data-testid` prop forwarding.** While `data-testid` is used extensively in tests as a selector, there is no explicit test asserting that `data-testid` is forwarded (it is implicitly tested by usage, but other components have explicit tests for it).
- **No story demonstrating `aria-label` override.** The `aria-label` prop is tested but not shown in stories.

## Recommendations

1. Add a meaningful reduced-motion fallback (e.g., a pulsing opacity animation or a static icon with text) so users who prefer reduced motion still see a loading indication.
2. Consider adding an `aria-label` story to demonstrate the override capability.
3. The component is otherwise well-built and the test coverage is strong.
