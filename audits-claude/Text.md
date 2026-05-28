# Text Component Audit

**Audited files:**

- `src/components/Text/Text.tsx`
- `src/components/Text/Heading.tsx`
- `src/components/Text/Text.recipe.ts`
- `src/components/Text/Text.stories.tsx`
- `src/components/Text/Heading.stories.tsx`
- `src/components/Text/Text.test.tsx`
- `src/components/Text/Heading.test.tsx`
- `src/components/Text/useTruncation.ts`
- `src/components/Text/index.ts`

---

## Performance Problems

1. **`useTruncation` runs for every Text/Heading instance, even when truncation is disabled** (`useTruncation.ts`, line 70-181; `Text.tsx`, line 136; `Heading.tsx`, line 100). The hook always creates a `ResizeObserver`, schedules animation frames, and wires up `useSyncExternalStore` even when `maxLines` is 0. While the `observeElement` function short-circuits at line 138 when `lines <= 0`, the hook still allocates a `storeRef`, `elementRef`, `frameRef`, `observerRef`, creates multiple `useCallback` closures, and runs the layout effect on every render. For a component as pervasive as `Text`, the overhead of these allocations on every instance adds up. Consider an early return pattern that returns a static no-op result when `maxLines <= 0`.

2. **ResizeObserver callback calls `publishState(getTruncationState(...))` synchronously** (`useTruncation.ts`, line 144-146). ResizeObserver callbacks fire synchronously during layout, and calling `publishState` triggers `useSyncExternalStore` listeners which schedule React re-renders. This is generally fine, but unlike the initial mount path (which uses `requestAnimationFrame` via `scheduleUpdate`), the ResizeObserver callback path does not batch via rAF. This means rapid resize events (e.g., window drag) will trigger a React re-render for every ResizeObserver notification. Consider debouncing through `scheduleUpdate` instead of calling `publishState` directly.

3. **Duplicated `styles` object and `getMaxLinesVariant` function** (`Text.tsx`, lines 95-100 and 102-112; `Heading.tsx`, lines 61-66 and 68-78). The `styles.tooltipContent` CSS object and `getMaxLinesVariant` helper are identical in both files. These should be extracted to a shared module. While not a runtime performance issue (both are module-level constants), it is a maintenance cost.

---

## Accessibility Concerns

1. **Truncation tooltip is hover-only with no keyboard accessibility** (`Text.tsx`, lines 174-186; `Heading.tsx`, lines 140-153). The truncated text tooltip is rendered via `<Tooltip anchorRef={...}>` which is anchored to the text element. The text element itself is a `<span>`, `<p>`, or `<div>` -- none of which are focusable by default. This means keyboard-only users cannot access the full text content when it is truncated. The `title` attribute (line 169 / line 135) provides a native fallback, but its behavior is browser-dependent and often not announced by screen readers. Consider adding `tabIndex={0}` and `role="text"` (or wrapping in a focusable element) when truncation is active so that the tooltip can be triggered via keyboard focus.

2. **`aria-label` not applied for truncated content** (`Text.tsx`, line 148-170). When text is truncated, screen readers will read the visually truncated content. While the `title` attribute is set, not all assistive technologies honor `title`. Consider setting `aria-label={truncation.fullText}` when the text is truncated so screen readers announce the complete text.

3. **`disabled` color has no additional indication** (`Text.recipe.ts`, line 74). The `disabled` color variant only changes the text color to `silver-neutral.400`. There is no `aria-disabled` or any visual indicator beyond color (such as opacity or strikethrough) to communicate the disabled state. Color alone is not sufficient per WCAG 1.4.1 (Use of Color). This may be intentional if the parent component manages `aria-disabled`, but it is worth documenting.

4. **`as="label"` without `htmlFor` validation** (`Text.tsx`, line 127). When `as="label"` is used, the component renders a `<label>` element. There is no enforcement or warning if `htmlFor` is not provided. An orphaned `<label>` with no associated control is an accessibility anti-pattern. Consider a TypeScript overload or runtime warning when `as="label"` is used without `htmlFor`.

---

## Logic Bugs

1. **Type mismatch: `element.textContent` is `string | null` but `fullText` is typed `string`** (`useTruncation.ts`, line 65). `element.textContent` can return `null` (e.g., if the element is a document or doctype node), but the `TruncationState.fullText` field is typed as `string` (line 20). While `HTMLElement.textContent` will almost always return a string in practice, this is technically unsound and could cause the tooltip to render `null` as its content. The assignment should use a nullish coalescing fallback: `fullText: element.textContent ?? ''`.

