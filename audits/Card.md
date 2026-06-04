# Card Audit

## Summary

Card is a rounded container surface for grouping related content. It supports 13 visual variants (default, transparent, muted, plus 10 decorative colors) and 11 padding steps. It extends `ComponentPropsWithRef<'div'>` to forward all native HTML div attributes.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **`data-testid` is extracted but also potentially passed via `...htmlProps`.** The component destructures `'data-testid': dataTestId` and passes it explicitly, but since `CardProps extends ComponentPropsWithRef<'div'>`, `data-testid` could also arrive via `...htmlProps`. The explicit prop takes precedence because it appears after `{...htmlProps}` in the JSX, so this works correctly, but it is redundant extraction. If a consumer passes `data-testid` without the explicit prop syntax, it would still work via `htmlProps`.
- **No interactive card variant.** Cards commonly need to be clickable (e.g., card as link, card as button). Currently, Card is always a `<div>`, and consumers must add their own click handling and keyboard accessibility. An `as` prop or `onClick` prop with automatic `role="button"` and `tabIndex` would make interactive cards easier to build correctly.

### Low

- **No shadow or elevation variant.** Many card designs use box shadows for depth. The recipe only uses background color and border. A `shadow` or `elevation` variant could be useful.
- **`padding` type is `SpacingStep` which is imported from Layout.** This creates a dependency between Card and the Layout module. If `SpacingStep` is a widely used type, consider moving it to a shared types module.
- **Limited story coverage.** There are only three stories: Basic, Variants, and WithLayout. Missing stories for: padding variations, nested cards, card with custom content (images, actions), and responsive behavior.
- **Tests check for specific CSS class names (`silver-bg_bg`, `silver-p_0`).** These tests are tightly coupled to the CSS compilation output. If the CSS framework's class naming convention changes, these tests will break even though the component is functionally correct. Consider testing behavior/visual properties instead.

## Recommendations

1. Consider adding an interactive card variant with proper keyboard accessibility.
2. Add more stories covering padding variations and complex content compositions.
3. Consider whether test assertions on CSS class names are sufficiently stable, or if behavioral assertions would be more resilient.

## SVA Conversion

**Benefit: Low / None**

Card renders a single styled `<div>` and applies one class via `cx(cardRecipe({variant, padding}), className)`. Its styling already lives entirely in a `cva` root recipe (`Card.recipe.ts`) with `variant` (13 color/surface options) and `padding` variants — exactly the case `cva` is designed for. There is no second styled element, no standalone `css()` styles object, and no per-element `cx()` branching, so an `sva` slot recipe would add structure without consolidating anything.
