# Divider Component Audit

Audited files:

- `src/components/Divider/Divider.tsx`
- `src/components/Divider/Divider.recipe.ts`
- `src/components/Divider/Divider.stories.tsx`
- `src/components/Divider/Divider.test.tsx`
- `src/components/Divider/index.ts`

---

## Performance

**No significant issues found.**

- The component is a pure function with no hooks, side effects, or expensive computations. This is appropriate for a presentational divider.
- The `styles` object is declared at module scope (lines 47-83 of `Divider.tsx`), so `css()` calls execute once at import time rather than on every render. This is correct.
- The `cx` utility is lightweight (filter + join). No memoization is needed here.
- The `dividerRecipe` is also module-scoped and evaluated once. No concerns.
- `React.memo` is not used, which is fine. Divider is cheap to render and typically does not receive new props frequently enough to justify the comparison overhead.

---

## Accessibility

### Issue 1 (Medium): Label with `label` prop changes separator semantics but lacks `aria-label`

**File:** `Divider.tsx`, lines 85-129

When a `label` prop is provided, the divider renders visible text inside the separator. Per WAI-ARIA, a separator with a label becomes a "labeled separator," and screen readers need a way to announce that label. Currently, the visible label text is inside a plain `<div>` that is a child of the `role="separator"` element, so screen readers may or may not read it depending on the implementation.

**Recommendation:** Consider adding `aria-label={typeof label === 'string' ? label : undefined}` to the root when a string label is provided, or ensure the label `<div>` has an `id` and connect it via `aria-labelledby`.

### Issue 2 (Low): No `aria-label` prop exposed for custom accessible names

**File:** `Divider.tsx`, lines 12-45 (DividerProps interface)

The component does not accept an `aria-label` or `aria-labelledby` prop. Consumers who need to provide a custom accessible name for the separator have no way to do so short of using `className` hacks or wrapping the component.

**Recommendation:** Add optional `aria-label?: string` to `DividerProps` and forward it to the root element.

### Issue 3 (Info): Decorative dividers could use `role="none"`

**File:** `Divider.tsx`, line 115

All dividers unconditionally receive `role="separator"`. When a divider is purely decorative (e.g., a thin line between paragraphs with no semantic grouping intent), `role="none"` or `role="presentation"` would be more appropriate so screen readers skip it entirely. However, since this is a common pattern in component libraries and the current behavior is not incorrect, this is informational only.

---

## Logic Bugs

**No logic bugs found.**

- The `label != null` check (line 118) correctly handles both `undefined` and `null`, and avoids rendering an extra label container for falsy values like `0` or `""` only when explicitly `null`/`undefined`. This is intentional: `label={0}` or `label={""}` would render, but that matches the `ReactNode` type semantics.
- The `cx` utility correctly filters out `false` values from conditional class expressions (lines 96-99, 105-112).
- Default prop values (`orientation = 'horizontal'`, `variant = 'subtle'`, `isFullBleed = false`) are consistent with the recipe's `defaultVariants`.

---

## Unclear API

### Issue 1 (Low): `variant` is split across recipe and inline styles

**File:** `Divider.recipe.ts` (lines 1-27) and `Divider.tsx` (lines 47-55)

The `variant` prop (`subtle` | `strong`) is not handled in the Panda CSS recipe at all. Instead, it is handled via conditional inline `css()` classes (`styles.line` vs `styles.lineStrong`) in `Divider.tsx`. The recipe only handles `orientation`. This split means the recipe's `RecipeVariantProps` type (`DividerVariants`) does not include `variant`, which could confuse contributors who expect all visual variants to live in the recipe.

**Recommendation:** Consider moving the `variant` into the recipe as a proper variant axis, or add a comment explaining why it is handled separately (e.g., because it applies to the inner line elements rather than the root).

### Issue 2 (Info): `isFullBleed` depends on undocumented CSS custom properties

**File:** `Divider.tsx`, lines 75-82

