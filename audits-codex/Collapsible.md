# Collapsible Audit

Scope checked:

- `src/components/Collapsible/Collapsible.tsx`
- `src/components/Accordion/AccordionItem.tsx`
- `src/components/Accordion/useCollapsible.ts`
- `src/components/Accordion/Accordion.test.tsx`
- `XDS_src/Collapsible/*`

## Findings

### High: uncontrolled `onOpenChange` makes Collapsible non-interactive

In the silver-ui implementation, `AccordionItem` passes `{defaultIsOpen, onOpenChange}` whenever `isOpen` is not controlled (`src/components/Accordion/AccordionItem.tsx:80-83`). The hook then treats the mere presence of `onOpenChange` as the controlled path and only calls the callback, skipping `setInternalIsOpen` (`src/components/Accordion/useCollapsible.ts:54-60`). Result: `<Collapsible trigger="Details" onOpenChange={fn}>...</Collapsible>` calls `fn(false)` but remains open forever; subsequent clicks keep reporting `false`.

The same bug exists in the XDS copy: `XDSCollapsible` builds an uncontrolled config with `onOpenChange` (`XDS_src/Collapsible/XDSCollapsible.tsx:183-187`), and `useXDSCollapsible` skips internal state updates whenever `config.onOpenChange` exists (`XDS_src/Collapsible/useXDSCollapsible.ts:115-121`).

Recommended fix: in uncontrolled mode, update internal state and call `onOpenChange(nextOpen)`. Only skip internal state when `isOpen` is explicitly provided.

### Medium: expanded button is not programmatically associated with its panel

Both implementations set `aria-expanded`, but neither creates an `id` for the content panel nor an `aria-controls` relationship from trigger to content (`src/components/Accordion/AccordionItem.tsx:96-110`, `XDS_src/Collapsible/XDSCollapsible.tsx:206-224`). Screen reader users can tell the button is expanded/collapsed, but the controlled region is not discoverable from the button.

Recommended fix: generate stable IDs with `useId`, set `aria-controls` on the button, and set `id` on the content container. Consider `role="region"` plus `aria-labelledby` when panel content is substantial.

### Medium: `trigger: ReactNode` allows invalid or inaccessible button content

`trigger` is typed as any `ReactNode`, then wrapped in a `<span>` inside a `<button>` (`src/components/Accordion/AccordionItem.tsx:101`, `XDS_src/Collapsible/XDSCollapsible.tsx:211`). Passing headings, paragraphs, divs, or interactive controls can produce invalid HTML or nested interactive content. This is an API/documentation problem because the prop appears fully flexible.

Recommended fix: document that `trigger` must be phrasing, non-interactive content, or provide a stricter trigger API.

### Low: XDS group accepts base props it cannot render

`XDSCollapsibleGroupProps` extends `XDSBaseProps` and declares `ref`, but `XDSCollapsibleGroup` intentionally renders only a context provider and destructures no base props (`XDS_src/Collapsible/XDSCollapsibleGroup.tsx:31-42`, `XDS_src/Collapsible/XDSCollapsibleGroup.tsx:121-181`). Consumers can pass `className`, `style`, `xstyle`, `data-testid`, or `ref` and they are silently ignored.

Recommended fix: do not extend `XDSBaseProps` for this no-DOM provider, or document clearly that styling/test/ref props are unsupported.

### Low: group controlled values allocate unstable arrays

`normalizeToArray(controlledValue)` returns a new array every render (`XDS_src/Collapsible/XDSCollapsibleGroup.tsx:133-139`). Because `openValues` is a dependency for `isOpen` and `toggle`, the context value changes on every controlled render even when the controlled value is unchanged. The same pattern exists in `src/components/Accordion/Accordion.tsx`. This is unlikely to matter for small accordions, but large grouped lists could re-render unnecessarily.

Recommended fix: memoize normalized controlled values or store single-mode values without array allocation.

## Tests

The XDS implementation has useful coverage in `XDS_src/Collapsible/XDSCollapsibleGroup.test.tsx`: standalone rendering, default open/closed state, controlled `isOpen`, chevron rendering, keyboard activation, single and multiple group behavior, and default values are covered.

Missing test coverage:

- No direct tests exist for `src/components/Collapsible`; only `AccordionItem` behavior is tested indirectly through `src/components/Accordion/Accordion.test.tsx`.
- No test covers uncontrolled `onOpenChange`, which is the current logic bug.
- No test asserts `aria-controls`/content ID linkage.
- No test covers controlled `XDSCollapsibleGroup` in `type="multiple"` mode.
- No test covers the API edge case of a Collapsible rendered inside an Accordion/group context.

## Stories / Docs

XDS docs exist in `XDS_src/Collapsible/Collapsible.doc.mjs` and `XDS_src/Collapsible/useXDSCollapsible.doc.mjs`. They document the main props, group behavior, and the hook.

Missing story/doc coverage:

- No `Collapsible.stories.*` file was found.
- No silver-ui docs/stories were found for `src/components/Collapsible`.
- Important states and props lacking stories: `defaultIsOpen={false}` / `isDefaultOpen={false}`, controlled `isOpen` + `onOpenChange`, `onOpenChange` in uncontrolled mode, single group, multiple group, and rich trigger/content examples.
- The silver-ui wrapper uses `isDefaultOpen`, while XDS uses `defaultIsOpen`; that naming difference is not explained anywhere.

## Performance

No serious performance issues found. The component renders a small static tree, and hidden content is not repeatedly mounted/unmounted. The only performance concern is the low-severity controlled group array allocation noted above.

## Accessibility

Issues found: missing trigger-to-panel association and overly broad trigger content API. Keyboard activation works through the native button element and is covered by XDS tests. Focus visibility is implemented in the silver-ui AccordionItem styles (`src/components/Accordion/AccordionItem.tsx:39-44`).

## API Clarity

The API needs clearer documentation around default-open behavior, controlled vs uncontrolled `onOpenChange`, trigger content restrictions, and the `isDefaultOpen` vs `defaultIsOpen` naming mismatch between silver-ui and XDS.
