# Tooltip Audit

Reviewed:

- `src/components/Tooltip/Tooltip.tsx`
- `src/components/Tooltip/useTooltip.tsx`
- `src/components/Tooltip/Tooltip.stories.tsx`
- `src/components/Tooltip/Tooltip.test.tsx`
- `src/components/Tooltip/index.ts`
- `src/internal/useLayer.tsx`
- `XDS_src/Tooltip/*.tsx` and `XDS_src/Tooltip/*.doc.mjs` as mirrored docs/context

Verification: `pnpm vitest run src/components/Tooltip/Tooltip.test.tsx` passes.

## Findings

### High: Tooltip cannot be dismissed with Escape

Tooltips opened by hover or focus are rendered as manual popovers (`src/internal/useLayer.tsx:178-183`) and neither `useTooltip` nor `useLayer` registers an Escape key handler (`src/components/Tooltip/useTooltip.tsx:138-173`). WCAG 2.1 SC 1.4.13 requires hover/focus content to be dismissible without moving pointer or focus. Add Escape dismissal, or use a popover mode/browser behavior that provides equivalent dismissal, and test it.

### High: Non-focusable element triggers are hover-only

For element children, `Tooltip` attaches behavior to only the first DOM child (`src/components/Tooltip/Tooltip.tsx:133-159`). Focus listeners are added only when `focusTrigger === "always"` or the element is already focusable (`src/components/Tooltip/useTooltip.tsx:188-195`), but `focusTrigger="always"` does not add `tabIndex`. A common label info-icon trigger implemented as a plain `span` is therefore unavailable to keyboard users unless every caller remembers to make it focusable. Either make this behavior explicit and enforce focusable triggers, or provide a safe focusable trigger path for non-interactive elements.

### Medium: `isDefaultOpen` reopens after user dismissal

The `isDefaultOpen` effect depends on the whole `layer` object (`src/components/Tooltip/useTooltip.tsx:223-227`). `useLayer` returns a new object each render (`src/internal/useLayer.tsx:192-200`), so when `isDefaultOpen` is true the effect runs after every render. Because `layer.show()` is idempotent while open but not after a user hide, any later render can reopen a tooltip that the user dismissed. `isDefaultOpen` should behave as an initial state only.

### Medium: Trigger attachment is fragile for multiple or changing children

The wrapper path only reads `wrapperRef.current?.firstElementChild` and never depends on `children` (`src/components/Tooltip/Tooltip.tsx:133-159`). If multiple elements are passed, only the first gets listeners and `aria-describedby`; hovering/focusing siblings will not show the tooltip. If the first child conditionally appears after the effect ran, the tooltip may stay unattached until another dependency happens to change. The API accepts `ReactNode`, so this behavior should either be constrained to one element or handled deliberately.

### Medium: `aria-describedby` cleanup can clobber other owners

`Tooltip` snapshots the existing `aria-describedby`, appends its tooltip ID, then restores the snapshot on cleanup (`src/components/Tooltip/Tooltip.tsx:115-130` and `src/components/Tooltip/Tooltip.tsx:143-158`). If another component adds or removes IDs while the tooltip is mounted, unmounting the tooltip can erase those later changes. Cleanup should remove only the tooltip-owned ID from the current attribute value.

### Medium: Browser API dependency is unguarded

`useLayer.show()` calls `popoverRef.current.showPopover()` directly (`src/internal/useLayer.tsx:101-107`). In browsers/environments without the Popover API, hovering a tooltip trigger will throw instead of failing gracefully. CSS Anchor Positioning is also assumed through `positionAnchor`/`positionArea` (`src/internal/useLayer.tsx:172-175`). If unsupported browsers are in scope, this needs feature detection, a fallback, or documented support constraints.

### Low: Hook return stability causes avoidable work

`useTooltip` memoizes its return value, but many dependencies include callbacks that depend on the freshly allocated `layer` object (`src/components/Tooltip/useTooltip.tsx:110-119`, `src/components/Tooltip/useTooltip.tsx:175-215`, `src/components/Tooltip/useTooltip.tsx:244-275`). The component then uses the whole `tooltip` object as a layout-effect dependency (`src/components/Tooltip/Tooltip.tsx:105-131` and `src/components/Tooltip/Tooltip.tsx:133-159`). This can cause unnecessary listener and ARIA cleanup/reattachment on ordinary renders. Narrowing dependencies to `tooltip.ref`/`tooltip.describedBy`, or memoizing `useLayer`'s return, would reduce churn.

### Low: Public hook/docs are unclear and partly stale

`UseTooltipReturn` exposes `ref`, `positionRef`, and `interactionRef` without local docs explaining when to split positioning from interaction (`src/components/Tooltip/useTooltip.tsx:32-39`). The mirrored XDS hook docs describe `content`, `delayMs`, `triggerProps`, and `layerNode` (`XDS_src/Tooltip/useXDSTooltip.doc.mjs:9-45`), but the actual hook takes behavior options and returns refs/render helpers (`XDS_src/Tooltip/useXDSTooltip.tsx:81-187`). The component docs also omit controlled `isOpen` even though the prop exists in the implementation (`src/components/Tooltip/Tooltip.tsx:27-30`, `XDS_src/Tooltip/Tooltip.doc.mjs:68-90`). This makes the controlled and headless APIs hard to use correctly.

## Missing Tests

- No Escape dismissal test for WCAG hover/focus behavior.
- No hide-on-mouse-leave or `onOpenChange(false)` test.
- No coverage for `delay`, `hideDelay`, `isEnabled={false}`, hover suppression on `(hover: none)`, or focus-trigger modes.
- No test for non-focusable element children, multiple children, changing children, disabled native controls, or `aria-describedby` cleanup with pre-existing and concurrently updated IDs.
- No direct tests for the exported `useTooltip` hook.
- Existing tests cover render, hover show callback, `aria-describedby`, text-only focusability, controlled open, default open, and `anchorRef` attachment (`src/components/Tooltip/Tooltip.test.tsx:53-157`).

## Missing Stories

- Stories cover text, button trigger, and placements (`src/components/Tooltip/Tooltip.stories.tsx:44-71`).
- Missing stories for `alignment`, `delay`/`hideDelay`, `focusTrigger`, `isEnabled={false}`, `isDefaultOpen`, controlled `isOpen`, `anchorRef`, and `hasHoverIndication`.
- Missing stories for keyboard-focused behavior and a non-focusable/custom trigger, which would expose the accessibility constraints.

## Category Notes

- Performance: low-level listener/effect churn exists, but no expensive rendering loop was found.
- Accessibility: issues found, especially Escape dismissal and keyboard access for non-focusable triggers.
- Logic bugs: issues found around default-open behavior, child attachment, ARIA cleanup, and unguarded platform APIs.
- API clarity: issues found in the headless hook and controlled/external-anchor documentation.
- Tests/stories: important behavior and props are not yet covered.
- Barrel exports are complete and straightforward (`src/components/Tooltip/index.ts:1-6`).
