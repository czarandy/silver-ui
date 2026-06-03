# SegmentedControl Audit

## Summary

SegmentedControl is a radio-group-based toggle control that allows selecting one option from a set. It uses `role="radiogroup"` and `role="radio"` with proper `aria-checked` semantics, supports roving tabindex keyboard navigation (arrow keys, Home, End), and propagates size/layout/disabled state via React context. The SegmentedControlItem sub-component handles individual segments with icon, label, and hidden-label (icon-only) modes.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **SegmentedControlItem uses `aria-disabled` but does not use the native `disabled` attribute.** The button at line 142-165 of `SegmentedControlItem.tsx` sets `aria-disabled={isItemDisabled || undefined}` but never sets the HTML `disabled` attribute. While the click handler checks `isItemDisabled` and prevents onChange, the button is technically still interactive for assistive technologies that don't honor `aria-disabled`. Additionally, the button remains focusable even when disabled (it gets `tabIndex={isSelected ? 0 : -1}`), which is intentional for roving tabindex but means keyboard users can focus disabled items. The keyboard handler in SegmentedControl correctly skips items with `aria-disabled="true"` via the selector `[role="radio"]:not([aria-disabled="true"])`, so arrow navigation skips disabled items, but direct Tab/click can still reach them.
- **`aria-orientation` is hardcoded to `"horizontal"`.** Line 182 sets `aria-orientation="horizontal"` unconditionally. There is no support for vertical orientation, but the component also does not prevent a vertical layout via CSS. If a consumer uses CSS to stack items vertically, the ARIA orientation would be incorrect. Currently the component only supports horizontal, so this is not an active bug, but it should be documented or the prop should be exposed.

### Low

- **No story for a disabled individual item that is currently selected.** The `DisabledItem` story disables the "Week" option but selects "Day". There is no story showing what happens when the currently-selected item is disabled (can the user navigate away? can they deselect?).
- **Generic type parameter `TValue` is not exposed in stories.** The component supports `TValue extends string` for type-safe value matching, but stories use plain string values. A story demonstrating union type usage (e.g., `'day' | 'week' | 'month'`) would showcase the generic.
- **Width reservation element duplicates visible content.** `SegmentedControlItem` renders a zero-height hidden span with the label text (lines 203-205) to reserve width for the `semibold` selected state. This is a clever technique to prevent layout shift, but it means the label text appears twice in the DOM. Screen readers may or may not read this text depending on the `aria-hidden="true"` attribute (which is correctly set). No issue in practice, but worth noting.
- **No `name` attribute on radio buttons.** Native radio groups use the `name` attribute to associate radios. Since these are custom `button` elements with `role="radio"` rather than `<input type="radio">`, the `name` attribute is not needed. However, this means the component cannot participate in native form submission.
- **Context throws on missing provider, which is good.** The `useSegmentedControlContext` hook correctly throws if `SegmentedControlItem` is used outside of `SegmentedControl`. This is tested and is a positive design choice.

## Recommendations

1. Consider whether to expose an `orientation` prop and support vertical layouts with `aria-orientation="vertical"`. If vertical is not intended, add documentation stating horizontal-only support.
2. Evaluate whether to add the native `disabled` attribute alongside `aria-disabled` on items, or document the intentional use of `aria-disabled` for roving-tabindex compatibility.
3. Add a story showing a disabled item that is the currently selected value.
4. The keyboard navigation implementation is solid and well-tested, including wrapping, Home/End, and skipping disabled items. No changes needed there.
