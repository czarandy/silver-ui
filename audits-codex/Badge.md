# Badge Audit

Scope reviewed:

- Implementation: `src/components/Badge/Badge.tsx`, `XDS_src/Badge/XDSBadge.tsx`
- Stories/docs: `src/components/Badge/Badge.stories.tsx`, `XDS_src/Badge/Badge.doc.mjs`
- Tests: `src/components/Badge/Badge.test.tsx`, `XDS_src/Badge/XDSBadge.test.tsx`

## Findings

### Medium - XDS Badge tests are not run by the repo test config

`XDS_src/Badge/XDSBadge.test.tsx:7` contains useful coverage for default rendering, semantic variants, non-semantic variants, icon rendering, ref forwarding, prop spreading, and theme class names. However, the Vitest config only includes `src/**/*.test.{ts,tsx}` and `eslint/**/*.test.{js,ts}` at `vitest.config.ts:17`, so these XDS tests are outside the default test suite.

I verified with `pnpm vitest run src/components/Badge/Badge.test.tsx XDS_src/Badge/XDSBadge.test.tsx`; Vitest reported only one test file and two tests run, matching the local `src/components/Badge/Badge.test.tsx` file. This leaves the XDS Badge implementation effectively unprotected in this repo's normal test command.

### Medium - Local Badge has a narrow prop API and cannot accept common HTML or accessibility attributes

`src/components/Badge/Badge.tsx:21` defines a closed `BadgeProps` interface with only `className`, `data-testid`, `icon`, `label`, `ref`, `style`, and `variant`; the rendered `span` at `src/components/Badge/Badge.tsx:103` only receives those root props. Consumers cannot pass common attributes such as `id`, `role`, `aria-label`, `aria-live`, `aria-describedby`, `title`, or arbitrary `data-*` telemetry hooks.

This is inconsistent with the XDS version, which extends `XDSBaseProps<HTMLSpanElement>` at `XDS_src/Badge/XDSBadge.tsx:153` and spreads remaining props onto the root at `XDS_src/Badge/XDSBadge.tsx:194`. `XDS_src/XDSBaseProps.ts:9` also explicitly documents preserving event handlers, `aria-*`, `role`, `tabIndex`, `hidden`, `dir`, `className`, `style`, `id`, and `data-*`.

### Low - Local stories do not demonstrate every supported variant

`src/components/Badge/Badge.tsx:5` supports 14 variants, and the XDS docs list the same full set at `XDS_src/Badge/Badge.doc.mjs:11`. The local `Variants` story only renders 8 variants at `src/components/Badge/Badge.stories.tsx:6`: `neutral`, `info`, `success`, `warning`, `error`, `blue`, `purple`, and `teal`.

Missing story coverage: `cyan`, `green`, `orange`, `pink`, `red`, and `yellow`. Since `variant` is the main visual prop, the story should show the complete matrix.

### Low - Local Badge tests do not assert the icon or variant behavior they intend to cover

The test named "renders a label and optional icon" passes `<Badge icon={<Check />} label="Active" />` at `src/components/Badge/Badge.test.tsx:8`, but only asserts the label at `src/components/Badge/Badge.test.tsx:10`. It would still pass if the component dropped `icon` entirely.

There is also no local test for the default variant, variant class changes, ref forwarding, or the full supported variant set. The XDS tests cover many of these behaviors, but as noted above they are not included by the current Vitest config.

## Category Notes

- Performance: no issue found. Both implementations use static style definitions outside render and do only simple prop composition.
- Accessibility: no intrinsic role issue found for a text badge, but the local component's inability to accept `aria-*`/`role` props is a practical accessibility API gap.
- Logic bugs: no runtime behavior bug found in the reviewed implementation.
- API clarity: the local API is more restrictive than the XDS API and does not document whether that restriction is intentional.
- Missing docs/stories: XDS docs are comprehensive for props and usage guidance; local Storybook coverage is thin for variants.
- Missing tests: local tests need icon assertions and variant/ref coverage; XDS tests need to be included in the test runner or moved under the configured test include path.
