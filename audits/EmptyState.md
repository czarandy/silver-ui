# EmptyState Audit

## Summary

EmptyState is a simple presentational component that renders a centered placeholder for empty data or content areas. It supports a title, description, illustration, actions, configurable heading level, and a compact mode. The component has no recipe file (uses inline `css()` calls), which is a minor architectural inconsistency but acceptable given its simplicity.

## Issues

### Critical

- None

### High

- None

### Medium

- **`region` role without a meaningful accessible name.** The root element has `role="region"` but no `aria-label` or `aria-labelledby`. ARIA landmarks require accessible names to be useful to screen reader users. The heading inside the region provides some context, but the region itself is anonymous. Consider adding `aria-labelledby` pointing to the heading, or allow consumers to provide an `aria-label`.
- **`title` and `description` are restricted to `string` type.** Unlike Alert (which accepts `ReactNode` for both), EmptyState only accepts `string` for `title` and `description`. This prevents consumers from rendering rich content (e.g., inline links, formatted text, or translated JSX fragments). Consider changing to `ReactNode` for consistency with other components, or at minimum for `description`.

### Low

- **No recipe file.** Other components in the library (Alert, Spinner, Stepper) use `.recipe.ts` files with `cva()`. EmptyState uses raw `css()` calls. While this is fine for a component with no meaningful variants, the `isCompact` boolean is essentially a variant that would fit naturally in a recipe.
- **`actionsCompact` style is defined but may be redundant.** The compact actions style sets `flexDirection: 'column'`, but the actions are already wrapped in consumer-provided content (like `HStack`). The consumer's layout component may override this direction, making the compact action layout unreliable.
- **Stories for `MultipleActions` and `CompactWithActions` wrap actions in `HStack`.** This means the stories demonstrate `HStack` layout rather than the component's own `actions` container layout. The `actionsCompact` CSS (column direction) is not effectively demonstrated because `HStack` forces row direction.
- **No test for `style` prop forwarding.** While `className`, `data-testid`, and `ref` are tested, and `style` is tested in the `className/style/data-testid/ref` combined test, the coverage is adequate but the test name could be clearer.

## Recommendations

1. Add `aria-labelledby` to the root `region` element, pointing at the heading's generated ID, so screen readers can identify the landmark.
2. Consider accepting `ReactNode` for `description` (and optionally `title`) for richer content.
3. Reconsider the `actionsCompact` behavior -- either document that consumers should not wrap actions in layout components when using `isCompact`, or remove the directional override.
