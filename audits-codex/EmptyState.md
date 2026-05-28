# EmptyState Audit

Scope reviewed:

- Implementation: `src/components/EmptyState/EmptyState.tsx`, `XDS_src/EmptyState/XDSEmptyState.tsx`
- Stories/docs: `src/components/EmptyState/EmptyState.stories.tsx`, `XDS_src/EmptyState/EmptyState.doc.mjs`
- Tests: `src/components/EmptyState/EmptyState.test.tsx`, `XDS_src/EmptyState/XDSEmptyState.test.tsx`

## Findings

### Medium - Local EmptyState hardcodes a live region and gives consumers no accessibility escape hatch

`src/components/EmptyState/EmptyState.tsx:119` always renders the root with `role="status"`, which creates an implicit polite live region. That can be useful when an empty state appears after a dynamic list/filter update, but it is noisy for static placeholders that are already discoverable through the heading at `src/components/EmptyState/EmptyState.tsx:127`. The component is also used as the default table placeholder at `src/components/Table/BaseTable.tsx:366`, so this live-region behavior applies automatically to empty tables.

The local prop interface is closed at `src/components/EmptyState/EmptyState.tsx:6`: consumers cannot pass `role`, `aria-live`, `aria-label`, `aria-labelledby`, `id`, or other native div attributes to adjust the announcement model. The XDS version is more flexible because it extends base div props at `XDS_src/EmptyState/XDSEmptyState.tsx:84` and spreads extra props after the default role at `XDS_src/EmptyState/XDSEmptyState.tsx:154` and `XDS_src/EmptyState/XDSEmptyState.tsx:167`, allowing callers to override the default when needed.

### Medium - XDS EmptyState tests are outside the configured Vitest include

`XDS_src/EmptyState/XDSEmptyState.test.tsx:7` has broad coverage for heading levels, omitted optional slots, decorative icon semantics, actions, status role, compact mode, ref forwarding, and `data-testid`. However, `vitest.config.ts:17` only includes `src/**/*.test.{ts,tsx}` and `eslint/**/*.test.{js,ts}`, so these XDS tests are not part of the normal test suite.

This matters because the local test file is much thinner, and the better XDS coverage will not catch regressions unless the test config is widened or those tests are moved under the configured paths.

### Low - Local tests miss key supported props and behaviors

`src/components/EmptyState/EmptyState.test.tsx:8` renders the full component, and `src/components/EmptyState/EmptyState.test.tsx:26` checks `className`/`data-testid`, but several important props are untested:

- `headingLevel` and the default heading level from `src/components/EmptyState/EmptyState.tsx:103` and `src/components/EmptyState/EmptyState.tsx:127`
- `isCompact`, including the compact root class and stacked action layout from `src/components/EmptyState/EmptyState.tsx:114` and `src/components/EmptyState/EmptyState.tsx:138`
- decorative icon wrapping via `aria-hidden="true"` at `src/components/EmptyState/EmptyState.tsx:122`
- omitted optional slots for `description`, `icon`, and `actions` at `src/components/EmptyState/EmptyState.tsx:121`, `src/components/EmptyState/EmptyState.tsx:128`, and `src/components/EmptyState/EmptyState.tsx:134`
- `ref` and `style` root props from `src/components/EmptyState/EmptyState.tsx:118` and `src/components/EmptyState/EmptyState.tsx:120`

### Low - Local stories do not demonstrate several important prop combinations

`src/components/EmptyState/EmptyState.stories.tsx:9` sets shared args for `description`, `icon`, and `title`, and the only variants are default, one action, and compact at `src/components/EmptyState/EmptyState.stories.tsx:19`. Missing story coverage includes:

- `headingLevel`, which is important for page outline correctness
- title-only empty state with no `description`
- no-icon empty state, since all stories inherit the `icon` from `src/components/EmptyState/EmptyState.stories.tsx:11`
- multiple actions, despite action wrapping support at `src/components/EmptyState/EmptyState.tsx:86`
- compact with actions, which is the only visible way to demonstrate the stacked compact action layout at `src/components/EmptyState/EmptyState.tsx:90`

### Low - Local API is narrower than the XDS API without documentation explaining the difference

The local component exposes only bespoke root props (`className`, `data-testid`, `style`, `ref`) plus EmptyState-specific props at `src/components/EmptyState/EmptyState.tsx:6`. The XDS component extends shared base props at `XDS_src/EmptyState/XDSEmptyState.tsx:84`, and its docs explicitly document `xstyle` at `XDS_src/EmptyState/EmptyState.doc.mjs:51`.

This leaves the local API unclear for consumers who need standard div attributes, analytics `data-*` hooks other than `data-testid`, custom ARIA wiring, or role overrides. Either widening the local props or documenting the intentional restriction would make the API easier to reason about.

## Category Notes

- Performance: no issue found. Both implementations keep styles at module scope and render simple conditional slots with no effects, subscriptions, or heavy derived work.
- Accessibility: main concern is the hardcoded local `role="status"` with no native/ARIA prop pass-through. The icon is correctly treated as decorative in both implementations.
- Logic bugs: no concrete rendering logic bug found. Nullish checks for optional slots are appropriate.
- API clarity: local props are intentionally or accidentally narrower than XDS; that difference is not documented.
- Missing tests: local tests should cover heading levels, compact behavior, decorative icon semantics, omitted slots, ref, and style. XDS tests are more complete but not included by current Vitest config.
- Missing stories/docs: XDS docs cover the props and usage guidance. Local stories need heading-level, title-only, no-icon, multiple-action, and compact-with-action examples.
