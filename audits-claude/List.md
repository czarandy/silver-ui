# List Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/List/List.tsx`
- `src/components/List/ListItem.tsx`
- `src/components/List/ListContext.tsx`
- `src/components/List/List.stories.tsx`
- `src/components/List/List.test.tsx`
- `src/components/List/index.ts`
- `src/components/Item/Item.tsx` (underlying primitive)

---

## Performance Problems

**No significant performance issues found.**

- The `ListContext` value is correctly memoized with `useMemo` (List.tsx, line 107-110), preventing unnecessary re-renders of `ListItem` consumers when the parent re-renders without changing `density`, `hasDividers`, or `listStyle`.
- The `Marker` component (ListItem.tsx, lines 130-152) is a simple conditional render with no state or effects. It returns `null` for `listStyle === 'none'`, and React correctly skips rendering in that case.
- The `styles` objects in both `List.tsx` and `ListItem.tsx` are module-level constants and are not re-created on each render.
- The `counterReset` inline style computation (List.tsx, lines 103-106) creates a new object via `{counterReset, ...style}` on every render (line 125), but this is standard practice for style objects and not a concern.

---

## Accessibility Concerns

1. **`role="list"` is correctly added for styled unordered lists (List.tsx, line 123):**
   When `listStyle === 'none'` and the list is unordered, `role="list"` is explicitly set. This is necessary because Safari strips the implicit `list` role from `<ul>` elements when `list-style-type: none` is applied. Good practice.

2. **`role="list"` is not applied to ordered lists with `listStyle: 'none'` (List.tsx, line 123):**
   The condition `listStyle === 'none' && !isOrdered` means if someone renders `<List listStyle="none">` (the default), an unordered list gets `role="list"`, but an ordered list (`listStyle="decimal"`) never hits this branch. This is correct because ordered lists always use `<ol>`, which inherently has `role="list"` in all browsers. No issue here.

3. **Marker elements lack `aria-hidden` (ListItem.tsx, lines 130-152):**
   The `Marker` component renders `<span>` elements for disc, circle, and decimal markers. These are purely decorative -- the disc/circle are empty `<span>` elements and the decimal marker uses CSS `content: 'counter(silver-list) "."'`. Screen readers may attempt to announce the CSS-generated counter text from the `::before` pseudo-element on the number marker. Adding `aria-hidden="true"` to the marker `<span>` elements would ensure they are consistently treated as decorative.

4. **`ListItem` does not expose an `aria-label` or `aria-labelledby` prop:**
   While the underlying `Item` component uses `label` as visible text, there is no way to provide an accessible name that differs from the visible label. This is a minor gap -- most list items do not need this, but it limits flexibility for items where the visual label alone is insufficient.

5. **Disabled link items remain in tab order (inherited from Item.tsx, line 284):**
   When `ListItem` has `href` and `isDisabled`, the underlying `Item` renders a link with `tabIndex={-1}` and `aria-disabled` (Item.tsx, lines 276-284). This correctly removes it from tab order. However, the link is still clickable -- there is no `onClick` prevention for disabled links. A user clicking a disabled link item will still navigate. This is an Item-level concern but affects List consumers.

---

## Logic Bugs

1. **`spacious` density is silently treated as `default` (ListItem.tsx, line 189):**
   The `ListDensity` type includes three values: `'compact' | 'balanced' | 'spacious'` (ListContext.tsx, line 3). However, the density mapping in `ListItem` is `density === 'compact' ? 'compact' : 'default'` (line 189). Both `'balanced'` and `'spacious'` map to `'default'`. The `spacious` option has no distinct effect -- it behaves identically to `balanced`. This is either a missing feature (no `spacious` density variant in `Item`) or the type definition is overly broad. Either way, a consumer selecting `spacious` gets no differentiation from `balanced`, which is misleading.

2. **`start` prop is accepted on unordered lists but silently ignored (List.tsx, lines 124, 103-106):**
   The `start` prop is only applied as an HTML attribute when `isOrdered` is true (line 124), and the CSS `counterReset` only applies when `listStyle !== 'none'` (line 104). However, the `ListProps` type does not restrict `start` to ordered lists. A consumer can pass `<List start={5}>` on an unordered list with no effect and no warning. This could be addressed with a type-level constraint or a runtime dev warning.

3. **Marker always renders `startAdornment`, even for `listStyle: 'none'` (ListItem.tsx, line 199):**
   `<Marker listStyle={listStyle} />` is always passed as `startAdornment` to `Item`. When `listStyle` is `'none'`, `Marker` returns `null`, and React renders nothing for the `{startAdornment}` slot in Item.tsx (line 335). This is functionally correct -- no DOM element is created. Not a bug, but the intent would be clearer if the `startAdornment` prop were conditionally passed (e.g., `startAdornment={hasMarkers ? <Marker listStyle={listStyle} /> : undefined}`).

---

## Unclear API

1. **`startContent` vs. `media` naming mismatch (ListItem.tsx, line 196):**
   `ListItem` accepts `startContent` (line 63 of `ListItemProps`) but maps it to the `media` prop on `Item` (line 196). Meanwhile, `startAdornment` on `Item` is used for the `Marker`. This creates a confusing mental model: `ListItem.startContent` is not the same conceptual slot as `Item.startAdornment`. Consumers who are familiar with `Item`'s API may be surprised that `startContent` maps to `media`, not `startAdornment`. A JSDoc note clarifying the slot mapping would help.

