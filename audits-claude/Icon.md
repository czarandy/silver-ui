# Icon Component Audit

Audited files:

- `src/components/Icon/Icon.tsx`
- `src/components/Icon/Icon.stories.tsx`
- `src/components/Icon/Icon.test.tsx`
- `src/components/Icon/index.ts`

---

## Performance

**No significant issues found.**

- The `styles` object is declared at module scope (lines 68-102 of `Icon.tsx`), so `css()` calls execute once at import time rather than on every render. This is correct.
- The component is a pure function with no hooks, state, or side effects. This is appropriate for an icon wrapper.
- The `cx` utility is lightweight (filter + join). No memoization is needed.
- `React.memo` is not used, which is fine. Icon is cheap to render and the cost of the shallow comparison would likely exceed the cost of re-rendering.
- The component does not create any objects or arrays inline that would cause unnecessary child re-renders, since it has no children.

---

## Accessibility

### Issue 1 (Low): `aria-labelledby` not considered for accessible name detection

**File:** `Icon.tsx`, lines 120 and 131

The component checks only `props['aria-label']` to decide whether the icon is decorative (`aria-hidden="true"`) or semantic (`role="img"`). If a consumer provides `aria-labelledby` instead of `aria-label`, the icon would still be marked as decorative with `aria-hidden="true"`, hiding it from assistive technology even though it has an accessible name via `aria-labelledby`.

**Recommendation:** Expand the check to `props['aria-label'] == null && props['aria-labelledby'] == null`.

### Issue 2 (Info): `focusable="false"` is hardcoded

**File:** `Icon.tsx`, line 128

The `focusable="false"` attribute is set unconditionally. This is correct behavior for decorative icons and follows the SVG accessibility best practice of preventing focus in IE/Edge legacy. However, it is set before `{...props}` on line 135, so a consumer could override it, which is acceptable. No action needed; noted for completeness.

### Issue 3 (Info): Good pattern -- conditional `aria-hidden` and `role="img"`

The automatic toggling between `aria-hidden="true"` (decorative) and `role="img"` (semantic) based on the presence of `aria-label` is a well-implemented accessibility pattern. No issues here.

---

## Logic Bugs

### Issue 1 (Medium): `{...props}` spread can silently override computed ARIA attributes

**File:** `Icon.tsx`, lines 119-136

The `{...props}` rest spread is applied last (line 135), after the explicitly computed `aria-hidden` (line 120) and `role` (line 131). Since `aria-hidden` and `role` are not destructured out of `props`, a consumer who passes both `aria-label` and `aria-hidden={true}` would have the explicit `aria-hidden` override the component's computed value. This could lead to an icon with `aria-label="Home"` and `role="img"` but also `aria-hidden="true"`, which is contradictory.

More subtly, `className` (line 121), `height` (line 129), `width` (line 134), and `data-testid` (line 127) are explicitly set before the spread. While `className` and `data-testid` are destructured out of `...props`, `height` and `width` are only excluded at the TypeScript level via `Omit`. A JavaScript caller or `as any` cast could still pass them, and they would be silently overridden by... wait -- they would actually be overridden by `{...props}` since it comes last. But since they are `Omit`ted from the type, this is a very unlikely edge case.

**Recommendation:** Destructure `aria-hidden` and `role` out of `...props` (or move `{...props}` before the explicit attributes) to prevent accidental overrides of the component's accessibility logic.

### Issue 2 (Low): `strokeWidth` default of `2` is implicit and undocumented

**File:** `Icon.tsx`, line 114

The `strokeWidth` parameter is destructured with a default value of `2` but is not documented in the `IconProps` interface (lines 32-66). It is inherited from `SVGProps<SVGSVGElement>` via the `Omit` extension. The default of `2` matches Lucide's default, but consumers using non-Lucide SVG icons (which the `IconComponent` type allows via `SVGProps<SVGSVGElement>`) may be surprised by this behavior.

**Recommendation:** Add `strokeWidth` to the `IconProps` interface with a JSDoc comment noting the default and its relationship to Lucide conventions.

---

## Unclear API

### Issue 1 (Low): `IconComponent` type accepts both Lucide and plain SVG components but JSDoc says "Lucide"

**File:** `Icon.tsx`, lines 28-30 and line 52

The `IconComponent` type is `ComponentType<LucideProps | SVGProps<SVGSVGElement>>`, which allows both Lucide icon components and plain SVG components. However, the JSDoc for `icon` (line 52) says "Lucide icon component to render," and the component-level JSDoc (line 106) says "Renders a lucide icon." This could mislead consumers into thinking only Lucide icons are supported.

**Recommendation:** Update the JSDoc to clarify that any SVG component matching the `IconComponent` type is accepted, not just Lucide icons.

### Issue 2 (Info): No `title` prop for accessible tooltips

**File:** `Icon.tsx`, lines 32-66

The component does not expose a `title` prop, which is the SVG-native way to add a tooltip/accessible name. Since the component wraps an SVG element, some consumers might expect to pass `title` for a tooltip. However, `title` is available through the `SVGProps` extension via `...props`, so this is not a real limitation -- just not explicitly documented.

