# Progress Audit

## Summary

A progress bar that communicates determinate or indeterminate loading state. It renders a `container` with an optional `header` row (a `label` and an optional formatted `valueLabel`), a `track`, and a moving `fill` bar. It supports an accessible (optionally hidden) label, a `max`/`value` pair with custom formatting, five semantic color variants, disabled state, and an indeterminate animated mode. Uses `role="progressbar"` or `meter` with full ARIA value attributes.

## SVA Conversion

**Benefit: Moderate**

Progress already splits its styling between a `cva` recipe and a standalone styles object: `Progress.recipe.ts` holds `progressFillRecipe` (a `cva` for the moving fill, with `variant` (error/info/neutral/success/warning), `isDisabled`, and `isIndeterminate` variants), while `Progress.tsx` keeps a separate `styles` object with 6 `css()` blocks (`container`, `header`, `label`, `disabledText`, `valueLabel`, `track`). The `label`/`valueLabel` elements get their disabled color via per-element `cx()` ternaries (`isDisabled ? styles.disabledText`). This is exactly the OLD two-file pattern: a root-ish cva plus a parallel css() object with conditional branches. An `sva` with slots `container`/`header`/`label`/`valueLabel`/`track`/`fill` and `variant`/`isDisabled`/`isIndeterminate` variants would fold the standalone styles object and the `disabledText` ternaries into the same recipe that already drives the fill, consolidating all styling into one place. Benefit is moderate rather than strong because the fill is the only element with the rich variant set, the other slots are mostly static layout, and the `isDisabled` text branch is the lone conditional outside the existing recipe.
