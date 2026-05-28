# SegmentedControl Audit

Scope reviewed:

- `src/components/SegmentedControl/SegmentedControl.tsx`
- `src/components/SegmentedControl/SegmentedControlItem.tsx`
- `src/components/SegmentedControl/SegmentedControlContext.ts`
- `src/components/SegmentedControl/SegmentedControl.test.tsx`
- `src/components/SegmentedControl/index.ts`
- `XDS_src/SegmentedControl/*`

## Findings

### High

1. **Disabled controls remain keyboard-focusable.** `SegmentedControlItem` computes disabled state from the parent/item (`src/components/SegmentedControl/SegmentedControlItem.tsx:140-146`) but still sets `tabIndex={isSelected ? 0 : -1}` (`src/components/SegmentedControl/SegmentedControlItem.tsx:166`). When `SegmentedControl isDisabled` is true, the selected child is still in the tab order even though the group is marked `aria-disabled` (`src/components/SegmentedControl/SegmentedControl.tsx:175`). The same issue exists in XDS (`XDS_src/SegmentedControl/XDSSegmentedControlItem.tsx:173-197`). Consider using the native `disabled` attribute or setting disabled selected items to `tabIndex={-1}` while preserving the intended aria semantics.

2. **XDS item drops its advertised base props.** `XDSSegmentedControlItemProps` extends `XDSBaseProps<HTMLButtonElement>` (`XDS_src/SegmentedControl/XDSSegmentedControlItem.tsx:35`), but the component destructures only named props and never collects/spreads `...props` (`XDS_src/SegmentedControl/XDSSegmentedControlItem.tsx:163-170`). `className`, `style`, `xstyle`, `data-*`, `id`, and event handlers are silently ignored; the final `mergeProps` only includes internal class/style (`XDS_src/SegmentedControl/XDSSegmentedControlItem.tsx:199-213`). Add rest prop forwarding and merge consumer `className/style/xstyle` consistently with other XDS components.

### Medium

3. **XDS keyboard support is incomplete for radio semantics.** The source component handles `ArrowRight`, `ArrowDown`, `ArrowLeft`, `ArrowUp`, `Home`, and `End` (`src/components/SegmentedControl/SegmentedControl.tsx:138-155`), but XDS handles only left/right/home/end (`XDS_src/SegmentedControl/XDSSegmentedControl.tsx:162-180`). For a radiogroup with no orientation prop, up/down arrows should also move selection.

4. **No Storybook story exists for the shipped `src` component.** There is no `src/components/SegmentedControl/SegmentedControl.stories.tsx`, while peer components do have stories. Important props missing from story coverage include `size`, `layout="fill"`, `isDisabled`, item `isDisabled`, `icon`, and `isLabelHidden`. XDS has docs (`XDS_src/SegmentedControl/SegmentedControl.doc.mjs`) that list these props, but that does not cover the public `src/components` Storybook surface.

5. **Keyboard navigation can emit redundant changes.** The key handler always calls `onChange(nextValue)` after focusing the computed item (`src/components/SegmentedControl/SegmentedControl.tsx:161-167`; XDS: `XDS_src/SegmentedControl/XDSSegmentedControl.tsx:183-189`). With one enabled item, or `Home` on the first item / `End` on the last item, this calls `onChange` with the current value. Click handling avoids this (`src/components/SegmentedControl/SegmentedControlItem.tsx:158-160`), so keyboard and pointer behavior differ.

### Low

6. **Public context API is unclear.** `SegmentedControlContext` and `useSegmentedControlContext` are re-exported from the public index (`src/components/SegmentedControl/index.ts:6-12`, `src/index.ts:134-144`) but there is no story or doc explaining whether custom segment implementations are supported. If this is intentional extensibility, document the contract; otherwise keep the context internal.

7. **Root size CSS variable appears unused in `src`.** The root defines `--segmented-control-radius` for all sizes (`src/components/SegmentedControl/SegmentedControl.tsx:86-90`), but items use fixed radii from their own size styles (`src/components/SegmentedControl/SegmentedControlItem.tsx:103-125`). This looks like dead styling or an incomplete port from XDS's concentric radius implementation.

## Tests

Existing `src` tests cover basic radiogroup labeling/checked state, click selection, selected/disabled item click suppression, one roving keyboard path, and hidden-label icon items (`src/components/SegmentedControl/SegmentedControl.test.tsx:7-86`).

Missing or undercovered:

- Root `isDisabled` should assert `aria-disabled`, no click change, no keyboard change, and no tabbable selected item.
- `ArrowLeft`, `ArrowUp`, `ArrowDown`, `Home`, `End`, and wraparound behavior are implemented but mostly untested in `src`.
- Rerendering `value` and roving `tabIndex` updates are untested in `src`.
- `layout="fill"`, all `size` variants, `className`, `style`, `data-testid`, and refs are untested in `src`.
- The context error for `SegmentedControlItem` used outside `SegmentedControl` is untested (`src/components/SegmentedControl/SegmentedControlContext.ts:19-24`).
- XDS tests are broader, but do not catch the ignored item base props or missing up/down arrow support.

## Category Notes

- **Performance:** No material performance issue found. The keydown path queries enabled radios on demand (`src/components/SegmentedControl/SegmentedControl.tsx:123-127`), but segmented controls should have small item counts and this keeps disabled filtering current.
- **Accessibility:** Issues found above around disabled focusability and XDS up/down arrow support.
- **Logic bugs:** Issues found above around ignored XDS props and redundant keyboard `onChange`.
- **API clarity:** Context exports need documentation if intentional.
- **Stories/docs:** XDS docs exist and list core props (`XDS_src/SegmentedControl/SegmentedControl.doc.mjs:29-127`), but `src` has no Storybook story.
