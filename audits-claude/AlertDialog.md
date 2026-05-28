# AlertDialog Audit

Files reviewed:

- `src/components/AlertDialog/AlertDialog.tsx`
- `src/components/AlertDialog/useAlertDialog.tsx`
- `src/components/AlertDialog/AlertDialog.stories.tsx`
- `src/components/AlertDialog/AlertDialog.test.tsx`
- `src/components/AlertDialog/index.ts`
- `src/components/Dialog/Dialog.tsx` (underlying implementation)

---

## Accessibility Concerns

### 1. Missing `aria-describedby` on the dialog (high)

**File:** `AlertDialog.tsx`, lines 103-136

The WAI-ARIA `alertdialog` pattern requires that the dialog's descriptive text be linked to the dialog element via `aria-describedby`. Currently the `description` prop is rendered as a `<Text>` element inside the dialog body, but there is no `id` on that element and no `aria-describedby` on the `<dialog>`. Screen readers will announce the title (via `aria-label`) but will not automatically announce the description text, which is critical context for a destructive action confirmation.

**Recommendation:** Generate a stable ID (e.g., via `useId`), apply it to the description `<Text>` element, and pass `aria-describedby` through to the underlying `Dialog`. The `Dialog` component would need to support forwarding this attribute.

### 2. Inline mode loses `alertdialog` role (medium)

**File:** `Dialog.tsx`, lines 156-177; `AlertDialog.tsx`, line 46 (`isInline` prop)

When `isInline={true}`, the `Dialog` renders a plain `<div>` with `aria-label` but without `role="alertdialog"`. This means the inline AlertDialog variant is not announced as an alert dialog to assistive technologies. The inline `<div>` path in `Dialog.tsx` (line 162) does not apply the `role` attribute at all, unlike the modal `<dialog>` path (line 215).

**Recommendation:** Either propagate the `role` to the inline div in `Dialog.tsx`, or remove `isInline` from the AlertDialog's public API since alert dialogs are inherently modal by definition.

### 3. No explicit focus management for the action button (low)

**File:** `AlertDialog.tsx`, lines 121-133

When the alert dialog opens, focus is managed by the underlying `Dialog` component, which looks for `[data-autofocus="true"]` or `[autofocus]` (Dialog.tsx, line 137). Neither the Cancel button nor the Action button has either attribute, so the browser's native `<dialog>` autofocus heuristic takes over. For destructive alert dialogs, best practice is to focus the Cancel button rather than the destructive action to prevent accidental confirmation.

**Recommendation:** Add `data-autofocus="true"` to the Cancel `Button` or expose a `autoFocusAction` prop to let consumers choose.

---

## Logic Bugs

### 4. `useAlertDialog` element is memoized with stale `onAction` (medium)

**File:** `useAlertDialog.tsx`, lines 38-44

The `element` is created via `useMemo` with dependencies `[isOpen, options]`. The `options` object includes `onAction`, and since `options` is set via `setOptions` (a state setter), the reference is stable per `show()` call. However, if a consumer calls `show()` with a new `onAction` closure that captures changing external state, the closure is captured at `show()` time and won't update if external values change while the dialog is open. This is an inherent trade-off of the imperative API and is unlikely to cause real bugs in typical usage, but worth documenting.

### 5. Action button click does not close the dialog (low, by design but surprising)

**File:** `AlertDialog.tsx`, line 129

Clicking the action button calls `onAction()` but does not call `onOpenChange(false)`. This means the consumer must explicitly close the dialog after handling the action. While this allows async workflows (e.g., showing a loading spinner before closing), it is a common source of bugs for consumers who forget to close the dialog. The `ControlledStory` in the stories file (line 29) demonstrates this pattern: `onAction={() => setIsOpen(false)}`.

**Recommendation:** Consider adding an `autoClose` prop (defaulting to `true`) that calls `onOpenChange(false)` after `onAction()`, or at minimum document this behavior clearly.

---

## Performance Problems

### 6. Minor: `useMemo` for element creation in `useAlertDialog` is appropriate (no issue)

The hook correctly memoizes the element and uses `useCallback` for `show`/`hide`. No unnecessary re-renders detected.

### 7. Inline style object created on every render (very low)

**File:** `AlertDialog.tsx`, lines 103-113 (implicitly via Dialog)

