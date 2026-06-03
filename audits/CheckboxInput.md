# CheckboxInput Audit

## Summary

A controlled checkbox input supporting checked, unchecked, and indeterminate states, with label, description, validation status, loading, disabled, and read-only support. Implemented as a native `<input type="checkbox">` overlaid on a styled visual box, composed with `Item` for layout.

## Issues

### Critical

- None.

### High

- **`isLabelHidden` hides the entire interactive control.** When `isLabelHidden` is true, the component wraps the _entire_ `<Item>` (including the checkbox control itself) in `<VisuallyHidden>`, which applies `clipPath: 'inset(50%)'`, `w: 1px`, `h: 1px`. This makes the checkbox completely invisible _and_ nearly impossible to interact with via pointer. The intent is likely to hide only the label text while keeping the control visible and operable. The current behavior effectively hides the whole component from sighted users. (Field.tsx does this correctly -- it only hides the label and description.)

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

1. **Fix `isLabelHidden` immediately.** It should only hide the label/description, not the control. Restructure to wrap only the `labelNode` in `VisuallyHidden`, similar to how `Field.tsx` handles it.
2. **Verify the `_peerFocusVisible` selector works.** If Panda CSS requires an explicit `peer` className on the input, add `className={cx('peer', styles.input)}` to the input element.
3. Add stories for `labelTooltip`, `labelIcon`, and `isLabelHidden`.
4. Add a test for `isLabelHidden` to verify the checkbox remains interactive.
