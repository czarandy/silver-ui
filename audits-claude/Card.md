# Card Component Audit

**Files reviewed:**

- `src/components/Card/Card.tsx`
- `src/components/Card/Card.recipe.ts`
- `src/components/Card/Card.stories.tsx`
- `src/components/Card/Card.test.tsx`
- `src/components/Card/index.ts`

---

## Performance Problems

### 1. Duplicated `toSize` utility (minor)

- **File:** `Card.tsx`, line 53
- The `toSize` helper is copy-pasted identically in `Card.tsx`, `Center.tsx` (line 20), and `Stack.tsx` (line 73). This is not a runtime performance issue, but it increases bundle size marginally and creates a maintenance burden. Consider extracting to a shared `internal/toSize.ts` utility.

### 2. `paddingByStep` object re-created on every module parse (negligible)

- **File:** `Card.tsx`, lines 35-47
- This is a module-level constant, so it is only created once. No issue here. Included for completeness.

**Verdict:** No meaningful runtime performance concerns. The component is a thin wrapper around a styled `div` with no state, effects, or expensive computations.

---

## Accessibility Concerns

### 1. No semantic HTML or ARIA landmark support

- **File:** `Card.tsx`, lines 80-88
- The Card always renders a plain `<div>` with no `role` attribute. Cards are frequently used to represent distinct sections of content (e.g., a product card, a settings panel). Without an `as` prop or a `role` prop, consumers cannot make the Card render as a `<section>`, `<article>`, or `<aside>`, and cannot assign an ARIA role without wrapping in another element. Consider adding an optional `role` prop at minimum, or an `as` prop for polymorphic rendering.

### 2. No `aria-label` or `aria-labelledby` support

- **File:** `Card.tsx`, lines 21-33
- The props interface does not include `aria-label` or `aria-labelledby`. If a Card is given a landmark role (e.g., `role="region"`), it requires an accessible name. Even without the `role` prop suggested above, passing through arbitrary ARIA attributes would be beneficial.

### 3. `overflow: clip` / `overflow: auto` may hide focusable content

- **File:** `Card.recipe.ts`, line 6 (base: `overflow: 'clip'`) and line 37 (`overflow: 'auto'` when `hasFixedHeight` is true)
- When `overflow: clip` is active (no fixed height), any content that overflows the Card boundary is clipped and cannot be scrolled to. If that clipped content contains focusable elements (buttons, links, inputs), they become invisible but remain in the tab order, creating a keyboard trap. This is a potential WCAG 2.4.3 (Focus Order) violation depending on usage.
- When `hasFixedHeight` is true, `overflow: auto` is applied, which is correct for scrollable content, but the scrollable container itself has no `tabIndex` or `role="region"` with an accessible name, meaning keyboard-only users cannot scroll it without a focusable child inside.

---

## Logic Bugs

### 1. `hasFixedHeight` does not account for `minHeight`

- **File:** `Card.tsx`, line 70
- `const hasFixedHeight = height != null && height !== 'auto';`
- The Card accepts a `minHeight` prop (line 27), but `hasFixedHeight` only checks `height`. If a consumer sets `minHeight={200}` without `height`, the Card could still have constrained height (via CSS or parent layout) but will use `overflow: clip` instead of `overflow: auto`. This may cause content to be silently clipped. Consider whether `minHeight` should also trigger the `auto` overflow behavior, or document that `height` must be set for scrollable overflow.

### 2. Inline style spread order allows consumer to override CSS custom property

- **File:** `Card.tsx`, lines 71-78
- The `...style` spread comes after `'--card-padding'`, `width`, `height`, `maxWidth`, and `minHeight`. This means a consumer can override these via the `style` prop, including `--card-padding`. This could be intentional (escape hatch) or a subtle source of bugs if someone passes `style={{padding: '8px'}}` thinking it overrides the recipe padding (it would not -- the recipe uses `var(--card-padding)`, not the inline `padding` property). This is a minor API footgun worth documenting.

---

## Unclear API

### 1. `padding` prop type is `StackGap` (imported from Stack)

- **File:** `Card.tsx`, line 3 and line 28
- Reusing `StackGap` for Card padding works because the numeric steps happen to be the same, but the name `StackGap` is semantically misleading for padding. Consider creating a shared `SpacingStep` type alias, or defining a `CardPadding` type locally.

### 2. `SizeValue` is `number | string` -- very permissive

