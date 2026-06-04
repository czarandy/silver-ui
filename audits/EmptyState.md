# EmptyState Audit

## Summary

`EmptyState` renders a centered placeholder for empty data or content areas. It outputs a root `div` (`role="region"`, labelled by the heading) containing an optional decorative illustration wrapper, a text column holding a `Heading` (`title`) and an optional secondary `Text` (`description`), and an optional actions row. Spacing tightens via an `isCompact` flag.

## SVA Conversion

**Benefit: Moderate**

`EmptyState` renders four styled DOM elements: the root container, the illustration wrapper, the text column, and the actions row. Styling is currently split — the root uses a `cva` (`EmptyState.recipe.ts`, single `isCompact` variant), while the other three elements come from a 3-block standalone `css()` object in `EmptyState.tsx` (`illustration`, `text`, `actions`) applied as plain class names with no variants. The only variant in play is `isCompact`, which today adjusts only the root's `gap`/padding; an `sva` with slots `root`/`illustration`/`text`/`actions` and an `isCompact` variant would consolidate the two-file split into one recipe and make it trivial to extend compact spacing to the inner slots. Benefit is moderate because the inner blocks are static and there is only one variant, so the consolidation is real but modest.
