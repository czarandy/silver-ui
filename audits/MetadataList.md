# MetadataList Audit

## Summary

MetadataList displays label-value metadata pairs using semantic `<dl>`, `<dt>`, and `<dd>` elements in either an inline (side-by-side) or stacked (top) layout. It uses a context provider to communicate `labelPosition` to child `MetadataListItem` components. The component is clean, accessible, and well-tested.

## Issues

### Critical

- None

### High

- None

### Medium

- **`MetadataListItem` throws in dev but silently falls back in production:** When rendered outside a `MetadataList`, the component throws an error in development (`process.env.NODE_ENV !== 'production'`) but in production it silently continues with `context == null`. This means in production, the `isStacked` check defaults to `false` and renders inline layout. This could lead to subtle rendering bugs in production that are not caught during development. Consider either always throwing (which would make production errors more visible) or providing a more explicit fallback behavior.
- **`display: contents` on inline wrapper breaks some CSS features:** The inline layout wraps `<dt>` and `<dd>` in a `<div>` with `display: contents`. While this is necessary for the CSS Grid layout, `display: contents` can cause accessibility issues in some browsers where the wrapper element is removed from the accessibility tree. In this case the wrapper div has no semantic role so this is acceptable, but it prevents applying `className` and `style` to a visible element in inline mode.

### Low

- **No story demonstrating icons in inline (start) layout:** The `Default` story shows icons with `labelPosition="start"` (the default), but the `LabelsOnTopWithIcons` story only shows icons in the stacked layout. The Default story does demonstrate icons inline, so this is not a gap per se, but could be more explicit.
- **Missing `role` attribute on `<dl>` element:** While `<dl>` has an implicit ARIA role of `association list` in some specs, adding an explicit role or ensuring consistent screen reader behavior could improve accessibility for less common assistive technologies.
- **No test for icon rendering in stacked layout:** The test for icon rendering only checks the inline (default) layout. A test for icon rendering in the stacked layout would be more thorough.

## Recommendations

- Consider whether the dev-only throw vs. production silent behavior in `MetadataListItem` is the right trade-off. A warning in production might be preferable to silent fallback.
- Add a test verifying icon rendering in the stacked (`labelPosition="top"`) layout.
- Test and story coverage is solid overall, with good coverage of both layouts, title association, forward props, and the dev-only error boundary.

## SVA Conversion

**Benefit: Moderate**

MetadataList renders a `root` wrapper, an optional `title` Heading, and a `dl` grid (`MetadataList.tsx`, 5 `css()` blocks), while each `MetadataListItem` renders a wrapper plus a `dt` `label` and `dd` `value` (`MetadataListItem.tsx`, 4 `css()` blocks). The single styling axis is `labelPosition` (start/top), currently applied via per-element `cx()` ternaries: the parent picks `grid` vs `gridStacked` for the `dl`, and the item picks `inline` (display:contents) vs `stacked` for its wrapper. An `sva` with slots `root`/`title`/`dl`/`item`/`label`/`value` and a `labelPosition` variant would consolidate that orientation logic into one recipe and remove the two parallel standalone styles objects. Benefit is moderate because there are only two layout states and the styling is split across the container and item files (coupled via `MetadataListContext`), so a single recipe cannot fully co-locate everything.
