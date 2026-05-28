# Card Audit

Audited 2026-05-28.

Files reviewed:

- `src/components/Card/Card.tsx`
- `src/components/Card/Card.recipe.ts`
- `src/components/Card/Card.stories.tsx`
- `src/components/Card/Card.test.tsx`
- `src/components/Card/index.ts`
- `src/index.ts`
- Reference/docs context: `XDS_src/Card/XDSCard.tsx`, `XDS_src/Card/Card.doc.mjs`

Verification:

- `pnpm vitest run src/components/Card/Card.test.tsx` passed: 3 tests.

## Findings

### Medium: Card does not forward standard div or ARIA props

`CardProps` only exposes `children`, `className`, `data-testid`, sizing props, `padding`, `ref`, `style`, and `variant` (`src/components/Card/Card.tsx:21-33`). The implementation destructures exactly those props and renders no rest props (`src/components/Card/Card.tsx:57-88`). Consumers therefore cannot set `id`, `role`, `aria-label`, `aria-labelledby`, `aria-describedby`, `tabIndex`, event handlers, or arbitrary `data-*` attributes on the card root without casts or wrappers.

This is an accessibility/API limitation for a generic container. Card itself can remain a plain `div`, but consumers need root DOM attributes when a card represents an `article`, named `region`, selectable item, or clickable surface. The upstream/reference implementation extends a base div-prop surface and spreads remaining props (`XDS_src/Card/XDSCard.tsx:146-156`, `XDS_src/Card/XDSCard.tsx:250-303`).

Recommendation: extend a constrained `React.HTMLAttributes<HTMLDivElement>` or `ComponentPropsWithoutRef<'div'>`, omit conflicting props if needed, and spread the rest onto the root. Add tests for at least `role`, an accessible name attribute, and one generic `data-*` prop.

### Low: Stories do not demonstrate most Card props and variants

The story file has only `Basic` and `Variants` (`src/components/Card/Card.stories.tsx:36-57`). `Variants` shows 6 of 13 supported variants and omits `transparent`, `cyan`, `gray`, `orange`, `pink`, `purple`, and `teal` (`src/components/Card/Card.stories.tsx:48-54` vs. `src/components/Card/Card.tsx:6-19`). There are no stories for the `padding`, `height`, `maxWidth`, `minHeight`, fixed-height scrolling, `className`, or `style` props.

`Basic` also hard-codes `width={360}` after `{...args}` (`src/components/Card/Card.stories.tsx:37-40`), so any Storybook control or docs-generated arg for `width` cannot override that value in the primary example.

Recommendation: add compact stories for all variants, padding scale examples, constrained/fixed-height scrolling, and sizing. Put fixed example values before `{...args}` when the story is intended to remain controllable.

### Low: Core styling branches are untested

Current tests cover child rendering, numeric sizing for `height`/`maxWidth`/`width`, and root `className`/`style`/`data-testid`/`ref` passthrough (`src/components/Card/Card.test.tsx:5-44`). Important behavior is not covered:

- `variant` changes the recipe branch (`src/components/Card/Card.recipe.ts:12-34`).
- `padding` maps spacing steps to `--card-padding` (`src/components/Card/Card.tsx:35-47`, `src/components/Card/Card.tsx:71-78`).
- `height` toggles fixed-height overflow behavior while `height="auto"` does not (`src/components/Card/Card.tsx:70`, `src/components/Card/Card.recipe.ts:35-40`).
- `minHeight` and string size values are part of the public API but are not asserted (`src/components/Card/Card.tsx:25-32`, `src/components/Card/Card.test.tsx:12-24`).

Recommendation: add focused assertions for padding custom property output, each major variant category, fixed-height vs. auto-height overflow classes/styles, `minHeight`, and string size passthrough.

### Low: Padding type is coupled to Stack terminology

`Card` imports `StackGap` from `../Stack` and uses it as the type for `padding` (`src/components/Card/Card.tsx:3`, `src/components/Card/Card.tsx:28`). The numeric scale is correct, but the name is misleading in Card's public API and couples Card padding to Stack's gap naming.

Recommendation: introduce a shared `SpacingStep` type or a local `CardPadding` alias that matches the same numeric union.

### Low: No current docs file for the exported Card API

No colocated docs file exists under `src/components/Card`; the only docs found are for the `XDS_src` reference copy (`XDS_src/Card/Card.doc.mjs`). Those docs describe upstream `XDSCard` concepts and theming details that are not the exported `src/components/Card` surface.

Recommendation: add docs metadata or markdown for the actual exported Card API, including whether Card is intentionally non-interactive and whether consumers should use wrappers for semantic/card-link patterns.

## Category Notes

- Performance: no significant issues found. Card is stateless, has no effects, and only creates a small inline style object per render (`src/components/Card/Card.tsx:71-78`).
- Accessibility: main concern is the missing native/ARIA prop forwarding. The base element being a `div` is acceptable for a presentational container if consumers can add semantics when needed.
- Logic bugs: no high-severity runtime logic bugs found. The untested fixed-height overflow branch is the main behavior risk.
- API clarity: root DOM prop support and the `StackGap`-named padding type are the clearest API issues.
- Missing tests/stories: present but thin; key prop behavior is not tested or demonstrated as described above.
