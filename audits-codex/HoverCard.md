# HoverCard Audit

Files reviewed:

- `src/components/HoverCard/HoverCard.tsx`
- `src/components/HoverCard/useHoverCard.tsx`
- `src/components/HoverCard/HoverCard.stories.tsx`
- `src/components/HoverCard/HoverCard.test.tsx`
- `src/components/HoverCard/index.ts`
- `XDS_src/HoverCard/XDSHoverCard.tsx`
- `XDS_src/HoverCard/useXDSHoverCard.tsx`
- `XDS_src/HoverCard/XDSHoverCard.test.tsx`
- `XDS_src/HoverCard/HoverCard.doc.mjs`
- `XDS_src/HoverCard/useXDSHoverCard.doc.mjs`

## Findings

### High: Controlled `isOpen` can be dismissed internally

`isOpen={true}` suppresses scheduled hides (`src/components/HoverCard/useHoverCard.tsx:122`, `XDS_src/HoverCard/useXDSHoverCard.tsx:299`), but Escape still calls `layer.hide()` directly from both trigger and content handlers (`src/components/HoverCard/useHoverCard.tsx:166`, `src/components/HoverCard/useHoverCard.tsx:269`, `XDS_src/HoverCard/useXDSHoverCard.tsx:351`, `XDS_src/HoverCard/useXDSHoverCard.tsx:472`). The controlled-state effect only re-runs when the prop changes (`src/components/HoverCard/useHoverCard.tsx:236`, `XDS_src/HoverCard/useXDSHoverCard.tsx:434`), so the popover can remain hidden while the parent still renders `isOpen={true}`. This contradicts the XDS prop contract that controlled `true` force-shows the card.

### High: `useXDSHoverCard` docs describe a different API

`XDS_src/HoverCard/useXDSHoverCard.doc.mjs` documents params like `content` and `delayMs`, a default placement of `'below'`, and returns `triggerProps`/`layerNode` (`XDS_src/HoverCard/useXDSHoverCard.doc.mjs:9`, `XDS_src/HoverCard/useXDSHoverCard.doc.mjs:17`, `XDS_src/HoverCard/useXDSHoverCard.doc.mjs:28`, `XDS_src/HoverCard/useXDSHoverCard.doc.mjs:45`). The actual hook accepts an options object with `delay`, `hideDelay`, `focusTrigger`, `isOpen`, etc. and returns refs/render functions (`XDS_src/HoverCard/useXDSHoverCard.tsx:236`, `XDS_src/HoverCard/useXDSHoverCard.tsx:511`). Consumers following the docs will implement the hook incorrectly.

### Medium: Multi-element triggers are silently only partially wired

The public `children` type is `ReactNode` (`src/components/HoverCard/HoverCard.tsx:23`), but non-text triggers attach positioning, events, and `aria-describedby` only to `wrapperRef.current?.firstElementChild` (`src/components/HoverCard/HoverCard.tsx:153`). XDS does the same (`XDS_src/HoverCard/XDSHoverCard.tsx:205`). A fragment or multiple sibling trigger elements will leave all but the first child non-interactive and undescribed. Either restrict/document the API as a single element trigger or support multiple anchors intentionally.

### Medium: Accessibility semantics for rich content are unclear

The component always links the trigger to the card with `aria-describedby` (`src/components/HoverCard/HoverCard.tsx:165`, `src/components/HoverCard/HoverCard.tsx:186`), while docs describe richer anatomy and optional actions (`XDS_src/HoverCard/HoverCard.doc.mjs:111`). The default component does not assign a role to the popover; the lower-level hook only passes through `props?.role` when a custom caller supplies one (`src/components/HoverCard/useHoverCard.tsx:288`). For interactive content, `aria-describedby` can flatten structure and the popover has no explicit assistive-technology role/name contract.

### Medium: Escape is swallowed even when the card is already closed

The trigger `keydown` listener is attached regardless of current open state (`src/components/HoverCard/useHoverCard.tsx:190`) and always calls `event.stopPropagation()` before `layer.hide()` on Escape (`src/components/HoverCard/useHoverCard.tsx:166`). XDS mirrors this (`XDS_src/HoverCard/useXDSHoverCard.tsx:351`). If focus is on the trigger while the card is closed, parent dialogs/menus cannot observe Escape.

### Low: Re-renders reattach element-trigger listeners in the source component

`useHoverCard` returns a fresh object each render (`src/components/HoverCard/useHoverCard.tsx:304`), and `HoverCard` depends on that full object in a layout effect (`src/components/HoverCard/HoverCard.tsx:178`). For element triggers, ordinary re-renders tear down and reapply refs, event listeners, and `aria-describedby`. This is unlikely to be severe for typical usage, but it is avoidable by stabilizing the returned object or narrowing dependencies.

## Coverage Gaps

### Tests

`src/components/HoverCard/HoverCard.test.tsx` has only four basic tests (`src/components/HoverCard/HoverCard.test.tsx:20`): text trigger attributes, element `aria-describedby`, hover open, and text-trigger passthrough props. It is missing tests for close behavior, `hideDelay`, focus open/close, focus moving into content, Escape from trigger/content, `isEnabled={false}`, `isDefaultOpen`, controlled `isOpen`, `focusTrigger`, merging existing `aria-describedby`, and the multi-child trigger edge case.

`XDS_src/HoverCard/XDSHoverCard.test.tsx` covers more behavior, including `isEnabled`, `isDefaultOpen`, and Escape (`XDS_src/HoverCard/XDSHoverCard.test.tsx:129`, `XDS_src/HoverCard/XDSHoverCard.test.tsx:163`, `XDS_src/HoverCard/XDSHoverCard.test.tsx:230`), but still lacks controlled `isOpen`, `focusTrigger`, timing/keep-open behavior while hovering content, and multi-child trigger coverage.

### Stories

Story coverage is thin: only text trigger, button trigger, and default-open examples exist (`src/components/HoverCard/HoverCard.stories.tsx:28`, `src/components/HoverCard/HoverCard.stories.tsx:44`, `src/components/HoverCard/HoverCard.stories.tsx:63`). Important props have controls but no dedicated demonstrations: `placement`, `alignment`, `delay`, `hideDelay`, `isEnabled`, and `hasHoverIndication` (`src/components/HoverCard/HoverCard.stories.tsx:9`). There are no stories for `focusTrigger`, controlled `isOpen`/`onOpenChange`, disabled behavior, placement/alignment matrices, hover indication variants, or interactive card content.

### Docs/API

The XDS component docs omit `isOpen` even though it is part of the component props (`XDS_src/HoverCard/HoverCard.doc.mjs:27`, `XDS_src/HoverCard/XDSHoverCard.tsx:162`). The hook docs are stale as noted above. The source component JSDoc does call out that `className`, `style`, `ref`, and `data-testid` apply only to text triggers (`src/components/HoverCard/HoverCard.tsx:26`), so that part is documented, albeit easy to miss.

## Category Notes

- Performance: no major rendering hot path issue found; the main concern is avoidable ref/listener churn on re-render.
- Accessibility: issues found around semantic role/relationship and Escape propagation.
- Logic bugs: controlled `isOpen` dismissal and multi-child trigger behavior are the main risks.
- Unclear API: docs mismatch and implicit single-element trigger behavior need clarification.
- Missing tests/stories: significant gaps for controlled, focus, timing, and important prop demonstrations.
