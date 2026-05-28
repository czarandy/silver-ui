# ButtonGroup Component Audit

**Audited files:**

- `src/components/ButtonGroup/ButtonGroup.tsx`
- `src/components/ButtonGroup/ButtonGroup.recipe.ts`
- `src/components/ButtonGroup/ButtonGroup.stories.tsx`
- `src/components/ButtonGroup/ButtonGroup.test.tsx`
- `src/components/ButtonGroup/ButtonGroupContext.ts`
- `src/components/ButtonGroup/index.ts`

---

## Performance Problems

**No significant issues found.**

The context value is correctly memoized via `useMemo` (`ButtonGroup.tsx`, line 65-68), preventing unnecessary re-renders of child Buttons when the parent re-renders with the same `isDisabled`, `orientation`, and `size` values. The `buttonGroupRecipe` call is a lightweight Panda CSS `cva` invocation, and `cx` is a simple `filter(Boolean).join(' ')`.

Minor note: The `buttonGroupRecipe` is called on every render with `{orientation}`. Since Panda CSS `cva` returns deterministic class name strings for the same variant inputs, the cost is negligible, but if ButtonGroup is rendered in a large list (unlikely but possible), memoizing the class name string could save a few microseconds per render.

---

## Accessibility Concerns

1. **Missing `aria-orientation` attribute** (`ButtonGroup.tsx`, lines 70-82). The WAI-ARIA `group` role supports the `aria-orientation` property, which tells assistive technologies the layout direction of the group. The component tracks orientation via `data-orientation` (a custom data attribute used for CSS), but does not set `aria-orientation`. Screen readers cannot interpret `data-orientation`.

   **Recommendation:** Add `aria-orientation={orientation}` to the root `<div>`.

2. **No roving tabindex or arrow-key navigation** (`ButtonGroup.tsx`). The WAI-ARIA toolbar pattern recommends that grouped buttons support arrow-key navigation with roving tabindex, so users can tab into the group once and then use arrow keys to move between buttons. Currently, each Button in the group is a separate tab stop. For a small group (2-3 buttons) this is often acceptable, but for larger groups it degrades keyboard usability.

   **Recommendation:** Consider whether `role="toolbar"` with roving tabindex is appropriate for this component. If ButtonGroup is always small (2-4 buttons), the current `role="group"` with individual tab stops is reasonable and meets WCAG. Document this decision either way.

3. **`aria-disabled` on the group container is informational only** (`ButtonGroup.tsx`, line 73). Setting `aria-disabled` on the wrapping `<div role="group">` does not actually prevent interaction with child buttons -- that is handled correctly via context propagation to individual Buttons. However, some screen readers may announce the group as "disabled" even though individual buttons already announce their own disabled state, potentially causing double announcements.

   **Recommendation:** This is a minor concern. Monitor for user feedback on double announcements. The current approach is not incorrect.

---

## Logic Bugs

**No logic bugs found.** The component correctly:

- Defaults `isDisabled` to `false`, `orientation` to `'horizontal'`, and `size` to `'md'` (line 59-62).
- Memoizes the context value with the correct dependency array (line 65-68).
- Passes `aria-disabled` as `true` only when `isDisabled` is true, and `undefined` otherwise (line 73).
- Merges `className` after the recipe class via `cx` (line 75).

The consuming Button component (`Button.tsx`, lines 220-223) correctly reads from context: it falls back to `buttonGroup?.size` when `sizeProp` is undefined, and merges `buttonGroup?.isDisabled` into its own disabled state. Individual Buttons can override `size` but not `isDisabled` (the group's `isDisabled` is OR'd in), which is the correct design.

One subtle behavior worth documenting: `isDisabled` on ButtonGroup cannot be overridden per-button. If ButtonGroup has `isDisabled={true}`, a child `<Button isDisabled={false}>` will still be disabled because the Button component uses `isDisabled || buttonGroup?.isDisabled === true` (Button.tsx, line 222-223). This is correct behavior but should be mentioned in the JSDoc.

---

## Unclear API

1. **`useButtonGroup` hook is not exported** (`ButtonGroupContext.ts`, line 17; `index.ts`). The hook is defined in `ButtonGroupContext.ts` but is not re-exported from `index.ts` or the library's main `src/index.ts`. It is only consumed internally by `Button.tsx`. If consumers want to build custom components that participate in a ButtonGroup (e.g., a custom dropdown trigger), they cannot access the group context. Either export the hook intentionally, or document that it is internal-only.

