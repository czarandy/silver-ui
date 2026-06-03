# Rating Audit

## Summary

Rating is a star-based rating control that supports both read-only display (`role="img"`) and interactive selection (`role="radiogroup"`) modes. In interactive mode, each star is a visually hidden radio input wrapped in a label. The component supports hover preview, custom star count, custom colors, disabled state, and dev-mode validation of value/count invariants.

## Issues

### Critical

- None

### High

- **No way to set rating to 0 in interactive mode**: The radio buttons represent values 1 through `count`. Once a star is selected, there is no way to deselect it (set value back to 0) through the UI. This is a common usability issue with star rating components. Consider adding a "clear" mechanism, such as clicking the currently selected star to deselect, or an explicit clear button.

### Medium

- **No recipe file -- all styles inline**: Rating uses `css()` calls directly instead of a `.recipe.ts` file with `cva`. This is inconsistent with the project pattern.
- **Missing `aria-required` support**: Unlike other form components, Rating does not accept `isRequired` or provide `aria-required`. If used in a form where a rating is mandatory, there is no way to communicate this requirement to assistive technologies.
- **Missing `status` support**: Rating does not accept a `status` prop for validation feedback (error/warning/success). Other form components consistently support this through the `Field` wrapper, but Rating does not use `Field` at all.
- **`VisuallyHidden` text uses custom implementation**: Rating imports `VisuallyHidden` from `../../internal/VisuallyHidden` for the star labels. The star label text uses pluralization ("1 star" vs "2 stars") but does not use a proper i18n mechanism. This is fine for English but would need adaptation for localization.
- **Stories do not demonstrate controlled interactive mode**: The `Interactive` story sets `onChange: () => {}` as an arg default, meaning clicking stars does nothing visible. A proper controlled story with `useState` would better demonstrate the interaction.
- **Stories lack `Empty` (value=0) with controlled state**: The `Empty` story uses `onChange: () => {}` and does not track state, so selecting a star does not work.

### Low

- **No test for `className` applied to root in interactive mode**: The test at line 134 covers `className` on the read-only root, but the interactive mode also applies `className` via `cx()` -- this path is not tested.
- **Hover preview test accesses DOM directly**: The hover test (lines 117-131) uses `querySelectorAll('label')` with an eslint-disable comment. This is acceptable for hover testing but slightly fragile.
- **`StarIcon` helper is not memoized**: The `StarIcon` function component is defined at the module level (good for avoiding re-creation) but receives new props on every render, so its output is not memoized. For a small visual component this is negligible.
- **Dev-mode validation throws errors**: The component throws `Error` in dev mode for invalid `count` or `value`. While this is a good developer safeguard, it means any misconfiguration crashes the entire React tree. Consider using `console.error` instead, or wrapping in an error boundary pattern.

## Recommendations

1. Add a mechanism to reset the rating to 0 (e.g., clicking the current value toggles it off, or an explicit "Clear rating" button).
2. Add controlled interactive stories with `useState` to properly demonstrate the interaction.
3. Consider adding `isRequired` and `status` props to align with other form components, even if Rating does not use the `Field` wrapper.
4. Consider adding a `.recipe.ts` file with `cva` for style consistency.
5. The component has good accessibility in both modes: `role="img"` with a descriptive label for read-only, and `role="radiogroup"` with individual radio inputs and visually hidden labels for interactive mode. The hover preview feature is a nice UX touch.
