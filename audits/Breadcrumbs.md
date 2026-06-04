# Breadcrumbs Audit

## Summary

Breadcrumbs provides a navigation landmark (`<nav>`) wrapping an ordered list of BreadcrumbItem children. Items render as links, buttons, or static text depending on props. Context distributes separator and variant settings. The component integrates with `LinkProvider` for custom routing links.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **No recipe file for styling variants**: Unlike most other navigation components, Breadcrumbs does not use a Panda CSS recipe (`cva`). All styles are hardcoded `css()` calls. This makes it harder to override or extend variants externally and is inconsistent with the rest of the library.
- **No truncation / overflow handling for long trails**: The `LongTrail` story shows 7 items, but there is no built-in ellipsis collapse (e.g., showing first, last, and a "..." dropdown for middle items). Very long breadcrumb trails will overflow horizontally with only `flexWrap: 'wrap'` as a mitigation.

### Low

- **Separator shown on first item via CSS variable hack**: The separator visibility for the first item is controlled by a CSS custom property (`--breadcrumb-separator-display`) set to `'none'` via `_first`. While functional, this is fragile; if someone wraps items in additional elements, the `:first-child` selector may not target the correct item.
- **Static text items without `href` or `onClick` share the same style as `isCurrent`**: A `BreadcrumbItem` with no `href`, no `onClick`, and `isCurrent={false}` renders as a `<span>` with current-page styling (via `styles.current`). This could be confusing since the item is not actually current, just non-interactive.
- **Missing `aria-description` JSDoc in `BreadcrumbsContext`**: The context value interface lacks JSDoc comments, though this is minor since it is an internal type.
- **No story for `data-testid` or `ref` forwarding**: While tested, there is no visual story demonstrating test-id or ref usage for documentation purposes.

## Recommendations

- Consider adding a recipe file (`Breadcrumbs.recipe.ts`) for consistency with other components in the library.
- Add an optional `maxItems` or collapse behavior for long trails, similar to MUI or Chakra breadcrumbs.
- Differentiate the styling of non-interactive, non-current items from current items.
- The test coverage is thorough: it covers landmarks, links, buttons, current items, separators, custom separators, custom link components, className/style/ref forwarding, icons, variants, and edge cases. No significant test gaps.
- Story coverage is good, covering default, custom separator, supporting variant, icons, button items, and long trails.

## SVA Conversion

**Benefit: Strong**

The styling lives in `BreadcrumbItem.tsx`, which renders multiple distinct styled elements (list `<li>` item, separator `<span>`, content `<span>`, link/button, icon `<span>`) via a standalone `const styles` object of ~8 css() blocks, with several per-element `cx()` ternaries keyed on the `supporting` variant and current state (`isSupporting ? styles.supportingSize : styles.defaultSize`, `isSupporting ? styles.supportingCurrent : styles.current`). The `variant` (default/supporting) comes from `BreadcrumbsContext`, and `Breadcrumbs.tsx` itself only has nav/list css() blocks. An `sva` recipe with slots item/separator/content/link/icon plus `variant` (default|supporting) and `isCurrent` variants would fold the repeated supporting/current `cx()` conditionals into recipe variants/compoundVariants.
