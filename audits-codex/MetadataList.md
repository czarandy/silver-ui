# MetadataList Audit

Audited:

- `src/components/MetadataList/MetadataList.tsx`
- `src/components/MetadataList/MetadataListItem.tsx`
- `src/components/MetadataList/MetadataListContext.ts`
- `src/components/MetadataList/MetadataList.stories.tsx`
- `src/components/MetadataList/MetadataList.test.tsx`
- `src/components/MetadataList/index.ts`

## Findings

### High: Collapsing counts top-level React children, so fragment-wrapped items do not collapse correctly

`MetadataList` uses `Children.toArray(children)` to decide `childArray.length`, `isCollapsible`, and `visibleChildren` (`MetadataList.tsx:110-119`). React children traversal treats a fragment as a single child rather than flattening the fragment's contents, so this common usage will be counted as one item:

```tsx
<MetadataList maxNumOfItems={2}>
  <>
    <MetadataListItem label="A">1</MetadataListItem>
    <MetadataListItem label="B">2</MetadataListItem>
    <MetadataListItem label="C">3</MetadataListItem>
  </>
</MetadataList>
```

The Storybook default also passes all items inside one fragment (`MetadataList.stories.tsx:11-22`), which makes this easy to miss. Add a regression test for fragment-wrapped children and either flatten fragments before counting/slicing or document that `maxNumOfItems` only works with direct item children.

### Medium: `columns="multi"` with `label={{position: 'start'}}` can separate labels from values visually

When labels are not stacked, fixed numeric columns get paired grid tracks via `repeat(${columns}, auto 1fr)` (`MetadataList.tsx:131-133`). The `'multi'` path instead uses `repeat(auto-fill, minmax(280px, 1fr))` (`MetadataList.tsx:47-50`, `MetadataList.tsx:124-130`), while each `MetadataListItem` renders separate `dt` and `dd` grid children in start-label mode (`MetadataListItem.tsx:77-91`). That means labels and values can occupy independent auto-fill cells instead of staying paired.

Either prevent/override start-position labels for multi-column auto-fill layouts, or implement a paired multi-column layout for `dt`/`dd`. Add a story and test for this explicit prop combination.

### Medium: Important props and behavior are under-covered by stories

The current stories cover only default, `columns="multi"`, and `orientation="horizontal"` (`MetadataList.stories.tsx:29-31`). Missing demonstrations for important public behavior:

- `maxNumOfItems` collapsed and expanded state (`MetadataList.tsx:113-164`)
- `label.position="top"` and `label.position="start"` defaults/overrides (`MetadataList.tsx:95-108`, `MetadataListItem.tsx:55-75`)
- `label.width` (`MetadataList.tsx:134-137`)
- numeric `columns` (`MetadataList.tsx:17`, `MetadataList.tsx:131-133`)
- long values/wrapping and icon-bearing items beyond the default example (`MetadataListItem.tsx:57-60`)

No dedicated docs file was found under `src/components/MetadataList`; Storybook is currently the only local docs surface.

### Medium: Key behavior is under-tested

`MetadataList.test.tsx` has only two tests: semantic rendering and the basic collapse/expand path (`MetadataList.test.tsx:7-42`). Missing tests for:

- fragment-wrapped children with `maxNumOfItems`
- `orientation="horizontal"` ignoring `maxNumOfItems` (`MetadataList.tsx:113`)
- `label.position`, default label position for multi-column layouts, and `label.width`
- numeric `columns`
- `MetadataListItem` `icon` rendering (`MetadataListItem.tsx:57-60`)
- `data-testid` behavior, including the label/value suffix split in non-stacked mode (`MetadataListItem.tsx:79-88`)
- `className`, `style`, and `ref` forwarding on list and item roots (`MetadataList.tsx:142-146`, `MetadataListItem.tsx:66-70`, `MetadataListItem.tsx:79-83`)

### Low: `title` is visual only unless callers pass their own heading

The `title` prop is rendered inside a plain `div` (`MetadataList.tsx:147`). When callers pass a string, as the test does (`MetadataList.test.tsx:10`), the visible title is not a heading and is not associated with the `dl` via `aria-labelledby`. If `title` is meant to label the metadata group, consider rendering a heading-like element or wiring an accessible label.

### Low: Horizontal orientation silently ignores other layout props

In horizontal mode, `label` is forced to `{position: 'top'}` (`MetadataList.tsx:97-100`) and `maxNumOfItems` is disabled (`MetadataList.tsx:113`). `columns` is also bypassed by the horizontal class selection (`MetadataList.tsx:121-130`). This may be intentional, but the public prop interface has no JSDoc explaining it (`MetadataList.tsx:19-30`), and the Horizontal story does not make the ignored-prop behavior visible.

## Category Notes

- Performance: no material performance issue found. The component does an O(n) `Children.toArray` pass per render for collapse support (`MetadataList.tsx:110-119`), which is expected for this feature.
- Accessibility: semantic `dl`/`dt`/`dd` usage is good, and the toggle uses `aria-controls` and `aria-expanded` (`MetadataList.tsx:148-163`). The only accessibility concern found is the visual-only `title` behavior above.
- API clarity: `label` config and horizontal-mode ignored props need documentation or clearer stories.
- Tests/stories: coverage is the largest gap after the fragment collapse bug.
