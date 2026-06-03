# Collapsible Audit

## Summary

Collapsible is a standalone disclosure widget that toggles the visibility of a content panel. It is implemented as a thin wrapper around `AccordionItem`, located at `src/components/Accordion/Collapsible.tsx` (not in its own directory). It delegates all behavior to AccordionItem, which uses the `useCollapsible` hook to manage open/closed state, supporting both controlled and uncontrolled modes. The underlying AccordionItem uses proper ARIA disclosure pattern with `aria-expanded`, `aria-controls`, and `aria-labelledby`.

## Issues

### Critical

- None identified.

### High

- None identified.

### Medium

- **Content is always rendered in DOM even when hidden**: AccordionItem uses `hidden={!isOpen || undefined}` (line 168) to toggle visibility, but the content children are always mounted in the DOM. For performance-sensitive cases with heavy content (large forms, data tables), this means unnecessary DOM nodes and potential layout calculations. Consider supporting a `lazy` or `unmountOnClose` prop that conditionally renders children only when open.
- **No CSS animation/transition for open/close**: The content panel appears and disappears instantly. The chevron icon has a transition (`transitionProperty: 'transform'` in AccordionItem styles), but the content panel has no enter/exit animation. Many disclosure components animate height for a smoother user experience.
- **`isDefaultOpen` defaults to `true` which is unconventional**: Most collapsible/accordion components default to closed. Collapsible defaults to open (`isDefaultOpen` defaults to `true` via AccordionItem line 131). While documented, this may surprise consumers. The default is intentional but worth calling out.
- **No story demonstrating accessibility features**: No story shows screen reader behavior, focus management, or keyboard interaction. While tests cover keyboard activation (Enter/Space), a story demonstrating these patterns would help developers understand the accessibility behavior.

### Low

- **Component lives inside the Accordion directory**: Collapsible is defined at `src/components/Accordion/Collapsible.tsx` rather than having its own `src/components/Collapsible/` directory. This makes it harder to discover and breaks the convention of one component per directory used by the rest of the library. The index.ts exports it from the Accordion barrel, so import paths work, but the physical location is unexpected.
- **Collapsible re-declares all AccordionItem props**: The `CollapsibleProps` interface mirrors `AccordionItemProps` minus `value`. It could extend `Omit<AccordionItemProps, 'value'>` to avoid prop definition duplication and ensure the two stay in sync.
- **Tests do not verify that the `value` prop is absent/unused**: Since Collapsible is not meant to be used inside an Accordion, there is no test verifying that passing a `value` prop does not cause unexpected behavior. The `useCollapsible` hook will use the AccordionContext when value is provided, which could cause bugs if someone accidentally nests a Collapsible inside an Accordion.

## Recommendations

1. Consider adding a `lazy` or `unmountOnClose` prop to avoid rendering heavy content when collapsed.
2. Add open/close animation (e.g., CSS height transition or `@starting-style` animation).
3. Consider moving Collapsible to its own directory (`src/components/Collapsible/`) for discoverability, or at minimum add a re-export from a dedicated directory.
4. Consider having `CollapsibleProps` extend `Omit<AccordionItemProps, 'value'>` to avoid prop duplication.
5. Add a test that verifies Collapsible behavior when accidentally nested inside an Accordion.
