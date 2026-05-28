# Drawer Component Audit

Audited files:

- `src/components/Drawer/Drawer.tsx`
- `src/components/Drawer/useDrawer.tsx`
- `src/components/Drawer/Drawer.test.tsx`
- `src/components/Drawer/index.ts`

Notable missing files:

- No `Drawer.stories.tsx` exists
- No `Drawer.recipe.ts` exists

---

## Performance Problems

### P1. Inline arrow functions recreated on every render (Drawer.tsx:182-189)

The `onCancel` and `onClick` handlers are inline arrow functions, meaning new function references are created on every render. For a `<dialog>` element this has no practical cost (no child memoization depends on these props), but it is inconsistent with the general pattern of memoizing callbacks in hooks like `useDrawer`. This is a negligible concern.

### P2. `useMemo` for `element` in `useDrawer` recalculates on every option change (useDrawer.tsx:33-45)

The `element` memo depends on `[content, defaultOptions, isOpen, options]`. The `defaultOptions` object is an external parameter that may be a new reference on every render of the consuming component (if it is defined inline). This would cause the memoized element to be recalculated on every parent render, defeating the purpose of `useMemo`. The `useDialog` hook has the identical issue.

### P3. `show` merges options cumulatively (useDrawer.tsx:24)

`setOptions(previous => ({...previous, ...nextOptions}))` merges new options into the previous options. This means options from prior `show()` calls persist even if not passed again. For example, calling `show(contentA, {placement: 'left'})` then `show(contentB)` will keep `placement: 'left'` from the first call. Whether this is intentional is unclear, but it could surprise consumers. Dialog's `useDialog` has the same behavior.

### P4. `style` prop spread order means consumer styles override size (Drawer.tsx:192)

```tsx
style={{...sizeStyle, ...style}}
```

This allows a consumer's `style` prop to override `width`/`maxWidth`/`height`/`maxHeight` set by `sizeStyle`. This is likely intentional for flexibility, but it means `size` and `style.width` can conflict silently with no warning.

---

## Accessibility Concerns

### A1. No visible focus indicator on the dialog (Drawer.tsx:47-49)

```ts
_focusVisible: {
  outline: 'none',
},
```

The Drawer explicitly removes the focus outline with `outline: 'none'` and provides no replacement focus style. When the dialog receives focus (e.g., when opened via `showModal()`), keyboard users have no visible focus indicator. Compare with the Dialog component (Dialog.tsx:57-60), which provides a 2px solid outline with primary color. This is a WCAG 2.4.7 (Focus Visible) violation.

### A2. No focus trap documentation or escape key communication (Drawer.tsx:182-189)

The native `<dialog>` element provides a focus trap via `showModal()`, which is correct. However, there is no visible close button or hint that Escape will dismiss the drawer. For screen reader users, `aria-label` provides the label, but sighted keyboard users have no indication how to close the drawer other than pressing Escape. Consider whether a close button should be part of the component or at least documented as a pattern consumers should follow.

### A3. Backdrop click closes drawer but no keyboard equivalent for that specific action (Drawer.tsx:186-189)

Clicking the backdrop (the `::backdrop` pseudo-element area, detected via `event.target === event.currentTarget`) closes the drawer. This is redundant with Escape-to-close, so it is not a strict a11y violation, but the component does not communicate to screen reader users that tapping outside will close it. This is acceptable since Escape is the standard keyboard mechanism.

### A4. No `role` attribute differentiation (Drawer.tsx:172)

The `<dialog>` element's implicit role is `dialog`, which is correct. However, unlike the sibling `Dialog` component which supports `purpose="required"` and renders `role="alertdialog"` accordingly (Dialog.tsx:215), the Drawer has no equivalent mechanism. If a drawer were used for a critical workflow where dismissal should be prevented, there is no way to express that semantically.

### A5. Hardcoded backdrop opacity with no reduced-motion consideration (Drawer.tsx:43-46)

The backdrop uses `backdropFilter: 'blur(2px)'` unconditionally. Users who prefer reduced motion (via `prefers-reduced-motion`) still see the blur effect. While blur is not animation, some users find it disorienting. This is a minor concern.

---

## Logic Bugs

