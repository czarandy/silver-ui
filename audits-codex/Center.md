# Center Component Audit

Audited:

- `src/components/Center/Center.tsx`
- `src/components/Center/Center.recipe.ts`
- `src/components/Center/Center.stories.tsx`
- `src/components/Center/Center.test.tsx`
- `src/components/Center/index.ts`
- `XDS_src/Center/Center.doc.mjs` and `XDS_src/Center/XDSCenter.tsx` as related docs/source context

Verification:

- `pnpm vitest run src/components/Center/Center.test.tsx` passes: 3 tests.

## Findings

### Medium: Root HTML and ARIA props cannot be passed through

`CenterProps` is a narrow allowlist with only `className`, `data-testid`, `style`, `ref`, sizing, axis, inline, and children (`src/components/Center/Center.tsx:8`). The render path destructures only those props and does not spread a rest object onto the root div (`src/components/Center/Center.tsx:24`, `src/components/Center/Center.tsx:36`). Consumers therefore cannot set common root attributes such as `id`, `role`, `aria-label`, `aria-labelledby`, `aria-live`, `tabIndex`, or event handlers.

This is both an accessibility and API concern for a layout primitive commonly used around empty states, loading states, or centered page content. The related XDS implementation accepts base div props and spreads them through (`XDS_src/Center/XDSCenter.tsx:112`, `XDS_src/Center/XDSCenter.tsx:130`), so the Silver implementation is also less capable than its source context.

### Medium: Axis behavior is not meaningfully tested

The default-axis test only checks rendered text (`src/components/Center/Center.test.tsx:6`), and there are no tests for `axis="horizontal"` or `axis="vertical"`. The actual behavior lives in the recipe (`src/components/Center/Center.recipe.ts:8`), where each axis maps to different `alignItems` and `justifyContent` classes. A regression that removed default centering, swapped horizontal/vertical behavior, or made all variants identical could pass the current test suite.

Add tests that assert the expected classes or computed styles for default, horizontal, and vertical axes, plus the absence of the opposite-axis class where possible.

### Low: Stories do not demonstrate important props

Storybook has only `Basic` (`src/components/Center/Center.stories.tsx:24`). Controls expose `axis`, `width`, and `height` (`src/components/Center/Center.stories.tsx:8`), but there are no dedicated visual examples for:

- `axis="horizontal"` and `axis="vertical"`
- `isInline`
- numeric vs CSS string `width`/`height`
- unconstrained parent sizing vs explicit height for vertical centering

This makes the common gotcha documented in the XDS docs, "Set a height when centering vertically", hard to discover visually (`XDS_src/Center/Center.doc.mjs:55`).

### Low: Available docs do not match the shipped Silver component

There is no `src/components/Center/*.doc.mjs` file. The only Center doc found is under `XDS_src/Center/Center.doc.mjs`, and it documents `xstyle` (`XDS_src/Center/Center.doc.mjs:39`) even though `src/components/Center/Center.tsx` has no `xstyle` prop (`src/components/Center/Center.tsx:8`). It also omits supported Silver props like `className`, `style`, `data-testid`, and `ref`.

If `XDS_src` docs are not used for Silver, this is simply missing docs. If they are used as migration/source docs, they are stale for the current implementation.

### Low: Size behavior has partial test coverage only

The test suite verifies numeric `width` and `height` are converted to pixel strings (`src/components/Center/Center.test.tsx:22`), but not CSS string values even though `SizeValue` allows strings via the Stack type alias (`src/components/Stack/Stack.tsx:23`) and `toSize` returns strings unchanged (`src/components/Center/Center.tsx:20`). A small test with values like `width="100%"` and `height="50vh"` would lock the documented API.

## Categories With No Issues Found

- Performance: no performance problems found. The component is a small stateless wrapper; class generation is recipe-based and sizing work is constant-time.
- Logic bugs: no confirmed runtime logic bug found in the current implementation.
- Export surface: `Center`, prop/types, and recipe exports are present in the component index and package root (`src/components/Center/index.ts:1`, `src/index.ts:296`).
