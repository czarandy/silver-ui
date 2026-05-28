# Accordion Audit

## Findings

### High

- Uncontrolled `AccordionItem` stops toggling when `onOpenChange` is provided. `AccordionItem` passes `{defaultIsOpen, onOpenChange}` when `isOpen` is absent, but `useCollapsible` treats the presence of `config.onOpenChange` as a controlled branch and only calls the callback without updating `internalIsOpen` ([AccordionItem.tsx:80](../src/components/Accordion/AccordionItem.tsx#L80), [useCollapsible.ts:54](../src/components/Accordion/useCollapsible.ts#L54)). This makes `<AccordionItem onOpenChange={...}>` report state changes but remain visually stuck. Add a test for uncontrolled `onOpenChange` and update state before/after invoking the callback.

- `type="single"` can render multiple panels open when `value` or `defaultValue` is an array. The public props allow `string | string[]` for all modes, and `normalizeToArray` preserves every entry before `isOpen` checks membership ([Accordion.tsx:15](../src/components/Accordion/Accordion.tsx#L15), [Accordion.tsx:46](../src/components/Accordion/Accordion.tsx#L46), [Accordion.tsx:50](../src/components/Accordion/Accordion.tsx#L50)). A single-mode accordion should either type `value/defaultValue` as `string` for single mode or coerce/validate to one open item. Add tests for array `value/defaultValue` in single mode.

### Medium

- Accordion items without `value` silently opt out of group coordination. `value` is optional, and `useCollapsible` only uses the group when `group != null && value != null` ([AccordionItem.tsx:18](../src/components/Accordion/AccordionItem.tsx#L18), [useCollapsible.ts:25](../src/components/Accordion/useCollapsible.ts#L25)). Inside `<Accordion>`, a missing value becomes a standalone item that defaults open and can leave multiple panels open in single mode. Make `value` required for grouped usage through API/docs/runtime warning, and add a regression test.

- Accordion semantics are incomplete. Triggers expose `aria-expanded`, but they do not expose `aria-controls`, panels do not have matching `id`/`aria-labelledby`, and there is no heading wrapper or optional panel `role="region"` ([AccordionItem.tsx:96](../src/components/Accordion/AccordionItem.tsx#L96), [AccordionItem.tsx:110](../src/components/Accordion/AccordionItem.tsx#L110)). Native button keyboard activation is covered, but screen reader relationships between trigger and panel are weaker than the ARIA accordion pattern.

- The component has a local barrel but is not exported from the package entry point. `src/components/Accordion/index.ts` exports `Accordion` and `AccordionItem`, but `src/index.ts` has no `Accordion` export. Consumers cannot import it from the package root, unlike other components.

- No Accordion stories or docs were found. `src/components/Accordion` contains implementation and tests only; there is no `Accordion.stories.tsx`, `.doc.mjs`, or MDX file. Important stories are missing for single mode, multiple mode, controlled `value/onChange`, standalone `AccordionItem` controlled/uncontrolled behavior, `isDefaultOpen`, and missing/required `value` guidance.

### Low

- `onChange` return shape is ambiguous. In single mode, closing the active item calls `onChange('')` ([Accordion.tsx:71](../src/components/Accordion/Accordion.tsx#L71)). The prop type is `string | string[]`, but the empty string sentinel is undocumented and can collide with an item whose value is `''`. Consider `string | undefined` for single mode or documenting that empty string means no open item.

## Tests

- Existing tests cover standalone rendering, default open/collapsed state, click and keyboard toggling, controlled standalone `isOpen`, single-mode exclusivity, multi-mode opening, controlled single value, default values, and basic `aria-expanded` ([Accordion.test.tsx:7](../src/components/Accordion/Accordion.test.tsx#L7), [Accordion.test.tsx:112](../src/components/Accordion/Accordion.test.tsx#L112), [Accordion.test.tsx:254](../src/components/Accordion/Accordion.test.tsx#L254)).
- Missing tests: uncontrolled `onOpenChange` should both call back and update UI; `type="single"` should not accept/render multiple open values; controlled multiple-mode `value/onChange`; item without `value` inside a group; package root export; `aria-controls`/panel relationship once implemented.

## Performance

- No blocking performance issue found for normal accordion sizes. The group state uses array `includes`/`filter` checks ([Accordion.tsx:50](../src/components/Accordion/Accordion.tsx#L50), [Accordion.tsx:62](../src/components/Accordion/Accordion.tsx#L62)); this is acceptable for typical UI counts, though a `Set` could help if the component is expected to coordinate very large lists.
