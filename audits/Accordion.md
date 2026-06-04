# Accordion Audit

## Summary

## SVA Conversion

**Benefit: Strong**

The styling lives mostly in `AccordionItem.tsx`, which renders 4 distinct styled DOM elements (root `<div>`, `<button>` trigger, chevron `<span>`, and content/panel `<div>`) via a standalone `const styles = {root, trigger, chevron, chevronOpen, content}` object (5 css() blocks) with `cx()` and a `isOpen ? styles.chevronOpen : undefined` conditional. `Accordion.tsx` itself is a layout/context container with a single `styles.root` block, and `Collapsible.tsx` just delegates to `AccordionItem`. An `sva` recipe on `AccordionItem` with slots root/trigger/chevron/content plus an `isOpen` (and `isDisabled`) variant would consolidate the open-state chevron rotation and disabled styling into one recipe, mapping cleanly onto the markup.
