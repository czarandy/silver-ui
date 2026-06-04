# Drawer Audit

## Summary

Drawer is a slide-in panel anchored to a viewport edge (start, end, top, bottom), built on the native `<dialog>` element with modal behavior. It supports configurable size, placement, backdrop dismiss, escape dismiss, body scroll locking, focus management, and an imperative `useDrawer` hook. The component is well-tested with comprehensive placement and size tests.

## Issues

### Critical

- None identified.

### High

- None identified.

### Medium

- **No `dismissBehavior` prop to disable Escape or backdrop dismiss**: Unlike Dialog which has a `dismissBehavior` prop for granular control, Drawer always closes on Escape and backdrop click. For use cases like unsaved-changes drawers, consumers have no way to prevent accidental dismissal.
- **`useDrawer` merges options accumulatively (same issue as `useDialog`)**: The `show()` method uses `setOptions(previous => ({...previous, ...nextOptions}))`, which means options from a previous `show()` call bleed into subsequent calls unless explicitly overridden.
- **`ref` type mismatch**: The component accepts `Ref<HTMLElement>` but the internal dialog is an `HTMLDialogElement`. The `mergeRefs` call casts `ref as Ref<HTMLDialogElement>` to reconcile this. Consumers passing a ref typed as `Ref<HTMLElement>` will get an `HTMLDialogElement` at runtime, which is fine since it extends `HTMLElement`, but the declared type could be more accurate as `Ref<HTMLDialogElement>`.
- **`aria-modal="true"` is explicitly set but redundant**: The native `<dialog>` element opened via `showModal()` already has implicit `aria-modal="true"`. The explicit attribute is harmless but adds noise. Note that Dialog.tsx does not set this attribute, creating an inconsistency between the two components.

### Low

- **No `role` prop**: The Drawer always renders with the default `dialog` role. Unlike Dialog which supports `alertdialog`, Drawer does not offer role customization.
- **No story demonstrating `data-testid` or `ref`**: These utility props are tested but not shown in stories.
- **Focus is not returned to trigger when using the imperative hook**: The `useDrawer` hook does not track the trigger element. Focus restoration only works when using the declarative pattern because the Drawer component captures `document.activeElement` on open.
- **No `_focusVisible` outline style**: The Drawer sets `_focusVisible: { outline: 'none' }`, which removes the focus ring entirely. Dialog keeps its focus ring. While the dialog element itself rarely receives visible focus (focus moves to content), removing the outline entirely could be an accessibility issue in edge cases.
- **Missing test for `placement` CSS class composition**: While tests verify inline styles for size, they don't verify that the correct placement CSS class is applied.

## Recommendations

- Add a `dismissBehavior` prop (or at minimum `isEscapeDismissEnabled`/`isBackdropDismissEnabled` booleans) to match Dialog's capabilities.
- Ensure `_focusVisible` has an accessible outline rather than `outline: 'none'`.
- Consider changing the `ref` type to `Ref<HTMLDialogElement>` for type accuracy.
- The test coverage is strong (15 tests covering open/close, placements, sizes, focus management, body scroll, unmount cleanup, rapid updates, and imperative hook). Stories cover all major visual variants including auto-focus and nested content.

## SVA Conversion

**Benefit: Moderate**

Drawer renders two styled elements: the `<dialog>` root and an `inner` content `<div>`. It styles them with a standalone `const styles = {...}` object containing seven `css()` blocks — `root`, `open`, `inner`, and one block per placement (`start`/`end`/`top`/`bottom`) — and applies them via `cx(styles.root, isOpen ? styles.open : undefined, styles[placement], className)`, indexing the styles object by the `placement` prop. There is no recipe today. An `sva` with `root`/`inner` slots and `placement` (start/end/top/bottom) + boolean `isOpen` variants would consolidate the four placement blocks and the open state into one recipe and replace the `styles[placement]` runtime lookup and the open ternary. It is moderate rather than strong because there are only two slots and the `inner` slot is placement-independent.
