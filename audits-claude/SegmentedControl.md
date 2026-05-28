# SegmentedControl Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/SegmentedControl/SegmentedControl.tsx`
- `src/components/SegmentedControl/SegmentedControlItem.tsx`
- `src/components/SegmentedControl/SegmentedControlContext.ts`
- `src/components/SegmentedControl/SegmentedControl.test.tsx`
- `src/components/SegmentedControl/index.ts`

**Files missing:**

- No `*.stories.tsx` file exists
- No `*.recipe.ts` file exists

---

## Performance Problems

1. **Inline arrow function in onClick handler (SegmentedControlItem.tsx, line 158-161):**
   Each `SegmentedControlItem` creates a new arrow function on every render for its `onClick` handler. For a typical SegmentedControl with 3-5 items, this is negligible. However, if `useCallback` were used, it would require `isItemDisabled`, `isSelected`, `context.onChange`, and `value` as dependencies, and all but `value` change when any context value changes, so wrapping in `useCallback` would not actually help. **Low severity -- no action needed.**

2. **`onChange` in `useMemo` dependency array (SegmentedControl.tsx, line 109):**
   If the consumer passes an unstable `onChange` callback (i.e., an inline arrow in JSX), the context value object will be re-created every render, causing all `SegmentedControlItem` children to re-render. This is a common pattern and the consumer can mitigate it by stabilizing `onChange` with `useCallback`. **Low severity, but worth documenting in the component's API docs.**

3. **`querySelectorAll` on every keydown (SegmentedControl.tsx, lines 123-127):**
   The `handleKeyDown` callback queries the DOM for all `[role="radio"]` items on every arrow-key press. For a small number of segments this is fine, but it couples the keyboard logic to the DOM rather than a React-managed data structure. **Low severity -- acceptable for the expected item count.**

4. **Identical size styles (SegmentedControl.tsx, lines 87-90):**
   The `styles.size` map defines `sm`, `md`, and `lg` with the exact same CSS custom property value (`var(--silver-radii-md)`). All three sizes produce the same `--segmented-control-radius` value, meaning the size map on the root is effectively a no-op. This is likely a bug or unfinished work (see Logic Bugs below), and the custom property `--segmented-control-radius` is never consumed anywhere in the component files.

---

## Accessibility Concerns

1. **`aria-disabled` instead of `disabled` attribute (SegmentedControlItem.tsx, line 146):**
   The button uses `aria-disabled` rather than the native `disabled` attribute. While `aria-disabled` is a valid approach (it keeps the button focusable, which can be desirable), the component also applies `cursor: default` and blocks click via JS (line 158-161), but does **not** prevent the button from being activated via Enter or Space key. If a user presses Enter/Space on a disabled item, the default `<button>` behavior will fire a `click` event. The `onClick` handler does guard against this, so it is functionally correct, but the native `disabled` attribute would be a more robust safeguard.

2. **Roving tabindex does not handle "no item selected" edge case (SegmentedControlItem.tsx, line 166):**
   `tabIndex` is `0` only when `isSelected` is true and `-1` otherwise. If `value` does not match any item (e.g., the consumer passes an invalid value, or value is an empty string), no item will have `tabIndex={0}`, making the entire control unreachable by keyboard Tab navigation. There is no fallback to make the first item tabbable when nothing is selected.

3. **Container has `tabIndex={-1}` (SegmentedControl.tsx, line 189):**
   The `radiogroup` container itself has `tabIndex={-1}`. This means clicking the background area between items focuses the container but does not move focus to any radio item. Combined with issue #2, if no item matches `value`, the user cannot Tab into the control at all, since neither the container (tabIndex -1) nor any item (all tabIndex -1) is in the tab order.

4. **Missing `aria-orientation` (SegmentedControl.tsx, line 187):**
   The `radiogroup` does not declare `aria-orientation`. While the component is visually always horizontal, explicitly setting `aria-orientation="horizontal"` signals to assistive technology that ArrowLeft/ArrowRight (not ArrowUp/ArrowDown) are the expected navigation keys. The component currently handles both arrow pairs, which is generous, but the missing attribute is an omission per WAI-ARIA radiogroup best practices.

