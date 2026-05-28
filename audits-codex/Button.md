# Button Audit

Audited:

- `src/components/Button/Button.tsx`
- `src/components/Button/Button.recipe.ts`
- `src/components/Button/Button.stories.tsx`
- `src/components/Button/Button.test.tsx`
- `src/components/Button/index.ts`
- Related docs/reference: `README.md`, `XDS_src/Button/Button.doc.mjs`

Verification:

- `pnpm vitest run src/components/Button/Button.test.tsx` passed: 26 tests.
- Vitest printed `Not implemented: navigation to another Document` during link click coverage; the suite still passed.

## Findings

### Medium: Button cannot express common trigger ARIA attributes

`ButtonProps` exposes only `aria-current` from ARIA (`src/components/Button/Button.tsx:30`-`139`). It does not accept common button trigger attributes such as `aria-expanded`, `aria-controls`, `aria-haspopup`, `aria-pressed`, `id`, or general `data-*` attributes other than `data-testid`. This makes the component awkward or impossible to use as an accessible popover/menu/disclosure trigger without casts or wrappers.

Tests cover the supported `aria-current` path indirectly only through implementation surface (`src/components/Button/Button.test.tsx:245`-`370` has link tests, but no ARIA trigger coverage). Stories also do not demonstrate `aria-current` or trigger-style ARIA usage (`src/components/Button/Button.stories.tsx:31`-`131`).

Recommendation: extend props from a constrained subset of native button/anchor attributes, or explicitly add the ARIA trigger attributes the design system expects.

### Medium: Current Button docs are missing or stale

There is no current `src/components/Button/Button.doc.mjs` or colocated markdown doc. The only Button doc found is `XDS_src/Button/Button.doc.mjs`, which describes upstream `XDSButton` APIs that the current `src` Button does not implement, including `children` and `clickAction` (`XDS_src/Button/Button.doc.mjs:100`-`131`). That same doc omits current link props from the prop table even though the current component supports `href`, `as`, `target`, and `rel` (`src/components/Button/Button.tsx:59`-`62`, `103`-`120`).

The root README is also stale for the current public API: it shows children-based usage and `variant="solid"` (`README.md:23`-`28`), but `Button` requires `label` and supports `primary | secondary | ghost | destructive` (`src/components/Button/Button.tsx:86`, `src/components/Button/Button.recipe.ts:43`-`71`). The component list repeats the stale variants (`README.md:58`).

Recommendation: add/update docs for the actual `src/components/Button` API and fix README examples before consumers rely on the package docs.

### Low: `isIconOnly` does not require an icon

`isIconOnly` visually hides the label and renders only `icon` when provided (`src/components/Button/Button.tsx:266`-`274`), but the type permits `<Button isIconOnly label="Settings" />` with no icon (`src/components/Button/Button.tsx:66`-`76`). That produces an accessible but visually empty square button. The story demonstrates correct usage with an icon (`src/components/Button/Button.stories.tsx:57`-`68`), but no test guards against accidental empty icon-only buttons (`src/components/Button/Button.test.tsx:56`-`68` covers only the happy path).

Recommendation: make `icon` required when `isIconOnly: true` via a discriminated union, or document and test the expected fallback behavior.

### Low: Story coverage misses several important props and states

Stories cover variants, sizes, icon/end content/icon-only, disabled, loading, link, tooltip, and disabled-with-tooltip (`src/components/Button/Button.stories.tsx:31`-`131`). Missing story coverage:

- `target="_blank"`/`rel` and the accessible "opens in new tab" naming behavior, though tested at `src/components/Button/Button.test.tsx:254`-`274`.
- `type`, `form`, `name`, and `value`, though tested at `src/components/Button/Button.test.tsx:226`-`243`.
- `aria-current`, used by pagination-like consumers (`src/components/Button/Button.tsx:31`-`35`).
- ButtonGroup inherited `size`/`isDisabled` behavior, which is tested in ButtonGroup tests (`src/components/ButtonGroup/ButtonGroup.test.tsx:36`-`68`) but not shown from the Button story page.

Recommendation: add compact stories for new-tab link, form submit/reset usage, current-page button, and grouped buttons if Button remains the primary documentation surface.

### Low: Some behavior has tests but not end-to-end assertions

The unit suite is strong for rendering, variants, icon/end content, loading, disabled-with-tooltip, form attributes, link rendering, custom link providers, and disabled link fallback (`src/components/Button/Button.test.tsx:26`-`370`). Gaps:

- No assertion that `type="submit"` actually submits an associated form; only attributes are checked (`src/components/Button/Button.test.tsx:226`-`243`).
- No direct assertion for `aria-current` passthrough despite the public prop (`src/components/Button/Button.tsx:31`-`35`).
- No Button-specific assertion that tooltip wrapping adds `aria-describedby`; Tooltip itself covers this behavior (`src/components/Tooltip/Tooltip.test.tsx:80`-`93`).

Recommendation: add focused tests for these passthrough/integration behaviors if they are part of the supported Button contract.

## Category Notes

- Performance: no significant performance issues found. The component does create small handler functions each render (`src/components/Button/Button.tsx:237`-`261`), but there is no meaningful hot-path work or avoidable expensive computation.
- Accessibility: main concern is the limited ARIA/native attribute surface. Existing loading, disabled, icon-only, new-tab, and disabled-with-tooltip behavior is tested.
- Logic bugs: no high-severity runtime logic bugs found in the reviewed implementation.
- API clarity: docs and README are the main clarity risk; `isIconOnly` without `icon` is also underspecified.
- Missing tests/stories: see findings above.
