# Accordion Audit

## Summary

The Accordion module provides three components: `Accordion` (group coordinator), `AccordionItem` (individual panel), and `Collapsible` (standalone disclosure wrapper around AccordionItem). It supports single/multiple mode, controlled/uncontrolled state, and disabled items. The `useCollapsible` hook unifies standalone and grouped open-state logic via context.

## Issues

### Critical

- None.

### High

- **Content always rendered in DOM even when collapsed.** `AccordionItem` renders children into a `<div>` with `hidden` toggled. The content is always mounted (just hidden), which means large subtrees pay mount cost even when never opened. For accordions with heavy content (forms, tables), this can degrade initial render performance. Consider lazy-mounting children on first open, or providing a `lazyMount` / `unmountOnClose` prop.

### Medium

- **`toggle` callback is not memoized in `useCollapsible`.** The `toggle` function in `useCollapsible.ts` (line 58) is a plain arrow function created every render. Since it closes over `isControlledByGroup`, `group`, `value`, `config`, and `isOpen`, it changes identity on every render. This forces `AccordionItem` to re-render even when nothing changed. Wrapping it in `useCallback` would stabilize the identity when dependencies are unchanged.
- **`normalizeToSet` creates a new Set on every call.** In `Accordion.tsx`, the `openValues` memo (line 132-135) calls `normalizeToSet(controlledValue)` on every render when controlled. Since `controlledValue` for single mode is a string (primitively stable), this is fine, but for multiple mode where `controlledValue` is an array, a new Set is created even if the array reference hasn't changed. The memo's dependency on `controlledValue` already handles this correctly via `useMemo`, but if the consumer passes a new array reference each render (common mistake), it will create unnecessary Sets. This is documented in the JSDoc ("Memoize array values"), but a dev-mode warning could help.
- **No animation or transition on open/close.** The content panel shows/hides instantly via `hidden`. The chevron rotates with a CSS transition, but the panel itself has no height transition. This is a UX gap compared to most accordion implementations. Consider adding a collapsible height animation.
- **Missing story for nested Accordion (Accordion inside AccordionItem).** This is a valid use case (e.g., multi-level navigation) and would help verify context isolation.

### Low

- **`isDefaultOpen` defaults to `true` for standalone AccordionItem/Collapsible.** This is an unusual default -- most accordion/collapsible implementations default to closed. While documented, it may surprise users. The JSDoc clearly states the default, but the `Collapsible.stories.tsx` "Default" story starts open, which could mask the fact that `isDefaultOpen={false}` is the more typical configuration.
- **`Collapsible` is a thin wrapper that adds no logic.** It exists only for naming clarity (`Collapsible` vs `AccordionItem` used standalone). This is fine architecturally, but the component could inherit its own `displayName` from `AccordionItem` if the two ever diverge.
- **No `aria-label` or `aria-labelledby` required on `Accordion`.** While both are optional, providing neither means the `role="group"` has no accessible name. A dev-mode warning when neither is provided would improve accessibility.
- **Test coverage: no test for the `AllCollapsed` state in single mode without `defaultValue`.** The story exists (`AllCollapsed`), but there is no corresponding test asserting that omitting `defaultValue` starts all items closed.

## Recommendations

1. Add lazy-mount support to avoid rendering hidden content on initial mount.
2. Memoize the `toggle` function in `useCollapsible` with `useCallback`.
3. Add a dev-mode warning when `Accordion` has no accessible name (`aria-label` or `aria-labelledby`).
4. Consider adding open/close animation for the content panel.
5. Add a test for the "all collapsed" initial state (no `defaultValue`).
