# Divider Audit

Audited files:

- `src/components/Divider/Divider.tsx`
- `src/components/Divider/Divider.recipe.ts`
- `src/components/Divider/Divider.stories.tsx`
- `src/components/Divider/Divider.test.tsx`
- `src/components/Divider/index.ts`
- `XDS_src/Divider/XDSDivider.tsx`
- `XDS_src/Divider/XDSDivider.test.tsx`
- `XDS_src/Divider/Divider.doc.mjs`

## Findings

### High: `isFullBleed` uses the start padding variable for both sides

`src/components/Divider/Divider.tsx:75-82` uses `mx`/`my` with only `--container-padding-inline-start` or `--container-padding-block-start`. In asymmetric containers, the divider gets the wrong end-side negative margin even though its width/height includes both start and end padding variables. This can overhang or underfill the padded container edge.

The XDS implementation handles this correctly with separate start/end declarations in `XDS_src/Divider/XDSDivider.tsx:154-166`. The primary component should use separate inline/block start and end margins too.

### Medium: Root does not accept normal div attributes or ARIA overrides

`DividerProps` in `src/components/Divider/Divider.tsx:12-45` only exposes `className`, `data-testid`, `style`, and component-specific props, and the render path has no `...props` passthrough at `src/components/Divider/Divider.tsx:102-116`. Consumers cannot pass `aria-label`, `aria-hidden`, `id`, `title`, or other valid `div` attributes.

This is an accessibility/API issue because dividers are often either meaningful separators that need an accessible name or purely decorative separators that should be hidden from assistive tech. The XDS copy supports passthrough props and has a test for `aria-label` in `XDS_src/Divider/XDSDivider.test.tsx:74-78`.

### Medium: XDS label rendering drops valid falsy React nodes

`XDS_src/Divider/XDSDivider.tsx:218-227` uses `label && ...`, so valid `ReactNode` values like `0` are not rendered and do not produce the expected second line. The primary `src` Divider handles this better with `label != null` at `src/components/Divider/Divider.tsx:118`. If `XDS_src` is still active, align it with the primary implementation.

### Low: Exported variant typing is confusing

`src/components/Divider/Divider.recipe.ts:7-24` only models the `orientation` recipe variant, but `src/components/Divider/index.ts:7` exports `DividerVariants` next to `DividerVariant`. Consumers may reasonably expect `DividerVariants` to include the visual `variant` prop (`subtle | strong`), but it does not. This is not a runtime bug, but it makes the public API harder to understand.

## Tests

Missing or weak coverage:

- No test for the default horizontal orientation in `src/components/Divider/Divider.test.tsx`; only the non-default vertical path is asserted at lines 6-13.
- No test that `variant="strong"` changes the rendered line styling.
- No test for `isFullBleed`, which would have caught the asymmetric margin bug.
- No test for labeled divider structure, vertical labels, or falsy-but-valid labels such as `0`.
- No test for ARIA passthrough because the primary API currently does not allow passthrough props.

Existing tests cover role/orientation for vertical, label text, and forwarding of `className`, `style`, `data-testid`, and `ref`.

## Stories And Docs

Missing stories:

- `src/components/Divider/Divider.stories.tsx` only has `Basic` and `WithLabel` at lines 26-34.
- There are controls for `orientation` and `variant`, but no dedicated stories for `vertical`, `strong`, `isFullBleed`, or vertical-with-label usage.

Docs:

- No `src/components/Divider/Divider.doc.mjs` exists for the primary component.
- `XDS_src/Divider/Divider.doc.mjs` documents `orientation`, `label`, `variant`, `isFullBleed`, and `xstyle`, but there is no XDS Divider Storybook story in this repo.

## Category Notes

- Performance: no significant issues found. Styling is declared at module scope in the primary component, so `css()` calls do not run on every render.
- Accessibility: main concern is the lack of ARIA/native prop passthrough on the primary component.
- Logic bugs: `isFullBleed` asymmetric margin handling is the concrete primary-component bug; XDS has the falsy label rendering issue.
