# Pagination Component Audit

Scope:

- Implementation: `src/components/Pagination/Pagination.tsx`
- Public export: `src/components/Pagination/index.ts`
- Tests: `src/components/Pagination/Pagination.test.tsx`
- Stories/docs: no `src/components/Pagination/Pagination.stories.tsx` or source docs file found. Related XDS-only docs/tests exist under `XDS_src/Pagination/`.

## Findings

### High: Page number buttons render verbose labels instead of page numbers

`Pagination` creates each page button with only `label={`Go to page ${item}`}` and no numeric child/content ([`Pagination.tsx:307`](../src/components/Pagination/Pagination.tsx#L307)-[`316`](../src/components/Pagination/Pagination.tsx#L316)). The local `Button` renders `label` as visible text when `isIconOnly` is false ([`Button.tsx:271`](../src/components/Button/Button.tsx#L271)), so the pages variant shows full strings like "Go to page 3" in the UI instead of compact numeric buttons. The XDS copy appears to show the intended API shape: visible `{item}` plus an accessible `aria-label` ([`XDSPagination.tsx:447`](../XDS_src/Pagination/XDSPagination.tsx#L447)-[`458`](../XDS_src/Pagination/XDSPagination.tsx#L458)).

Impact: the default pagination layout is visually noisy, likely overflows much earlier, and does not match expected pagination UI. The current tests assert accessible names only ([`Pagination.test.tsx:32`](../src/components/Pagination/Pagination.test.tsx#L32)-[`40`](../src/components/Pagination/Pagination.test.tsx#L40)), so they do not catch visible text regressions.

### High: `dots` variant can render an unbounded number of buttons

The dots variant renders `Array.from({length: computedTotalPages})` buttons with no cap or virtualization ([`Pagination.tsx:340`](../src/components/Pagination/Pagination.tsx#L340)-[`365`](../src/components/Pagination/Pagination.tsx#L365)). When `totalItems` or `totalPages` is large, this can create thousands of focusable controls, hurting render performance and keyboard/screen-reader usability. The XDS docs advise not using dots for more than about 10 pages ([`Pagination.doc.mjs:116`](../XDS_src/Pagination/Pagination.doc.mjs#L116)-[`119`](../XDS_src/Pagination/Pagination.doc.mjs#L119)), but the source component does not enforce or warn about that.

### Medium: `changeAction` pending state does not reliably block rapid changes

`handlePageChange` gates on `isPending` ([`Pagination.tsx:257`](../src/components/Pagination/Pagination.tsx#L257)-[`259`](../src/components/Pagination/Pagination.tsx#L259)), then calls `startTransition(() => { void changeAction(newPage); })` ([`Pagination.tsx:262`](../src/components/Pagination/Pagination.tsx#L262)-[`267`](../src/components/Pagination/Pagination.tsx#L267)). Because no state update is scheduled inside the transition and the promise is not awaited by React, `isPending` is unlikely to represent the async action lifetime. Rapid clicks can still dispatch multiple `onChange`/`changeAction` calls. There is no loading/disabled UI tied to `isPending`.

### Medium: Page bounds are not validated for controlled `page`

The component assumes `page` is valid. If a consumer passes `page > computedTotalPages`, compact/count variants can display impossible ranges such as "Page 6 of 5" or a start greater than the item total ([`Pagination.tsx:279`](../src/components/Pagination/Pagination.tsx#L279)-[`335`](../src/components/Pagination/Pagination.tsx#L335)). If `page < 1`, range math also becomes invalid and no active page is marked. This is a controlled component, so clamping may not be desired, but the API should document the invariant and tests should cover out-of-range behavior.

### Medium: Page size change behavior is under-specified and under-tested

`handlePageSizeChange` calls `onPageSizeChange` and then `handlePageChange(1)` ([`Pagination.tsx:270`](../src/components/Pagination/Pagination.tsx#L270)-[`277`](../src/components/Pagination/Pagination.tsx#L277)). This means selecting the current size still emits a page reset, `onPageSizeChange` can fire even if `handlePageChange` later returns due to pending state, and passing `pageSizeOptions` without `onPageSizeChange` renders a controlled selector that appears interactive but cannot change the value. The prop comments do not explain these contracts ([`Pagination.tsx:44`](../src/components/Pagination/Pagination.tsx#L44)-[`60`](../src/components/Pagination/Pagination.tsx#L60)).

### Low: Disabled dots lose disabled styling

`styles.dot` defines `_disabled` styling ([`Pagination.tsx:144`](../src/components/Pagination/Pagination.tsx#L144)-[`147`](../src/components/Pagination/Pagination.tsx#L147)), but Panda's disabled pseudo may not match a native `button:disabled` selector depending on the generated output. The XDS implementation applies an explicit disabled style for dots ([`XDSPagination.tsx:513`](../XDS_src/Pagination/XDSPagination.tsx#L513)-[`518`](../XDS_src/Pagination/XDSPagination.tsx#L518)). Verify generated CSS or add an explicit disabled class if needed.

## Category Notes

Performance: issue found in unbounded dots rendering. The pages variant itself uses a bounded range and is otherwise small.

Accessibility: page buttons have accessible names and `aria-current`, and the nav has a label. Concerns are the verbose visible labels in the pages variant and the large number of focusable dot buttons when totals are high.

Logic/API clarity: issues found around async `changeAction`, controlled page bounds, and page-size callback contracts. `totalItems` precedence over `totalPages` is documented in JSDoc ([`Pagination.tsx:79`](../src/components/Pagination/Pagination.tsx#L79)-[`86`](../src/components/Pagination/Pagination.tsx#L86)); `hasMore` being ignored when totals are known is implied by implementation but not stated.

Tests: current source tests cover the range helper, landmark, current page, page click, boundary disabled state, count/compact/dots variants, and empty totals ([`Pagination.test.tsx:6`](../src/components/Pagination/Pagination.test.tsx#L6)-[`107`](../src/components/Pagination/Pagination.test.tsx#L107)). Missing important coverage: visible numeric page button content, `hasMore`, `variant="none"`, custom `label`, `isDisabled` all-controls behavior, next/previous callbacks, `pageSizeOptions` and `onPageSizeChange`, `changeAction`/rapid click behavior, `totalItems` derived pages, non-default `siblingCount`, size, ref/className/style passthrough, and invalid page bounds.

Stories/docs: no source Storybook story exists for Pagination. Important props lacking stories: all five `variant` values, `totalItems` vs `totalPages`, unknown-total `hasMore`, `pageSizeOptions`/`onPageSizeChange`, `siblingCount`, `size`, `isDisabled`, and custom `label`. XDS docs exist, but they do not make the public `src/components/Pagination` discoverable in Storybook.
