# Link Audit

## Summary

Link is a polymorphic anchor component with built-in accessibility for external links (icon, `rel`, `target="_blank"` handling), disabled state management, tooltip support, and router integration via `LinkProvider`. It uses a `cva` recipe for styling variants (color, size, weight, underline).

## Issues

### Critical

- None.

### High

- **Disabled links remain in the accessibility tree as links**: When `isDisabled` is true, the component renders `aria-disabled="true"` and `tabIndex={-1}`, but the element is still an `<a>` tag with an `href`. Screen readers will still announce it as a link. The WAI-ARIA recommendation for truly disabled links is to either remove the `href` entirely or switch to a `<span>` with `role="link"`. The current approach may confuse assistive technology users who expect to be able to activate the link.

### Medium

- **`href="#"` fallback may cause unexpected scroll-to-top**: When `href` is omitted, the component falls back to `href="#"`. While `event.preventDefault()` is called in the click handler, this relies on the React event system. If JavaScript fails to load or a consumer wraps the component in a way that bypasses the handler, the user would navigate to `#`. Consider using `role="button"` or `href="javascript:void(0)"` (though both have trade-offs), or simply omitting `href` when not provided.
- **`weight` prop defaults to `'inherit'` in the recipe but JSDoc says "Default is inherited from parent styles"**: The `linkRecipe` does not set a `defaultVariants.weight`, so the weight variant is undefined by default, which means the `fontWeight: 'inherit'` from the base style applies. This is correct behavior but the JSDoc is slightly misleading since `'inherit'` is also an explicit variant option.
- **Color variant `'disabled'` is confusing alongside the `isDisabled` prop**: The `color` prop has a `'disabled'` variant that only changes the visual color but does not actually disable the link. The test `'keeps color disabled links interactive'` validates this. This dual meaning could confuse consumers.

### Low

- **`aria-description` is in the destructured props but not in `LinkComponentProps`**: The `Link` component accepts `aria-description` but the `LinkComponentProps` type (used for custom link components) does not include it, so custom components won't receive it through type checking. Same issue with `aria-roledescription` and `aria-keyshortcuts`.
- **No story for the `label` prop on non-external links**: The `IconOnly` story uses `label` with an emoji child, but there is no story showing how `label` works for standard (non-external) links for accessibility purposes.
- **Tooltip on disabled links may not be keyboard-accessible**: Since `tabIndex={-1}` removes the link from the tab order, keyboard users cannot reach the disabled link and thus cannot trigger the tooltip. Consider whether `Tooltip` should use a wrapper that can receive focus.
- **External link icon is always `ExternalLink` from lucide-react with no customization**: There is no prop to override the external link icon.

## Recommendations

- Reconsider the disabled link implementation. Either render a `<span role="link">` when disabled, or remove the `href` attribute to truly prevent navigation at the HTML level.
- Align `LinkComponentProps` with all ARIA attributes accepted by `Link` to prevent type mismatches with custom link components.
- The test suite is comprehensive (33 tests) covering all major behaviors: href, fallback href, disabled state, external links, tooltips, custom components, LinkProvider, ARIA attributes, className/style, refs, and keyboard interaction.
- Stories are thorough with 22 stories covering all color variants, weights, sizes, underline, external links, disabled states, tooltips, custom components, and inline usage.
