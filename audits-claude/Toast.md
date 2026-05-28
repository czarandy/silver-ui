# Toast Component Audit

Audited files:

- `src/components/Toast/Toast.tsx`
- `src/components/Toast/ToastContext.ts`
- `src/components/Toast/ToastViewport.tsx`
- `src/components/Toast/types.ts`
- `src/components/Toast/useToast.tsx`
- `src/components/Toast/index.ts`
- `src/components/Toast/Toast.stories.tsx`
- `src/components/Toast/Toast.test.tsx`

No recipe file exists for this component.

---

## Performance Problems

### 1. New inline closure created on every render for `onDismiss`

**File:** `ToastViewport.tsx`, line 248

```tsx
onDismiss={reason => removeToast(entry.id, reason)}
```

A new arrow function is created on each render for every visible toast. Since `removeToast` is already stable (wrapped in `useCallback`), this still forces a shallow-prop change on every `Toast` child on every render of `ToastViewport`. Because `Toast` is not memoized, this does not cause extra re-renders today, but it prevents future memoization from being effective.

**Severity:** Low. Only matters if `Toast` is later wrapped in `React.memo`.

### 2. Module-level mutable counter for toast IDs

**File:** `useToast.tsx`, line 10

```tsx
let toastIdCounter = 0;
```

A module-scoped mutable counter is fine for single-page apps but is not SSR-safe. During server rendering the counter is shared across all requests and never resets, leading to non-deterministic IDs. This is unlikely to cause a real bug since toasts are inherently client-side, but it is worth documenting or guarding.

**Severity:** Low.

### 3. `exitingIds` stored as `Set` causes new object on every mutation

**File:** `ToastViewport.tsx`, line 141

```tsx
const [exitingIds, setExitingIds] = useState<Set<string>>(() => new Set());
```

Every call to `setExitingIds` creates a new `Set`. This is correct for immutability, but `exitingIds.has(entry.id)` is called inside the render loop (lines 238, 247), meaning every toast re-evaluates membership on every render. With the current `maxVisible` cap of 5 this is negligible, but using a plain object (`Record<string, boolean>`) would be slightly cheaper and more idiomatic for React state.

**Severity:** Negligible.

---

## Accessibility Concerns

### 1. ESLint directive suppresses static-element interaction warning

**File:** `Toast.tsx`, line 1

```tsx
/* eslint-disable jsx-a11y-x/no-static-element-interactions */
```

The root `<div>` has `onMouseEnter`, `onMouseLeave`, `onFocusCapture`, and `onBlurCapture` handlers on a non-interactive element. These are used for pausing the auto-dismiss timer and do not require keyboard equivalents (keyboard focus is already handled via `onFocusCapture`/`onBlurCapture`), so the suppression is justified. However, the comment should explain why the rule is suppressed.

**Severity:** Low (code hygiene).

### 2. No `aria-label` or visible heading on individual toasts

**File:** `Toast.tsx`, lines 179-212

Each toast has `role="status"` or `role="alert"`, `aria-live`, and `aria-atomic`, which is correct. However, there is no `aria-label` on individual toasts, so screen reader users hearing multiple notifications have no way to distinguish them except by their body text. This is acceptable if `body` always contains text, but if `body` is a complex `ReactNode` without readable text, the announcement may be empty or confusing.

**Severity:** Low. Consider adding an optional `aria-label` prop.

### 3. Dismiss button has a generic label

**File:** `Toast.tsx`, line 204

```tsx
label = 'Dismiss notification';
```

All toasts share the same dismiss button label. If multiple toasts are visible, screen reader users cannot tell which "Dismiss notification" button corresponds to which toast. A more descriptive label (or `aria-describedby` linking to the toast body) would improve clarity.

**Severity:** Medium.

### 4. No focus management on toast appearance or dismissal

**File:** `ToastViewport.tsx`

When a toast appears or is dismissed, focus is not moved. For `role="status"` with `aria-live="polite"` this is correct (the live region handles announcement). For `role="alert"` (error toasts), the announcement is automatic via `aria-live="assertive"`. However, if a user had focus inside a toast that gets dismissed, focus is lost to `<body>`. There is no focus restoration logic.

**Severity:** Medium. Focus should be moved to the next visible toast or returned to the previously focused element when a focused toast is dismissed.

### 5. The viewport `<div>` uses `role="region"` with `aria-label="Notifications"`

**File:** `ToastViewport.tsx`, line 228

This is correct and well-done. No issue here.

---

## Logic Bugs

### 1. Overwrite collision replaces the entry but keeps the old internal `id`

**File:** `ToastViewport.tsx`, lines 150-164

