# Link Component Audit

**Date:** 2026-05-28

**Files reviewed:**

- `src/components/Link/Link.tsx`
- `src/components/Link/Link.recipe.ts`
- `src/components/Link/LinkProvider.tsx`
- `src/components/Link/useLinkComponent.ts`
- `src/components/Link/types.ts`
- `src/components/Link/Link.stories.tsx`
- `src/components/Link/Link.test.tsx`
- `src/internal/linkAccessibility.ts`
- `XDS_src/Link/Link.doc.mjs`
- `XDS_src/Link/LinkProvider.doc.mjs`

## Findings

1. **Medium - Standard anchor and ARIA props are not supported or forwarded.** `LinkProps` enumerates only a small set of props (`src/components/Link/Link.tsx:21`) and the render path passes only those explicit props to the root (`src/components/Link/Link.tsx:130`). This means consumers cannot set common link attributes such as `aria-current`, `aria-describedby`, `id`, `title`, `download`, or `referrerPolicy`; in plain JS those props would be silently dropped, and in TS many are rejected. This is an accessibility/API gap for navigation links, especially current-page links. Tests cover existing explicit props but not passthrough behavior (`src/components/Link/Link.test.tsx:82`, `src/components/Link/Link.test.tsx:291`).

2. **Low - Custom link components always receive a router-specific `to` prop.** Any non-`'a'` component gets `to={href}` (`src/components/Link/Link.tsx:143`). That works for React Router and is tested (`src/components/Link/Link.test.tsx:383`), but the Storybook `StoryLink` just spreads props onto `<a>` (`src/components/Link/Link.stories.tsx:8`), so the custom-component stories can render a non-standard `to` attribute. The API is clearer if the adapter contract is documented as requiring `to`, or if `to` is opt-in/adapter-owned.

3. **Low - The component encourages action-style links when `href` is omitted.** Missing `href` is converted to `href="#"` and default navigation is prevented (`src/components/Link/Link.tsx:112`, `src/components/Link/Link.tsx:118`). This behavior is tested (`src/components/Link/Link.test.tsx:61`, `src/components/Link/Link.test.tsx:70`) and has stories (`src/components/Link/Link.stories.tsx:140`, `src/components/Link/Link.stories.tsx:148`), but it blurs the boundary between navigation and actions. The XDS docs explicitly say not to use Link for non-navigation actions (`XDS_src/Link/Link.doc.mjs:125`); the Silver story set should steer users toward `Button` for action-only behavior.

4. **Low - Link docs in the repo are stale/misaligned with the Silver component.** There is no `src/components/Link/*.doc.mjs`; the only Link doc files found are under `XDS_src/Link`. Those docs still describe XDS-only API such as `isStandalone` (`XDS_src/Link/Link.doc.mjs:83`) and XDS naming (`XDSLink`, `XDSLinkProvider`) (`XDS_src/Link/Link.doc.mjs:22`, `XDS_src/Link/Link.doc.mjs:97`). If these docs are used for Silver, they will mislead consumers.

## Category Notes

- **Performance:** No significant issues found. The component is small, has no effects, and `useRel` memoizes the only derived string (`src/internal/linkAccessibility.ts:14`).
- **Accessibility:** External/new-tab labeling is handled well with either `aria-label` or hidden suffix text (`src/components/Link/Link.tsx:133`, `src/components/Link/Link.tsx:145`) and is tested (`src/components/Link/Link.test.tsx:357`, `src/components/Link/Link.test.tsx:370`). The main accessibility concern is the missing ARIA/anchor passthrough above.
- **Logic bugs:** No high-severity logic bugs found in the implemented behavior. Disabled links prevent click navigation and suppress `onClick` (`src/components/Link/Link.tsx:118`) with tests for pointer and keyboard activation (`src/components/Link/Link.test.tsx:127`, `src/components/Link/Link.test.tsx:311`).
- **Unclear API:** The `href` fallback and unconditional `to` prop are the main unclear areas.
- **Missing tests:** Add tests for standard anchor/ARIA passthrough if supported, and for custom components that do not consume `to` to prevent accidental DOM leakage. Existing tests cover external rel/target behavior, labels, disabled behavior, tooltip wrapping, refs, class/style, provider override, and nested providers.
- **Missing stories:** Important props mostly have stories: color variants, underline, external, same-tab external, label/icon-only, `as`, provider, target blank, custom rel, disabled, tooltip, without `href`, and onClick are covered (`src/components/Link/Link.stories.tsx:52` through `src/components/Link/Link.stories.tsx:194`). Missing/weak stories are docs-oriented: standard anchor/ARIA attributes if added, and clearer guidance away from action-only Link usage.

## Verification

- Ran `pnpm vitest run src/components/Link/Link.test.tsx`: 31 tests passed. jsdom printed `Not implemented: navigation to another Document`, but the suite exited successfully.
