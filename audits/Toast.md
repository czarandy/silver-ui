# Toast Audit

## Summary

Toast is a comprehensive notification system consisting of four parts: `Toast` (individual notification), `ToastViewport` (provider and viewport container), `ToastContext` (React context), and `useToast` (consumer hook). It supports auto-dismiss with pause-on-hover/focus, manual dismiss, exit animations, positioning, deduplication, collision behaviors, and top-layer rendering via the popover API. The implementation is sophisticated and well-tested.

## Issues

### Critical

- None

### High

- **`eslint-disable jsx-a11y-x/no-static-element-interactions` at the top of `Toast.tsx`.** This file-level disable suppresses accessibility lint warnings for the entire file. The disable is needed because `onMouseEnter`/`onMouseLeave`/`onFocusCapture`/`onBlurCapture` are on a `<div>`. However, file-level disables are overly broad. Consider using a line-level disable or restructuring to avoid the warning.

### Medium

- **Toast `onDismiss` callback is in `startTimer`'s dependency, causing timer resets.** The `startTimer` callback depends on `onDismiss`, and the `useEffect` that starts the timer depends on `startTimer`. If the parent re-renders and creates a new `onDismiss` function reference (common when not using `useCallback`), the timer will restart. In `ToastViewport`, the `onDismiss` is an inline arrow `(reason => removeToast(entry.id, reason))` which creates a new reference on every render, potentially resetting the auto-dismiss timer whenever any toast state changes. This could cause toasts to never auto-dismiss in practice if the viewport re-renders frequently.
- **Exit animation timing is hardcoded at 180ms.** The `window.setTimeout(() => { ... }, 180)` in `removeToast` must stay in sync with the CSS `transitionDuration: 'fast'`. If the token value changes, the JS and CSS will be out of sync, causing either premature removal or a delay after animation ends.
- **`toastIdCounter` is a module-level mutable variable.** In `useToast.tsx`, `toastIdCounter` is a module-global counter that increments on each toast. In environments with module isolation (e.g., testing), this counter does not reset between tests, leading to non-deterministic IDs. While this does not cause functional issues, it makes snapshot testing unreliable. Consider using `crypto.randomUUID()` or a context-scoped counter.
- **`ToastViewport` ref handling is manual.** The ref callback in `ToastViewport` manually checks `typeof ref === 'function'` vs object ref. This is a common pattern but fragile -- it does not handle string refs (though those are deprecated) and the manual logic could be replaced by the library's `mergeRefs` utility (which exists in `src/internal/mergeRefs.ts`).
- **No `aria-label` on individual toasts.** Each toast has `role="alert"` or `role="status"` and `aria-live`, but no `aria-label`. The content is announced via `aria-atomic="true"`, which works, but a concise label (e.g., the toast type) could help screen reader users distinguish between multiple simultaneous toasts.

### Low

- **`isAutoHide` default logic is split between `ToastViewport` and the `Toast` component.** The default (`true` for non-error, `false` for error) is computed in `ToastViewport` at render time. This logic should ideally live in `types.ts` or be documented more prominently so consumers of the raw `Toast` component (without the viewport) know the expected defaults.
- **No story for deduplication (`uniqueID` / `collisionBehavior`).** These are important features tested in the test file but not demonstrated in Storybook.
- **No story for `maxVisible` prop.** The viewport's `maxVisible` limiting behavior is not demonstrated.
- **No story for `inset` prop.** Custom viewport insets are not demonstrated.
- **No story for `isTopLayer={false}`.** The non-popover mode is used in tests but not shown in stories.
- **`ShowToastFixture` in tests uses `Record<string, unknown>` for extra options.** This bypasses type safety and could mask issues if the `ToastOptions` interface changes.
- **No test for the viewport `maxVisible` prop.** The slicing logic `toasts.slice(-maxVisible)` is not tested.
- **No test for the `inset` prop.**
- **`window.setTimeout` in `removeToast` should use `globalThis.setTimeout` for SSR safety.** While toast notifications are inherently client-side, using `globalThis` is a better practice.

## Recommendations

1. Stabilize the `onDismiss` reference in `ToastViewport` using `useCallback` or a ref-based pattern to prevent timer resets on re-renders.
2. Use the existing `mergeRefs` utility for the viewport ref instead of manual ref handling.
3. Replace the file-level eslint-disable with a targeted line-level disable.
4. Add stories for `uniqueID`/`collisionBehavior`, `maxVisible`, `inset`, and `isTopLayer={false}`.
5. Add tests for `maxVisible` and `inset` props.
6. Consider syncing the exit animation timeout with the CSS transition duration via a shared constant.

## SVA Conversion

**Benefit: Moderate**

Toast renders 4 distinct styled elements (root, `inner` flex row, `content`, `end` action group) styled entirely by a standalone `const styles = {...}` object in `Toast.tsx` — no recipe. The 9 `css()` blocks include a `type`-keyed color set (`info`/`error`/`success`/`warning`, looked up as `styles[type]`) and an `isExiting` state block, applied via `cx(styles.root, styles[type], isExiting ? styles.exiting : ...)`. An `sva` with slots `root`/`inner`/`content`/`end` plus a `type` variant and an `isExiting` boolean variant would replace the manual `styles[type]` index lookup and the conditional `cx` with proper recipe variants. The benefit is moderate rather than strong because only the root carries the variant styling — the inner/content/end slots are static layout — so consolidation mainly cleans up the type/exiting branching rather than a large per-slot variant matrix. (The separate `ToastViewport.tsx` has its own `position`-keyed styles map that is a similar but distinct candidate.)