When a toast with a matching `uniqueID` is overwritten, the new `entry` (which has a new `id` from `generateToastId()`) fully replaces the old one. This is correct. However, if `removeToast` was already called for the old entry (e.g., its dismiss function was captured), the old `id` will not match any toast and the removal silently no-ops. This could lead to a stale dismiss function reference.

**Severity:** Low. Edge case only reachable if a consumer stores the dismiss function returned by `useToast` and calls it after an overwrite.

### 2. `onDismiss` identity changes cause timer reset

**File:** `Toast.tsx`, lines 130-142, 169-177

`startTimer` depends on `onDismiss` (line 142). The `useEffect` on line 169 depends on `startTimer`. In `ToastViewport`, `onDismiss` is an inline arrow (line 248), so it changes identity on every render. This means the effect fires on every re-render of `ToastViewport`, resetting the timer and `remainingRef`. A user hovering, pausing the timer, then another toast arriving would reset the first toast's timer from the full `autoHideDuration` rather than the paused remaining time.

**Severity:** High. The auto-dismiss timer is fragile. The `useEffect` resets `remainingRef.current = autoHideDuration` (line 170) every time `startTimer` changes, which happens whenever the parent re-renders because `onDismiss` is a new closure. This effectively restarts the countdown from scratch on every parent render.

**Fix:** Either memoize the `onDismiss` callback in `ToastViewport` (e.g., via a stable ref), or store `onDismiss` in a ref inside `Toast` and remove it from `startTimer`'s dependency array.

### 3. `findByUniqueID` is defined and exposed on context but never consumed

**File:** `ToastContext.ts`, line 6; `ToastViewport.tsx`, line 183

`findByUniqueID` is part of `ToastContextValue` and implemented in `ToastViewport`, but it is never called anywhere in the codebase. It is not exported from `useToast` either. This is dead code unless intended for future use.

**Severity:** Low (dead code).

### 4. `window.setTimeout` used directly

**File:** `ToastViewport.tsx`, line 173

```tsx
window.setTimeout(() => { ... }, 180);
```

The 180ms timeout for the exit animation is not cleaned up on unmount. If `ToastViewport` unmounts before the timeout fires, `setExitingIds` and `setToasts` are called on an unmounted component. React 18+ tolerates this (no-op state updates), but it is still a minor correctness issue and could cause warnings in strict mode or testing environments.

**Severity:** Low.

---

## Unclear API

### 1. `isAutoHide` and `autoHideDuration` are both required on `Toast`

**File:** `Toast.tsx`, lines 19-21, 39-41

Both `isAutoHide` and `autoHideDuration` are required props on `Toast`. If `isAutoHide` is `false`, `autoHideDuration` is meaningless but still must be provided. These should either be combined into a single optional `autoHideDuration` (where `undefined` or `0` means no auto-hide), or `autoHideDuration` should be optional when `isAutoHide` is `false`.

**Severity:** Medium. Confusing for direct `Toast` consumers.

### 2. `ToastOptions.isAutoHide` default depends on `type`

**File:** `ToastViewport.tsx`, lines 232-233

```tsx
const isAutoHide =
  entry.options.isAutoHide ?? (type === 'error' ? false : true);
```

The default for `isAutoHide` is `true` for info toasts and `false` for error toasts. This implicit coupling is not documented in the `ToastOptions` interface (`types.ts`, line 29). The JSDoc just says "Whether the toast auto-dismisses" with no mention of the type-dependent default.

**Severity:** Medium. Should be documented.

### 3. `ToastEntry` is exported but is essentially an internal type

**File:** `types.ts`, lines 49-53; `index.ts`

`ToastEntry` is not exported from `index.ts`, but `ToastContextValue` (which references `ToastEntry`) is exported from `ToastContext.ts`. If a consumer imports `ToastContext` directly, they would need `ToastEntry`, but it is not publicly exported. Either export `ToastEntry` from `index.ts` or make `ToastContextValue` fully internal.

**Severity:** Low.

### 4. `type` prop is named `type` which shadows HTML attribute

**File:** `Toast.tsx`, line 62; `types.ts`, line 3

Using `type` as a prop name can cause confusion since `<div>` elements have an implicit `type` attribute in some contexts. A name like `variant` or `tone` would be more conventional for a component library.

**Severity:** Low (naming preference).

---

## Missing Tests

### 1. No test for pause/resume timer behavior

**File:** `Toast.test.tsx`

The hover-to-pause and focus-to-pause timer behavior (Toast.tsx lines 144-167, 190-191) is completely untested. This is core functionality that prevents accidental dismissal while a user is interacting with a toast.

**Severity:** High. Should test:

