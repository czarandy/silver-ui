# PasswordInput Audit

## Summary

PasswordInput is a thin wrapper around TextInput that adds a toggle button to show/hide the password. It uses internal state for visibility and delegates all input behavior to TextInput. The component strips `endContent`, `hasClear`, `startIcon`, and `type` from the forwarded props to prevent conflicts with its toggle button behavior.

## Issues

### Critical

- None

### High

- None

### Medium

- **Stories use uncontrolled pattern for some variants**: Several stories (e.g., `Default`, `Required`, `Optional`, `HiddenLabel`, `WithLabelTooltip`) do not provide `onChange` or `value` props. This works because TextInput (and thus PasswordInput) apparently supports an uncontrolled mode, but it is inconsistent with other component stories in the library that always provide controlled state. It also means Storybook's controls panel cannot interact with the value.
- **No way to clear or reset the visibility state**: When the component is controlled externally, there is no prop to control or reset the visibility state (e.g., `isVisible` / `onVisibilityChange`). If a consumer needs to reset visibility on form submission or route change, they have to unmount/remount the component. This may be an intentional simplification but is worth noting as a potential API gap.
- **Toggle button `onClick` creates new function on every render**: The `onClick={() => setIsVisible(v => !v)}` at line 40 creates a new function reference on every render. Since this is passed to `Button`, which may be memoized, it could cause unnecessary re-renders of the toggle button. Using `useCallback` would be a minor optimization.

### Low

- **`WithValue` story passes `value` without `onChange`**: The `WithValue` story sets `value: 'supersecret'` but does not provide an `onChange` handler. This means Storybook will render the input but typing will not update the displayed value.
- **No story for `autoComplete`**: Password inputs commonly use `autoComplete="current-password"` or `autoComplete="new-password"`, but there is no story demonstrating this integration.
- **No test for the `className` and `style` forwarding**: While these props are destructured and forwarded, they are not tested.
- **No test for `data-testid` forwarding**: The `data-testid` prop is destructured and forwarded but not tested.

## Recommendations

1. Make all stories fully controlled with `useState` for consistency with the rest of the library.
2. Consider adding an `autoComplete` story to demonstrate the common password field patterns.
3. Consider wrapping the toggle `onClick` handler in `useCallback` for a minor re-render optimization.
4. The component is clean, well-scoped, and follows good accessibility practices -- the toggle button has clear labels ("Show password" / "Hide password"), is disabled when the input is disabled, and keyboard interaction is properly tested.

## SVA Conversion

**Benefit: Low / None**

PasswordInput is a pure composition wrapper around `TextInput` (`PasswordInput.tsx`). It renders no DOM elements of its own and contains no `css()` calls, no `styles` object, and no recipe -- it only forwards props to `TextInput` and injects a `Button` as `endContent` for the show/hide toggle. All styling lives in `TextInput`/`Field` and `Button`. With zero styled elements owned by this component, an `sva` slot recipe has nothing to consolidate.
