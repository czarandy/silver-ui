# Dialog Audit

## Summary

Dialog is a modal dialog surface built on the native `<dialog>` element, with backdrop blur, focus management, configurable dismiss behavior (Escape and backdrop click), body scroll locking, and an imperative `useDialog` hook. It supports standard and fullscreen variants, custom positioning, and provides a DialogContext for child components (like LayoutHeader) to render close buttons.

## Issues

### Critical

- None identified.

### High

- **`Dialog.recipe.ts` is exported but never used by `Dialog.tsx`**: The Dialog component defines its own inline `css()` styles in the `.tsx` file, while `Dialog.recipe.ts` defines a separate `cva()` recipe with different token values (e.g., `borderRadius: 'lg'` in recipe vs `'md'` in component, `outlineColor: 'accent'` vs `'primary'`, `boxShadow: 'lg'` vs `'xl'`). This creates a maintenance risk: consumers importing the recipe for custom styling will get different values than the actual component uses. The recipe is dead code from the component's perspective.

### Medium

- **`DialogHeader` and `DialogFooter` are defined but never used or exported from stories/tests**: Both `DialogHeader.tsx` and `DialogFooter.tsx` exist in the Dialog directory, are exported from `index.ts` (DialogHeader is not actually re-exported from index.ts), but are never imported anywhere in the codebase. They appear to be dead code or intended for future use. DialogHeader has a potentially problematic CSS selector `'[data-testid] h4, h1, h2, h3, h4, h5, h6'` that would focus any heading in the dialog, not just the title.
- **`useDialog` merges options accumulatively**: The `show()` method uses `setOptions(previous => ({...previous, ...nextOptions}))`, which means options from a previous `show()` call persist into subsequent calls unless explicitly overridden. This can lead to surprising behavior if a consumer calls `show()` multiple times with different partial option sets.
- **Backdrop click detection relies on `event.target === event.currentTarget`**: This technique for detecting backdrop clicks works because native `<dialog>` renders the backdrop as part of the dialog element's box model, and clicking the backdrop triggers a click on the `<dialog>` itself. However, if CSS padding is added to the dialog element, clicks on the padding (inside the dialog visually) would also trigger dismissal. The current `p: 0` style mitigates this, but it is fragile.
- **Duplicate title in `aria-label` and visible heading**: Similar to AlertDialog, the Dialog uses `aria-label={label}` while consumers typically also render a `<LayoutHeader title={...}>` inside. This creates duplicate accessible names.

### Low

- **No story demonstrating custom `position` prop**: The `position` prop supports fixed positioning offsets but has no story showing its usage.
- **No test for the `position` prop**: Position-based styling is not tested.
- **No test for `maxHeight` prop**: The `maxHeight` prop is accepted but never tested.
- **Missing `displayName` on sub-components**: `DialogContext` has `displayName` set, but there are no `displayName` values set on the memoized elements in `useDialog`.
- **Focus restoration in `useEffect` may race with external focus management**: The pattern of capturing `document.activeElement` on open and restoring it on close works for simple cases but can conflict with external focus management libraries or nested dialogs.
- **`ref` callback in `DialogHeader` does not handle `null` cleanup**: The ref callback in `DialogHeader` manually assigns to `ref.current` for object refs but does not clean up (set to `null`) when the component unmounts. The `mergeRefs` utility used in Dialog.tsx would be more robust.

## Recommendations

- Remove or unify `Dialog.recipe.ts` with the actual component styles to eliminate the divergence.
- Evaluate whether `DialogHeader` and `DialogFooter` should be removed, documented, or integrated into stories and tests.
- Consider resetting options to defaults in `useDialog.show()` instead of merging accumulatively, or document the merge behavior clearly.
- Add stories and tests for `position`, `maxHeight`, and edge cases like nested dialogs.
- Consider using `aria-labelledby` instead of `aria-label` when a visible heading is present.

## SVA Conversion

**Benefit: Moderate**

Dialog renders two styled elements: the `<dialog>` root (with `_backdrop`, `_focusVisible`, open, and fullscreen states) and an `inner` content `<div>`. It currently styles both via a standalone `const styles = {root, open, fullscreen, inner}` object in `Dialog.tsx`, applying `cx(styles.root, isOpen ? styles.open : undefined, isFullscreen ? styles.fullscreen : undefined, className)`. Notably, a separate `cva` root recipe (`Dialog.recipe.ts`, with `isOpen` and `variant` variants) already exists but is unused/divergent — the audit above flags this. An `sva` with `root`/`inner` slots and `isOpen` + `variant` (standard/fullscreen) variants would both consolidate the two-element styling and resolve the recipe-vs-styles divergence, replacing the two `cx()` ternaries. Benefit is moderate rather than strong because there are only two slots and two variants and the `inner` slot has no variant-dependent styling.
