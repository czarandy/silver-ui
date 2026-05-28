# MobileNav Component Audit

**Files reviewed:**

- `src/components/MobileNav/MobileNav.tsx`
- `src/components/MobileNav/MobileNavToggle.tsx`
- `src/components/MobileNav/MobileNav.recipe.ts`
- `src/components/MobileNav/MobileNav.stories.tsx`
- `src/components/MobileNav/MobileNav.test.tsx`
- `src/components/MobileNav/index.ts`

---

## Performance Problems

### 1. `useMemo` wrapping a closure that changes identity anyway (MobileNav.tsx:95-106)

The `onOpenChange` fallback is wrapped in `useMemo` with `[appShellMobile, onOpenChangeFromProps]` as dependencies. The `appShellMobile` context object is recreated on every render of the AppShell provider (it is built from a `useMemo` in AppShell.tsx that depends on `isMobileNavOpen`), so this `useMemo` will recompute every time the open state changes -- exactly when it matters least. The memoization provides negligible benefit. Consider using `useCallback` for the individual fallback, or restructuring so `openMobileNav`/`closeMobileNav` are stable references (they already are individually since they come from `useCallback` in AppShell).

### 2. Manual ref callback instead of `mergeRefs` (MobileNav.tsx:123-131)

The `setRef` callback function is recreated on every render because it is not wrapped in `useCallback` and closes over `ref`. The sibling `Drawer` component uses the shared `mergeRefs` utility for the same purpose (Drawer.tsx:191). Using `mergeRefs(ref, dialogRef)` would be both simpler and consistent with the rest of the codebase.

### 3. No scroll lock on the document body (MobileNav.tsx)

The `Drawer` component explicitly sets `document.body.style.overflow = 'hidden'` when open (Drawer.tsx:157-166) to prevent background scrolling on mobile. `MobileNav` does not do this. On iOS Safari in particular, users can still scroll the background content behind the open drawer. This is a UX issue on mobile -- the primary target platform for this component.

---

## Accessibility Concerns

### 4. No focus restoration on close (MobileNav.tsx:109-121)

When the drawer closes, focus is not returned to the element that triggered it. The `Drawer` component saves `document.activeElement` before opening and restores focus on close (Drawer.tsx:143, 152). `MobileNav` does neither. When a user opens the drawer via `MobileNavToggle`, closes it, and then tabs, focus will land in an unpredictable location. This is a WCAG 2.1 SC 2.4.3 (Focus Order) concern.

### 5. No initial focus management (MobileNav.tsx)

When the dialog opens, there is no explicit focus placement. The `<dialog>` element's native `showModal()` will focus the first focusable element inside it, which in this case is the close button -- a reasonable default. However, unlike `Drawer` (Drawer.tsx:148-149), there is no support for `data-autofocus` or `autofocus` attributes on children, so consumers cannot control initial focus placement. For a navigation drawer with many links, focusing the first nav item may be more useful than focusing the close button.

### 6. Missing `aria-modal="true"` (MobileNav.tsx:135)

The `Drawer` component explicitly sets `aria-modal="true"` (Drawer.tsx:174). While `showModal()` provides this implicitly in browsers, the MobileNav test mock (MobileNav.test.tsx:7-18) does not replicate this behavior, and explicit `aria-modal` makes intent clear for assistive technology and test tooling.

### 7. `MobileNavToggle` does not convey expanded state (MobileNavToggle.tsx:30-41)

The toggle button does not set `aria-expanded` to indicate whether the navigation drawer is currently open or closed. Since `MobileNavToggle` has access to `isMobileNavOpen` from context (it already reads `toggleMobileNav`), it should pass `aria-expanded={isMobileNavOpen}` to the `Button`. This is a WCAG 2.1 SC 4.1.2 (Name, Role, Value) concern.

### 8. `MobileNavToggle` does not link to the dialog via `aria-controls` (MobileNavToggle.tsx)

Best practice for a toggle that opens/closes a dialog or drawer is to set `aria-controls` pointing to the id of the controlled element. Neither `MobileNav` nor `MobileNavToggle` support an `id` prop or use `aria-controls`.

---

## Logic Bugs

### 9. `onCancel` prevents default but does not prevent re-close (MobileNav.tsx:139-142)

The `onCancel` handler calls `event.preventDefault()` and then `onOpenChange(false)`. The `preventDefault()` stops the browser from closing the dialog natively, so the component can control the close through state. However, if the component is used in uncontrolled mode (relying on `appShellMobile`), the `closeMobileNav` call will update context, triggering a re-render, which then runs the `useEffect` that calls `dialog.close()`. This works but the close transition animation may not play because the `isOpen` state change and the re-render race with each other. Consider whether a single close path (either native or state-driven) would be more predictable.

### 10. `header` fallback renders an empty `<span>` (MobileNav.tsx:161)

When `header` is `undefined` (not a string, not a ReactNode), the expression `(header ?? <span />)` renders an empty `<span>`. This empty span still occupies space in the flex header row and the `justify-content: space-between` will push the close button to the far end. This is likely intentional for layout, but it introduces an empty, semantically meaningless element in the DOM. A more explicit approach (e.g., a `<div>` with a comment) would clarify intent.

---

## Unclear API

