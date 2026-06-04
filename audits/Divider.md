# Divider Audit

## Summary

A visual separator for grouping content. It renders a `role="separator"` root `<div>` containing one or two thin line `<div>`s and, when a `label` is provided, a label `<div>` between two lines. It supports horizontal/vertical orientation, subtle/strong visual weight, an optional accessible label, and a full-bleed mode that escapes container padding.

## SVA Conversion

**Benefit: N/A — already migrated (reference implementation)**

Divider is the canonical slot-recipe example for the rest of the library: `Divider.recipe.ts` is an `sva` with `slots: ['root', 'line', 'label']`, `orientation` (horizontal/vertical) and `variant` (subtle/strong) variants, an `isFullBleed` marker variant, and two `compoundVariants` that apply orientation-dependent full-bleed styling. `Divider.tsx` simply calls `dividerRecipe({orientation, variant, isFullBleed})` and maps `classes.root`, `classes.line`, and `classes.label` onto the markup, with no standalone `css()` styles object and no per-element `cx()` ternaries. This is the target pattern other multi-element components should be converted to.
