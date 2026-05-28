# Drawer Audit

Audited implementation: `src/components/Drawer/Drawer.tsx`, `src/components/Drawer/useDrawer.tsx`, `src/components/Drawer/index.ts`.
Audited tests: `src/components/Drawer/Drawer.test.tsx`.
Stories/docs: no dedicated `Drawer.stories.*` or `Drawer.doc.mjs` found.

Targeted verification: `pnpm vitest run src/components/Drawer/Drawer.test.tsx` passes, 9 tests.

## Findings

### Medium: dialog focus indicator is removed

`Drawer` removes the dialog focus outline with `_focusVisible: { outline: 'none' }` (`src/components/Drawer/Drawer.tsx:47`). When a drawer has no `data-autofocus`, `autofocus`, or focusable child, native `showModal()` can leave focus on the dialog itself (`src/components/Drawer/Drawer.tsx:142-149`). In that state keyboard users may have no visible focus indicator. Keep a visible focus style on the dialog or guarantee focus is moved to a visibly focusable control.

### Medium: `useDrawer` leaks per-call options into later opens

`show()` merges new options over the previous options state (`src/components/Drawer/useDrawer.tsx:22-26`). A one-off option such as `label`, `placement`, `size`, `className`, or `style` persists into later `show(content)` calls that omit it. This makes each open depend on prior opens instead of `defaultOptions + nextOptions`, which is surprising for an imperative helper and can produce stale labels or placement. Tests only cover the simplest open/hide path (`src/components/Drawer/Drawer.test.tsx:158-188`), not option reset behavior.

### Low: body scroll locking is not coordinated across multiple drawers/modals

Each open drawer snapshots `document.body.style.overflow` and restores that exact value on cleanup (`src/components/Drawer/Drawer.tsx:157-166`). If two drawers or another modal-like component overlap, closing one can restore scrolling while another is still open. This is not exposed by current tests. A shared lock counter or central scroll-lock utility would make this behavior robust.

### Low: no dedicated Drawer stories/docs

There is no `src/components/Drawer/Drawer.stories.*` or `Drawer.doc.mjs`. Important props and behavior are therefore undocumented in the component catalog: `placement` (`left`, `right`, `top`, `bottom`), numeric and string `size`, `label`, controlled `isOpen`/`onOpenChange`, focus via `data-autofocus`/`autofocus`, backdrop/Escape dismissal, and `useDrawer`.

### Low: placement and focus/scroll behavior need stronger tests

The tests cover default right placement, a left numeric size, a bottom string size, close requests, ref/style/className, and autofocus (`src/components/Drawer/Drawer.test.tsx:23-156`). Missing coverage:

- `top` placement and default top/bottom sizes.
- focus restoration to the opener after close (`src/components/Drawer/Drawer.tsx:150-153`).
- body overflow lock and cleanup (`src/components/Drawer/Drawer.tsx:157-166`).
- inside click does not close while backdrop click does (`src/components/Drawer/Drawer.tsx:186-190`).
- `useDrawer` option overrides and reset semantics (`src/components/Drawer/useDrawer.tsx:22-40`).

## Category Notes

- Performance: no material render-time issue found. The backdrop blur (`src/components/Drawer/Drawer.tsx:43-46`) can be visually expensive on low-end devices, but it is scoped to the modal backdrop and not a clear defect by itself.
- Accessibility: issues noted above for visible focus. The component does provide a required accessible label via `aria-label` and uses native modal dialog behavior.
- API clarity: the controlled `Drawer` API is small, but `useDrawer` option persistence should be clarified or changed.
- Stories: missing.
- Tests: present and passing, but missing the behavior cases listed above.
