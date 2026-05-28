# Thumbnail Component Audit

**Files reviewed:**

- `src/components/Thumbnail/Thumbnail.tsx` (247 lines)
- `src/components/Thumbnail/Thumbnail.stories.tsx` (31 lines)
- `src/components/Thumbnail/Thumbnail.test.tsx` (46 lines)
- `src/components/Thumbnail/index.ts` (1 line)

No `.recipe.ts` file exists (component uses inline `css()` calls instead).

---

## Performance

1. **Stale error state when `src` changes** (`Thumbnail.tsx`, line 167-168).
   `hasImageError` is stored in `useState` but is never reset when `src` changes. If an image fails to load and a new `src` is subsequently provided, the component will remain stuck on the placeholder because `hasImageError` is still `true`. This needs a `useEffect` (or a key-based reset) to clear `hasImageError` when `src` changes.

2. **No memoization, but not needed.** The component is a leaf-level UI component with no expensive computation or deep child trees. The absence of `React.memo`, `useMemo`, or `useCallback` is appropriate here.

---

## Accessibility

3. **`aria-label` on a non-interactive `<div>` has no semantic meaning** (`Thumbnail.tsx`, line 189).
   The root element is a plain `<div>` with `aria-label={accessibleName}`. Since `<div>` has no implicit ARIA role, screen readers may ignore the label entirely. Consider adding `role="img"` to the root when the thumbnail is non-interactive and showing an image, or `role="group"` when interactive controls are present inside it.

4. **Missing `aria-busy` for loading state** (`Thumbnail.tsx`, line 159).
   When `isLoading` is true, there is no `aria-busy="true"` on the container to signal to assistive technology that content is still loading.

5. **Disabled state uses `pointer-events: none` and `opacity` only** (`Thumbnail.tsx`, lines 69-71).
   The disabled state is purely visual. The remove button is correctly hidden when disabled (line 220), but if `onClick` is provided along with `isDisabled`, the interactive button is not rendered (line 169 sets `isInteractive = false`), which is correct. However, there is no `aria-disabled="true"` on the root to communicate the disabled state to assistive technology.

6. **Tooltip wrapping may break accessible `aria-describedby` linkage** (`Thumbnail.tsx`, lines 239-243).
   When `label` is set, the entire thumbnail `<div>` is wrapped in `<Tooltip>`. The Tooltip component (`Tooltip.tsx`, lines 137-158) attaches `aria-describedby` to the first child element. Since the first child is the root `<div>` which already has `aria-label`, this works, but the tooltip content duplicates the `aria-label` value (both are `label`). The tooltip provides visual hover information but the `aria-describedby` pointing to the same text as `aria-label` is redundant for screen readers.

---

## Logic Bugs

7. **Stale image error state (same as item 1)** (`Thumbnail.tsx`, line 167).
   This is the most significant bug. Reproduction: render `<Thumbnail src="bad.jpg" />`, image fails, error state is set. Then change props to `<Thumbnail src="good.jpg" />`. The component will still show the placeholder because `hasImageError` remains `true`. Fix: add an effect that resets `hasImageError` to `false` when `src` changes, for example:

   ```ts
   useEffect(() => {
     setHasImageError(false);
   }, [src]);
   ```

8. **`onRemove` event type mismatch** (`Thumbnail.tsx`, line 45 vs line 228).
   The `onRemove` prop is typed as `(event: MouseEvent<HTMLElement>) => void`, but the actual event passed at line 228 originates from a `<Button>` click handler which provides `MouseEvent<HTMLButtonElement>`. This works at runtime because `HTMLButtonElement extends HTMLElement`, but the broader type in the prop definition may mislead consumers who try to access button-specific properties on the event. Consider narrowing to `MouseEvent<HTMLButtonElement>`.

---

## Unclear API

9. **`alt` vs `label` distinction is confusing** (`Thumbnail.tsx`, lines 13-37).
   The component has both `alt` (image alt text) and `label` (accessible label + tooltip text). The `accessibleName` falls back through `label -> alt -> 'thumbnail'` (line 170). It is unclear to consumers when to provide `alt` alone, `label` alone, or both. The JSDoc could clarify the relationship, e.g., that `label` is the file name shown in a tooltip and used for button labels, while `alt` describes the image content.

10. **Hardcoded fallback accessible name** (`Thumbnail.tsx`, line 170).
    When neither `label` nor `alt` is provided, the accessible name defaults to the generic string `'thumbnail'`. If multiple thumbnails appear without labels, all their buttons will read "Open thumbnail" and "Remove thumbnail", making them indistinguishable to screen reader users. Consider making `alt` or `label` required, or at least documenting that one should always be provided.

---

## Missing Tests

The test file has only 3 test cases. The following behaviors are untested:

11. **Image error fallback** -- no test verifies that when `<img>` fires `onError`, the placeholder is rendered instead. This is important because of the bug in item 7.

12. **`isDisabled` state** -- no test verifies that `onClick` and `onRemove` buttons are not rendered when `isDisabled` is true.

13. **`isLoading` with an image src** -- no test verifies the overlay spinner appears when both `isLoading` and `src` are provided.

14. **`isLoading` without an image** -- the test at line 41 checks that the label is present, but does not verify that a `Skeleton` is actually rendered.

15. **Tooltip rendering** -- no test verifies that a tooltip is rendered when `label` is provided. The tooltip wrapper changes the DOM structure, which could affect accessibility.

16. **Remove button `stopPropagation`** -- no test verifies that clicking the remove button does _not_ also trigger `onClick`. This is the explicit purpose of the `event.stopPropagation()` call at line 227.

17. **`className` and `style` forwarding** -- no test verifies that custom classes and inline styles are applied to the root element.

18. **`ref` forwarding** -- no test verifies that the ref is forwarded to the root `<div>`.

---

## Missing Stories

The stories file has only 2 stories (`Default` and `States`). Key props and behaviors lacking dedicated story coverage:

19. **`onClick` (interactive thumbnail)** -- no story demonstrates the clickable thumbnail with cursor/hover behavior.

20. **`onRemove` (removable thumbnail)** -- no story shows the remove button badge.

21. **`isDisabled`** -- no story demonstrates the disabled visual state.

22. **`isLoading` with image** -- no story shows the spinner overlay on top of an existing image (upload progress pattern).

23. **Image error / placeholder** -- the `States` story shows `<Thumbnail label="Missing image" />` (no `src`), but does not demonstrate an image that _fails_ to load.

24. **Combined interactive + removable** -- no story demonstrates a thumbnail with both `onClick` and `onRemove` to show how the remove button overlays the clickable area.

---

## Summary

| Category        | Issues                                                        |
| --------------- | ------------------------------------------------------------- |
| Performance     | 1 (stale error state)                                         |
| Accessibility   | 4 (missing role, aria-busy, aria-disabled, redundant tooltip) |
| Logic bugs      | 2 (stale error state, event type mismatch)                    |
| Unclear API     | 2 (alt vs label, hardcoded fallback)                          |
| Missing tests   | 8 scenarios untested                                          |
| Missing stories | 6 prop/state combinations not demonstrated                    |

The most impactful issue is the stale `hasImageError` state (items 1/7), which is a real bug that will manifest whenever a thumbnail's `src` prop changes from a broken URL to a valid one.