2. **No guidance on what children are valid.** The `children` prop accepts `ReactNode` (`ButtonGroup.tsx`, line 19), but the recipe's CSS selectors target only `button` and `a` elements (`ButtonGroup.recipe.ts`, lines 8, 11, 19, 23, 29, 33). If a consumer wraps Buttons in a `<div>` or renders a custom component that does not produce a `<button>` or `<a>`, the border-radius stripping will silently fail. A JSDoc comment on `children` noting that direct children should be `<Button>` elements would help.

3. **`ButtonGroupVariants` type is exported but has limited utility.** The `ButtonGroupVariants` type (`ButtonGroup.recipe.ts`, line 46) is exported from `index.ts`, but it only contains `{ orientation?: 'horizontal' | 'vertical' }`, which is already available as `ButtonGroupOrientation`. Consider whether this export is necessary.

---

## Missing Tests

1. **No test for default prop values.** There is no test asserting the default `orientation` is `'horizontal'` or that the default `size` is `'md'`. The `orientation` test (line 20-31) only tests explicit `orientation="vertical"`.

2. **No test for `isDisabled` not being overridable per-button.** While the test at line 58-70 verifies disabled propagation, there is no test verifying that a child `<Button isDisabled={false}>` inside a disabled ButtonGroup is still disabled. This is an important edge case of the API contract.

3. **No test for non-Button children.** There is no test verifying behavior when children are not Button components (e.g., a `<div>`, a fragment, or `null`). While this may be considered an invalid usage, a test documenting the expected behavior would be valuable.

4. **No test for context memoization stability.** There is no test verifying that the context value is referentially stable across re-renders when props do not change. While `useMemo` is used, a test ensuring no unnecessary child re-renders would guard against regressions.

5. **No test for the `orientation` prop affecting layout.** The test at line 20-31 only checks the `data-orientation` attribute. It does not verify that the correct CSS class from the recipe is applied (e.g., that the `flexDirection: 'column'` variant is active for vertical orientation).

6. **No test for multiple ButtonGroups on the same page.** There is no test verifying that context isolation works correctly when multiple ButtonGroups with different sizes/disabled states are rendered simultaneously.

---

## Missing Stories

1. **No story with mixed Button variants.** No story demonstrates a ButtonGroup containing Buttons of different visual variants (e.g., `secondary` + `destructive`), which is a common real-world pattern and the `Vertical` story only partially shows this.

2. **No story for `isDisabled` combined with orientation.** The `Disabled` story (line 71-81) only shows horizontal disabled. A disabled vertical group would help verify visual correctness.

3. **No story with link buttons (href).** There is no story showing a ButtonGroup with link-style Buttons (`href` prop). The recipe targets both `button` and `a` elements (recipe line 8), so this is a supported use case that should be demonstrated.

4. **No story for large groups.** All stories show 2-3 buttons. A story with 5+ buttons would help verify visual behavior and highlight any keyboard navigation concerns.

5. **No story demonstrating size override on individual buttons.** The `Sizes` story (line 52-69) shows different group-level sizes, but no story shows a child Button overriding the group's size (which is a documented capability of the API).

6. **No story for icon-only buttons in vertical orientation.** The `Horizontal` story uses icon-only buttons but only in horizontal orientation. Vertical icon-only groups are a common pattern (e.g., a drawing toolbar) that should be visually validated.

7. **No story showing loading state interaction.** There is no story showing a ButtonGroup where one or more Buttons are in a loading state, which affects the disabled behavior.

---

## Additional Observations

- **`index.ts` exports are mostly complete** but omit `useButtonGroup`. This is either intentional (internal-only hook) or an oversight. See "Unclear API" item 1.
- **`displayName` is set** on both `ButtonGroup` (`ButtonGroup.tsx`, line 87) and `ButtonGroupContext` (`ButtonGroupContext.ts`, line 15), which is good for React DevTools debugging.
- **Consistency with ToggleButtonGroup.** The sibling `ToggleButtonGroup` component uses `css()` for styling rather than `cva()` recipes, and does not strip border radii from adjacent children (it uses `gap: '1'` instead). The two components have divergent visual models -- ButtonGroup fuses buttons together (no gap, shared border radii), while ToggleButtonGroup separates them. This is a valid design choice but should be documented so consumers understand when to use each.
- **The recipe's `:where()` selectors** (`ButtonGroup.recipe.ts`, lines 8, 11, etc.) use zero-specificity wrappers, which is good practice. However, if a consumer applies a higher-specificity border-radius override directly on a Button, it will win over the group's radius stripping. This is expected CSS behavior but could be surprising.
