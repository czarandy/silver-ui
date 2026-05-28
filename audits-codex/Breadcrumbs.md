# Breadcrumbs Component Audit

Scope checked:

- `src/components/Breadcrumbs/Breadcrumbs.tsx`
- `src/components/Breadcrumbs/BreadcrumbItem.tsx`
- `src/components/Breadcrumbs/BreadcrumbsContext.ts`
- `src/components/Breadcrumbs/Breadcrumbs.test.tsx`
- `XDS_src/Breadcrumbs/XDSBreadcrumbs.tsx`
- `XDS_src/Breadcrumbs/XDSBreadcrumbItem.tsx`
- `XDS_src/Breadcrumbs/XDSBreadcrumbs.test.tsx`
- `XDS_src/Breadcrumbs/Breadcrumbs.doc.mjs`

Verification:

- `pnpm test -- Breadcrumbs` passes: 73 files, 402 tests. The filter matched the broader suite, not only Breadcrumbs.

## Findings

### Medium: auto-current can become stale when `src` breadcrumbs change

`BreadcrumbItem` auto-detects the last item in an effect that only depends on `isAutoCandidate` (`src/components/Breadcrumbs/BreadcrumbItem.tsx:152`). Once mounted, existing auto-candidate items do not re-run the detection when children are appended, removed, or reordered. If a route transition grows the trail from `Home > Projects` to `Home > Projects > Detail`, the previous last item can keep `aria-current="page"` while the new last item sees an existing current item and remains unmarked (`src/components/Breadcrumbs/BreadcrumbItem.tsx:163`, `src/components/Breadcrumbs/BreadcrumbItem.tsx:165`, `src/components/Breadcrumbs/BreadcrumbItem.tsx:167`).

The current `src` test only covers initial auto-detection (`src/components/Breadcrumbs/Breadcrumbs.test.tsx:63`). Add a rerender test that changes the breadcrumb list and asserts only the new last item is current. The XDS copy avoids this exact stale-update issue by running its effect after every render (`XDS_src/Breadcrumbs/XDSBreadcrumbItem.tsx:193`), though it still relies on DOM inspection.

### Medium: auto-current does not make a linked last item non-current-link content

Both implementations say or imply that the last child can be auto-detected as current (`XDS_src/Breadcrumbs/XDSBreadcrumbs.tsx:132`), but the render branch is decided before the effect. If the last item has `href` and no explicit `isCurrent`, the effect can only add `aria-current` to the `<li>`; the visible item remains a clickable link (`src/components/Breadcrumbs/BreadcrumbItem.tsx:167`, `src/components/Breadcrumbs/BreadcrumbItem.tsx:222`; `XDS_src/Breadcrumbs/XDSBreadcrumbItem.tsx:212`, `XDS_src/Breadcrumbs/XDSBreadcrumbItem.tsx:280`). That conflicts with the docs guidance that the current page item is plain text, not a link (`XDS_src/Breadcrumbs/Breadcrumbs.doc.mjs:17`, `XDS_src/Breadcrumbs/Breadcrumbs.doc.mjs:80`).

Either document that consumers must omit `href` or set `isCurrent` for the current page, or make auto-current a React-level decision so the last auto-detected item renders through the current `<span aria-current="page">` path.

### Low: no Storybook story exists for the shipped `src` component

No `src/components/Breadcrumbs/*.stories.*` file was found, while peer components have colocated stories. Important props and states therefore lack visual examples: `separator`, `variant="supporting"`, `label`, `startIcon`, `as`/`LinkProvider`, `onClick` button crumbs, explicit `isCurrent`, and the auto-current fallback. `XDS_src/Breadcrumbs/Breadcrumbs.doc.mjs` documents the API, but it is XDS-shaped (`xstyle`, `XDSBreadcrumbs`, `XDSBreadcrumbItem`) rather than a story for the exported `src` component (`XDS_src/Breadcrumbs/Breadcrumbs.doc.mjs:37`, `XDS_src/Breadcrumbs/Breadcrumbs.doc.mjs:70`).

### Low: `src` tests miss several public props and edge cases

The `src` tests cover nav semantics, links/buttons/current items, one custom separator, initial auto-current, custom links, and root `className`/`style`/`data-testid`/`ref` (`src/components/Breadcrumbs/Breadcrumbs.test.tsx:26`). Missing coverage includes custom `label`, `variant="supporting"`, `startIcon`, item-level `className`/`style`/`data-testid`/`ref`, auto-current after rerender, explicit current suppressing auto-current, and the linked-last-item case above. The XDS tests cover more props (`XDS_src/Breadcrumbs/XDSBreadcrumbs.test.tsx:33`, `XDS_src/Breadcrumbs/XDSBreadcrumbs.test.tsx:70`, `XDS_src/Breadcrumbs/XDSBreadcrumbs.test.tsx:125`, `XDS_src/Breadcrumbs/XDSBreadcrumbs.test.tsx:238`), but those do not protect the exported `src` implementation from the stale-effect behavior.

## Categories With No Issues Found

- Performance: no serious performance problem found. Breadcrumb trails are small, and the only DOM inspection is bounded by the number of rendered items.
- Base accessibility semantics: the component uses a labelled `nav`, an ordered list, hidden decorative separators, native anchors/buttons, and `aria-current` for current items (`src/components/Breadcrumbs/Breadcrumbs.tsx:79`, `src/components/Breadcrumbs/Breadcrumbs.tsx:85`, `src/components/Breadcrumbs/BreadcrumbItem.tsx:198`, `src/components/Breadcrumbs/BreadcrumbItem.tsx:202`).
- Export surface: `Breadcrumbs`, `BreadcrumbItem`, context, and their public types are exported from the component barrel (`src/components/Breadcrumbs/index.ts:1`) and package root (`src/index.ts:146`).