5. **Disabled items can still receive focus via click (SegmentedControlItem.tsx):**
   Because `aria-disabled` is used instead of `disabled`, clicking a disabled item will focus it. The keyboard handler in `SegmentedControl.tsx` (line 125) filters out `[aria-disabled="true"]` items during arrow navigation, which is correct, but a user can still click-focus a disabled item and then be "stuck" -- arrow keys will skip that item's index, but focus remains on it until another item is focused.

6. **`pointerEvents: 'none'` on the container when disabled (SegmentedControl.tsx, line 84):**
   The `disabled` style on the root sets `pointerEvents: 'none'`, which prevents mouse interaction but also prevents screen reader users from clicking items. This is acceptable since keyboard navigation is also blocked (line 114), but it is worth noting that `pointerEvents: 'none'` is not a substitute for semantic disabling.

---

## Logic Bugs

1. **`--segmented-control-radius` custom property is set but never consumed (SegmentedControl.tsx, lines 87-90):**
   The root element sets a `--segmented-control-radius` CSS custom property in all three size variants, but no element in `SegmentedControl.tsx` or `SegmentedControlItem.tsx` reads this property. The items define their own `borderRadius` directly in `styles.size` (SegmentedControlItem.tsx, lines 107, 113, 121). This custom property appears to be dead code.

2. **All three root size variants are identical (SegmentedControl.tsx, lines 87-90):**

   ```ts
   sm: css({'--segmented-control-radius': 'var(--silver-radii-md)'}),
   md: css({'--segmented-control-radius': 'var(--silver-radii-md)'}),
   lg: css({'--segmented-control-radius': 'var(--silver-radii-md)'}),
   ```

   All three sizes map to `var(--silver-radii-md)`. This is likely a copy-paste oversight -- `sm` might have been intended to use a smaller radius, or this block was leftover scaffolding.

3. **`isDisabled` on root uses `pointerEvents: 'none'` but keyboard events still fire (SegmentedControl.tsx, lines 83-85, 114):**
   The `disabled` CSS class applies `pointerEvents: 'none'`, which blocks mouse events but not keyboard events. The `handleKeyDown` callback does check `isDisabled` early (line 114) and returns, so this is functionally correct. However, if the user somehow focuses an item and uses Enter/Space, the `onClick` on SegmentedControlItem will fire. The item's `onClick` does not check `context.isDisabled` directly -- it checks `isItemDisabled`, which is `context.isDisabled || isDisabled`. So this is actually correct. **No bug, just a subtle interaction worth noting.**

4. **`onChange` is called even when value hasn't changed during keyboard navigation edge case (SegmentedControl.tsx, line 166):**
   When arrowing through items, `onChange` is called with the next item's `data-value`. If the currently selected item is not the currently focused item (e.g., user focused an item via click, then used arrow keys), `onChange` may be called with a value that is already the selected value. The item's `onClick` guards against this (`!isSelected`, line 159), but the keyboard handler does not. **Minor -- no visible bug since the consumer controls state, but it creates unnecessary re-renders.**

---

## Unclear API

1. **`SegmentedControlContext` and `useSegmentedControlContext` are exported from the public API (index.ts, lines 6-12):**
   The context and hook are exported as part of the package's public surface (confirmed in `src/index.ts` lines 136-137). This allows consumers to build custom items outside of `SegmentedControlItem`, which is useful for extensibility. However, it also exposes implementation details. If this is intentional, it should be documented. If not, consider removing these from the public exports.

2. **`value` prop is typed as `string` with no generic (SegmentedControl.tsx, line 66; SegmentedControlItem.tsx, line 45):**
   Both `SegmentedControl.value` and `SegmentedControlItem.value` are typed as `string`. A generic type parameter (e.g., `SegmentedControl<T extends string>`) would allow consumers to get type-safe value matching with string literal unions. This is a common pattern in similar component libraries.

3. **No `name` prop for form integration:**
   Unlike a native radio group, there is no `name` prop and no hidden `<input>` elements. The component cannot participate in native form submission. This may be intentional (the component is purely controlled), but it limits use cases.

