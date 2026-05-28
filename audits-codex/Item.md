# Item Audit

Audited the public Silver component in `src/components/Item` plus its stories and tests. Also checked `XDS_src/Item`; it has a fuller reference implementation/docs/tests, but `src/index.ts` exports the Silver `src/components/Item` API.

## Findings

### High: `isDisabled` is ignored for role-based clickable items

When `role` is provided, `Item` skips the inner button/link and attaches `onClick` directly to the root (`src/components/Item/Item.tsx:266`, `src/components/Item/Item.tsx:325`). In that same mode, disabled pointer blocking is deliberately not applied (`src/components/Item/Item.tsx:321`). The result is that `<Item role="menuitem" isDisabled onClick={...} />` still invokes `onClick` on mouse click despite rendering `aria-disabled="true"` (`src/components/Item/Item.tsx:312`). The existing disabled test only covers the inner button path (`src/components/Item/Item.test.tsx:56`).

### Medium: Link items look row-clickable but only the text content is a link

For `href`, the root gets interactive cursor/hover styling (`src/components/Item/Item.tsx:234`, `src/components/Item/Item.tsx:318`), but only the label/description subtree is rendered as `LinkComponent` (`src/components/Item/Item.tsx:274`). The media, start adornment, row padding, and trailing slot are not part of the anchor and the container click handler cannot navigate for link-only items because it only calls `onClick` (`src/components/Item/Item.tsx:253`). This creates misleading hit targets and inconsistent behavior versus the `onClick` path, where clicking media or empty row area calls the handler. Tests only assert that an anchor exists, not that the whole apparent row activates (`src/components/Item/Item.test.tsx:62`).

### Medium: Passing both `href` and `onClick` creates split behavior

If both props are supplied, the content area becomes a link because the `href` branch wins (`src/components/Item/Item.tsx:274`), while clicks outside button/link/input descendants call `onClick` through the root handler (`src/components/Item/Item.tsx:258`, `src/components/Item/Item.tsx:263`). A single item can therefore navigate when the label is clicked but run a different click handler when its media, adornment, or padding is clicked. The API does not document exclusivity or precedence, and there is no test for this combination.

### Low: Truncation observation is always enabled for string labels/descriptions

String labels and descriptions default to `maxLines=1` (`src/components/Item/Item.tsx:194`, `src/components/Item/Item.tsx:239`, `src/components/Item/Item.tsx:245`). `Text` enables truncation tooltip logic by default (`src/components/Text/Text.tsx:120`) and `useTruncation` installs measurement work and a `ResizeObserver` whenever `maxLines > 0` (`src/components/Text/useTruncation.ts:136`). That is useful for isolated rows, but `Item` is a list primitive and gives consumers no way to disable truncate tooltips for large virtualized/static lists. This is a performance concern rather than an immediate bug.

## Accessibility

Issues found above: disabled role-based items are still activatable, and link rows expose a smaller semantic/focus target than the visual interactive row suggests. Native button keyboard behavior is covered for the simple `onClick` path (`src/components/Item/Item.test.tsx:46` only checks pointer activation, not keyboard activation). `aria-selected`/`aria-disabled` are present on the root, but role-specific behavior is under-tested.

## API Clarity

`role` is very broad (`string`) and changes the interaction model substantially (`src/components/Item/Item.tsx:96`), but the public stories do not demonstrate it. `href` and `onClick` precedence is unclear. `as` is limited to `div | li | span`, which is clear and conservative.

## Tests

Current tests cover basic rendering, slots, inner button click/disabled, link rel handling, custom link `to`, and selected/disabled attributes (`src/components/Item/Item.test.tsx:21`). Missing important coverage:

- Disabled `role` path should not fire `onClick`.
- Keyboard activation/focus for the `onClick` button path.
- `href` click target behavior outside the label/description.
- Combined `href` + `onClick` behavior or a validation rule forbidding it.
- `as`, `ref`, `className`, `style`, `align`, `density`, `isHighlighted`, `labelLines`, and `descriptionLines`.

## Stories / Docs

Stories exist for default, slots, click interaction, and compact density (`src/components/Item/Item.stories.tsx:26`). Missing important stories:

- Link item (`href`, `target`) and disabled link state.
- Selected, highlighted, and disabled visual states as concrete stories, not only controls (`src/components/Item/Item.stories.tsx:14`).
- `align="start"` with multiline text or tall media.
- `labelLines` / `descriptionLines` truncation.
- `startAdornment` and `as="li"` usage.

No public Silver docs file exists beside the stories. `XDS_src/Item/Item.doc.mjs` documents the reference `XDSItem`, but it is not the exported Silver component.
