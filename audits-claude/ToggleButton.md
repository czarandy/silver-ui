# ToggleButton Component Audit

Audited: 2026-05-28
Files reviewed:

- `src/components/ToggleButton/ToggleButton.tsx`
- `src/components/ToggleButton/ToggleButtonGroup.tsx`
- `src/components/ToggleButton/ToggleButton.test.tsx`
- `src/components/ToggleButton/index.ts`

Note: No `.stories.tsx` or `.recipe.ts` files exist for this component.

---

## Performance

### Issue 1: `useCallback` dependency on `props` causes unnecessary re-creation of `toggle`

**File:** `ToggleButtonGroup.tsx`, line 155
**Severity:** Medium

The `toggle` callback depends on `[isMultiple, props]`. Because `props` is a new object on every render (it is the rest of the destructured props, which includes `value`, `onChange`, `type`, and any other remaining props), `toggle` is re-created on every render, defeating the purpose of `useCallback`. This in turn causes the `contextValue` object from `useMemo` (line 158) to produce a new value on every render, forcing all consuming `ToggleButton` children to re-render even when nothing has changed.

**Recommendation:** Depend on `props.value` and `props.onChange` individually rather than the entire `props` object:

```ts
[isMultiple, props.value, props.onChange];
```

### Issue 2: `selectedValues` Set is re-created on every render when value is stable

**File:** `ToggleButtonGroup.tsx`, line 130-136
**Severity:** Low

The `useMemo` depends on `[isMultiple, props.value]`. For the multiple-selection case, `props.value` is an array, and arrays fail referential equality checks even when their contents are unchanged. This means a new `Set` is created on every render unless the parent memoizes the array. This is acceptable behavior (the parent controls the reference), but worth noting since it contributes to unnecessary context updates when combined with Issue 1.

### Issue 3: Styles object is defined at module scope (good)

No performance issue. Both `ToggleButton.tsx` and `ToggleButtonGroup.tsx` define their `styles` objects at module scope, so `css()` calls are evaluated once and reused. The `buttonRecipe` is also imported and called inline, which is fine since `cva` results are cached by Panda CSS.

---

## Accessibility

### Issue 4: No keyboard navigation between buttons in a group

**File:** `ToggleButtonGroup.tsx`, lines 163-178
**Severity:** Medium

The group renders a `<div role="group">` but does not implement roving tabindex or arrow-key navigation between buttons. The WAI-ARIA Authoring Practices for toolbars and toggle button groups recommend that arrow keys move focus between buttons in the group, with only one button in the tab order at a time (roving tabindex pattern). Currently, every button in the group is independently tabbable, which is functional but not optimal for keyboard users navigating large groups.

**Recommendation:** Consider implementing roving tabindex with `ArrowLeft`/`ArrowRight` (horizontal) and `ArrowUp`/`ArrowDown` (vertical) keyboard navigation. Alternatively, if the groups are always small (2-4 buttons), the current approach is acceptable but should be documented as a deliberate choice. Adding `role="toolbar"` instead of `role="group"` would also be appropriate if arrow-key navigation is added.

### Issue 5: Spinner is not announced to screen readers when isIconOnly is true

**File:** `ToggleButton.tsx`, lines 226-230
**Severity:** Medium

When `isIconOnly` is true and `isBusy` is true, no spinner is rendered (line 226: `!isIconOnly && isBusy`). The `aria-busy` attribute is set on the button (line 199), which is good, but there is no visual loading indicator for icon-only buttons. This means an icon-only button in a loading state looks identical to a normal icon-only button -- the user has no visual feedback that an action is pending.

**Recommendation:** Either render the spinner for icon-only buttons (replacing the icon while loading), or visually indicate the loading state in another way (e.g., an overlay spinner or opacity change).

### Issue 6: `aria-busy` is removed when not busy instead of being set to `false`

**File:** `ToggleButton.tsx`, line 199
**Severity:** Low

The expression `aria-busy={isBusy || undefined}` removes the attribute entirely when not busy. While this is technically valid (the absence of `aria-busy` is equivalent to `false`), some screen readers and testing tools may behave more consistently with an explicit `aria-busy="false"`. This is a minor concern.

### Issue 7: Tooltip on a disabled button may not be keyboard-accessible

**File:** `ToggleButton.tsx`, lines 209, 235-237
**Severity:** Low

When `isDisabled || isBusy` is true, the `<button>` element gets `disabled={true}`. Disabled buttons are removed from the tab order, so keyboard users cannot focus them to see the tooltip. If the tooltip contains important information (e.g., "This action is unavailable because..."), it becomes inaccessible. This depends on the `Tooltip` component's implementation -- some tooltip components work around this by wrapping the trigger in a `<span>`.

---

## Logic Bugs

### Issue 8: `pressedChangeAction` runs even when used inside a `ToggleButtonGroup`

**File:** `ToggleButton.tsx`, lines 181-194
**Severity:** Low (unlikely to trigger in practice)

