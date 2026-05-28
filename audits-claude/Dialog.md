# Dialog Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/Dialog/Dialog.tsx`
- `src/components/Dialog/DialogHeader.tsx`
- `src/components/Dialog/useDialog.tsx`
- `src/components/Dialog/Dialog.recipe.ts`
- `src/components/Dialog/Dialog.stories.tsx`
- `src/components/Dialog/Dialog.test.tsx`
- `src/components/Dialog/index.ts`

---

## Performance Problems

1. **Inline style objects re-created on every render (Dialog.tsx, lines 171-174 and 216-220):**
   Both the inline and modal branches build a style object literal on every render via object spread (`{ width: ..., maxHeight: ..., ...positionStyle, ...style }`). For the modal path, the `positionStyle` object (lines 180-190) is also re-created each render. This is standard React practice and unlikely to cause real perf issues, but it does mean the `<dialog>` element receives a new `style` reference every render, which prevents shallow-comparison optimizations in any wrapper component.

2. **`useDialog` memoization includes `defaultOptions` as a dependency (useDialog.tsx, line 44):**
   The `element` memo depends on `defaultOptions`. If the consumer passes `defaultOptions` as an inline object literal (e.g., `useDialog({ label: 'My Dialog', width: 480 })`), a new reference is created every render, defeating the `useMemo` entirely and causing the `<Dialog>` subtree to re-render on every parent render. This is a common footgun. Consider documenting that `defaultOptions` should be a stable reference, or use a ref to capture it.

3. **`useDialog.show` merges options by spreading over previous state (useDialog.tsx, line 25):**
   `setOptions(previous => ({...previous, ...nextOptions}))` means options accumulate across multiple `show()` calls. If a consumer calls `show(contentA, { width: 600 })` then later `show(contentB)` (without options), the width from the first call persists. This is semantically confusing and may cause stale option bugs. Each `show()` call should likely reset to `defaultOptions` plus the new overrides.

4. **`dialogRecipe` (Dialog.recipe.ts) is exported but unused internally:**
   The recipe defines a CVA-based variant system (lines 3-58) with `isOpen` and `variant` variants, but `Dialog.tsx` does not import or use it. Instead, Dialog.tsx defines its own inline `css()` styles (lines 40-93). This means two parallel styling systems exist for the same component. The recipe is only re-exported for external consumers; if it drifts from the actual styles used in Dialog.tsx, consumers will get inconsistent results. For instance, the recipe uses `borderRadius: 'lg'` and `boxShadow: 'lg'` (lines 12-13) while Dialog.tsx uses `borderRadius: 'md'` and `boxShadow: 'xl'` (lines 48-49).

---

## Accessibility Concerns

1. **eslint a11y rules are disabled at file level (Dialog.tsx, line 1):**
   The file disables `jsx-a11y-x/click-events-have-key-events` and `jsx-a11y-x/no-noninteractive-element-interactions` globally. The backdrop-click handler (line 209-212) fires on click of the `<dialog>` element itself, which is how native dialog backdrop dismiss works, so the disable is defensible. However, the blanket disable also suppresses warnings for any future code added to the file.

2. **Inline dialog (`isInline=true`) uses a `<div>` with `aria-label` but no role (Dialog.tsx, lines 161-177):**
   When rendered inline, the component renders a plain `<div>` with `aria-label` but no `role` attribute. A `<div>` does not inherently support `aria-label`; screen readers may ignore it. The inline variant should include `role="dialog"` (and potentially `aria-modal="false"`) so assistive technology announces it correctly.

3. **Inline dialog has no focus management (Dialog.tsx, lines 156-177):**
   The modal code path captures the trigger element, calls `showModal()`, focuses `[data-autofocus]` elements, and restores focus on close (lines 121-142). None of this happens for the inline path. Keyboard users may not be aware a dialog has appeared, and focus is not trapped or moved into the inline dialog.

4. **DialogHeader auto-focuses the title heading on mount (DialogHeader.tsx, lines 69-71):**
   `useEffect(() => { titleRef.current?.focus(); }, [])` fires unconditionally when DialogHeader mounts. This conflicts with Dialog.tsx's own autofocus logic (line 136-137), which focuses `[data-autofocus]` elements. If a consumer provides both a `data-autofocus` element and a `DialogHeader`, there is a race between the two focus calls. Additionally, this auto-focus fires even when DialogHeader is used in non-dialog contexts (if any), which would be unexpected.

