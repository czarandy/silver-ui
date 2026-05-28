# Item Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/Item/Item.tsx`
- `src/components/Item/Item.stories.tsx`
- `src/components/Item/Item.test.tsx`
- `src/components/Item/index.ts`

---

## Performance Problems

**No significant performance issues found.**

- The component is stateless and effect-free. The `styles` object (lines 118-192) is module-level and computed once at import time via Panda CSS `css()` calls.
- `useLinkComponent()` and `useRel()` are lightweight context reads / `useMemo` calls, respectively.
- The `labelAndDescription` JSX fragment (lines 237-251) is re-created on every render. This is idiomatic React and not a concern for a leaf-level layout primitive. Memoizing it would add complexity without measurable benefit since the component has no expensive children or effects.
- The `handleContainerClick` closure (lines 253-264) is re-created on every render. Since `Item` is a primitive used inside lists (e.g., Combobox, DropdownMenu), this could theoretically matter in very large lists. However, there is no `React.memo` boundary on `Item` itself, so memoizing the handler alone would not help. If virtualized-list performance becomes an issue, wrapping `Item` in `React.memo` and stabilizing callbacks would be the correct approach, but this is premature optimization at this stage.

---

## Accessibility Concerns

1. **Missing `aria-label` / accessible name support (Item.tsx, lines 20-116):**
   The `ItemProps` interface does not accept `aria-label` or `aria-labelledby`. When `label` is a non-string `ReactNode` (e.g., a styled `<span>`), the accessible name of the inner `<button>` or `<a>` is derived from its text content, which may not always be adequate. Adding explicit `aria-label` support would give consumers control over the accessible name.

2. **`isDisabled` on links uses `aria-disabled` + `tabIndex={-1}` but does not prevent navigation (Item.tsx, lines 274-288):**
   When `href` is provided and `isDisabled` is true, the link renders with `aria-disabled` and `tabIndex={-1}`, but there is no `onClick` handler to call `event.preventDefault()`. The link is styled with `pointer-events: none` (line 158) via the root element's `styles.disabled` class, but that only applies when `!hasParentRole` (line 321). Even when it does apply, `pointer-events: none` does not prevent keyboard activation -- a screen reader user can still activate the link. Additionally, native `<a>` elements do not support a `disabled` attribute, so `aria-disabled` is advisory only and does not actually prevent activation.

3. **`handleContainerClick` swallows clicks on nested interactive elements but does not handle keyboard activation (Item.tsx, lines 253-264):**
   The guard on line 259 checks `event.target.closest('button, a, input, select, textarea')` to avoid double-firing when a nested interactive element is clicked. This is good for mouse interaction, but the container `onClick` is also fired on keyboard activation (`Enter`/`Space` on the inner `<button>`), where `event.target` will be the `<button>` itself. This means keyboard activation of the inner button will be swallowed by the guard when `hasParentRole` is false (since `handleContainerClick` is used). In practice this is not currently triggered because the inner `<button>` has its own `onClick` that fires first and the event bubbles, but the container handler on line 329 would then also fire for keyboard events. The current code path produces a double-fire for keyboard activation on the button variant because: (a) the inner `<button onClick={onClick}>` fires `onClick`, and (b) the event bubbles to the container `onClick={handleContainerClick}`, which then checks `closest('button')` and bails. So the guard actually works correctly here, but this is subtle and fragile -- a comment would help.

4. **No `aria-disabled` on the inner `<button>` wrapper's parent when `role` is set (Item.tsx, lines 266-273):**
   When `hasParentRole` is true and `isDisabled` is true, the content renders as a plain `<span>` (line 267) with no interactive element inside. The root element gets `aria-disabled` (line 312), but no `tabIndex={-1}` or focus management is applied. This is acceptable because the parent composite widget (e.g., Combobox listbox) is expected to own focus, but it means `Item` itself does nothing to prevent activation in this code path -- the responsibility is entirely on the consumer.

