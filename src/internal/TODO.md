# TODO: portal the layer content out of the trigger's DOM subtree

## Problem

`useLayer.render` emits the floating element (`<div popover>`) **inline at the call
site**, as a DOM sibling/descendant of the trigger. It escapes _visually_ via the
top layer (popover API) + CSS anchor positioning (`position-anchor` / `anchor-name`),
so its DOM location is purely a selector-scoping concern — but ancestors with
descendant/sibling selectors still reach into it.

Concrete symptom: a `DropdownMenu` placed inside a `ButtonGroup` leaked the group's
"joined button" styling in two ways:

1. The trailing `<div popover>` (display:none but still structural) made the real
   last button `:not(:last-child)`, stripping its end radius.
2. When open, the menu-item buttons are descendants of the group, so they inherited
   the group's border/radius joins.

These were patched _locally_ in `ButtonGroup.recipe.ts` with
`:has(~ :not([popover]))` and `:not([popover] *)`. That guard is **mechanism-specific**
— it only knows about `[popover]`. A `Dialog` child (top layer via `showModal()`, no
`popover` attribute) would reproduce the same bug and slip past the guard. This is
whack-a-mole; every component that renders top-layer content inline needs its own
escape hatch in every ancestor's selectors.

## Fix

Portal the layer element to `document.body` (or a dedicated portal root) inside
`render`. Costs nothing visually (already painted from the top layer); removes the
content from arbitrary ancestors' DOM subtrees, killing the whole class of leak. Once
done, the `ButtonGroup.recipe.ts` workarounds can be reverted to plain
`:not(:last-child)` / `:not(:first-child)`.

## Blast radius

`useLayer` backs ~18 components (Popover, Tooltip, HoverCard, Select, MultiSelect, the
autocomplete/date inputs, TabMenu, table filtering, …). This is a shared-core change —
verify Select / Tooltip / HoverCard visually and run the full suite.

## SSR checklist (this is a library; SSR-safety is a constraint — cf. `useIsomorphicLayoutEffect`)

- Never touch `document` during render — resolve the portal target in an effect.
- Portal content won't appear in server HTML. Behavior change: today the layer is
  rendered inline even when closed, so its markup _is_ in SSR output; portaling drops
  it. Acceptable for overlays, but a conscious call.
- Avoid hydration mismatch: server and first client render must agree, then portal
  after mount:

  ```tsx
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => setContainer(document.body), []);
  return container ? createPortal(node, container) : null;
  ```

  The one-frame "not portaled yet" gap is invisible because layers start closed and
  are interaction-driven (can't open before hydration).

- Keep the element mounted (don't gate on `isOpen`) so `showPopover()` / the toggle
  lifecycle still works.

## Related

- `src/components/Popover/TODO.md`
- `src/components/Dialog/TODO.md` (separate top-layer mechanism — needs its own portal)
- `src/components/ButtonGroup/ButtonGroup.recipe.ts` (the local workarounds to revert)