5. **`aria-modal="true"` is set as a string attribute (Dialog.tsx, line 195):**
   This is technically valid HTML, but React's JSX normally expects a boolean for aria attributes. The native `<dialog>` element with `showModal()` implicitly sets `aria-modal`, so the explicit attribute is redundant but harmless.

6. **No `aria-describedby` support (Dialog.tsx):**
   The Dialog accepts `label` (mapped to `aria-label`) but provides no mechanism for `aria-describedby`, which is recommended when a dialog has descriptive body text that helps the user understand the dialog's purpose.

---

## Logic Bugs

1. **Backdrop click detection is fragile (Dialog.tsx, lines 209-212):**
   `event.target === event.currentTarget` checks if the click was directly on the `<dialog>` element. This works for the native backdrop because clicks on the `::backdrop` pseudo-element register on the `<dialog>` itself. However, if the dialog has any padding (it sets `p: 0` so this is currently fine), clicks in the padding area would also trigger close. More importantly, this technique can break if the inner `<div>` does not fill the entire dialog box, since clicks in dead space inside the dialog (but not on the inner div) would also close it. The current `flex` layout makes this unlikely but it is architecture-dependent.

2. **`onCancel` always calls `preventDefault()` (Dialog.tsx, lines 203-208):**
   The cancel handler calls `event.preventDefault()` unconditionally, even when it then proceeds to call `onOpenChange(false)` for non-required dialogs. This means the native `<dialog>` close behavior is always suppressed in favor of a React state update. If the React state update does not cause a re-render that closes the dialog (e.g., because `onOpenChange` is a stale closure or does nothing), the dialog remains visually open but the user pressed Escape expecting it to close. The native close would have worked as a fallback.

3. **Body overflow lock can conflict with nested dialogs (Dialog.tsx, lines 145-154):**
   The effect saves `document.body.style.overflow` and restores it on cleanup. If two Dialogs are open simultaneously (or a Dialog opens an AlertDialog), the second dialog saves `overflow: 'hidden'` (already set by the first). When the second dialog closes, it restores to `'hidden'`. When the first dialog then closes, it restores to the original value. This ordering works correctly only if the second dialog closes first (stack order). If the first dialog closes before the second, the body overflow is restored prematurely, then set to `'hidden'` again, but the second dialog's cleanup restores `'hidden'` rather than the original value.

4. **`useDialog` options accumulation (useDialog.tsx, line 25):**
   As noted in performance, `setOptions(previous => ({...previous, ...nextOptions}))` accumulates options. If `show()` is called with `{ purpose: 'required' }` and then later with `{}`, the `required` purpose persists from the first call. This is likely unintentional -- each show call should be independent.

---

## Unclear API

1. **`isInline` prop fundamentally changes the rendered element (Dialog.tsx):**
   When `isInline=true`, the component renders a `<div>` instead of a `<dialog>`, skips all modal logic, and behaves as a completely different component. This violates the principle of least surprise. Consider making `InlineDialog` a separate export, or at minimum document this behavior prominently.

2. **`purpose` prop semantics are non-obvious (Dialog.tsx, lines 14, 118-119):**
   The `purpose` prop controls three orthogonal behaviors: (a) whether Escape closes the dialog, (b) whether backdrop click closes it, and (c) whether `role="alertdialog"` is applied. The mapping is: `info` = escape + backdrop + dialog role; `form` = escape only + dialog role; `required` = no dismiss + alertdialog role. This is not intuitive from the prop name or values alone. There is no JSDoc explaining the behavioral implications.

3. **`position` prop interaction with `variant="fullscreen"` (Dialog.tsx, lines 180-191):**
   When `variant="fullscreen"`, the `position` prop is silently ignored (`position != null && !isFullscreen` on line 181). This is reasonable but undocumented. Consumers might expect an error or warning.

4. **`ref` is typed as `Ref<HTMLElement>` but cast internally (Dialog.tsx, lines 169, 214):**
   The ref is typed as `Ref<HTMLElement>` in the props interface but then cast to `Ref<HTMLDivElement>` (inline path, line 169) or `Ref<HTMLDialogElement>` (modal path, line 214). Consumers cannot easily know the actual element type they receive.

5. **`useDialog` label fallback is a magic string (useDialog.tsx, line 39):**
   `label={options?.label ?? defaultOptions?.label ?? 'Dialog'}` falls back to the generic string `'Dialog'` if no label is provided. This produces a technically accessible but unhelpful label. Consider making `label` required in `DialogOptions`, or logging a development warning when the fallback is used.

