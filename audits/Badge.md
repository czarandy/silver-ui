# Badge Audit

## Summary

Badge is a compact status label, category marker, or count indicator. It supports three sizes (sm, md, lg), 14 color variants (semantic and decorative), an optional leading icon, and explicit ARIA labeling and role props.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **Color contrast may be insufficient for some variants.** The recipe maps colors like `yellow`, `orange`, and `cyan` to surface tokens with surface foreground tokens. Depending on the theme's actual color values, some combinations (especially light backgrounds with light foreground text) may not meet WCAG AA contrast requirements (4.5:1 for normal text). This should be verified against the actual theme tokens.
- **No `variant` prop for outline/subtle styles.** Many design systems offer badge variants like `solid`, `outline`, and `subtle`. Currently only a solid style is available. This limits visual hierarchy options when multiple badges appear together.

### Low

- **`role` prop is untyped beyond `string`.** The `role` prop accepts any string. Narrowing it to common ARIA roles (`'status' | 'alert' | 'log' | string`) with documentation would guide consumers toward accessible usage.
- **Icon size is coupled to badge size.** The `Icon` receives the same `size` prop as the badge (sm/md/lg). This means the icon size mapping is determined by the Icon component's recipe, not the Badge. If the Icon's size tokens don't match the Badge's visual expectations, the result could look wrong. This is currently fine but is an implicit coupling.
- **No story for numeric labels.** The `Count` story shows `label={42}`, but there is no story showing how very large numbers (e.g., 99+) look or whether truncation is needed.
- **Missing test for `icon` being null/undefined.** The code handles `icon != null` correctly, but there is no explicit test asserting that the icon slot is empty when `icon` is not provided.
- **No `aria-label` story.** While the test covers `aria-label` and `role`, there is no story demonstrating accessible badge usage patterns (e.g., a notification count badge with `role="status"` and `aria-label`).

## Recommendations

1. Audit color contrast ratios for all badge color variants against the theme tokens.
2. Consider adding `variant` support (solid, outline, subtle) for more visual flexibility.
3. Add a story demonstrating accessible badge usage with `role="status"` and `aria-label`.
4. Add a story for large numeric labels to verify visual handling.