5. **`aria-selected` is set unconditionally on the root when `isSelected` is true (Item.tsx, line 313):**
   `aria-selected` is only valid on certain roles (`option`, `row`, `tab`, `treeitem`, `gridcell`). When `Item` is rendered as a plain `<div>` with no `role`, setting `aria-selected` is invalid ARIA and may confuse assistive technologies. It should only be set when a compatible `role` is also present.

---

## Logic Bugs

1. **`handleContainerClick` does not prevent default for disabled links (Item.tsx, lines 253-264, 326-330):**
   When `isInteractive` is true (because `href` is set) and `isDisabled` is true, `handleContainerClick` is assigned to the container. The handler checks `isDisabled` and returns early (line 255), but the inner `<a>` element still exists in the DOM and is still clickable. The `styles.disabled` class applies `pointer-events: none` on the root (line 158-159), which prevents mouse clicks from reaching the link, but this relies entirely on CSS. If the CSS fails to load or is overridden, clicks will navigate. More importantly, as noted in accessibility concern #2, keyboard activation is not prevented.

2. **`ref` cast to `Ref<never>` (Item.tsx, line 332):**
   The ref is cast as `Ref<never>` to satisfy TypeScript because the root element type varies (`div | li | span`). This is a type-level escape hatch that suppresses legitimate type errors. If a consumer passes `Ref<HTMLDivElement>` but renders `as="li"`, the ref will point to an `HTMLLIElement` at runtime. This mismatch is unlikely to cause runtime errors (both are `HTMLElement` subclasses) but violates the type contract.

3. **`to` prop is conditionally passed to `LinkComponent` but `LinkComponent` may not accept it (Item.tsx, line 286):**
   `to={LinkComponent === 'a' ? undefined : href}` assumes that any custom `LinkComponent` accepts a `to` prop. If a custom link component uses a different prop name (e.g., `url`), the `to` prop will be silently ignored. This is documented behavior of the `LinkProvider` system, but worth noting that the check `LinkComponent === 'a'` is a runtime identity comparison against the string `'a'`, which works because `useLinkComponent` returns `'a'` as a literal when no provider is set.

---

## Unclear API

1. **`role` prop has non-obvious side effects (Item.tsx, lines 98-99, 266-273, 320-321, 325-330):**
   Setting `role` on `Item` changes multiple behaviors: (a) the content area renders as a plain `<span>` instead of a `<button>` or `<a>`, (b) the `styles.disabled` class is not applied to the root, and (c) `onClick` is attached directly to the root instead of through `handleContainerClick`. The JSDoc comment (lines 96-99) partially explains this ("click handling is attached to the root so parent composite widgets can own keyboard behavior"), but the full set of behavioral changes is not documented. A consumer passing `role="listitem"` might be surprised that disabled styling changes.

2. **`startAdornment` vs. `media` distinction is subtle (Item.tsx, lines 100-103, 80-82):**
   Both `startAdornment` and `media` render content before the label area. `startAdornment` renders as a direct flex child of the root (line 335), while `media` is wrapped in a `<span>` with flex-shrink (line 336). The difference is that `startAdornment` appears before `media` in the DOM. The JSDoc comments describe what each does, but neither explains when to use one over the other. Looking at consumers, only `ListItem` uses `startAdornment` (for list markers), suggesting this is an internal-only concern.

3. **`getMaxLines` helper auto-truncates string labels to 1 line (Item.tsx, lines 194-203):**
   When `labelLines` / `descriptionLines` are not explicitly set, string content defaults to 1-line truncation while ReactNode content defaults to 0 (no truncation). This asymmetry may surprise consumers who pass a long string label and find it truncated without explicitly opting in. The behavior is sensible as a default but is not documented on the `label` or `description` prop JSDoc.

---

## Missing Tests

1. **No test for `isHighlighted` styling:**
   The `isHighlighted` prop (line 65) applies `styles.highlighted` but is never tested. There is no assertion that the highlighted class is applied or that the visual state differs from default.

2. **No test for `isSelected` styling:**
   The test on line 84 checks `aria-selected` but does not verify that the `styles.selected` class is applied.

