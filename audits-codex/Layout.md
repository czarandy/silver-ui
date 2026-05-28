# Layout Audit

Audited the exported `src/components/Layout` implementation, its Storybook story, tests, and the separate top-level `Layout/` docs/tests that appear to describe an XDS variant rather than the exported `src` component.

## Findings

### High: `hasDefaultDividers` does not affect panels

`LayoutProps.hasDefaultDividers` is documented as applying default dividers to "child layout regions" (`src/components/Layout/Layout.tsx:42`), but only `LayoutHeader` consumes `LayoutDividerContext` (`src/components/Layout/LayoutHeader.tsx:71`). `LayoutPanel` defaults `hasDivider = false` and ignores the context (`src/components/Layout/LayoutPanel.tsx:65`), so `start`/`end` panels do not get dividers when the layout-level default is enabled. This makes the prop behavior incomplete and surprising.

Coverage gap: `src/components/Layout/Layout.test.tsx` only checks slot rendering and root pass-through props (`src/components/Layout/Layout.test.tsx:9`, `src/components/Layout/Layout.test.tsx:27`); it does not assert divider defaults for headers or panels.

### High: Footer API is incomplete and encourages wrong divider placement

`Layout` exposes a `footer` slot (`src/components/Layout/Layout.tsx:41`) but `src/components/Layout/index.ts` exports no `LayoutFooter` primitive (`src/components/Layout/index.ts:1`). The existing test uses `LayoutHeader` as the footer (`src/components/Layout/Layout.test.tsx:14`), and `LayoutHeader` always renders its divider on the block-end edge (`src/components/Layout/LayoutHeader.tsx:30`), which is the wrong edge for a footer. The top-level XDS docs/tests include `XDSLayoutFooter` (`Layout/Layout.doc.mjs:129`, `Layout/index.ts:70`), but the exported `src` API does not.

Impact: consumers have no first-class way to render a footer with correct top-edge divider semantics, and current tests normalize using the header component in the footer slot.

### Medium: `contentWidth` only constrains the middle row, not header/footer

`Layout` sets `--layout-content-width` on the root (`src/components/Layout/Layout.tsx:153`) and applies the max-width class only to the middle row (`src/components/Layout/Layout.tsx:173`). `LayoutHeader` does not read `--layout-content-width` for its inner wrapper (`src/components/Layout/LayoutHeader.tsx:35`), so header/footer slot content remains full width while content/start/end are centered. The prop description is broad, "Maximum content width in pixels" (`src/components/Layout/Layout.tsx:27`), and the top-level docs describe content width across header/content/footer (`Layout/__tests__/contentWidth.test.tsx:50`, `Layout/__tests__/contentWidth.test.tsx:90`).

Coverage gap: no `src/components/Layout` test or story demonstrates `contentWidth`.

### Medium: Important props and subcomponents are not covered by stories

`src/components/Layout/Layout.stories.tsx` has a single `Basic` story using `height`, `padding`, `header`, `start`, and `content` (`src/components/Layout/Layout.stories.tsx:19`). Missing story coverage includes `contentWidth`, `end`, `footer`, `hasDefaultDividers`, `height="auto"`, region `role`/`label`, `isScrollable={false}`, custom `padding`, and panel `width`. This makes visual review of core layout behavior difficult.

### Medium: Important behavior is not tested

The current test file has two tests total (`src/components/Layout/Layout.test.tsx:8`). Missing assertions include `height` variants, root `padding`, `contentWidth`, `hasDefaultDividers`, explicit `hasDivider`, start/end divider edge selection, `LayoutContent` and `LayoutPanel` scrollability, region `padding`, `width`, `role`/`label`, and footer-specific behavior.

### Low: Accessibility API is narrow

`LayoutHeader`, `LayoutContent`, and `LayoutPanel` support `role` plus `label` (`src/components/Layout/LayoutHeader.tsx:19`, `src/components/Layout/LayoutContent.tsx:12`, `src/components/Layout/LayoutPanel.tsx:13`), but they do not accept general div/ARIA props such as `aria-labelledby`, `aria-describedby`, or `tabIndex`. `LayoutContent` exposes `id` (`src/components/Layout/LayoutContent.tsx:10`), but header and panel do not. This limits accessible landmark labeling patterns to string `aria-label` only.

### No significant performance issue found

The component does not do heavy work. `useMemo` is used for context values (`src/components/Layout/Layout.tsx:137`, `src/components/Layout/Layout.tsx:146`), and the remaining per-render object creation is small.

## Verification

Ran `pnpm vitest run src/components/Layout/Layout.test.tsx`: 1 file passed, 2 tests passed.
