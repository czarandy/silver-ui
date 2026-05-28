# Tag Component Audit

Reviewed:

- `src/components/Tag/Tag.tsx`
- `src/components/Tag/Tag.stories.tsx`
- `src/components/Tag/Tag.test.tsx`
- `src/components/Tag/index.ts`

## Findings

### High: removable link tags nest a button inside a link

When `href` and `onRemove` are both provided, `Tag` renders a `Link` root (`Tag.tsx:278-295`) and `TagContent` renders the remove `<button>` inside it (`Tag.tsx:222-233`). This creates nested interactive controls, which is invalid HTML and confusing for keyboard and assistive technology users. It also makes click/activation behavior fragile because the remove button is inside the anchor's activation area.

Consider rendering a non-link wrapper with separate link and remove controls for this combination, or disallowing/documenting the unsupported prop combination at the type/runtime level.

### Medium: `description` is dropped for link tags

`Tag` puts `description` into `sharedProps` as `aria-description` (`Tag.tsx:270-276`), but the `href` branch spreads those props into the Silver `Link` component (`Tag.tsx:278-286`). `Link` explicitly destructures its props and does not forward unknown props to the underlying element (`src/components/Link/Link.tsx:93-110`, `src/components/Link/Link.tsx:130-143`), so linked tags silently lose the accessible description.

This needs either first-class support in `Link`, a Tag-specific link rendering path, or a different description mechanism such as `aria-describedby` that is actually forwarded.

### Medium: important behavior is untested

`Tag.test.tsx` currently covers only a static label, remove click, and basic link rendering (`Tag.test.tsx:7-31`). Missing tests leave the highest-risk branches unprotected:

- `href` plus `onRemove`, including the nested-interactive behavior above.
- `description`, especially the link branch where it is currently dropped.
- disabled click/remove/link behavior.
- `onClick` rendering as a button, and `onClick` plus `onRemove` rendering as two controls.
- `isLabelHidden` accessible names.
- `icon`, `endContent`, `size`, and `color` rendering/class application.

### Low: Storybook coverage misses several public props and combinations

Stories cover default, icon, removable, and color variants only (`Tag.stories.tsx:29-43`). There are no stories for `size`, `href`, `onClick`, `isDisabled`, `isLabelHidden`, `endContent`, or `description`, and no story for combined clickable/removable behavior. Those are all public API props in `TagProps` (`Tag.tsx:30-95`) and should have representative stories so consumers can inspect semantics and layout.

### Low: mixed `onClick`/`onRemove` API is hard to reason about

The component has three interactive modes: link (`Tag.tsx:278-296`), single button (`Tag.tsx:299-316`), and a span containing separate label/remove buttons (`Tag.tsx:318-344`). `onClick` is documented as ignored when `href` is provided (`Tag.tsx:74-77`), but `onRemove` is still accepted with `href`, leading to the invalid nested-control case. The supported prop matrix should be clearer, ideally through discriminated prop types or explicit docs/stories.

## Category Notes

- Performance: no clear performance issue in this component; it is small and does not allocate expensive derived state.
- Accessibility: issues found above for nested controls and dropped descriptions. Focus-visible styles exist for interactive roots and remove buttons (`Tag.tsx:118-128`, `Tag.tsx:146-161`).
- Logic bugs: the linked `description` drop is a concrete behavior bug.
- Tests: missing coverage listed above.
- Stories/docs: missing public prop stories listed above.