- Mouse hover pauses auto-dismiss.
- Mouse leave resumes auto-dismiss.
- Focus inside toast pauses auto-dismiss.
- Blur from toast resumes auto-dismiss.

### 2. No test for error toast non-auto-dismiss default

**File:** `Toast.test.tsx`

There is a test for info toast auto-dismiss (line 98) but no corresponding test verifying that error toasts do NOT auto-dismiss by default.

**Severity:** Medium.

### 3. No test for `maxVisible` prop

**File:** `Toast.test.tsx`

The `maxVisible` prop on `ToastViewport` is untested. Adding 6+ toasts and verifying only 5 are rendered would cover this.

**Severity:** Medium.

### 4. No test for `onHide` callback

**File:** `Toast.test.tsx`

`ToastOptions.onHide` (types.ts line 33) is invoked in `removeToast` (ToastViewport.tsx line 171) but never tested.

**Severity:** Medium.

### 5. No test for `collisionBehavior: 'ignore'`

**File:** `Toast.test.tsx`

Only `overwrite` deduplication is tested (line 66). The `ignore` behavior is untested.

**Severity:** Medium.

### 6. No test for the dismiss function returned by `useToast`

**File:** `Toast.test.tsx`

`useToast` returns a `ToastDismissFn` (useToast.tsx line 28) that can programmatically dismiss the toast. This is never tested.

**Severity:** Medium.

### 7. No test for `position` prop

**File:** `Toast.test.tsx`

All four positions (`bottomEnd`, `bottomStart`, `topEnd`, `topStart`) are untested.

**Severity:** Low (primarily visual).

### 8. No test for `inset` prop

**File:** `Toast.test.tsx`

Custom viewport insets are untested.

**Severity:** Low (primarily visual).

### 9. No test for exit animation lifecycle

**File:** `Toast.test.tsx`

The 180ms exit animation (ToastViewport.tsx line 173) and `isExiting` state propagation are untested. Tests should verify that the toast receives `isExiting` and is removed from the DOM after the animation delay.

**Severity:** Medium.

### 10. No test for `useToast` outside of `ToastViewport`

**File:** `Toast.test.tsx`

Calling the function returned by `useToast()` outside a `ToastViewport` should throw (useToast.tsx line 23), but this is untested.

**Severity:** Low.

---

## Missing Stories

### 1. No story for `position` variants

**File:** `Toast.stories.tsx`

The `ToastViewport` supports four positions (`bottomEnd`, `bottomStart`, `topEnd`, `topStart`), but only the default (`bottomEnd`) is shown in the `WithViewport` story.

**Severity:** Medium. Each position should have a story or a single story with controls.

### 2. No story for `autoHideDuration` / auto-dismiss behavior

**File:** `Toast.stories.tsx`

There is no story demonstrating auto-dismiss. The `Default` story sets `isAutoHide: false` (line 14), so users never see auto-dismiss in Storybook.

**Severity:** Medium.

### 3. No story for `endContent` prop

**File:** `Toast.stories.tsx`

The `endContent` prop (for rendering actions like "Undo" before the dismiss button) has no story.

**Severity:** Medium. This is a key customization point.

### 4. No story for `maxVisible` overflow

**File:** `Toast.stories.tsx`

No demonstration of what happens when more toasts are shown than `maxVisible` allows.

**Severity:** Low.

### 5. No story for `inset` customization

**File:** `Toast.stories.tsx`

Custom viewport insets are not demonstrated.

**Severity:** Low.

### 6. No story for `uniqueID` deduplication

**File:** `Toast.stories.tsx`

The deduplication behavior (`uniqueID` + `collisionBehavior`) is not demonstrated.

**Severity:** Low.

### 7. No story for `isTopLayer` behavior

**File:** `Toast.stories.tsx`

The `WithViewport` story sets `isTopLayer={false}` (line 49) to work around Storybook rendering. There is no story explaining or demonstrating the popover top-layer behavior.

**Severity:** Low.

---

## Summary

| Category        | High | Medium | Low |
| --------------- | ---- | ------ | --- |
| Performance     | 0    | 0      | 3   |
| Accessibility   | 0    | 2      | 3   |
| Logic Bugs      | 1    | 0      | 3   |
| Unclear API     | 0    | 2      | 2   |
| Missing Tests   | 1    | 5      | 4   |
| Missing Stories | 0    | 3      | 4   |

**Most critical issue:** The auto-dismiss timer reset bug (Logic Bugs #2). Because `onDismiss` is a new closure on every render of `ToastViewport`, the `useEffect` in `Toast` reruns on every parent render, resetting `remainingRef` to the full `autoHideDuration`. This effectively means pause/resume is broken whenever the parent re-renders while a toast is paused, and the timer restarts from scratch on any sibling state change.