When a `ToggleButton` is inside a group and has a `value`, the `handleClick` function exits early at line 182 (`group.toggle(value); return;`), so `pressedChangeAction` is never called. This is correct behavior -- but the prop is still accepted without any warning or documentation that it is ignored inside groups. A consumer might set both `value` and `pressedChangeAction` and be confused when the action never fires.

**Recommendation:** Document in the JSDoc for `pressedChangeAction` that it is only used for standalone toggle buttons and is ignored inside `ToggleButtonGroup`.

### Issue 9: `onPressedChange` is called with stale `isPressed` when controlled externally

**File:** `ToggleButton.tsx`, lines 165-168, 187
**Severity:** Low

When used standalone, `isPressed` is derived directly from `isPressedProp` (line 168). On click, `nextPressed` is computed as `!isPressed` (line 187). This is a standard controlled component pattern and works correctly as long as the parent updates `isPressed` in response to `onPressedChange`. However, if the parent does not update the prop, clicking repeatedly will always send the same `nextPressed` value (always `true` if initially `false`). This is technically correct for a controlled component but could be surprising.

### Issue 10: No protection against unmounted state update in `pressedChangeAction`

**File:** `ToggleButton.tsx`, lines 190-193
**Severity:** Low

The `.finally(() => setIsActionPending(false))` callback could fire after the component unmounts if the promise takes a long time. In React 18+, this produces a no-op (React suppresses the warning), so it is not a functional bug, but it is a minor code smell.

---

## API Clarity

### Issue 11: `onChange` type on `ToggleButtonGroupBaseProps` is a union of two incompatible function signatures

**File:** `ToggleButtonGroup.tsx`, line 57
**Severity:** Medium

The `onChange` prop is typed as `((value: string | null) => void) | ((value: string[]) => void)`. This type is defined in the base props and then inherited by both `ToggleButtonGroupSingleProps` and `ToggleButtonGroupMultipleProps`. While the discriminated union at the top level (`ToggleButtonGroupProps`) ensures correct usage, the base interface itself has a confusing type. Inside the component, `onChange` is cast with `as` (lines 142, 152) to the expected shape, bypassing type safety.

**Recommendation:** Move `onChange` out of the base props and into each variant interface with the correct type. This eliminates the need for `as` casts:

- `ToggleButtonGroupSingleProps`: `onChange: (value: string | null) => void`
- `ToggleButtonGroupMultipleProps`: `onChange: (value: string[]) => void`

### Issue 12: `useToggleButtonGroup` and `ToggleButtonGroupContext` are not exported from `index.ts`

**File:** `index.ts`, lines 1-8
**Severity:** Low

The `useToggleButtonGroup` hook and `ToggleButtonGroupContext` are not re-exported from the barrel file. If a consumer needs to build a custom toggle button that integrates with the group, they cannot access the context. This may be intentional (keeping it internal), but it limits extensibility.

### Issue 13: `value` prop is optional on `ToggleButton` but required for group integration

**File:** `ToggleButton.tsx`, line 88
**Severity:** Low

When `ToggleButton` is used inside a `ToggleButtonGroup`, it must have a `value` prop for the group's selection logic to work (line 166: `group.selectedValues.has(value)`). If `value` is omitted inside a group, the button silently falls back to standalone behavior (`isPressedProp`), which is confusing. There is no warning when a `ToggleButton` is inside a group but lacks a `value`.

**Recommendation:** Add a development-mode warning when `group != null && value == null`.

---

## Missing Tests

### Issue 14: No tests for `isLoading` / `aria-busy` behavior

**File:** `ToggleButton.test.tsx`
**Severity:** Medium

The loading state is a significant feature (it shows a spinner, sets `aria-busy`, and disables the button), but there are no tests for:

- `aria-busy` being set when `isLoading` is true
- The button being disabled when loading
- The spinner being rendered
- Click being prevented during loading

### Issue 15: No tests for `pressedChangeAction` (async action)

**File:** `ToggleButton.test.tsx`
**Severity:** Medium

The `pressedChangeAction` prop triggers async behavior with internal `isActionPending` state. There are no tests for:

- The action being called with the next pressed state
- The button becoming busy while the action is pending
- The button returning to normal after the action resolves
- Behavior when the action rejects

### Issue 16: No tests for `tooltip` rendering

**File:** `ToggleButton.test.tsx`
**Severity:** Low

The tooltip wrapping logic (lines 235-237) is untested. A test should verify that a tooltip is rendered when the `tooltip` prop is provided.

### Issue 17: No tests for `isIconOnly` rendering

**File:** `ToggleButton.test.tsx`
**Severity:** Low

While `isIconOnly` is used in the `pressedIcon` test (line 47), there is no dedicated test verifying that:

- `aria-label` is set when `isIconOnly` is true
- The label text is visually hidden when `isIconOnly` is true
- `aria-label` is not set when `isIconOnly` is false

