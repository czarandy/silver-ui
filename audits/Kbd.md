# Kbd Audit

## Summary

`Kbd` displays keyboard shortcuts as styled key badges. It parses a `keys` string (splitting on `+`), maps each token to a platform-aware display glyph (mod -> Cmd/Ctrl, etc.) and an accessible label, then renders an outer `<kbd>` container wrapping one inner `<kbd>` badge per key. It supports `sm`/`md`/`lg` sizes and derives Mac-vs-other platform via `useSyncExternalStore`.

## SVA Conversion

**Benefit: Moderate**

`Kbd` renders two distinct styled element types: the outer `<kbd>` container and the inner per-key `<kbd>` badges. The badge is styled by a `cva` (`Kbd.recipe.ts`, `size` variant sm/md/lg), while the container is styled by a standalone `css()` object in `Kbd.tsx` with a base `root` block plus three size-specific gap blocks (`rootSm`/`rootMd`/`rootLg`) selected at runtime by a `size === 'sm' ? ... : ...` ternary. Both elements share the same `size` axis, so an `sva` with slots `root`/`key` and a single `size` variant would consolidate the container's gap logic and the badge recipe into one place and eliminate the manual `gapStyle` ternary. Benefit is moderate: it is a clean two-slot, one-variant consolidation but small in scope.
