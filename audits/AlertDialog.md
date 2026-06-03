# AlertDialog Audit

## Summary

AlertDialog is a modal confirmation dialog for destructive or irreversible actions. It composes the Dialog component internally, layering a fixed Layout with title, description, and action/cancel buttons. It also provides an imperative `useAlertDialog` hook. The component is clean, focused, and well-tested.

## Issues

### Critical

- None identified.

### High

- None identified.

### Medium

- **Action button not disabled during loading allows rapid double-submission via keyboard**: While the Button component appears to block clicks during `isLoading`, the `onAction` callback itself is not guarded. If the consumer's `onAction` is async, nothing prevents the user from pressing Enter repeatedly on the focused action button before `isActionLoading` is set to `true`. This is a consumer-side responsibility but could be mitigated with a built-in guard.
- **`useAlertDialog` element is recreated on every `options` change via `useMemo`**: The `useMemo` dependency on `options` (an object) means a new element is created whenever `show()` is called with new options. Since `setOptions` triggers a state change and options is a new object each time, this is acceptable, but if `show()` is called with the same logical options repeatedly, the reference changes still trigger re-renders. Minor performance concern in hot paths.

### Low

- **No story for the `data-testid` prop**: The `data-testid` prop is tested but not demonstrated in stories. This is a minor gap since it's a utility prop, not a visual one.
- **No story for the `ref` prop**: The `ref` prop is accepted but not demonstrated in any story.
- **`useAlertDialog` does not clear stale options on hide**: After calling `hide()`, the previous options remain in state. If `show()` is called again without options, the old options are still used. This is by design but could surprise consumers who expect a clean slate after hide.
- **Missing test for `style` and `className` passthrough on AlertDialog**: While Dialog's own tests cover these props, AlertDialog's test file does not verify that `className` and `style` are forwarded correctly to the underlying Dialog.
- **Duplicate title in both `label` and `LayoutHeader`**: The `title` prop is passed to both `Dialog label={title}` (for `aria-label`) and `<LayoutHeader title={title} />` (for the visible heading). This means the dialog has both an `aria-label` and a visible heading, which could create redundant announcements for screen readers. Using `aria-labelledby` pointing to the heading would be more idiomatic.

## Recommendations

- Consider using `aria-labelledby` referencing the heading element instead of duplicating the title in `aria-label`, to avoid redundant screen reader announcements.
- Consider adding a built-in debounce or disable mechanism to the action button when `onAction` is invoked, to prevent accidental double-submission.
- The component is well-structured with good test coverage (7 tests covering core scenarios, imperative hook, loading state, custom labels, variants, and data-testid). Stories cover all major visual variants.