The `isFullBleed` feature relies on `--container-padding-inline-start`, `--container-padding-inline-end`, `--container-padding-block-start`, and `--container-padding-block-end` CSS custom properties being set by a parent container. This contract is not documented in the prop's JSDoc or elsewhere in this component's code. Consumers who enable `isFullBleed` without a parent that sets these variables will get `0px` fallbacks (which means no bleed at all), which may be confusing.

**Recommendation:** Document the required CSS custom properties in the `isFullBleed` JSDoc comment, or link to the container component that provides them.

---

## Missing Tests

### Issue 1 (High): No test for `variant` prop

**File:** `Divider.test.tsx`

The `variant` prop (`subtle` | `strong`) is not tested at all. There is no assertion that `variant="strong"` applies the stronger background color class.

### Issue 2 (High): No test for `isFullBleed` prop

**File:** `Divider.test.tsx`

The `isFullBleed` prop is not tested. There is no assertion that `isFullBleed` applies the full-bleed CSS class to the root element.

### Issue 3 (Medium): No test for vertical orientation rendering

**File:** `Divider.test.tsx`

The test at line 7 checks that `aria-orientation="vertical"` is set, but does not verify that the vertical layout class is applied. There is also no test for a vertical divider with a label, which applies `styles.verticalLabel`.

### Issue 4 (Medium): No test for label with vertical orientation

**File:** `Divider.test.tsx`

There is no test that a label rendered inside a vertical divider receives the `verticalLabel` class (py instead of px padding).

### Issue 5 (Low): No test for default prop values

**File:** `Divider.test.tsx`

There is no test verifying that a bare `<Divider />` renders with `aria-orientation="horizontal"` (the default). The existing orientation test only checks the non-default `vertical` value.

---

## Missing Stories

### Issue 1 (High): No story for `isFullBleed`

**File:** `Divider.stories.tsx`

The `isFullBleed` prop has no dedicated story. This is a visually significant prop that requires a parent container with padding to demonstrate correctly. Without a story, it is impossible to visually verify the full-bleed behavior in Storybook.

**Recommendation:** Add a `FullBleed` story that wraps the Divider in a container with padding and the required CSS custom properties.

### Issue 2 (Medium): No story for vertical orientation

**File:** `Divider.stories.tsx`

While `orientation` is available as a Storybook control, there is no dedicated `Vertical` story. Vertical dividers require a parent with a defined height to display correctly, so the default `Basic` story with `orientation="vertical"` via controls may not render well without a wrapper.

**Recommendation:** Add a `Vertical` story with a parent container that has a fixed height and horizontal flex layout to demonstrate the vertical divider properly.

### Issue 3 (Medium): No story for `variant="strong"`

**File:** `Divider.stories.tsx`

There is no dedicated story for the `strong` variant. While it is available via controls, a side-by-side comparison story showing `subtle` vs `strong` would help designers and developers see the visual difference.

### Issue 4 (Low): No story for vertical divider with label

**File:** `Divider.stories.tsx`

The `WithLabel` story only demonstrates a horizontal label. A vertical divider with a label has distinct padding behavior (`py` instead of `px`) that should be visually verified.

### Issue 5 (Info): `isFullBleed` not listed in argTypes

**File:** `Divider.stories.tsx`, lines 4-21

The `isFullBleed` prop is not listed in `argTypes`, so Storybook will auto-generate a boolean toggle for it, but there is no explicit control configuration. This is minor since the auto-generated control works fine for booleans.

---

## Summary

| Category        | Critical | High | Medium | Low | Info |
| --------------- | -------- | ---- | ------ | --- | ---- |
| Performance     | 0        | 0    | 0      | 0   | 0    |
| Accessibility   | 0        | 0    | 1      | 1   | 1    |
| Logic Bugs      | 0        | 0    | 0      | 0   | 0    |
| Unclear API     | 0        | 0    | 0      | 1   | 1    |
| Missing Tests   | 0        | 2    | 2      | 1   | 0    |
| Missing Stories | 0        | 1    | 2      | 1   | 1    |

The component is well-implemented with no logic bugs or performance concerns. The main gaps are in test and story coverage: the `variant`, `isFullBleed`, and vertical-with-label scenarios are untested and lack dedicated stories. The accessibility concern around labeled separators is worth addressing but is not a blocker.
