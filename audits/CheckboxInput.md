# CheckboxInput Audit

## Summary

A controlled checkbox input supporting checked, unchecked, and indeterminate states, with label, description, validation status, loading, disabled, and read-only support. Implemented as a native `<input type="checkbox">` overlaid on a styled visual box, composed with `Item` for layout.

## Issues

### Critical

- None.

### High

None

### Medium

- **`isReadOnly` does not fully prevent visual state changes.** While `onChange` is blocked with `event.preventDefault()`, the native `checked` attribute of the input momentarily toggles before the React re-render resets it, causing a visual flash in some browsers. Using `aria-readonly` combined with the manual `event.preventDefault()` is correct, but adding `pointer-events: none` on the visual box when `isReadOnly` is true, or using a click-event handler approach, would be more robust.
- **Missing `peer` class on the input for `_peerFocusVisible`.** The `box` style uses `_peerFocusVisible` which in Panda CSS requires the triggering element to have a `peer` class or data attribute. The `<input>` element does not appear to have this class applied. This means the focus-visible ring on the visual checkbox box may not render at all, which is an accessibility concern for keyboard users. Verify that Panda CSS generates the correct selectors without an explicit peer marker, or add the `peer` className to the input.
- **No story for `labelTooltip` or `labelIcon` props.** The `WithIcon` story uses `startContent` but does not demonstrate `labelIcon` (which renders an icon _before_ the label text inside the label element). There is no story showing `labelTooltip` behavior.
- **No test for `isLabelHidden` behavior.** Given the high-severity bug above, a test for this prop would have caught the issue.

### Low

- **`onChange` callback is required but could be typed more defensively.** The `onChange` prop is non-optional, which is fine for controlled components, but there is no warning or guard if a consumer accidentally omits it (TypeScript would catch this, but JSDoc could clarify the controlled nature).
- **No story for `onFocus`/`onBlur` callbacks.** These are useful for demonstrating interactive focus behavior.
- **`data-testid` story coverage is missing.** While tested in the test file, no story demonstrates it.
- **Style prop (`style`) is applied to the outer `div`, not the input.** This is consistent but could confuse consumers expecting to style the checkbox itself.

## Recommendations

1. **Verify the `_peerFocusVisible` selector works.** If Panda CSS requires an explicit `peer` className on the input, add `className={cx('peer', styles.input)}` to the input element.
2. Add stories for `labelTooltip`, `labelIcon`, and `isLabelHidden`.
3. Add a test for `isLabelHidden` to verify the checkbox remains interactive.

## SVA Conversion

**Benefit: Strong**

CheckboxInput renders multiple distinct styled elements — root wrapper, boxWrap, the visually-hidden input, the visible box, the icon, the label, the necessity indicator, and the tooltip icon — and styles them through one standalone `const styles = {...}` object in `CheckboxInput.tsx` with ~14 `css()` blocks (including a nested `boxSize: {sm, md}` map). The box element is composed at runtime via `cx(styles.box, styles.boxSize[size], isCheckedOrIndeterminate ? styles.boxChecked : undefined, isDisabled ? styles.boxDisabled : undefined)`, and the label similarly toggles `styles.labelDisabled`. There is no recipe today; size, checked, and disabled are all applied as conditional `cx()` branches. An `sva` with slots like `root/boxWrap/input/box/icon/label/indicator` plus `size` and boolean `isChecked`/`isDisabled` variants would consolidate the box-state logic into one recipe (the status message already uses the shared `fieldStatusRecipe`). Note: the existing audit already flags a `_peerFocusVisible`/`peer` concern, which an `sva` migration should preserve.
