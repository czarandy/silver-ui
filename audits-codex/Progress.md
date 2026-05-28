# Progress Audit

Reviewed:

- `src/components/Progress/Progress.tsx`
- `src/components/Progress/Progress.test.tsx`
- `src/components/Progress/index.ts`
- `XDS_src/ProgressBar/XDSProgressBar.tsx`
- `XDS_src/ProgressBar/XDSProgressBar.test.tsx`
- `XDS_src/ProgressBar/ProgressBar.doc.mjs`

## Findings

### High: determinate progress uses `role="meter"` instead of `progressbar`

The exported `Progress` renders determinate state with `role={isIndeterminate ? 'progressbar' : 'meter'}` at `src/components/Progress/Progress.tsx:221`, and the XDS source mirrors this at `XDS_src/ProgressBar/XDSProgressBar.tsx:322`. A component named/documented as progress should use `progressbar` for task completion; `meter` is for scalar measurements such as disk usage. The docs explicitly describe upload/loading/task progress in `XDS_src/ProgressBar/ProgressBar.doc.mjs:79`, so the current role can cause assistive tech to announce the wrong semantic. Tests lock this in via `getByRole('meter')` at `src/components/Progress/Progress.test.tsx:8` and `XDS_src/ProgressBar/XDSProgressBar.test.tsx:10`.

### High: `max <= 0` can produce invalid value text and ARIA state

`defaultFormatValueLabel` divides by `max` at `src/components/Progress/Progress.tsx:155`, while only the visual width calculation guards `max > 0` at `src/components/Progress/Progress.tsx:176`. `<Progress max={0} value={0} hasValueLabel />` produces `NaN%` for both visible text and `aria-valuetext` at `src/components/Progress/Progress.tsx:219`. Negative `max` is worse: `clampedValue` can become negative despite `aria-valuemin={0}` because `Math.min(Math.max(0, value), max)` at `src/components/Progress/Progress.tsx:175` returns the negative max. XDS has the same implementation at `XDS_src/ProgressBar/XDSProgressBar.tsx:228` and `XDS_src/ProgressBar/XDSProgressBar.tsx:273`. The XDS zero-max test only checks `aria-valuenow`/`aria-valuemax` at `XDS_src/ProgressBar/XDSProgressBar.test.tsx:118`, so it misses `aria-valuetext="NaN%"`.

### Medium: no stories found for Progress

I found docs metadata in `XDS_src/ProgressBar/ProgressBar.doc.mjs`, but no `Progress.stories.*` or `ProgressBar.stories.*` in this checkout. The source comment says Storybook should be kept in sync at `XDS_src/ProgressBar/XDSProgressBar.tsx:15`. Important states lack stories: determinate default, custom `max`, `hasValueLabel`, `formatValueLabel`, all `variant` values, `isIndeterminate`, `isDisabled`, and `isLabelHidden`.

### Medium: reduced-motion handling still runs infinite animation

The `Progress` indeterminate fill keeps animating under `prefers-reduced-motion: reduce`, only slowing from `1.5s` to `3s` at `src/components/Progress/Progress.tsx:140`. XDS does the same at `XDS_src/ProgressBar/XDSProgressBar.tsx:197`. Nearby components such as `src/components/Spinner/Spinner.tsx:67` and `src/components/Skeleton/Skeleton.tsx:55` stop animation in reduced-motion mode, so Progress is inconsistent and may still be uncomfortable.

### Medium: source tests miss key props and edge cases

`src/components/Progress/Progress.test.tsx` covers basic ARIA, labels, custom formatting, clamp, indeterminate mode, and `data-testid`. It does not test `isLabelHidden`, `isDisabled`, `variant`, `max={0}`, negative `max`, `ref`, `className`, `style`, or visual width. XDS has broader coverage for hidden labels, variants, disabled, ref, and zero max in `XDS_src/ProgressBar/XDSProgressBar.test.tsx`, but those tests do not protect the exported `src/components/Progress` implementation.

### Low: `isDisabled` is visual-only and not exposed semantically

The prop docs say "visually disabled" at `src/components/Progress/Progress.tsx:31`, and the implementation only changes text/fill colors at `src/components/Progress/Progress.tsx:179` and `src/components/Progress/Progress.tsx:193`. Because progress bars are non-interactive this may be intentional, but consumers may expect an `aria-disabled` signal or clearer docs explaining that it only represents inactive/canceled styling.

### Low: no performance problems found

The component keeps style definitions at module scope and performs only constant-time arithmetic per render. The inline fill style object at `src/components/Progress/Progress.tsx:227` is not a meaningful performance issue for this component.

## Category Notes

Accessibility: issues found for determinate role semantics, invalid ARIA under bad `max`, reduced motion, and unclear disabled semantics.

Logic bugs: `max <= 0` is the main logic bug.

Unclear API: `isDisabled` semantics are slightly unclear; otherwise the prop surface is small and understandable.

Missing tests: source tests need coverage for `isLabelHidden`, `isDisabled`, `variant`, invalid/zero `max`, forwarding props/ref, and rendered width.

Missing stories: no stories were found; docs metadata exists only for the XDS ProgressBar.
