# Center Component Audit

**Audited files:**

- `src/components/Center/Center.tsx`
- `src/components/Center/Center.recipe.ts`
- `src/components/Center/Center.stories.tsx`
- `src/components/Center/Center.test.tsx`
- `src/components/Center/index.ts`

---

## Performance Problems

**No significant issues found.**

The component is a thin wrapper around a `<div>` with recipe-generated class names. The `cx` utility is a lightweight `filter(Boolean).join(' ')` and the `centerRecipe` call from Panda CSS `cva` is designed for static variant resolution. No unnecessary re-renders, memoization concerns, or expensive computations are present.

Minor note: The `toSize` helper (line 20-22 of `Center.tsx`) is redefined identically in `Stack.tsx` (line 73). This is not a performance concern, but a DRY concern. Consider extracting it to a shared utility in `src/internal/`.

---

## Accessibility Concerns

1. **No semantic landmark or role support** (`Center.tsx`, lines 35-43). The component renders a plain `<div>` with no option to change the rendered element, add an ARIA role, or pass `aria-label`/`aria-labelledby`. For a layout primitive this is often acceptable, but consumers who use `Center` as a page-level centering container may benefit from an `as` prop or at least accepting `role` and `aria-*` attributes. Currently arbitrary HTML attributes (like `role`, `aria-label`, `id`, `tabIndex`) are silently dropped because the props interface is an explicit allowlist rather than extending `React.HTMLAttributes<HTMLDivElement>`.

2. **No `id` prop support** (`Center.tsx`, lines 8-18). The props interface does not include `id`, which is commonly needed for linking labels, anchors, or accessibility references.

**Recommendation:** Either extend `CenterProps` from `React.HTMLAttributes<HTMLDivElement>` (with explicit picks or omits as needed), or at minimum add `role`, `aria-label`, `aria-labelledby`, and `id` to the props interface.

---

## Logic Bugs

**No logic bugs found.** The component correctly:

- Defaults `axis` to `'both'` and `isInline` to `false`.
- Converts numeric `width`/`height` to `px` strings via `toSize`.
- Spreads `style` after `width`/`height`, allowing consumer overrides.
- Merges class names via `cx`.

One potential gotcha (not a bug): passing `width` or `height` as a prop and also setting the same property in `style` will result in the `style` value winning because `...style` spreads after `width`/`height` in the style object (line 40). This is actually correct behavior, but could be documented.

---

## Unclear API

1. **`SizeValue` imported from `../Stack`** (`Center.tsx`, line 3). This creates a coupling where `Center` depends on `Stack` for a simple type alias (`number | string`). If `Stack` is tree-shaken or reorganized, this import breaks. `SizeValue` should live in a shared types file (e.g., `src/internal/types.ts`) and be re-exported from both components.

2. **`isInline` naming** (`Center.tsx`, line 14). The prop name is clear, but it would benefit from a JSDoc comment explaining that it switches the outer container from `display: flex` to `display: inline-flex`.

3. **`toSize` is unexported and undocumented** (`Center.tsx`, line 20). This is a private utility and that is fine, but it silently accepts arbitrary strings (e.g., `"auto"`, `"50%"`, `"invalid-garbage"`). A JSDoc comment on `SizeValue` or `toSize` clarifying accepted string formats would improve the developer experience.

---

## Missing Tests

1. **No test for `axis` variants.** The tests never assert behavior when `axis="horizontal"` or `axis="vertical"` is passed. The default `axis="both"` is implicitly tested but not explicitly verified via class assertion. This is the primary prop of the component and should have dedicated test cases verifying the correct CSS classes are applied for each axis value.

2. **No test for `width`/`height` as string values.** The test at line 28-33 only tests numeric values (`height={200}`, `width={300}`). String values like `"100%"` or `"auto"` are not tested, even though the `toSize` function has a branch for strings.

3. **No test for `isInline` combined with other props.** The `isInline` test (line 13-20) does not verify that other centering behavior is preserved when `isInline` is true.

4. **No test for `style` override behavior.** There is no test verifying that a `style` prop value for `width` or `height` overrides the dedicated `width`/`height` props.

5. **No snapshot or visual regression test.** For a layout component, visual regression tests (or at least snapshot tests) would catch unintended styling changes.

---

## Missing Stories

1. **Only one story (`Basic`).** The stories file (`Center.stories.tsx`, lines 24-30) has a single story that demonstrates `axis="both"` with a background. Key props lack dedicated stories:
   - **`axis="horizontal"`** -- Should show content centered only horizontally with visible vertical offset.
   - **`axis="vertical"`** -- Should show content centered only vertically with visible horizontal offset.
   - **`isInline`** -- Should demonstrate inline centering behavior alongside other inline elements.
   - **`width` and `height`** -- While these are controllable via Storybook args, a dedicated story showing explicit sizing vs. container-based sizing would help.

2. **No composition story.** There is no story showing `Center` nested inside other layout components (e.g., inside a `Stack`) or with multiple children to demonstrate how it handles content overflow.

3. **No edge-case story.** No story for when `Center` has no explicit dimensions and must derive size from its parent, which is a common real-world usage.

---

## Additional Observations

- **`index.ts` exports are correct and complete.** Both the component, its props types, the recipe, and the variant types are exported.
- **`displayName` is set** (`Center.tsx`, line 46), which is good for React DevTools.
- **Duplicated `toSize` utility.** As noted above, `Center.tsx` line 20-22 and `Stack.tsx` line 73 contain identical `toSize` functions. This should be extracted to `src/internal/toSize.ts` or similar.
