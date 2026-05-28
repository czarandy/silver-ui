# Stack Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/Stack/Stack.tsx`
- `src/components/Stack/HStack.tsx`
- `src/components/Stack/VStack.tsx`
- `src/components/Stack/Stack.recipe.ts`
- `src/components/Stack/Stack.stories.tsx`
- `src/components/Stack/Stack.test.tsx`
- `src/components/Stack/index.ts`

---

## Performance Problems

**No significant performance issues found.**

- The component is lightweight: no state, no effects, no memoization needed. It renders a single element via `createElement`. The recipe call `stackRecipe({direction, wrap})` generates a class name from pre-compiled Panda CSS output, which is effectively a map lookup at runtime.
- `gapByStep`, `mainAlignValues`, and `crossAlignValues` are module-level constants and are not re-created on each render.
- The inline `stackStyle` object (line 102, `Stack.tsx`) is re-created every render, but this is standard practice for style objects and not a concern for a layout primitive.

---

## Accessibility Concerns

1. **No semantic role or ARIA attributes support (Stack.tsx, line 25-41):**
   The `StackProps` interface accepts `element` for polymorphic rendering (e.g., `<nav>`, `<section>`) but does not forward `role`, `aria-label`, `aria-labelledby`, or other ARIA attributes. Consumers cannot pass arbitrary HTML attributes (no `...rest` spread on the rendered element). This limits the ability to make Stack-based layouts accessible. The `element` prop handles some cases (e.g., rendering as `<nav>`), but a `<div>` Stack used as a toolbar, for example, cannot receive `role="toolbar"`.

2. **HStack and VStack also block arbitrary HTML attributes (HStack.tsx line 30, VStack.tsx line 30):**
   While HStack and VStack use `...props` rest spread, these rest props are typed as `Omit<StackProps, ...>`, so they still do not include standard HTML attributes like `role` or `aria-*`. The spread only passes through the remaining StackProps (e.g., `children`, `element`, `gap`, `width`, `height`, `wrap`).

**Recommendation:** Either extend `StackProps` to include `React.HTMLAttributes<HTMLElement>` (or at least `role` and common `aria-*` props), or add an explicit rest-spread of unknown props onto the rendered element.

---

## Logic Bugs

1. **Silent fallthrough for invalid alignment values (Stack.tsx, lines 105-111):**
   The `hAlign` and `vAlign` props on `Stack` accept the union type `StackAlignment = StackMainAlignment | StackCrossAlignment`. When a cross-alignment value (e.g., `'stretch'`) is passed where a main-alignment value is expected (via `justifyContent`), the `in` check on line 105 silently produces `undefined`, so the CSS property is simply omitted. This is arguably correct behavior, but it can be confusing for consumers -- passing `hAlign="stretch"` on a horizontal Stack will silently do nothing for `justifyContent`. The types technically permit it because `hAlign` accepts the full `StackAlignment` union.

2. **Double-mapping in HStack/VStack obscures alignment logic (HStack.tsx lines 37-38, VStack.tsx lines 37-38):**
   `HStack` maps `justify` to `hAlign` and `align` to `vAlign` before passing to `Stack`, which then maps `hAlign`/`vAlign` back to `justifyContent`/`alignItems` via the direction-aware resolution logic (Stack.tsx lines 94-101). This two-layer mapping works correctly, but the `align` prop on `Stack` itself (line 26) serves a different role than `align` on `HStack`/`VStack`. On `Stack`, `align` is a cross-axis alias that is direction-dependent; on `HStack`, `align` always means vertical (cross-axis). This is not a bug per se, but the same prop name having different semantics across the three components is error-prone.

3. **`StackProps.align` is overridden by `HStack.align` and `VStack.align` but both re-export `StackProps.align` type (HStack.tsx line 13, VStack.tsx line 13):**
   `HStackProps` re-declares `align?: StackCrossAlignment` which shadows the inherited `align?: StackCrossAlignment` from `StackProps`. This works because the types happen to match, but it would silently break if `StackProps.align` were ever changed.

---

## Unclear API