3. **No test for `align` prop:**
   The `align` prop controls vertical alignment of media and trailing slots (`'center'` vs `'start'`). Neither value is tested.

4. **No test for `density` prop:**
   The `density` prop (`'default'` vs `'compact'`) changes vertical padding. Neither value is tested.

5. **No test for `descriptionLines` / `labelLines` truncation:**
   The `getMaxLines` helper (lines 194-203) and the `maxLines` prop passed to `Text` are untested. Neither the auto-truncation behavior for strings nor explicit line counts are verified.

6. **No test for disabled link behavior:**
   The test on line 56 only checks the disabled button case. There is no test for `href` + `isDisabled`, which has different behavior (no native `disabled` attribute; uses `aria-disabled` and `tabIndex={-1}` instead).

7. **No test for `handleContainerClick` guard:**
   The logic on lines 258-261 that prevents double-firing when a nested interactive element (button, link, input) is clicked is untested.

8. **No test for `as` prop (polymorphic rendering):**
   The `as` prop supports `'div'`, `'li'`, and `'span'`. No test verifies that the correct element is rendered.

9. **No test for `className` or `style` passthrough:**
   These standard passthrough props are not tested.

10. **No test for `role` prop behavior:**
    The `role` prop changes the rendering strategy (plain `<span>` content, `onClick` on root). This complex branching logic is untested.

11. **No test for `startAdornment`:**
    The `startAdornment` slot is tested for presence (line 35) but not for its ordering relative to `media`.

---

## Missing Stories

1. **No story for `isDisabled` state:**
   The `isDisabled` prop is exposed in argTypes but has no dedicated story showing the disabled appearance for button, link, and static variants.

2. **No story for `isSelected` state:**
   The `isSelected` prop is exposed in argTypes but has no dedicated story.

3. **No story for `isHighlighted` state:**
   The `isHighlighted` prop is exposed in argTypes but has no dedicated story.

4. **No story for link variant (`href`):**
   There is no story demonstrating the link rendering path. The Interactive story uses `onClick` only.

5. **No story for `align="start"` with multi-line content:**
   The `align` prop is exposed in argTypes but never demonstrated. A story showing `align="start"` with a tall media element and multi-line description would clarify this prop's purpose.

6. **No story for `labelLines` / `descriptionLines` truncation:**
   The truncation behavior is a key feature of `Item` but is not demonstrated in any story.

7. **No story for `as` polymorphic rendering:**
   Using `Item` as `<li>` or `<span>` is not shown (though consumers like `ListItem` handle this internally).

8. **No story for `startAdornment`:**
   The `startAdornment` slot is not demonstrated. This is used by `ListItem` for markers, but having a story would clarify its purpose.

9. **No story showing combined states:**
   No story demonstrates the interaction of `isDisabled` + `isSelected`, `isHighlighted` + `isSelected`, or other state combinations that have distinct visual outcomes.

10. **No story for `role` prop behavior:**
    The `role` prop significantly changes rendering behavior. A story showing `Item` used inside a composite widget pattern (with `role="option"`) would help document this advanced use case.

---

## Additional Observations

- **Exports are clean.** The `index.ts` barrel file exports the component, all prop types, and the union types (`ItemAlign`, `ItemDensity`, `ItemElement`).
- **`displayName` is set** -- good for React DevTools.
- **The component is heavily consumed internally.** `Item` is used by `ListItem`, `RadioGroupItem`, `DropdownMenuItem`, and `SelectOption`. Changes to its API or behavior should be validated against all consumers.
- **`ComboboxItem` does NOT use `Item` internally** despite the similar name -- it has its own layout implementation. This is worth noting as a potential inconsistency.
- **The `ref` type is `Ref<HTMLElement>`** (line 90), which is the correct generic type given that the rendered element varies by `as`. However, consumer wrappers like `ListItem` declare `Ref<HTMLLIElement>` and pass it through, relying on the `Ref<never>` cast on line 332 to bridge the gap.
- **The eslint-disable on line 1** (`@eslint-react/static-components`) is correctly scoped and documented ("intentional polymorphism via as/link component props").