2. **`maxLines` accepts negative numbers without validation** (`Text.tsx`, line 120; `useTruncation.ts`, line 60). The `maxLines` prop is typed as `number` with no constraints. Passing a negative value (e.g., `maxLines={-1}`) causes `getMaxLinesVariant` to return `'none'` (correct), and `getTruncationState` to short-circuit (correct), but `resolvedWordBreak` will not get the `maxLines === 1` special case (correct) and `resolvedDisplay` will not be forced to `'block'` (correct). So while this does not crash, the behavior of negative values is implicit and undocumented. Consider clamping or validating.

3. **`hasTruncateTooltip` defaults to `true` even when `maxLines` is 0** (`Text.tsx`, line 122; `Heading.tsx`, line 87). This is not a bug because `isTooltipEnabled` requires `maxLines > 0` (line 144 / line 107), but the default value is misleading. A consumer reading the API might expect that setting `hasTruncateTooltip={false}` on a non-truncated Text does something. This is a minor clarity issue.

4. **`style` prop spreads after `lineClampStyle`, allowing consumers to accidentally override `-webkit-line-clamp`** (`Text.tsx`, line 168; `Heading.tsx`, line 134). If a consumer passes `style={{ WebkitLineClamp: 5 }}` while `maxLines={2}`, the consumer's value wins silently. This could lead to visual inconsistency between the CSS class (which sets `-webkit-box-orient: vertical`) and the actual line clamp value. Consider spreading `lineClampStyle` after `style`, or documenting that `style` takes precedence.

---

## Unclear API

1. **`type` and `size` props on Text interact non-obviously** (`Text.tsx`, lines 16-37; `Text.recipe.ts`, lines 9-70). The `type` prop sets a default `fontSize` (e.g., `body` sets `md`, `large` sets `lg`), but the `size` prop can override it. The `size` variant only sets `fontSize` and does not adjust `lineHeight` or `fontWeight`, meaning `<Text type="body" size="3xl">` will have `3xl` font size but `normal` line height -- which may look incorrect. The interaction is not documented and could be confusing for consumers. Consider documenting that `size` is a font-size-only override, or having `size` adjust line height proportionally.

2. **`hasCapsize` prop name does not describe its effect** (`Text.tsx`, line 64; recipe line 106-111). "Capsize" is a library/concept for trimming whitespace above capital letters and below the baseline. Consumers unfamiliar with capsize will not understand what this prop does. A JSDoc comment on the prop explaining the visual effect (trims leading/trailing whitespace from text bounding box) would help.

3. **`wordBreak` defaults differ based on `maxLines`** (`Text.tsx`, lines 138-139). When `maxLines === 1`, `wordBreak` defaults to `'break-all'`; otherwise it defaults to `'break-word'`. This implicit behavior is undocumented and may surprise consumers who expect consistent word-break behavior regardless of truncation settings.

4. **Heading `type` prop is optional and overlaps with `level`** (`Heading.tsx`, line 43; `Text.recipe.ts`, lines 155-176). The `type` prop (`display-1` | `display-2` | `display-3`) overrides the font size set by `level`. The relationship between `level` and `type` is not documented. A consumer might wonder: if I set `level={3}` and `type="display-1"`, which font size wins? (Answer: `type` wins because it is applied as a separate variant that overrides `fontSize`.)

5. **`TextElement` type includes heading tags** (`Text.tsx`, line 47). The `as` prop allows `h1`, `h2`, `h3` but there is also a separate `Heading` component for headings. This creates two paths to render headings with different APIs, styling, and behavior. Consider removing heading elements from `TextElement` or documenting when to use `Text as="h1"` vs `Heading level={1}`.

---

## Missing Tests

### Text.test.tsx

1. **No test for `className` prop merging.** There is no assertion that a custom `className` is merged with the recipe-generated class names.

2. **No test for `style` prop forwarding.** There is no test verifying that inline styles are applied to the rendered element.

3. **No test for `color` prop.** The test at line 29-39 passes `color="secondary"` but only asserts the element exists -- it does not verify the correct CSS class is applied.

4. **No test for `type` variants beyond implicit default.** The tests do not verify that `type="code"` produces the correct font family, `type="large"` produces larger text, etc.

5. **No test for `display` prop.** Neither `display="inline"` (default) nor `display="block"` is explicitly tested.

6. **No test for `hasTruncateTooltip={false}` suppressing the tooltip.** The truncation tests do not verify that the tooltip is not rendered when `hasTruncateTooltip` is false.

7. **No test for `wordBreak` prop.** Neither explicit nor default word-break behavior is tested.

8. **No test for `textWrap` prop.** None of the wrap variants are tested.

9. **No test for `hasCapsize` prop.**

10. **No test for `hasStrikethrough` prop.**

11. **No test for `hasTabularNumbers` prop.**