1. **Confusing overlap between `align`/`justify` and `hAlign`/`vAlign` on `Stack` (Stack.tsx, lines 26-38):**
   `Stack` accepts four alignment props: `align`, `justify`, `hAlign`, and `vAlign`. The resolution logic (lines 94-101) has `hAlign`/`vAlign` take precedence over the direction-dependent `align`/`justify`. This is a lot of surface area for a single concern. Documentation or JSDoc comments explaining the precedence would help.

2. **`StackAlignment` type is exported but arguably should not be (index.ts, line 6):**
   `StackAlignment = StackMainAlignment | StackCrossAlignment` is a type union that makes it easy to pass a main-axis value where a cross-axis value is expected (and vice versa). The individual types `StackMainAlignment` and `StackCrossAlignment` are more precise. Exporting the union invites misuse.

3. **`element` prop vs. industry-standard `as` prop (Stack.tsx, line 31):**
   Most React component libraries (Chakra, Radix, Mantine) use `as` for the polymorphic element prop. Using `element` is unconventional and may surprise consumers familiar with other libraries.

---

## Missing Tests

1. **No test for the base `Stack` component with `gap` prop:**
   The test file verifies children rendering and polymorphic elements but never asserts that `gap` produces the correct inline style.

2. **No test for `width` or `height` props:**
   The `toSize` utility (Stack.tsx line 73) converts numbers to `px` strings and passes strings through. Neither path is tested.

3. **No test for `wrap` prop:**
   The `wrap` prop is passed to the recipe but never verified in tests.

4. **No test for `hAlign`/`vAlign` overriding `align`/`justify` on `Stack`:**
   The precedence logic (Stack.tsx lines 94-101) where `hAlign`/`vAlign` override `align`/`justify` is untested.

5. **No test for `VStack` with `ref`, `className`, `style`, or `data-testid`:**
   There is a test for `HStack` forwarding these props (line 56), but no equivalent for `VStack`.

6. **No test for `Stack` with `direction="horizontal"`:**
   The base `Stack` is only tested with its default vertical direction.

7. **No test for invalid/edge-case alignment combinations:**
   For example, passing `hAlign="stretch"` on a horizontal Stack (which silently does nothing for `justifyContent`).

---

## Missing Stories

1. **No story for `Stack` (base component):**
   The stories file only demonstrates `HStack` and `VStack`. The base `Stack` component with its `direction` prop has no story.

2. **No story demonstrating `gap` variations:**
   Neither the horizontal nor vertical story shows different gap values side by side. Since `gap` is one of the most frequently used props, a story showing the scale (0 through 10) would be valuable.

3. **No story for `wrap` behavior:**
   The `wrap` and `wrap-reverse` options are not demonstrated. This is particularly useful to show how items flow when a Stack overflows.

4. **No story for alignment props (`align`, `justify`, `hAlign`, `vAlign`):**
   The horizontal story uses `align="center"` but there is no story systematically showing the different alignment options or the difference between `justify` and `align`.

5. **No story for the `element` (polymorphic) prop:**
   Using `Stack` as `<nav>`, `<section>`, `<ul>`, etc. is a key feature with no visual demonstration.

6. **No story for `width`/`height` props:**
   These size props are not demonstrated.

7. **No story for nested Stacks:**
   A common real-world pattern (e.g., a VStack containing HStacks) is not shown.

8. **Meta component is `HStack`, not `Stack`:**
   The stories file sets `component: HStack` (line 7), which means Storybook's auto-generated controls/docs panel will only reflect `HStackProps`, not the full `StackProps`. This is misleading since the story title is `Components/Stack`.

---

## Additional Observations

- **`cx` utility is minimal but sufficient.** The internal `cx` function (src/internal/cx.ts) is a simple class-name joiner. It works correctly for this use case.
- **`toSize` returns `number | string | undefined` (Stack.tsx line 73)** but is only used for inline styles, where `number` values in React are treated as pixels for some properties but not all. The function converts numbers to `${value}px`, so this is handled correctly. However, the return type annotation includes `number` as a possibility that can never actually be returned (it always returns `string` or `undefined`). This is a minor type inaccuracy.
- **Exports are clean.** The `index.ts` barrel file exports all components, props interfaces, and types -- well organized.
- **`displayName` is set on all three components** -- good for React DevTools debugging.
- **`minW: 0` in the recipe base (Stack.recipe.ts, line 6)** is a good practice to prevent flex children from overflowing their container.