- **File:** `Card.tsx`, line 3 (imported from Stack)
- `SizeValue = number | string` accepts any string. Consumers could pass nonsense values like `"banana"`. This is a minor concern since CSS will simply ignore invalid values, but it reduces type safety. Consider a branded type or documented constraint.

### 3. No `onClick` or interactive variant

- **File:** `Card.tsx`, lines 21-33
- Cards are frequently interactive (clickable cards that navigate somewhere). The current API has no affordance for click handling, hover states, or cursor changes. This is a common pattern in card component libraries. If this is intentionally a layout-only card, it should be documented as such.

---

## Missing Tests

### 1. No test for `padding` prop

- **File:** `Card.test.tsx`
- The `padding` prop is a core feature of the Card (with a non-trivial mapping from step values to CSS custom properties), but no test verifies that setting `padding={6}` results in `--card-padding: 1.5rem` on the element.

### 2. No test for `variant` prop

- **File:** `Card.test.tsx`
- There are 13 variant options, but no test verifies that any variant produces the expected class name or visual result. At minimum, test that the default variant and one non-default variant produce different class names.

### 3. No test for `hasFixedHeight` overflow behavior

- **File:** `Card.test.tsx`
- The `hasFixedHeight` logic (line 70 of `Card.tsx`) changes overflow behavior, but this is not tested. A test should verify that setting `height={200}` causes the recipe to receive `hasFixedHeight: true`, or that the rendered element has the expected overflow style.

### 4. No test for `minHeight` prop

- **File:** `Card.test.tsx`
- The sizing test (line 12-24) checks `height`, `maxWidth`, and `width`, but not `minHeight`, even though it is accepted as a prop.

### 5. No test for string `SizeValue` handling

- **File:** `Card.test.tsx`
- The `toSize` function handles both `number` (appends `px`) and `string` (pass-through) values. The test only exercises `number` values. A test with `width="50%"` or `width="10rem"` would verify string pass-through.

### 6. No test for `displayName`

- **File:** `Card.tsx`, line 91
- `Card.displayName = 'Card'` is set but never verified. While low priority, this is a one-liner to add.

---

## Missing Stories

### 1. Variants story is incomplete

- **File:** `Card.stories.tsx`, lines 44-57
- The `Variants` story only shows 6 of the 13 available variants: `default`, `muted`, `blue`, `green`, `red`, `yellow`. Missing from the grid: `transparent`, `cyan`, `gray`, `orange`, `pink`, `purple`, `teal`.

### 2. No story for padding variations

- **File:** `Card.stories.tsx`
- The `padding` prop has 11 possible step values (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10), but no story demonstrates different padding levels. A "Padding" story showing several steps side-by-side would be valuable for visual review.

### 3. No story for sizing props (`height`, `maxWidth`, `minHeight`, `width`)

- **File:** `Card.stories.tsx`
- None of the sizing props have dedicated stories. A story showing a Card with constrained `height` and scrollable overflow (`hasFixedHeight` behavior) would be particularly useful since it demonstrates non-obvious behavior.

### 4. No story for fixed-height scrollable Card

- **File:** `Card.stories.tsx`
- The `hasFixedHeight` recipe variant switches overflow from `clip` to `auto`, but no story demonstrates this. A story with `height={200}` and content taller than 200px would show the scrolling behavior.

### 5. No story for custom styling / className composition

- **File:** `Card.stories.tsx`
- No story shows passing `className` or `style` to customize the Card, which is a common consumer use case.

---

## Summary

The Card component is clean, simple, and well-structured. The main areas for improvement are:

| Category        | Severity   | Count                  |
| --------------- | ---------- | ---------------------- |
| Performance     | Low        | 1 (duplicated utility) |
| Accessibility   | Medium     | 3                      |
| Logic Bugs      | Low-Medium | 2                      |
| Unclear API     | Low        | 3                      |
| Missing Tests   | Medium     | 6                      |
| Missing Stories | Medium     | 5                      |

**Top recommendations (by impact):**

1. Add tests for `padding`, `variant`, and `hasFixedHeight` -- these are core Card behaviors with zero test coverage.
2. Complete the Variants story to show all 13 variants, and add a Padding story.
3. Add a story for fixed-height scrollable content to demonstrate the `overflow: auto` behavior.
4. Consider adding a `role` prop to support accessible landmark semantics.
5. Extract `toSize` to a shared utility to eliminate triple-duplication across Card, Center, and Stack.