### Issue 18: No tests for group `isDisabled` propagation

**File:** `ToggleButton.test.tsx`
**Severity:** Low

The `isDisabled` prop on `ToggleButtonGroup` should disable all child buttons. This is not tested.

### Issue 19: No tests for group `orientation` rendering

**File:** `ToggleButton.test.tsx`
**Severity:** Low

The `orientation` prop on `ToggleButtonGroup` is untested. A test should verify that vertical orientation applies the vertical CSS class.

### Issue 20: No tests for `size` prop propagation from group to buttons

**File:** `ToggleButton.test.tsx`
**Severity:** Low

The `size` prop on `ToggleButtonGroup` should cascade to child `ToggleButton` components. This is not tested.

### Issue 21: No tests for `className`, `style`, `data-testid`, or `ref` forwarding

**File:** `ToggleButton.test.tsx`
**Severity:** Low

Standard prop forwarding is not tested for either `ToggleButton` or `ToggleButtonGroup`.

### Existing test coverage:

- Renders label as visible text
- Renders children instead of label
- `aria-pressed` reflects `isPressed` prop
- `onPressedChange` fires with next state on click
- `pressedIcon` replaces `icon` when pressed
- Click is suppressed when `isDisabled` is true
- Group: renders a labelled group (`role="group"`)
- Group: single selection and deselection
- Group: multiple selection

---

## Missing Stories

### Issue 22: No stories file exists

**File:** (missing `ToggleButton.stories.tsx`)
**Severity:** High

There is no Storybook stories file for the ToggleButton component. Every other component in the library appears to have stories. The following stories should be created at minimum:

1. **Default** -- A standalone toggle button with `isPressed` controlled by Storybook args
2. **WithIcon** -- Toggle button with an `icon` and optionally a `pressedIcon`
3. **IconOnly** -- `isIconOnly` toggle button showing the square icon button variant
4. **Sizes** -- All three sizes (`sm`, `md`, `lg`) side by side
5. **Loading** -- Demonstrates the `isLoading` state with spinner
6. **AsyncAction** -- Demonstrates `pressedChangeAction` with a simulated delay
7. **WithTooltip** -- Toggle button with `tooltip` prop
8. **Disabled** -- Toggle button in disabled state
9. **SingleGroup** -- `ToggleButtonGroup` with `type="single"` (default)
10. **MultipleGroup** -- `ToggleButtonGroup` with `type="multiple"`
11. **VerticalGroup** -- Group with `orientation="vertical"`
12. **DisabledGroup** -- Group with `isDisabled` propagated to all children

---

## Summary

The ToggleButton and ToggleButtonGroup components are well-structured with clean props interfaces, proper ARIA attributes (`aria-pressed`, `role="group"`), and a nice context-based group integration pattern. However, the component has significant gaps in test coverage and is missing its stories file entirely. There is also a performance issue with the `useCallback` dependency in the group component.

| #   | Category      | Severity | Summary                                                                            |
| --- | ------------- | -------- | ---------------------------------------------------------------------------------- |
| 1   | Performance   | Medium   | `toggle` callback depends on `props` object, defeating `useCallback` memoization   |
| 2   | Performance   | Low      | `selectedValues` Set re-created when array value reference changes                 |
| 4   | Accessibility | Medium   | No roving tabindex / arrow-key navigation in button group                          |
| 5   | Accessibility | Medium   | No visual loading indicator for icon-only buttons                                  |
| 6   | Accessibility | Low      | `aria-busy` removed instead of set to `false` when not busy                        |
| 7   | Accessibility | Low      | Tooltip on disabled button not keyboard-accessible                                 |
| 8   | Logic         | Low      | `pressedChangeAction` silently ignored inside groups, undocumented                 |
| 9   | Logic         | Low      | Repeated clicks on controlled button send same value if parent does not update     |
| 10  | Logic         | Low      | No unmount protection for async `pressedChangeAction`                              |
| 11  | API           | Medium   | `onChange` type in base props requires `as` casts in implementation                |
| 12  | API           | Low      | `useToggleButtonGroup` hook not exported from barrel                               |
| 13  | API           | Low      | `value` prop optional but required inside group, no warning when missing           |
| 14  | Tests         | Medium   | No tests for loading / `aria-busy` behavior                                        |
| 15  | Tests         | Medium   | No tests for `pressedChangeAction` async behavior                                  |
| 16  | Tests         | Low      | No tests for tooltip rendering                                                     |
| 17  | Tests         | Low      | No tests for `isIconOnly` accessibility attributes                                 |
| 18  | Tests         | Low      | No tests for group `isDisabled` propagation                                        |
| 19  | Tests         | Low      | No tests for group `orientation`                                                   |
| 20  | Tests         | Low      | No tests for `size` propagation from group                                         |
| 21  | Tests         | Low      | No tests for standard prop forwarding (`className`, `style`, `ref`, `data-testid`) |
| 22  | Stories       | High     | No stories file exists at all                                                      |
