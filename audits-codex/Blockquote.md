# Blockquote Audit

Audited files:

- `src/components/Blockquote/Blockquote.tsx`
- `src/components/Blockquote/Blockquote.test.tsx`
- `src/components/Blockquote/index.ts`
- `XDS_src/Blockquote/XDSBlockquote.tsx`
- `XDS_src/Blockquote/XDSBlockquote.test.tsx`
- `XDS_src/Blockquote/Blockquote.doc.mjs`

Verification:

- `pnpm vitest run src/components/Blockquote/Blockquote.test.tsx` passed: 7 tests.
- `pnpm vitest run XDS_src/Blockquote/XDSBlockquote.test.tsx` did not run because the current Vitest config includes only `src/**/*.test.{ts,tsx}`.

## Findings

### High: Primary Blockquote is not exported from the package entry point

`src/components/Blockquote/index.ts:1` exports the component locally, but `src/index.ts:1-695` has no `Blockquote` export. Consumers importing from the package root cannot access the primary component even though the component is implemented and tested. This is a public API/packaging bug if Blockquote is intended to be part of the shipped component set.

Recommendation: add `export {Blockquote, type BlockquoteProps} from './components/Blockquote';` to `src/index.ts` if this component is intended to be public.

### Medium: `cite` prop conflicts with native blockquote `cite` semantics

Both implementations define `cite?: ReactNode` as visible attribution (`src/components/Blockquote/Blockquote.tsx:5-12`, `XDS_src/Blockquote/XDSBlockquote.tsx:25-33`) and render it inside `<footer><cite>` (`src/components/Blockquote/Blockquote.tsx:47-50`, `XDS_src/Blockquote/XDSBlockquote.tsx:109-112`). In HTML, the native `<blockquote cite="...">` attribute is a URL for the source document. This API name makes it easy to pass a URL expecting native semantics, but the URL would render as visible text instead.

The primary component also has no rest-prop path, so consumers cannot set the native `cite` attribute at all (`src/components/Blockquote/Blockquote.tsx:32-45`). XDS spreads additional props, but `cite` is destructured for visible attribution before the spread (`XDS_src/Blockquote/XDSBlockquote.tsx:89-107`), so native `cite` is still unavailable there.

Recommendation: rename the visible attribution prop to `attribution`/`source`, or add an explicit `citeUrl?: string` prop that maps to the native blockquote `cite` attribute.

### Medium: Primary component blocks standard HTML and ARIA props

`BlockquoteProps` is a closed interface with only `children`, `cite`, `className`, `data-testid`, `ref`, and `style` (`src/components/Blockquote/Blockquote.tsx:5-12`), and the root render does not spread additional props (`src/components/Blockquote/Blockquote.tsx:41-45`). Consumers cannot pass `id`, `aria-label`, `aria-describedby`, `role`, `dir`, `lang`, or other standard attributes that are sometimes needed for quoted content.

The XDS implementation does support most additional props through `XDSBaseProps` and `...props` (`XDS_src/Blockquote/XDSBlockquote.tsx:25`, `XDS_src/Blockquote/XDSBlockquote.tsx:96-107`), and tests verify `aria-label` passthrough (`XDS_src/Blockquote/XDSBlockquote.test.tsx:72-80`). The primary component lacks equivalent API and coverage.

Recommendation: extend from an appropriate constrained native blockquote prop type, or explicitly add the standard accessibility attributes the design system supports.

### Medium: No Storybook stories for Blockquote

No `src/components/Blockquote/Blockquote.stories.tsx` file exists. The XDS implementation header also lists `/apps/storybook/stories/Blockquote.stories.tsx` as a sync target (`XDS_src/Blockquote/XDSBlockquote.tsx:11-15`), but no Blockquote story was found in this repo. Important behavior is therefore not visually documented: default quote content, attribution via `cite`, ReactNode attribution, rich children, styling overrides, and any native/ARIA passthrough decision.

Recommendation: add stories for default usage, string attribution, ReactNode attribution, rich children, and supported customization props.

### Low: Primary tests do not assert the citation structure

The primary tests only check text content when `cite` is present (`src/components/Blockquote/Blockquote.test.tsx:18-25`) and check absence with `not.toHaveTextContent('—')` (`src/components/Blockquote/Blockquote.test.tsx:13-16`). They do not assert that the component renders `<footer><cite>...</cite></footer>` or omits those elements by default, even though that is the semantic behavior in the implementation (`src/components/Blockquote/Blockquote.tsx:47-50`). The XDS tests do cover this structure (`XDS_src/Blockquote/XDSBlockquote.test.tsx:31-49`).

Recommendation: align the primary tests with the XDS tests by asserting presence/absence of `footer` and `cite`.

### Low: Styling override behavior is only partially covered

The primary tests cover `className`, `style`, and `data-testid` passthrough (`src/components/Blockquote/Blockquote.test.tsx:45-54`). XDS docs describe `xstyle` as a key customization prop (`XDS_src/Blockquote/Blockquote.doc.mjs:23-28`), but the XDS tests do not cover `xstyle`, `className`, or `style` merging (`XDS_src/Blockquote/XDSBlockquote.test.tsx:16-90`). If XDS remains active, this leaves the documented customization path unguarded.

Recommendation: add XDS tests for `xstyle`, `className`, and `style` merging, or remove unsupported customization claims from docs.

## Category Notes

- Performance: no significant performance issues found. Styles are created at module scope in both implementations (`src/components/Blockquote/Blockquote.tsx:14-30`, `XDS_src/Blockquote/XDSBlockquote.tsx:57-76`), and render work is minimal.
- Accessibility: main concerns are the native `cite` conflict and the primary component's lack of standard HTML/ARIA prop passthrough.
- Logic bugs: no rendering logic bugs found in the core quote/citation output.
- API clarity: `cite` is overloaded, and the primary component is implemented but missing from the root export.
- Missing tests: primary citation structure tests and XDS customization tests are missing.
- Missing stories/docs: XDS has docs (`XDS_src/Blockquote/Blockquote.doc.mjs`), but primary docs are absent and no Blockquote stories were found.
