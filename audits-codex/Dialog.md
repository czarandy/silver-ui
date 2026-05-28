# Dialog Audit

Reviewed:

- `src/components/Dialog/Dialog.tsx`
- `src/components/Dialog/DialogHeader.tsx`
- `src/components/Dialog/useDialog.tsx`
- `src/components/Dialog/Dialog.recipe.ts`
- `src/components/Dialog/Dialog.stories.tsx`
- `src/components/Dialog/Dialog.test.tsx`
- `src/components/Dialog/index.ts`

Verification: `pnpm vitest run src/components/Dialog/Dialog.test.tsx` passes, 9 tests.

## Findings

### High: body scroll can unlock while another modal is still open

`Dialog` locks scroll by saving `document.body.style.overflow`, setting it to `hidden`, then restoring the saved value in each instance's cleanup (`src/components/Dialog/Dialog.tsx:145`-`154`). With two open dialogs or a Dialog plus another overlay, closing the earlier-mounted one first restores the body overflow even though another modal remains open. This is a user-visible modal behavior bug because the background can scroll behind the remaining dialog.

Use a shared scroll-lock helper with reference counting or stack ownership instead of per-instance save/restore.

### High: standard dialogs can overflow small viewports

The active component applies `width` directly and only sets `maxHeight` (`src/components/Dialog/Dialog.tsx:216`-`220`); there is no `max-width` clamp. A default or custom width larger than the viewport can render off-screen on mobile. The exported recipe has a responsive clamp (`maxW: 'min(90vw, var(--dialog-width))'` in `src/components/Dialog/Dialog.recipe.ts:16`), but `Dialog.tsx` does not use that recipe.

Add a `maxWidth` constraint to the rendered dialog path, and cover it with a fullscreen/standard sizing story.

### Medium: `useDialog.show()` leaks options between openings

`show()` merges new options over previous options (`src/components/Dialog/useDialog.tsx:22`-`27`). If a caller opens one dialog with `{purpose: 'required', width: 600}` and later calls `show(content)` without options, the old purpose and width persist. That makes each `show()` call depend on hidden state from prior calls.

Reset options from `defaultOptions` plus `nextOptions` for each show call unless option persistence is an intentional API, and add a test either way.

### Medium: inline mode is not exposed as an accessible dialog

The `isInline` branch renders a plain `div` with `aria-label` but no `role` (`src/components/Dialog/Dialog.tsx:156`-`176`). A labelled `div` is not announced as a dialog. If this mode is public, it should likely render `role="dialog"` and document that it is non-modal. If it is only for docs/previews, the prop should be documented as such.

### Medium: `DialogHeader` focus competes with Dialog focus policy

`DialogHeader` always focuses its title on mount (`src/components/Dialog/DialogHeader.tsx:67`-`71`), while `Dialog` separately focuses `[data-autofocus="true"], [autofocus]` after opening (`src/components/Dialog/Dialog.tsx:130`-`137`). Composed dialogs can have two independent autofocus policies, which makes focus behavior hard to predict and can pull focus away from the field/action a consumer marked for autofocus.

Prefer one owner for initial focus, or make header focus conditional when another autofocus target exists.

### Medium: exported recipe drifts from the real component

`dialogRecipe` is exported publicly (`src/components/Dialog/index.ts:8`, `src/index.ts:478`-`491`) but is not used by `Dialog.tsx`. It also differs materially from the component: recipe uses `borderRadius: 'lg'`, `boxShadow: 'lg'`, `display: 'none'`, opacity states, and max-width clamping (`src/components/Dialog/Dialog.recipe.ts:11`-`21`, `34`-`38`), while the component uses `borderRadius: 'md'`, `boxShadow: 'xl'`, no closed opacity state, and no max-width clamp (`src/components/Dialog/Dialog.tsx:40`-`64`).

This is an unclear API risk for consumers styling against the exported recipe.

### Low: `DialogHeader` has no local tests

`DialogHeader` is exported (`src/components/Dialog/index.ts:9`) but `src/components/Dialog/Dialog.test.tsx` only imports `Dialog` and `useDialog` (`src/components/Dialog/Dialog.test.tsx:4`-`6`). Missing coverage includes title/subtitle rendering, close button behavior, `startContent`, `endContent`, `hasDivider`, focus, and pass-through props.

### Low: important Dialog props lack dedicated tests

Current tests cover open/close, backdrop behavior for `info`/`form`, required Escape behavior, pass-through props, autofocus, and basic `useDialog` (`src/components/Dialog/Dialog.test.tsx:23`-`193`). Missing tests include `isInline`, `variant="fullscreen"`, `position`, `width`/`maxHeight` formatting, body scroll lock/restore, focus restoration, required backdrop click, and `useDialog` option replacement/accumulation.

### Low: stories do not demonstrate several public props

Storybook has only `Default`, `Required`, and `Imperative` stories (`src/components/Dialog/Dialog.stories.tsx:64`-`132`). Missing dedicated stories: `DialogHeader` composition, `purpose="form"`, `variant="fullscreen"`, `isInline`, `position`, constrained/scrolling content via `maxHeight`, and custom width. The controls list these props (`src/components/Dialog/Dialog.stories.tsx:12`-`23`), but important behavior is not demonstrated.

## Category Notes

- Performance: no hot-path rendering or algorithmic performance issue found. The main performance-adjacent issue is the scroll-lock implementation, listed as a behavior bug.
- Accessibility: issues found for inline semantics and competing focus ownership. The modal path otherwise uses native `<dialog>`, `showModal()`, `aria-modal`, labels, Escape handling, and focus restoration.
- Logic bugs: issues found for scroll locking and `useDialog` option persistence.
- API clarity: issues found for exported recipe drift, `isInline` semantics, and hidden `purpose` behavior mapping.
- Docs: no separate `src/components/Dialog/*.doc.*` file was found; the local documentation surface appears to be Storybook only.