### B1. No guard against double `showModal()` call (Drawer.tsx:144)

The code checks `if (!dialog.open)` before calling `showModal()`, which correctly prevents a `DOMException` from calling `showModal()` on an already-open dialog. This is handled correctly.

### B2. Content is not cleared when drawer is hidden via `useDrawer` (useDrawer.tsx:31)

`hide` only calls `setIsOpen(false)`. The previous `content` remains in state. This means:

1. The stale content stays in the DOM inside the closed `<dialog>` (which is hidden but still rendered).
2. If the content contains side-effectful components (e.g., data fetchers, intervals), they continue to run even when the drawer is visually closed.

The Dialog's `useDialog` has the identical issue.

### B3. `onCancel` always calls `onOpenChange(false)` (Drawer.tsx:182-185)

Unlike the Dialog component which has a `purpose` prop and can block Escape for `required` dialogs (Dialog.tsx:203-208), the Drawer always allows Escape to close. This means there is no way to create a "sticky" drawer that requires explicit user action to close. Whether this is a bug or a design decision depends on the intended use cases, but it is a capability gap compared to Dialog.

### B4. Potential focus restoration to removed element (Drawer.tsx:151-153)

```ts
triggerRef.current?.focus();
triggerRef.current = null;
```

If the element that originally triggered the drawer has been removed from the DOM (e.g., the trigger was inside a list that was re-rendered), `focus()` will silently fail and focus will be sent to `<body>`. There is no fallback. This is a rare edge case but worth noting.

### B5. `style` prop can break drawer sizing (Drawer.tsx:192)

If a consumer passes `style={{width: '100%'}}`, it will override the computed width from `sizeStyle`, potentially breaking the layout for left/right-placed drawers. There is no validation or warning.

---

## Unclear API

### U1. `size` prop type is `number | string` with no documentation of units (Drawer.tsx:24)

The `size` prop accepts `number | string`. Numbers are converted to pixels by `formatSize`, and strings are passed through. This is not documented in the type definition or via JSDoc. A consumer does not know that `size={320}` means 320px and `size="50%"` means 50% of the viewport without reading the implementation.

### U2. `label` prop is required but its purpose may be unclear (Drawer.tsx:20)

The `label` prop is used for `aria-label`. The prop name does not convey that it is specifically for accessibility. The Dialog component uses the same naming, so this is consistent within the library, but a name like `accessibilityLabel` or a JSDoc comment would be clearer.

### U3. No `onClose` callback separate from `onOpenChange` (Drawer.tsx:21)

The `onOpenChange` callback is called with `false` when the drawer should close. There is no separate `onClose` callback for performing cleanup actions specifically on close. Consumers must check `if (!isOpen)` inside their `onOpenChange` handler. This is a minor ergonomics issue.

### U4. `useDrawer` label fallback is a generic string (useDrawer.tsx:39)

```ts
label={options?.label ?? defaultOptions?.label ?? 'Drawer'}
```

If no label is provided, the fallback is the generic string `'Drawer'`. This will result in a poor screen reader experience (every unlabeled drawer will be announced as "Drawer"). The Dialog hook uses `'Dialog'` as its fallback -- same pattern, same issue.

### U5. No `DrawerHeader` / `DrawerBody` / `DrawerFooter` sub-components (Drawer.tsx)

The Dialog component has a `DialogHeader` sub-component (Dialog/DialogHeader.tsx). The Drawer has no equivalent composition pattern. Consumers must compose their own header/body/footer layout inside `children`. This is not necessarily wrong but is an API gap compared to Dialog and common drawer patterns in other component libraries.

---

## Missing Tests

### T1. No test for `placement` prop variations

Only the default `right` placement is indirectly tested (Drawer.test.tsx:80-89 checks width of 320px). There are no tests verifying that `placement="left"`, `placement="top"`, or `placement="bottom"` apply the correct styles and size dimensions.

### T2. No test for body overflow locking (Drawer.tsx:157-165)

The second `useEffect` sets `document.body.style.overflow = 'hidden'` when open and restores it on cleanup. This behavior is untested. Specifically:

- Opening the drawer should set overflow to hidden.
- Closing the drawer should restore the previous overflow value.
- Unmounting while open should restore overflow.

