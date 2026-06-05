# TODO: portal Popover content out of the trigger's DOM subtree

## Problem

`Popover` renders its floating content as a DOM sibling inside the trigger's subtree:

```tsx
return (
  <>
    <div className={styles.anchor} ref={wrapperRef}>
      {children}
    </div>
    {popoverContent}{' '}
    {/* <div popover> from useLayer — DOM sibling of the trigger */}
  </>
);
```

The content escapes _visually_ via the top layer (popover API) + CSS anchor
positioning, so its DOM position is purely a selector-scoping concern. But any
ancestor with descendant/sibling selectors reaches into it.

Concrete symptom: a `DropdownMenu` (which wraps `Popover`) inside a `ButtonGroup`
leaked the group's "joined button" styling onto the trigger (lost end radius) and onto
the open menu items (inherited borders/radii). Patched locally in
`ButtonGroup.recipe.ts` with `[popover]`-specific guards — but that's mechanism-
specific (see `Dialog/TODO.md` for the same bug via a different top-layer mechanism).

## Fix

The real fix lives one level down in `src/internal/useLayer.tsx` (`render`): portal the
layer element to `document.body`. Once done, `Popover` no longer emits a floating DOM
sibling, the `ButtonGroup.recipe.ts` workarounds can be reverted, and the same fix
covers every other `useLayer` consumer (Tooltip, Select, HoverCard, …).

See `src/internal/TODO.md` for the full plan, blast radius, and SSR/hydration checklist.