2. **`ListItem` does not expose `descriptionLines`, `labelLines`, or `align` from `Item`:**
   The underlying `Item` component supports text truncation via `labelLines` and `descriptionLines`, and vertical alignment via `align`. These are not exposed in `ListItemProps`. If consumers need to truncate long labels in a list, they have no way to do so through the `ListItem` API. This may be intentional to keep the API surface small, but it limits functionality for dense data lists.

3. **No empty state support:**
   The `List` component has no built-in way to render an empty state when there are no children. Consumers must handle this externally. This is not necessarily a problem, but some list components provide an `emptyState` prop for convenience.

---

## Missing Tests

1. **No test for `density` prop:**
   None of the three density values (`compact`, `balanced`, `spacious`) are tested. The mapping logic at ListItem.tsx line 189 is untested.

2. **No test for `listStyle` variations (`disc`, `circle`):**
   The `Ordered` test (line 33) covers `listStyle="decimal"`, but `disc` and `circle` marker rendering is untested.

3. **No test for disabled list items:**
   `isDisabled` is passed through to `Item` but never tested in the List context. Behavior such as click prevention, visual appearance, and aria-disabled are not verified.

4. **No test for `start` prop edge cases:**
   The only `start` test (line 33) verifies the HTML attribute is set to `"3"`. There is no test for `start` with non-ordered lists (should be ignored), `start={0}`, or negative values.

5. **No test for `className` or `style` props on `List` or `ListItem`:**
   Custom class names and inline styles are accepted but never tested.

6. **No test for `data-testid` on `List`:**
   The `List` component accepts `data-testid` but no test verifies it is applied to the list element.

7. **No test for `ref` forwarding:**
   Neither `List` nor `ListItem` ref forwarding is tested.

8. **No test for `ListItem` rendered outside of `List` context:**
   `ListItem` uses `use(ListContext)` with fallback defaults (lines 174-176). This standalone usage is untested.

9. **No test for `target` and `rel` props on link items:**
   The `href` test (line 76) verifies the link role and href attribute, but does not test `target="_blank"` or `rel` behavior.

10. **No test for `ListItem` with both `href` and `onClick`:**
    The interaction between these two props (which one takes precedence in `Item`) is not tested.

---

## Missing Stories

1. **No story for `disc` or `circle` list styles:**
   The `Ordered` story demonstrates `listStyle="decimal"`, but `disc` and `circle` marker styles have no visual demonstration. These are distinct visual treatments that should be shown.

2. **No story for `density` variations:**
   The `density` prop is exposed as a Storybook control, but there is no dedicated story showing `compact`, `balanced`, and `spacious` side by side so that the visual differences (or lack thereof for `spacious`) are apparent.

3. **No story for clickable/interactive list items:**
   `ListItem` supports `onClick` for interactive items, but no story demonstrates this. An interactive story with click handlers would show hover/active/focus states.

4. **No story for link list items:**
   `ListItem` supports `href`, `target`, and `rel` for link items, but no story demonstrates navigation list items.

5. **No story for disabled list items:**
   The `isDisabled` prop is not demonstrated in any story.

6. **No story for selected list items:**
   The `isSelected` prop is not demonstrated in any story. Selection state is important for navigation lists and settings panels.

7. **No story for `start` prop on ordered lists:**
   The `Ordered` story starts at 1 (default). There is no story showing a list starting at a custom number (e.g., a continuation list starting at 4).

8. **No story for mixed content items:**
   No story shows list items with varying configurations in the same list (e.g., some items with descriptions, some without; some with endContent, some without).

9. **No story for `ListItem` with `description` prop:**
   While the `Default` story shows `description`, there is no isolated story focusing on description text and how it interacts with different density settings.

10. **No story for long content / text overflow:**
    No story demonstrates how the component handles long labels, long descriptions, or many items. This is important for verifying text truncation behavior and scroll behavior.

---

## Additional Observations

- **No recipe file:** Unlike many other components in this codebase, `List` does not use a Panda CSS recipe (`.recipe.ts` file). Styles are defined as module-level `css()` calls instead. This is fine for the current complexity level but diverges from the pattern used by components like Button, Card, and Avatar.
- **`use()` hook for context (ListItem.tsx, line 173):** The component uses React 19's `use()` API instead of `useContext()`. This is a modern approach and works correctly given the project's `react >= 19` peer dependency requirement.
- **Clean barrel exports:** The `index.ts` file exports all public types and components. The `ListContextValue` type is intentionally not exported, keeping the context internal.
- **`displayName` is set on both `List` and `ListItem`** -- good for React DevTools debugging.
- **`ListContext` has a `displayName`** (ListContext.tsx, line 13) -- good for debugging context in DevTools.
- **Header accessibility is well-handled:** The `header` prop correctly uses `aria-labelledby` with a generated `useId()` to associate the header with the list element (List.tsx, lines 100, 113, 136).
- **Ref type cast (List.tsx, line 122):** The ref is cast as `Ref<HTMLUListElement & HTMLOListElement>` to satisfy TypeScript when the element type depends on `isOrdered`. This is a pragmatic approach and works correctly at runtime.