The `Dialog` component creates inline style objects on each render (Dialog.tsx, lines 171-174 and 217-221). This is standard React and unlikely to cause measurable performance issues, but if the AlertDialog is rendered in a high-frequency re-render path, it could contribute to GC pressure. Not actionable at current scale.

No significant performance problems found.

---

## Unclear API

### 8. `actionVariant` defaults to `'destructive'` but the type allows all Button variants (low)

**File:** `AlertDialog.tsx`, lines 8, 19

`AlertDialogActionVariant` is typed as `NonNullable<ButtonProps['variant']>`, which includes `'primary'`, `'secondary'`, `'ghost'`, and `'destructive'`. Using `ghost` or `secondary` for an alert dialog action button is visually unusual and likely unintended. Consider narrowing the type to `'primary' | 'destructive'` or documenting which variants are appropriate.

### 9. `description` is a plain string (low)

**File:** `AlertDialog.tsx`, line 36

The `description` prop is typed as `string`, preventing consumers from rendering rich content (e.g., bold text, links, or lists) in the description area. This is a deliberate simplicity trade-off, but some alert dialogs benefit from structured descriptions. Consider allowing `ReactNode` if the use case arises.

---

## Missing Tests

### 10. No test for `isActionLoading` state

**File:** `AlertDialog.test.tsx`

There is no test verifying that when `isActionLoading={true}`, the action button shows a loading indicator and is disabled (non-interactive). This is an important behavioral prop.

**Suggested test:**

- Render with `isActionLoading={true}`, assert the action button has `aria-busy="true"` and clicking it does not call `onAction`.

### 11. No test for custom `actionVariant`

**File:** `AlertDialog.test.tsx`

No test verifies that the `actionVariant` prop is forwarded correctly to the action button.

### 12. No test for custom `cancelLabel`

**File:** `AlertDialog.test.tsx`

No test verifies that a custom `cancelLabel` (e.g., `"No, keep it"`) replaces the default `"Cancel"` text.

### 13. No test for `isInline` rendering

**File:** `AlertDialog.test.tsx`

No test verifies the inline rendering mode produces a non-modal element.

### 14. No test for `data-testid` forwarding

**File:** `AlertDialog.test.tsx`

No test verifies that the `data-testid` prop is passed through to the rendered dialog element.

### 15. No test for `className` and `style` forwarding

**File:** `AlertDialog.test.tsx`

No test for custom class name or inline style propagation.

### 16. No test for `useAlertDialog.hide()`

**File:** `AlertDialog.test.tsx`, lines 49-78

The imperative hook test verifies `show()` opens the dialog, but never tests that `hide()` closes it or that `isOpen` returns to `false`.

### 17. No test for re-calling `show()` with different options

**File:** `AlertDialog.test.tsx`

No test verifies that calling `show()` a second time with different options updates the dialog content.

---

## Missing Stories

### 18. No story for custom `cancelLabel`

**File:** `AlertDialog.stories.tsx`

No story demonstrates a custom cancel label (e.g., `"No, keep it"` or `"Go back"`).

### 19. No story for `actionVariant` variations

**File:** `AlertDialog.stories.tsx`

While the `Imperative` story uses `actionVariant: 'primary'`, there is no dedicated story showing the different action variant options side by side.

### 20. No story for `isInline` mode

**File:** `AlertDialog.stories.tsx`

No story demonstrates the inline (non-modal) rendering mode.

### 21. No story for `width` customization

**File:** `AlertDialog.stories.tsx`

No story demonstrates custom width values.

### 22. No story with a long description or title

**File:** `AlertDialog.stories.tsx`

No story tests how the dialog handles overflow with very long titles or descriptions.

---

## Summary

| Category        | Issues Found | Severity                |
| --------------- | ------------ | ----------------------- |
| Accessibility   | 3            | 1 high, 1 medium, 1 low |
| Logic bugs      | 2            | 1 medium, 1 low         |
| Performance     | 0            | --                      |
| Unclear API     | 2            | low                     |
| Missing tests   | 8            | medium                  |
| Missing stories | 5            | low                     |

**Priority recommendations:**

1. Add `aria-describedby` linking the description text to the dialog element (accessibility, high).
2. Fix or remove the inline mode's missing `alertdialog` role (accessibility, medium).
3. Add tests for `isActionLoading`, `cancelLabel`, `hide()`, and re-show behavior (coverage, medium).
4. Consider auto-focusing the Cancel button for destructive variants (accessibility, low).
5. Add stories for `isInline`, custom `cancelLabel`, long content, and width customization.
