# TODO: portal Dialog content out of the trigger's DOM subtree

## Problem

`Dialog` renders a native `<dialog>` opened with `showModal()` (`Dialog.tsx`). Like
`Popover`, it escapes _visually_ via the top layer — but the `<dialog>` and its inner
content stay where they're rendered in the DOM. So an ancestor with descendant/sibling
selectors reaches into it.

This is the same class of bug that `Popover` / `useLayer` have, via a **different
mechanism**: `<dialog showModal>` instead of the popover API. That distinction matters
because the local guard added to `ButtonGroup.recipe.ts` is keyed on `[popover]`, and a
`<dialog>` has no `popover` attribute — so it would slip past that guard entirely:

- a trailing closed `<dialog>` (display:none but still structural) would strip the last
  sibling button's end radius;
- an open dialog's inner buttons, being descendants, would inherit the group joins.

Chasing this in ancestor selectors (`:not([popover] *):not(dialog *)…`) is whack-a-mole.

## Fix

Portal the `<dialog>` to `document.body` (or a portal root) so it leaves arbitrary
ancestors' DOM subtrees. Costs nothing visually (already top-layer via `showModal()`).

Note: `Dialog` uses its own `useDialog` lifecycle, **not** `src/internal/useLayer.tsx`,
so this is a separate refactor from the `useLayer` portal work — same idea, different
plumbing. Apply the same SSR/hydration checklist (see `src/internal/TODO.md`):

- resolve the portal target in an effect, never during render;
- keep server and first client render in agreement, then portal after mount, to avoid
  hydration mismatch;
- preserve the `showModal()` / `<dialog>` close + backdrop/escape-dismiss behavior.
