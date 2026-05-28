# Spinner Audit

Reviewed:

- `src/components/Spinner/Spinner.tsx`
- `src/components/Spinner/Spinner.recipe.ts`
- `src/components/Spinner/Spinner.stories.tsx`
- `src/components/Spinner/Spinner.test.tsx`
- `XDS_src/Spinner/XDSSpinner.tsx`
- `XDS_src/Spinner/XDSSpinner.test.tsx`
- `XDS_src/Spinner/Spinner.doc.mjs`

## Findings

### High: XDS Spinner can render an unnamed status for empty labels

`XDS_src/Spinner/XDSSpinner.tsx:225-229` treats any non-null `label` as present and uses nullish coalescing for the accessible name. An empty string label therefore produces `aria-label=""` instead of falling back to `"Loading"`, and an explicit empty `aria-label` does the same. That leaves the `role="status"` element unnamed. The `src` Spinner explicitly avoids this by treating empty strings as absent (`src/components/Spinner/Spinner.tsx:82-88`) and has tests for both empty `label` and empty `aria-label` (`src/components/Spinner/Spinner.test.tsx:72-97`). XDS does not have equivalent coverage.

Recommendation: normalize empty strings before resolving `aria-label`, and add XDS tests for empty `label` and empty `aria-label`.

### Medium: XDS Spinner ignores reduced-motion preferences

`XDS_src/Spinner/XDSSpinner.tsx:68-75` applies an infinite rotation animation with no `prefers-reduced-motion` override. The main Spinner disables animation for reduced motion (`src/components/Spinner/Spinner.tsx:65-68`) and tests for the generated reduced-motion class (`src/components/Spinner/Spinner.test.tsx:99-106`). This is an accessibility gap for the XDS variant.

Recommendation: add a reduced-motion style override for the canvas animation and test for it, matching the main Spinner behavior.

### Medium: XDS labeled Spinner changes the public element/ref contract

`XDSSpinnerProps` extends `XDSBaseProps<HTMLSpanElement>` and exposes `ref?: React.Ref<HTMLSpanElement>` (`XDS_src/Spinner/XDSSpinner.tsx:86-88`), but when `label` is present the component returns a wrapper `<div>` and casts the ref to `React.Ref<HTMLDivElement>` (`XDS_src/Spinner/XDSSpinner.tsx:252-262`). The status span remains nested (`XDS_src/Spinner/XDSSpinner.tsx:231-245`), while `data-testid`, `className`, `style`, `xstyle`, and `restProps` move to the wrapper. Existing tests only assert the no-label root is a span (`XDS_src/Spinner/XDSSpinner.test.tsx:110-114`), so this contract switch is untested.

Recommendation: either keep a stable root element/ref target across label states, or document and type the wrapper behavior explicitly. Add tests for labeled root tag, ref target, and where pass-through props land.

### Medium: XDS docs and tests are out of sync with the implementation API

The implementation supports `size="xl"` (`XDS_src/Spinner/XDSSpinner.tsx:36-41`) and `shade="subtle"` (`XDS_src/Spinner/XDSSpinner.tsx:84`), but docs list only `sm | md | lg` and `default | onMedia` (`XDS_src/Spinner/Spinner.doc.mjs:10-20`, `XDS_src/Spinner/Spinner.doc.mjs:122-127`). The component JSDoc also says `xl` is 36px while `SIZES.xl.diameter` is 28 (`XDS_src/Spinner/XDSSpinner.tsx:90-95`), and the summary says three sizes and two shades (`XDS_src/Spinner/XDSSpinner.tsx:130-131`). Tests cover only `sm`, `md`, `lg`, `default`, and `onMedia` (`XDS_src/Spinner/XDSSpinner.test.tsx:22-45`).

Recommendation: update docs for `xl` and `subtle`, fix the `xl` size description, and add tests for the missing variants.

### Low: XDS canvas is not hidden from assistive technology

The visual spinner is rendered as a bare `<canvas>` inside the status span (`XDS_src/Spinner/XDSSpinner.tsx:231-245`). The main Spinner hides its decorative visual with `aria-hidden="true"` (`src/components/Spinner/Spinner.tsx:99`). Because the XDS status already has an accessible name, the canvas should be explicitly decorative.

Recommendation: add `aria-hidden="true"` or `role="presentation"` to the canvas and test the decorative visual is hidden.

## Category Notes

- Performance: no performance issue found in the main `src` Spinner. It uses CSS border animation and no React effects. The XDS canvas does more work, but redraws only when `shade`, `size`, or theme tokens change (`XDS_src/Spinner/XDSSpinner.tsx:157-221`).
- Accessibility: main `src` Spinner covers status semantics, accessible names, decorative visual hiding, and reduced motion. XDS has the accessibility gaps listed above.
- Logic bugs: no logic bug found in the main `src` Spinner. XDS has empty-label and root/ref contract issues listed above.
- API clarity: main `src` Spinner has a small, clear API (`size`, `variant`, `label`, `aria-label`, `className`, `style`, `data-testid`, `ref`). XDS API docs are stale for `xl` and `subtle`.
- Tests: `src/components/Spinner/Spinner.test.tsx` covers defaults, size, variant, label, accessible-name precedence, empty strings, reduced motion, class/style, and ref. XDS tests miss empty strings, reduced motion, `xl`, `subtle`, canvas hiding, and labeled root/ref/pass-through behavior.
- Stories/docs: `src/components/Spinner/Spinner.stories.tsx` demonstrates default, label, sizes, sizes with labels, `onMedia`, and `onMedia` with label. No standalone docs file was found for the main `src` Spinner; XDS has docs, but they are stale as noted above. No important visual story appears missing for the main Spinner.

## Verification

Ran `pnpm vitest run src/components/Spinner/Spinner.test.tsx XDS_src/Spinner/XDSSpinner.test.tsx`. Vitest passed 15 tests from `src/components/Spinner/Spinner.test.tsx`; `XDS_src/Spinner/XDSSpinner.test.tsx` was not executed because `vitest.config.ts:17` includes only `src/**/*.test.{ts,tsx}` and `eslint/**/*.test.{js,ts}`.
