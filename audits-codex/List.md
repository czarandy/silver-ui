# List Component Audit

Reviewed:

- `src/components/List/List.tsx`
- `src/components/List/ListItem.tsx`
- `src/components/List/ListContext.tsx`
- `src/components/List/List.stories.tsx`
- `src/components/List/List.test.tsx`
- `src/components/List/index.ts`
- `src/components/Item/Item.tsx`
- `XDS_src/List/List.doc.mjs`

Verification: `pnpm vitest run src/components/List/List.test.tsx` passes, 6 tests.

## Findings

### Medium: `spacious` density is exposed but has no distinct behavior

`ListDensity` includes `'spacious'` in `src/components/List/ListContext.tsx:3`, Storybook exposes it as a control in `src/components/List/List.stories.tsx:12`, and docs/tests imply density is an important prop. However, `ListItem` maps every non-compact value to the same `Item` density in `src/components/List/ListItem.tsx:189`, while `Item` only supports `'default' | 'compact'` in `src/components/Item/Item.tsx:16`. As a result, `density="spacious"` renders identically to `density="balanced"`.

Impact: consumers can select a documented value that silently does nothing. Either add a real spacious item density or remove the value from the public API/control/docs.

### Medium: `isSelected` sets `aria-selected` on plain `<li>` elements

`ListItem` passes `isSelected` to `Item` in `src/components/List/ListItem.tsx:193`, and `Item` writes `aria-selected` onto the root element in `src/components/Item/Item.tsx:312`. For List usage that root is a plain `<li>` (`src/components/List/ListItem.tsx:181`) inside a semantic list, not an option, tab, grid row, or other selectable composite role.

Impact: this is likely invalid or misleading ARIA for ordinary lists. If List is meant to support selectable collections, it needs an explicit composite/listbox-style API and keyboard model. If it is mainly for navigation/current-page styling, `aria-current` or visual-only selected state may be more appropriate.

### Low: Custom marker spans are not hidden from assistive tech

`Marker` renders decorative spans for `disc`, `circle`, and `decimal` marker styles in `src/components/List/ListItem.tsx:130`. The decimal marker uses CSS generated content in `src/components/List/ListItem.tsx:124`, while the list itself already carries list semantics via `<ul>`/`<ol>` in `src/components/List/List.tsx:101`.

Impact: assistive technology behavior for CSS-generated marker content can vary, and these marker nodes are decorative. Add `aria-hidden="true"` to the marker containers to avoid duplicate or noisy announcements while preserving native list semantics.

### Low: `href` and `onClick` can be combined with inconsistent activation behavior

`ListItemProps` allows both `href` and `onClick` (`src/components/List/ListItem.tsx:31`, `src/components/List/ListItem.tsx:51`). In `Item`, `href` takes precedence for the label area (`src/components/Item/Item.tsx:274`), but the root still installs `handleContainerClick` when the item is interactive (`src/components/Item/Item.tsx:325`). That handler intentionally ignores clicks originating on the anchor (`src/components/Item/Item.tsx:258`) and calls `onClick` only for non-anchor areas (`src/components/Item/Item.tsx:263`).

Impact: when both props are supplied, clicking the label navigates, while clicking surrounding non-interactive row content can call `onClick`. The API should either forbid this combination, define precedence, or test and document the split behavior.

## Performance

No significant performance problems found. The context value is memoized in `src/components/List/List.tsx:107`, styles are module-level constants, and marker rendering is small and stateless.

## Tests

Missing or weak coverage:

- No assertion that `density` changes classes/spacing, which would catch the `spacious` no-op (`src/components/List/List.test.tsx:7`).
- No tests for `listStyle="disc"` or `listStyle="circle"` marker rendering; only decimal is covered (`src/components/List/List.test.tsx:32`).
- No tests for disabled ListItems, including disabled links and disabled click handlers.
- No tests for `target`/`rel` on linked ListItems; only bare `href` is covered (`src/components/List/List.test.tsx:76`).
- No tests for `ref`, `className`, `style`, or `data-testid` on the List root.
- No test for a `ListItem` rendered outside a `List`, despite fallback context values in `src/components/List/ListItem.tsx:173`.
- No test for the `href` plus `onClick` combination described above.

## Stories

Missing or weak stories:

- No dedicated story comparing `compact`, `balanced`, and `spacious`; the current control alone hides that `spacious` is a no-op (`src/components/List/List.stories.tsx:12`).
- No story for `disc` or `circle`; only `decimal` is demonstrated (`src/components/List/List.stories.tsx:57`).
- No stories for interactive `onClick`, linked `href`, disabled, or selected ListItems.
- No story for ordered lists with a custom `start` value.
- No long-content or overflow story for labels/descriptions.

## Docs

The local `src/components/List` package has stories and tests but no component docs file. The XDS docs counterpart omits the `start` prop from the List prop table even though the implementation exposes it (`src/components/List/List.tsx:54`, `XDS_src/List/List.doc.mjs:27`). The XDS docs also describe `label` as `string` (`XDS_src/List/List.doc.mjs:68`) while the implementation accepts `ReactNode` (`src/components/List/ListItem.tsx:47`).

## API Clarity

The public API is generally small and understandable. The unclear areas are `spacious` density doing nothing, `isSelected` without a collection role/keyboard model, and the allowed but undefined `href` plus `onClick` combination.
