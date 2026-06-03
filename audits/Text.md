# Text Audit

## Summary

Text is a foundational typography component with two variants: `Text` (body copy, labels, code, display text) and `Heading` (semantic h1-h6 elements). Both support truncation with automatic tooltip display, configurable fonts, sizes, weights, colors, word breaking, and text wrapping. The truncation system uses `useSyncExternalStore` with a `ResizeObserver` for efficient overflow detection.

## Issues

### Critical

- None

### High

- None

### Medium

- **`useTruncation` fullText assignment has a type mismatch:** In `useTruncation.ts` line 69, `fullText: element.textContent` assigns `string | null` to a field typed as `string`. The `TruncationState` interface declares `fullText: string`, but `element.textContent` can be `null`. This is a TypeScript strict-mode issue that could cause runtime problems if `fullText` is used in a context that does not handle `null`.
- **`handleShow` and `handleHide` are empty callbacks:** In both `TruncatedText` and `TruncatedHeading`, `handleShow` and `handleHide` are created as empty `useCallback` functions and passed to `useTooltip`. This appears to be vestigial code or a pattern that anticipates future use. While harmless, it adds unnecessary ceremony and allocations.
- **`BaseText` receives but ignores several props:** `BaseText` destructures `maxLines`, `hasTruncateTooltip`, and `wordBreak` as prefixed-underscore variables (`_maxLines`, etc.) only to discard them. This is necessary to prevent these props from being spread to the DOM, but the pattern could be cleaner with an explicit omission utility.

### Low

- **`createElement` is used instead of JSX:** Both `BaseText` and `TruncatedText` use `createElement` instead of JSX. While functionally equivalent, this makes the code harder to read compared to standard JSX. The likely reason is to support the dynamic `Component` element type, but this could also be achieved with JSX by using a capitalized variable.
- **No story for `display="block"` on its own:** While `TabularNumbers` story uses `display: 'block'`, there is no dedicated story showing the visual difference between `display="inline"` and `display="block"`.
- **No story for `wordBreak` prop:** The `wordBreak` prop is not demonstrated in any story. It would be useful for showing how long unbroken strings behave.
- **No test for `textWrap` prop:** While `textWrap` variants exist in the recipe, they are not tested.
- **`NativeTextProps` excludes `children`, `color`, `size`, and `style` but re-declares them:** The type extends `AllHTMLAttributes` but omits these keys. This is correct for avoiding conflicts, but the pattern is verbose. Minor type ergonomics issue.
- **Heading `display` defaults to `block` while Text `display` defaults to `inline`:** This difference in defaults between sibling components is intentional (headings are block-level, text is inline) but is not documented in the component JSDoc beyond the `@default` tags.

## Recommendations

- Fix the `fullText: element.textContent` type issue in `useTruncation.ts` by adding a nullish coalescing operator: `fullText: element.textContent ?? ''`.
- Remove the empty `handleShow`/`handleHide` callbacks or add a comment explaining why they are needed.
- Add stories for `wordBreak` and `display` props.
- Add a test for `textWrap` behavior.
- The truncation system (`useTruncation`) is well-engineered, using `useSyncExternalStore` with `ResizeObserver` for tear-free state management. Test coverage for both Text and Heading is solid, covering element rendering, typography variants, truncation, ref forwarding, className/style merging, native HTML attributes, and the negative maxLines guard.
