# Layout Audit

## Summary

Layout is a shell component with header, footer, start panel, end panel, and content slots. It is a multi-file component with five sub-components: `Layout` (root), `LayoutContent`, `LayoutHeader`, `LayoutFooter`, and `LayoutPanel`. It uses three React contexts (`LayoutAreaContext`, `LayoutSlotsContext`, `LayoutDividerContext`) for intra-component communication. LayoutHeader integrates with `DialogContext` to auto-render a close button when used inside a Dialog. This is the most architecturally significant layout component, serving as the backbone for AppShell.

## Issues

### Critical

- None identified.

### High

- **LayoutHeader imports from Dialog module creates a circular dependency risk**: `LayoutHeader.tsx` imports `useDialogContext` from `'../Dialog/DialogContext'`. This means Layout depends on Dialog, and if Dialog ever depends on Layout (which is likely for dialog body layouts), a circular import would occur. This coupling should be inverted — the Dialog should inject the close button via a slot or context, rather than LayoutHeader reaching into Dialog internals.

### Medium

- **`LayoutContent` renders hidden content when `isScrollable={false}` with `overflow: 'clip'`**: The base style sets `overflow: 'clip'` and `isScrollable` overrides it to `overflow: 'auto'`. When `isScrollable={false}`, content that overflows the container is clipped without any scrollbar. This could silently hide content. A `overflow: 'visible'` option or a more explicit naming like `isClipped` would better communicate the behavior.
- **LayoutPanel `width` prop only supports fixed values**: The `width` prop is applied as an inline style, which means it only supports fixed values (numbers → px, strings). There is no support for min/max width constraints, percentage-based responsive widths, or resizable panels. This limits Layout's flexibility for responsive designs.
- **No test for LayoutHeader's Dialog integration**: The auto-close-button behavior when LayoutHeader is inside a Dialog is not tested in the Layout test file. This is a significant feature that has no test coverage here (it may be tested in Dialog's tests, but the behavior is defined in LayoutHeader).
- **`LayoutContent` `as` prop type safety concern**: The `as` prop is typed as `ElementType`, which allows any element type. However, `ComponentPropsWithRef<'div'>` is always used as the base props regardless of the `as` value. If `as="main"` is passed (which AppShell does), the prop types won't include main-specific attributes. This is a common limitation of polymorphic component patterns.
- **Missing stories for LayoutHeader features**: No story demonstrates `subtitle`, `startContent`, `endContent`, or `height` props on LayoutHeader individually. The AllSlots story shows them together but individual prop stories would improve documentation.
- **LayoutFooter requires `primaryButton` prop**: The `primaryButton` prop is required in the TypeScript interface. A footer with only `startContent` (e.g., status text) and no buttons is not possible without passing `primaryButton={null}` or an empty fragment, which is inelegant.

### Low

- **`LayoutSlotsContext` is exported but potentially unused by external consumers**: The `LayoutSlotsContext` tracks which slots are present, but it is unclear if any external consumer reads this context. If it is only used internally, it should not be exported from the index.
- **`AreaProvider` is a local component but could be a standalone utility**: The `AreaProvider` component (Layout.tsx line 77) is defined inline. This is fine for its simple logic but if other components need area-aware rendering, it should be extracted.
- **Empty `rootStyle` spread**: In `Layout.tsx` line 115, `rootStyle` is `{...style}`, which is an unnecessary shallow copy when no additional properties are added. It could pass `style` directly.
- **No story for `label` prop on LayoutContent and LayoutPanel**: The `label` prop automatically sets `role="region"` and `aria-label`. This accessibility feature is tested but not demonstrated in stories.

## Recommendations

1. Decouple LayoutHeader from Dialog by having Dialog inject the close button via a prop or context rather than LayoutHeader importing DialogContext.
2. Add tests for LayoutHeader's Dialog-close-button integration.
3. Add individual stories for LayoutHeader props (subtitle, startContent, endContent, height).
4. Consider making `primaryButton` optional on LayoutFooter.
5. Add stories demonstrating the `label`/`role="region"` accessibility feature on LayoutContent and LayoutPanel.
6. Consider adding `minWidth`/`maxWidth` support to LayoutPanel.

## SVA Conversion

**Benefit: Moderate**

The Layout family spans six files and renders many styled elements, but styling is already split across three `cva` recipes (`layoutRecipe`, `layoutMiddleRecipe`, `layoutRegionRecipe` in `Layout.recipe.ts`) plus a small standalone `css()` object in each sub-component: `Layout.tsx` (`contentFill`), `LayoutPanel.tsx` (4 blocks: `root`/`scrollable`/`dividerEnd`/`dividerStart`, selected via `area`+`hasDivider` ternaries from context), `LayoutContent.tsx` (`root`/`scrollable`), `LayoutHeader.tsx` (7 blocks: `root`/`divider`/`inner`/`titleArea`/`actions`/`closeButton`), and `LayoutFooter.tsx` (6 blocks: `root`/`divider`/`inner`/`customInner`/`start`/`actions`). Within a single sub-component like LayoutHeader or LayoutFooter, an `sva` (slots `root`/`inner`/`titleArea`/`actions`, with a `hasDivider` variant) would consolidate the per-element css and the `hasDivider`/`isCustom` ternaries. However, each piece is a separate composition component sharing the `padding` recipe and context-driven divider logic, so the benefit is per-file and modest rather than one unifying recipe; the root `Layout` itself is mostly a context/slot orchestrator.
