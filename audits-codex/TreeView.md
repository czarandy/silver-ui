# TreeView Audit

## Scope

- Implementation: `src/components/TreeView/TreeView.tsx`, `TreeViewItem.tsx`, `TreeViewBranches.tsx`, `types.ts`
- Tests: `src/components/TreeView/TreeView.test.tsx`
- Stories/docs: no `src/components/TreeView/*.stories.*` or Silver `TreeView` doc file found. Related source doc exists only for `XDS_src/TreeList/TreeList.doc.mjs`.
- Verification: `pnpm vitest run src/components/TreeView/TreeView.test.tsx` passes, 10 tests.

## Findings

### High: `role="tree"` is missing the expected tree keyboard/focus model

`TreeView` renders a `role="tree"` container and `role="treeitem"` nodes (`TreeView.tsx:170-173`, `TreeViewItem.tsx:319-324`), but focus usually lands on nested `button`/`a` elements or on a row with `role="button"` only for non-action expandable rows (`TreeViewItem.tsx:284-304`, `TreeViewItem.tsx:341-345`). Keyboard handling only supports Enter/Space for row-toggle items (`TreeViewItem.tsx:227-235`); ArrowUp/ArrowDown, ArrowLeft/ArrowRight, Home/End, and roving focus are not implemented.

This makes the component look like an ARIA tree without behaving like one for keyboard and assistive technology users. Either implement the full tree interaction model with focus on treeitems, or use simpler list/disclosure semantics until tree navigation is supported.

### Medium: Link items with children toggle expansion when the link is clicked

Rows toggle whenever `hasChildren && onClick == null` (`TreeViewItem.tsx:200-201`), but that condition ignores `href`. For an item with both `href` and `children`, the component renders a link as the primary action (`TreeViewItem.tsx:284-292`) and still attaches the row toggle handler (`TreeViewItem.tsx:341`). The dedicated chevron button is only rendered when `onClick != null`, so link+children rows get a non-interactive chevron spacer instead (`TreeViewItem.tsx:263-275`).

Result: clicking the link both navigates and toggles expansion, with no separate expand control. The existing test covers action+children separation (`TreeView.test.tsx:143-166`) but not link+children.

### Medium: No TreeView stories or Silver docs

There is no `src/components/TreeView/TreeView.stories.tsx` and no Silver-side doc file for `TreeView`. Important props and states therefore have no Storybook coverage: `density`, `header`, nested default/initial expansion, `description`, `startContent`, `endContent`, `href`, `target`, `onClick`, `isDisabled`, and `isSelected`.

The related XDS doc documents `XDSTreeList`, not the exported Silver `TreeView` API (`XDS_src/TreeList/TreeList.doc.mjs:30-63`).

### Low: Expansion API is unclear after `items` changes

`isExpanded` is documented as initial state (`types.ts:31-35`) and initial expanded keys are recomputed from `items` (`TreeView.tsx:86-89`), but user toggles are stored indefinitely in `expandedKeyOverrides` (`TreeView.tsx:90-103`). If a consumer later changes `items` or updates an item's `isExpanded`, the stale override for the same `id` wins (`TreeView.tsx:117-119`).

That may be intentional uncontrolled behavior, but the API does not state how prop updates, removed/re-added ids, or duplicate ids should behave. Add docs/tests for this contract or expose controlled expansion callbacks/props.

### Low: Test coverage misses several key behaviors

Current tests cover basic render, header presence, content slots, expansion by click, action/link leaf items, selected/disabled state, and action+children separation (`TreeView.test.tsx:36-166`). Missing notable tests:

- ARIA keyboard behavior for tree navigation and collapse/expand.
- Link+children behavior.
- `data-testid`, `className`, `style`, and `ref` passthrough from `TreeViewProps` (`TreeView.tsx:17-47`, `TreeView.tsx:160-164`).
- `density` variants (`TreeViewItem.tsx:57-73`).
- Header `aria-labelledby` resolves to the rendered header element, not just that the attribute exists (`TreeView.test.tsx:45-51`).
- Deeply nested expanded rendering and branch connector stability.
- Disabled action/link behavior and `target` passthrough.

## Category Notes

- Performance: no high-confidence performance bug found for ordinary tree sizes. The component recursively renders visible nodes and rebuilds small ancestor arrays/styles, so very large trees may need memoization or virtualization, but that is not clearly required by the current API.
- Accessibility: issues found above.
- Logic bugs: link+children behavior found above.
- API clarity: expansion ownership is unclear after prop changes.
- Stories/docs: missing for Silver `TreeView`.
- Tests: focused unit tests exist and pass, but important behavior gaps remain.
