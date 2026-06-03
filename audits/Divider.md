# Divider Audit

## Summary

Divider is a visual separator component for grouping content. It supports horizontal and vertical orientations, subtle and strong visual variants, optional labels, full-bleed mode that escapes container padding, and proper ARIA `role="separator"` semantics. The component uses `aria-orientation`, `aria-label`, and `aria-labelledby` correctly.

## Issues

### Critical

- None identified.

### High

- None identified.

### Medium

- **`useId` is called unconditionally but `labelId` is only used when `label` is provided**: The `useId()` hook on line 100 generates a unique ID on every render, but the `labelId` is only used in the DOM when `label != null && ariaLabel == null`. While `useId` is cheap, it is unnecessary overhead when no label is present. This is a very minor performance concern.
- **`isFullBleed` relies on a `--card-padding` CSS custom property**: The full-bleed styles use `calc(-1 * var(--card-padding, 0px))` to escape container padding. This creates an implicit coupling to the Card component. If used outside a Card (or inside a container that does not set `--card-padding`), the full-bleed effect will be a no-op (margin: 0, width: 100%) which is correct but potentially confusing. This coupling is not documented in the JSDoc for `isFullBleed`.
- **No test for vertical full-bleed**: The test for `isFullBleed` only checks that the class changes between with/without full-bleed on a horizontal divider. There is no test for the vertical full-bleed class (`styles.fullBleedVertical`). The story exists but the behavior is untested.

### Low

- **`variant: 'strong'` recipe variant is empty**: In the recipe file, the `strong` variant is `{}` (an empty object). The actual strong styling is applied via `cx(styles.line, variant === 'strong' && styles.lineStrong)` in the component. This means the recipe variant serves no styling purpose and exists only for type-level discrimination. This is a pattern inconsistency — the variant styling should ideally live in the recipe.
- **Stories use inline styles instead of Panda CSS**: Several stories use `style={{}}` directly (e.g., `style={{marginBlock: '1rem'}}` in FullBleed). This is a stylistic inconsistency with the rest of the library.
- **No story demonstrating `aria-label` usage**: While `aria-label` is tested, there is no story showing the accessibility-focused use case of providing semantic meaning to a divider.

## Recommendations

1. Document the `--card-padding` dependency in the `isFullBleed` JSDoc comment.
2. Add a test for vertical full-bleed behavior.
3. Consider moving the `strong` variant styling into the recipe for consistency.
4. Add a story demonstrating `aria-label` for accessible section separators.