### 11. `side` uses `'start' | 'end'` while `Drawer` uses `'left' | 'right'` (MobileNav.tsx:12)

`MobileNav` uses logical values `'start' | 'end'` for its `side` prop, while the sibling `Drawer` component uses physical values `'left' | 'right' | 'top' | 'bottom'` for its `placement` prop. The logical values are arguably better for RTL support, but the inconsistency with `Drawer` may confuse users who switch between the two components. At minimum this should be documented.

### 12. `width` prop accepts only `number` (MobileNav.tsx:28)

The `width` prop only accepts a `number` (pixels). The `Drawer` component accepts `number | string` for its `size` prop, allowing values like `'50vw'`. Consumers may want to set the MobileNav width using viewport-relative units or CSS custom properties.

### 13. Dual control mode is implicit (MobileNav.tsx:93-106)

`MobileNav` can be controlled via `isOpen`/`onOpenChange` props OR via `AppShellMobileContext`. This dual-mode is not documented in the interface JSDoc (line 14-16) and could confuse consumers. When `isOpen` is provided but `onOpenChange` is not, the component reads `isOpen` from props but writes close events to the context -- mixing controlled reading with uncontrolled writing.

---

## Missing Tests

### 14. No tests for `MobileNavToggle` at all

There is no `MobileNavToggle.test.tsx` file. Key behaviors that should be tested:

- Renders nothing when `isMobile` is `false`
- Renders nothing when `isMobileNavEnabled` is `false`
- Renders a button and calls `toggleMobileNav` on click when conditions are met
- Forwards `ref`, `className`, `style`, and custom `label`

### 15. No test for backdrop click closing the drawer (MobileNav.test.tsx)

The backdrop click handler (MobileNav.tsx:143-146) is not tested. This is a primary interaction pattern for mobile drawers.

### 16. No test for Escape key / `onCancel` behavior (MobileNav.test.tsx)

The `onCancel` handler (MobileNav.tsx:139-142) that intercepts the native dialog cancel event is not tested. Pressing Escape to close is a critical accessibility interaction.

### 17. No test for the `side` prop (MobileNav.test.tsx)

Neither `side="start"` nor `side="end"` is tested to verify correct CSS class application.

### 18. No test for the `width` prop (MobileNav.test.tsx)

The `width` prop's effect on the inline style is not tested.

### 19. No test for uncontrolled mode via AppShellMobileContext (MobileNav.test.tsx)

All existing tests pass `isOpen` and `onOpenChange` directly. There are no tests verifying the fallback to `appShellMobile.isMobileNavOpen` / `appShellMobile.closeMobileNav()`.

### 20. No test for the `header` prop as ReactNode (MobileNav.test.tsx)

The test only uses `header="Menu"` (a string). The branch where `header` is a ReactNode (MobileNav.tsx:158-161) is not tested.

---

## Missing Stories

### 21. No stories for `MobileNavToggle`

The toggle is exported from `index.ts` but has no dedicated story or appearance in the existing `MobileNav` stories.

### 22. Only one story (`Controlled`) exists (MobileNav.stories.tsx)

Important props and behaviors that lack story coverage:

- **`side="start"`**: No story showing left-side drawer. Only `side="end"` (the default) is demonstrated.
- **`width`**: No story demonstrating a custom width (e.g., a narrow or full-width drawer).
- **`header` as ReactNode**: No story demonstrating a custom header (e.g., logo + text). Only the string `"Navigation"` is shown.
- **`label`**: No story demonstrating a custom `aria-label` for screen reader testing.
- **Integration with `AppShellMobileContext`**: No story showing uncontrolled usage inside `AppShell`, which is the primary use case per the codebase (see `SideNav.tsx:121` and `TopNav.tsx:115`).
- **RTL support**: No story demonstrating behavior in right-to-left text direction, which is relevant given the `start`/`end` side prop uses logical directions.

---

## Summary of Severity

| #   | Issue                                       | Severity |
| --- | ------------------------------------------- | -------- |
| 4   | No focus restoration on close               | High     |
| 3   | No scroll lock on body                      | High     |
| 7   | Missing `aria-expanded` on toggle           | High     |
| 14  | No tests for `MobileNavToggle`              | High     |
| 5   | No initial focus control (`data-autofocus`) | Medium   |
| 6   | Missing explicit `aria-modal`               | Medium   |
| 15  | No test for backdrop click                  | Medium   |
| 16  | No test for Escape key                      | Medium   |
| 19  | No test for uncontrolled mode               | Medium   |
| 22  | Only one story, many untested props         | Medium   |
| 21  | No stories for `MobileNavToggle`            | Medium   |
| 2   | Manual ref callback vs `mergeRefs`          | Low      |
| 1   | Ineffective `useMemo`                       | Low      |
| 8   | Missing `aria-controls`                     | Low      |
| 9   | Dual close path race potential              | Low      |
| 10  | Empty `<span>` fallback                     | Low      |
| 11  | `side` vs `placement` naming inconsistency  | Low      |
| 12  | `width` only accepts `number`               | Low      |
| 13  | Dual control mode undocumented              | Low      |
| 17  | No test for `side` prop                     | Low      |
| 18  | No test for `width` prop                    | Low      |
| 20  | No test for ReactNode header                | Low      |