12. **No test for `data-testid` on the rendered element** (beyond using it as a query selector). The test should verify the attribute is present and correct.

### Heading.test.tsx

1. **No test for `color` prop.** No assertion that color variants produce correct classes.

2. **No test for `display` prop.** Default `block` and explicit `inline` are not tested.

3. **No test for `wordBreak` prop.**

4. **No test for `textWrap` prop.**

5. **No test for `hasCapsize` prop.**

6. **No test for `hasStrikethrough` prop.**

7. **No test for `hasTruncateTooltip={false}` suppressing the tooltip.**

8. **No test for `className` prop merging.**

9. **No test for `style` prop forwarding.**

10. **No test for `accessibilityLevel` when it equals `level`** (should not set `aria-level`). The existing test (line 27-37) only tests the differing case.

### useTruncation

1. **No dedicated unit tests.** The hook has no test file. Given its complexity (ResizeObserver, rAF scheduling, useSyncExternalStore, ref callbacks), it should have dedicated tests covering: initial state when `maxLines=0`, overflow detection for single-line vs multi-line, ResizeObserver triggering state updates, and cleanup on unmount.

---

## Missing Stories

### Text.stories.tsx

1. **No story for `type="large"`.** Only `body`, `supporting`, and `code` have stories. The `large` type is not demonstrated.

2. **No story for `type="label"`.** The label type is not demonstrated.

3. **No story for `type="display-*"` variants.** The display types (`display-1`, `display-2`, `display-3`) are only listed in argTypes but have no dedicated stories. These are available in `Heading.stories.tsx` but a consumer browsing the Text stories would not know Text supports them.

4. **No story for `type="inherit"`.** The inherit type is not demonstrated.

5. **No story for `weight` prop.** No story demonstrates bold, semibold, or medium text.

6. **No story for `size` prop.** No story demonstrates size overrides.

7. **No story for `color` variants.** No story demonstrates the full color palette (`disabled`, `placeholder`, `active`).

8. **No story for `hasCapsize`.** The capsize feature is not demonstrated.

9. **No story for `hasStrikethrough`.** Strikethrough text is not demonstrated.

10. **No story for `hasTabularNumbers`.** Tabular number formatting is not demonstrated (useful for showing alignment in tables/number columns).

11. **No story for `wordBreak` behavior.** No story demonstrates the difference between `break-word` and `break-all`.

12. **No story for `textWrap` variants.** No story demonstrates `balance`, `pretty`, `nowrap`, or `wrap`.

13. **No story for `as="label"` with `htmlFor`.** The label use case is not demonstrated.

14. **No story for `display="block"`.** Block-level text is not demonstrated.

15. **No story for single-line truncation (`maxLines={1}`).** The Truncated story uses `maxLines={2}` but does not show the single-line ellipsis behavior which uses different CSS (`text-overflow: ellipsis` vs `-webkit-line-clamp`).

### Heading.stories.tsx

1. **No story for all heading levels (1-6).** Only levels 1, 2, and 3 are demonstrated across stories. Levels 4, 5, and 6 are missing dedicated stories.

2. **No story for `accessibilityLevel`.** The aria-level override feature is not demonstrated.

3. **No story for `hasCapsize`.** The capsize feature is not demonstrated.

4. **No story for `hasStrikethrough`.** Strikethrough headings are not demonstrated.

5. **No story for `wordBreak` behavior.**

6. **No story for `textWrap` variants.**

7. **No story for `display="inline"`.** Inline headings are not demonstrated.

8. **No story for multiline truncation (`maxLines > 1`).** The Truncated story uses `maxLines={1}`.

---

## Additional Observations

- **`index.ts` exports are comprehensive.** All components, types, recipes, and variant types are properly exported.
- **`displayName` is set** on both `Text` (line 190) and `Heading` (line 156), which is good for React DevTools.
- **Fragment wrapper on both components** (`Text.tsx` line 175; `Heading.tsx` line 141). Both components return `<>{element}{tooltip}</>`. When truncation is not active, this still wraps the element in a Fragment. This is harmless but means `Text` and `Heading` cannot be used with APIs that require a single DOM element child (e.g., some animation libraries). This is an inherent trade-off of the tooltip approach and not necessarily a problem.
- **Heading imports types from Text** (`Heading.tsx`, line 13). `TextColor`, `TextDisplay`, `TextWordBreak`, and `TextWrap` are imported from `./Text`. This couples the two components but is reasonable since they share the same design system vocabulary. These shared types could alternatively live in a shared types file or in the recipe file.
- **`textBoxEdge` and `textBoxTrim` CSS properties** (`Text.recipe.ts`, lines 108-109). These are relatively new CSS properties with limited browser support. Consider documenting browser requirements or providing a fallback for the `hasCapsize` feature.
