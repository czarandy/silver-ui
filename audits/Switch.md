# Switch Audit

## Summary

A controlled toggle switch implemented as a styled checkbox with `role="switch"`. Supports label positioning (start/end), spread layout, label icons, tooltips, description text, loading state, validation status (error/warning/success), and necessity indicators (required/optional). Uses its own inline Field layout rather than the shared `Field` wrapper.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **Loading state does not prevent interaction.** When `isLoading` is true but `isDisabled` is false, the switch remains fully interactive. This is tested and intentional (there is an explicit test for it), but it is a design concern: users may toggle a switch while an async operation from the previous toggle is still in flight, potentially causing race conditions. Consider whether `isLoading` should implicitly disable the input, or document this behavior prominently.
- **No `aria-live` region for loading status.** The loading spinner's `role="status"` text ("Loading") inside `VisuallyHidden` will be announced, but it lacks `aria-live="polite"` on the container. Browsers typically treat `role="status"` as implying `aria-live="polite"`, so this likely works, but being explicit would be safer across assistive technologies.
- **Label click area does not include description text.** The `<label>` element wraps only the label text, icon, requiredness, and tooltip. The description is a sibling `<Text>` below the label. Clicking the description does not toggle the switch. This is a minor UX inconsistency since users might expect the entire label block to be clickable.

### Low

- **No recipe file.** Styles are defined inline with `css()`. This is consistent within the component but differs from other components that use `.recipe.ts` files.
- **Redundant track style with CSS selector and direct class.** The track has both a `data-switch-track` attribute checked by a parent CSS selector (`'& [data-switch-track][data-selected="true"]': { bg: 'primary' }`) and a direct `styles.trackOn` class applied when `isSelected`. Both set `bg: 'primary'`, making the CSS selector redundant with the class. The CSS selector approach is used for the `:active` state, but the `data-selected` one is duplicated.
- **`spread` layout test is fragile.** The test for spread layout (line 130) traverses DOM via `parentElement?.parentElement?.parentElement` to find the field container. This is brittle and will break if the DOM structure changes. Consider using `data-testid` on the field root or a more robust query.
- **No test for `className` or `style` passthrough.** The `className` and `style` props are applied to the field root but never tested.
- **No test for `data-testid` propagation.** Actually, there is a test for `data-testid` (line 267). Disregard.
- **Status message `aria-live` is set to `assertive` for errors.** Error status messages use `aria-live="assertive"`, which interrupts the user immediately. For form validation that appears on load, `polite` is generally preferred. `assertive` should be reserved for time-sensitive alerts.
- **No explicit `onChange` event type export.** The `onChange` callback signature is `(checked: boolean, event: ChangeEvent<HTMLInputElement>) => void`, which is clear, but consumers who want to type their handler need to import `ChangeEvent` from React separately.

## Recommendations

1. Consider adding a prop or documenting the intentional behavior that `isLoading` does not disable interaction. If consumers frequently need loading-disables-interaction, provide that as a pattern in documentation.
2. The spread layout test should use a more robust DOM querying strategy.
3. Consider whether error status messages should use `aria-live="polite"` instead of `"assertive"` for non-urgent validation feedback.
4. Add `aria-live="polite"` explicitly to the loading status container for cross-AT compatibility.

## SVA Conversion

**Status: Migrated.** `Switch.recipe.ts` is an `sva` slot recipe with slots `field`/`row`/`labelWrapper`/`label`/`labelIcon`/`requiredness`/`tooltipIcon`/`status`/`control`/`input`/`track`/`thumb` and variants `labelSpacing` (default/spread), `isSelected`, `isDisabled`, and `status` (warning/error/success). `Switch.tsx` consumes it via `switchRecipe({labelSpacing, isSelected, isDisabled, status: status?.type})`, replacing the former standalone `styles` object and all per-element `cx()` state ternaries. The on/off thumb transform, track colors, disabled state, and status colors now live in the recipe; `switchRecipe`/`SwitchVariants` are exported alongside the other recipes.