4. **`label` on `SegmentedControlItem` serves dual purpose (SegmentedControlItem.tsx, lines 29-33, 147, 169):**
   The `label` prop is used both as the visible text and as the `aria-label` when `isLabelHidden` is true. This is a clean API, but the prop name `label` for the visible text content might be unexpected to some consumers who would expect a `children` prop. This is a minor style choice and consistent with other silver-ui components (e.g., `RadioGroupItem`).

---

## Missing Tests

1. **No test for `layout="fill"` mode:**
   The `fill` layout is a documented prop but has no test verifying that it applies the fill CSS class or that items stretch to equal width.

2. **No test for `size` variants:**
   The `size` prop (`sm`, `md`, `lg`) is untested. There is no verification that size-specific CSS classes are applied.

3. **No test for `isDisabled` on the root `SegmentedControl`:**
   The test at line 38-51 tests individual item disabling and already-selected items, but there is no test for the `isDisabled` prop on the `SegmentedControl` itself. Specifically:
   - No test that keyboard navigation is blocked when `isDisabled` is true on the root.
   - No test that `aria-disabled` is set on the root `radiogroup` element.
   - No test that click is blocked on all items when the root is disabled.

4. **No test for `Home` / `End` key navigation (SegmentedControl.tsx, lines 151-155):**
   The `handleKeyDown` handler supports `Home` and `End` keys, but these are not tested.

5. **No test for `ArrowLeft` / `ArrowUp` navigation (SegmentedControl.tsx, lines 146-149):**
   Only `ArrowRight` is tested. Reverse navigation (`ArrowLeft`, `ArrowUp`) and wrap-around behavior are untested.

6. **No test for `ref` forwarding:**
   Both `SegmentedControl` and `SegmentedControlItem` accept `ref` props but neither is tested for correct ref assignment.

7. **No test for `className` and `style` passthrough:**
   Custom `className` and `style` props are accepted but untested.

8. **No test for `data-testid` passthrough:**
   The `data-testid` prop is accepted on both components but not tested (though it is used implicitly in the icon test on line 84).

9. **No controlled state test:**
   Unlike `RadioGroup.test.tsx`, there is no test that verifies the controlled value updates correctly when the consumer calls `onChange` and re-renders with a new `value`. The existing tests use mocked `onChange` but never verify the visual state updates after re-render.

10. **No test for wrapping keyboard navigation:**
    The arrow key handler wraps around (e.g., ArrowRight on the last item focuses the first), but this wrap-around behavior is not tested.

11. **No test for `SegmentedControlItem` used outside of `SegmentedControl`:**
    The context hook throws an error when used outside a provider (SegmentedControlContext.ts, lines 21-23), but this is not tested.

---

## Missing Stories

**There is no Storybook stories file at all.** The component has zero story coverage. A `SegmentedControl.stories.tsx` file should be created with stories for at least:

1. **Default** -- basic usage with 2-3 text segments.
2. **Sizes** -- demonstrating `sm`, `md`, and `lg` size variants.
3. **Fill layout** -- demonstrating `layout="fill"` where items stretch to fill the container.
4. **Disabled** -- the entire control disabled via `isDisabled`.
5. **Disabled item** -- individual items disabled.
6. **Icon-only** -- using `icon` + `isLabelHidden` for icon-only segments.
7. **Icon + label** -- using `icon` with a visible label.
8. **Many items** -- stress-testing with 5+ items to verify layout behavior.

For reference, sibling components like `RadioGroup`, `Tabs`, and `ButtonGroup` all have stories files demonstrating their key props and variants.

---

## Summary

The component implementation is solid in its core functionality -- controlled value, roving focus, and context-based composition. The main concerns are:

- **High priority:** No stories file exists, limiting discoverability and visual regression testing.
- **High priority:** Test coverage is thin -- only 5 tests covering basic rendering, click, disabled item click, one keyboard direction, and icon-only mode. Key behaviors like full keyboard navigation, root-level disabled state, layout/size variants, and controlled re-render are untested.
- **Medium priority:** The `--segmented-control-radius` custom property is dead code and the three size variants on the root element are all identical (lines 87-90 of `SegmentedControl.tsx`).
- **Medium priority:** If no item value matches, the control becomes completely unreachable by keyboard (no item has `tabIndex={0}`).
- **Low priority:** API could benefit from generic `value` typing and form integration via a `name` prop, depending on the library's goals.