---

## Missing Tests

### Issue 1 (Medium): No test that `aria-labelledby` does NOT set `role="img"`

**File:** `Icon.test.tsx`

There is a test for `aria-label` toggling the decorative/semantic behavior (lines 13-24), but no test verifying the behavior when `aria-labelledby` is provided instead. This would expose the `aria-labelledby` gap noted in the Accessibility section.

### Issue 2 (Medium): No test for `strokeWidth` default

**File:** `Icon.test.tsx`

The test on line 79 verifies that an explicit `strokeWidth={1.5}` is forwarded, but there is no test asserting that the default `strokeWidth` of `2` is applied when none is provided. This default is a behavioral choice (matching Lucide's default) that should be covered.

### Issue 3 (Low): Size and color tests only assert presence, not class application

**File:** `Icon.test.tsx`, lines 26-68

The size and color variant tests iterate through all values and assert only `toBeInTheDocument()`. They do not verify that the correct CSS class is actually applied for each variant. This means if the `styles.size` or `styles.color` mappings were broken for a specific value (e.g., a typo in the `css()` call), the tests would still pass.

**Recommendation:** Assert that each variant applies its corresponding CSS class, or at minimum spot-check a representative value with a class assertion.

### Issue 4 (Low): No test for `data-testid` forwarding

**File:** `Icon.test.tsx`

While `data-testid` is used throughout the tests as a query mechanism, there is no explicit test that verifies `data-testid` is correctly forwarded. This is implicitly covered (the tests would fail if it were not forwarded), but a dedicated assertion would be clearer.

### Issue 5 (Low): No test for invalid/missing `icon` prop

**File:** `Icon.test.tsx`

There is no test verifying behavior when an invalid component is passed as `icon`. While TypeScript prevents this, a runtime guard or error boundary test could be valuable for consumers using JavaScript.

---

## Missing Stories

### Issue 1 (Medium): No story demonstrating `aria-label` (accessible/semantic icon)

**File:** `Icon.stories.tsx`

The accessibility behavior is a key feature: icons without `aria-label` are decorative (`aria-hidden="true"`), and icons with `aria-label` are semantic (`role="img"`). There is no story demonstrating an icon used as a meaningful image with `aria-label`. This makes it hard to verify the accessibility behavior in Storybook.

**Recommendation:** Add an `Accessible` or `WithAriaLabel` story showing an icon with `aria-label` set, possibly alongside a decorative icon for comparison.

### Issue 2 (Medium): No story for `strokeWidth`

**File:** `Icon.stories.tsx`

The `strokeWidth` prop (defaulting to `2`) is not demonstrated or exposed as a Storybook control. Since this prop affects visual appearance significantly (thin vs. thick strokes), it should have a story or at least be listed in `argTypes`.

**Recommendation:** Add `strokeWidth` to `argTypes` as a range control (e.g., `{control: {type: 'range', min: 0.5, max: 4, step: 0.5}}`), and/or add a `StrokeWidths` story showing different values side-by-side.

### Issue 3 (Low): No story for custom `className` or `style` overrides

**File:** `Icon.stories.tsx`

The component supports `className` and `style` props for customization, but there is no story demonstrating how to use them (e.g., applying a custom rotation, animation, or drop-shadow). This is a standard pattern in component libraries.

### Issue 4 (Info): `Default` story uses `color="primary"` instead of the component default

**File:** `Icon.stories.tsx`, line 66

The Storybook `args` set `color: 'primary'` as the default, but the component's actual default is `color: 'inherit'` (line 109 of `Icon.tsx`). This means the Default story does not represent the component's out-of-the-box behavior. This is a minor discrepancy but could confuse consumers checking Storybook to understand defaults.

**Recommendation:** Change the Storybook default to `color: 'inherit'` to match the component default, or add a comment explaining why `primary` was chosen for Storybook display purposes.

---

## Summary

| Category        | Critical | High | Medium | Low | Info |
| --------------- | -------- | ---- | ------ | --- | ---- |
| Performance     | 0        | 0    | 0      | 0   | 0    |
| Accessibility   | 0        | 0    | 0      | 1   | 2    |
| Logic Bugs      | 0        | 0    | 1      | 1   | 0    |
| Unclear API     | 0        | 0    | 0      | 1   | 1    |
| Missing Tests   | 0        | 0    | 2      | 3   | 0    |
| Missing Stories | 0        | 0    | 2      | 1   | 1    |

The Icon component is well-implemented overall. It follows good accessibility patterns (conditional `aria-hidden`/`role="img"`), has a clean API, and performs well with module-scoped styles. The primary concerns are: (1) the `{...props}` spread ordering can silently override the component's computed ARIA attributes, (2) test coverage checks variant presence but not correctness, and (3) stories do not demonstrate the accessibility behavior or `strokeWidth` customization. The `aria-labelledby` gap is a minor accessibility concern worth addressing.