6. **`DialogHeader.onOpenChange` is optional but unnamed in purpose:**
   The prop name `onOpenChange` matches Dialog's prop, suggesting it should be wired to the same callback. But it is optional and there is no guidance on when to omit it. When omitted, no close button is rendered (line 99). The relationship between Dialog's `onOpenChange` and DialogHeader's `onOpenChange` should be documented.

---

## Missing Tests

1. **No tests for `DialogHeader` at all:**
   `DialogHeader.tsx` has zero test coverage. There are no tests for: title rendering, subtitle rendering, close button appearance/behavior, `startContent`/`endContent` rendering, `hasDivider` styling, auto-focus of the title heading, or forwarded ref/className/style/data-testid.

2. **No tests for `isInline` mode (Dialog.tsx, lines 156-177):**
   The entire inline rendering path is untested. This includes: rendering a `<div>` instead of `<dialog>`, returning `null` when `!isOpen`, the inline-specific styling, and the absence of modal behavior.

3. **No tests for `variant="fullscreen"` (Dialog.tsx, lines 65-72):**
   The fullscreen variant applies different styles and suppresses `width`/`maxHeight`/`position`. None of this is tested.

4. **No tests for `position` prop (Dialog.tsx, lines 180-191):**
   Custom positioning via the `position` prop is never tested. Neither are the `formatSize` conversions.

5. **No tests for `width` or `maxHeight` props (Dialog.tsx, lines 217-218):**
   The size props and their `formatSize` handling (number-to-px conversion) are not tested.

6. **No tests for body overflow lock (Dialog.tsx, lines 145-154):**
   The effect that sets `document.body.style.overflow = 'hidden'` and restores it on close is not tested.

7. **No tests for focus restoration on close (Dialog.tsx, lines 140-141):**
   The logic that stores `document.activeElement` and restores focus after close is not tested.

8. **No test for `useDialog` with `defaultOptions` merging or option accumulation:**
   The `show()` method's option-merging behavior (line 25) is not tested, nor is the interaction between `defaultOptions` and per-call options.

9. **No test that backdrop click does NOT close `required` dialogs:**
   There is a test for `form` purpose not closing on backdrop click, but `required` purpose is only tested for escape blocking and role. Backdrop click behavior for `required` is untested.

---

## Missing Stories

1. **No story for `DialogHeader`:**
   `DialogHeader` is exported publicly but has no story demonstrating its usage, props (`title`, `subtitle`, `startContent`, `endContent`, `hasDivider`, `onOpenChange`), or visual appearance.

2. **No story for `isInline` mode:**
   The inline rendering variant has no dedicated story. This is a significant behavioral difference (no modal overlay, no backdrop) that should be visually demonstrated.

3. **No story for `variant="fullscreen"`:**
   While `fullscreen` is listed in the `argTypes` control options (line 20), there is no dedicated story showing it. Consumers must manually switch the control to see it.

4. **No story for `position` prop:**
   Custom positioning (anchored dialogs) has no story.

5. **No story for `purpose="form"`:**
   The `form` purpose (escape allowed, backdrop click blocked) has no dedicated story. Only `info` (Default) and `required` (Required) are shown.

6. **No story demonstrating `DialogHeader` with `Dialog`:**
   There is no story showing the intended composition pattern of `<Dialog>` + `<DialogHeader>`, which is presumably the recommended usage.

7. **No story for `maxHeight` or scrollable content:**
   There is no story demonstrating a dialog with content that overflows, which would show the `maxHeight` and `overscrollBehavior` behavior.

---

## Additional Observations

1. **Recipe/component style drift (Dialog.recipe.ts vs Dialog.tsx):**
   As noted above, the recipe uses `borderRadius: 'lg'` / `boxShadow: 'lg'` while the component uses `borderRadius: 'md'` / `boxShadow: 'xl'`. The recipe also includes `opacity: 0` for closed state and `opacity: 1` for open state (lines 22, 36) which Dialog.tsx does not implement. The recipe includes `maxW: 'min(90vw, var(--dialog-width))'` responsive clamping (line 16) that Dialog.tsx lacks -- Dialog.tsx has no max-width constraint. These divergences suggest the recipe was written for a different iteration of the component and has not been kept in sync.

2. **No JSDoc comments on `DialogProps` (Dialog.tsx, lines 23-38):**
   Unlike `AlertDialogProps` which has JSDoc on every prop, `DialogProps` has no documentation comments. This makes the API harder to discover via editor tooltips.