### T3. No test for focus restoration to trigger element

The code captures `document.activeElement` when opening (line 143) and restores focus when closing (line 152). This is untested.

### T4. No test for `useDrawer` with `show` called multiple times

Calling `show()` multiple times with different content and options is not tested. Given the cumulative option merging (see P3), this would be valuable.

### T5. No test for `useDrawer` option overrides at `show()` time

The `show(content, options)` method accepts per-invocation options that merge with `defaultOptions`. This merging behavior is untested.

### T6. No test for `useDrawer` `placement` option

The `useDrawer` hook accepts `placement` as a default option, but no test exercises it.

### T7. No test for closing via backdrop click on inner content

The backdrop click test (Drawer.test.tsx:51-62) fires `click` on `getByRole('dialog')`, which tests the dialog element itself. There is no test verifying that clicking the inner `<div>` (the `styles.inner` wrapper) does NOT trigger close, confirming the `event.target === event.currentTarget` guard works.

### T8. No test for concurrent open/close race conditions

Rapidly toggling `isOpen` between `true` and `false` is not tested. The `useEffect` that calls `showModal()` / `close()` could behave unexpectedly if React batches multiple state updates.

### T9. No test for custom `className` composition with placement styles

The test at line 121 checks `className` but does not verify it composes correctly alongside placement-specific styles.

### T10. No test for string-valued `size` prop

The test at line 91 tests `size={400}` (number) and `size="50vh"` (string on rerender), but only for `placement="left"` and `placement="bottom"`. The string size with left/right placement is not tested.

---

## Missing Stories

### S1. No Storybook stories file exists

There is no `Drawer.stories.tsx` file at all. This is a significant gap. The Dialog component has a full stories file with Default, Required, and Imperative variants. The Drawer has zero visual documentation in Storybook.

The following stories should be created:

### S2. Default story (right placement)

A basic story showing a right-side drawer with a trigger button, demonstrating the standard open/close flow.

### S3. Placement variants story

Stories for each `placement` value (`left`, `right`, `top`, `bottom`) showing how the drawer anchors to different edges.

### S4. Custom size story

Demonstrating the `size` prop with both numeric (pixel) and string (percentage/viewport) values.

### S5. Imperative usage story (`useDrawer`)

A story using the `useDrawer` hook, analogous to Dialog's `Imperative` story, showing the `show()` / `hide()` API.

### S6. Auto-focus story

Demonstrating `data-autofocus` on an element inside the drawer to show initial focus behavior.

### S7. Nested content story

A story with realistic drawer content: a header, scrollable body, and footer with action buttons, demonstrating how consumers should compose the children.

---

## Summary

| Category        | Issues                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Performance     | 4 (inline handlers, unstable memo deps, cumulative option merge, style override)                                                                                               |
| Accessibility   | 5 (no focus indicator, no close button guidance, no alertdialog support, no backdrop keyboard equiv, no reduced-motion for blur)                                               |
| Logic Bugs      | 5 (stale content in useDrawer, no required/sticky mode, focus restoration edge case, style override, always-allow-escape)                                                      |
| Unclear API     | 5 (size units undocumented, label purpose unclear, no onClose, generic label fallback, no sub-components)                                                                      |
| Missing Tests   | 10 (placement, body overflow, focus restore, useDrawer multi-show, option overrides, inner click guard, race conditions, className composition, string size, placement option) |
| Missing Stories | 7 (entire stories file missing -- no default, placement, size, imperative, autofocus, or nested content stories)                                                               |

The most impactful issues to address first are:

1. **A1** (no visible focus indicator) -- WCAG violation; keyboard users cannot see focus on the drawer.
2. **S1** (no stories file at all) -- the component has zero visual documentation in Storybook, making it impossible for consumers to discover or evaluate.
3. **B2** (stale content in useDrawer) -- side-effectful content continues running after the drawer closes.
4. **T2** (body overflow locking untested) -- the scroll-lock behavior is critical for usability and has no test coverage.
5. **U5** (no sub-components) -- lack of DrawerHeader/DrawerBody/DrawerFooter makes it harder for consumers to build consistent drawer layouts.
