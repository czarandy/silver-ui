# Skeleton Audit

Reviewed:

- `src/components/Skeleton/Skeleton.tsx`
- `src/components/Skeleton/Skeleton.stories.tsx`
- `src/components/Skeleton/Skeleton.test.tsx`
- `src/components/Skeleton/index.ts`
- `XDS_src/Skeleton/XDSSkeleton.tsx`
- `XDS_src/Skeleton/Skeleton.doc.mjs`

## Findings

### Medium: loading semantics are left entirely to consumers and not documented

`Skeleton` renders a bare empty `div` at `src/components/Skeleton/Skeleton.tsx:88` with no `aria-hidden`, `role`, accessible name, or companion `aria-busy` pattern. A decorative skeleton should usually be hidden from assistive tech while the loading region exposes `aria-busy` or a status message; otherwise screen reader users may receive no loading state when real content is replaced. The only docs found are the XDS metadata, and its usage guidance at `XDS_src/Skeleton/Skeleton.doc.mjs:40` describes visual loading behavior but does not mention the accessibility contract. The Storybook examples at `src/components/Skeleton/Skeleton.stories.tsx:14` and `src/components/Skeleton/Skeleton.stories.tsx:15` also do not demonstrate wrapping content with `aria-busy`.

### Medium: source tests miss most behavior

`src/components/Skeleton/Skeleton.test.tsx:6` has one test covering numeric width/height and `className`. It does not test string dimensions, `radius` classes, `index`/`animationDelay`, `style` precedence, `ref`, default sizing, reduced-motion class generation, or the intended accessibility behavior. The riskiest untested behavior is the animation stagger at `src/components/Skeleton/Skeleton.tsx:95`, because it is a visible feature and can produce invalid-looking timing if callers pass unexpected values.

### Low: `index` accepts unbounded values, including negative values

The public prop is typed as a plain `number` at `src/components/Skeleton/Skeleton.tsx:25` and is used directly in `delayTime + staggerTime * index` at `src/components/Skeleton/Skeleton.tsx:95`. Negative values can reduce the delay below the intended one-second base, and values below `-10` produce a negative `animation-delay`, which starts the pulse partway through. This is not likely from normal TypeScript usage, but the runtime behavior is surprising and currently untested.

### Low: stories cover the happy path but not important variants

The stories include a controllable default with `height`, `width`, and `radius` args at `src/components/Skeleton/Skeleton.stories.tsx:8`, plus a multi-line content block using `radius="rounded"` and staggered `index` values at `src/components/Skeleton/Skeleton.stories.tsx:18`. Missing useful stories: a radius scale comparison (`none`, `0`-`4`, `rounded`), numeric versus CSS string dimensions, and an accessible loading-region example showing the recommended parent semantics.

### Low: `index` is a slightly unclear API name

The JSDoc says `index` means "Animation stagger index" at `src/components/Skeleton/Skeleton.tsx:21`, and XDS docs explain the formula at `XDS_src/Skeleton/Skeleton.doc.mjs:29`. In JSX, though, `<Skeleton index={2} />` does not make the animation relationship obvious. A name such as `staggerIndex` or stronger docs in the main component stories would make the API easier to understand.

## Category Notes

Performance: no concrete performance problem found. Styles are module-scoped at `src/components/Skeleton/Skeleton.tsx:49`, rendering does constant work, and reduced-motion disables the pulse at `src/components/Skeleton/Skeleton.tsx:54`.

Accessibility: the main gap is missing/documented loading semantics. Reduced-motion handling exists.

Logic bugs: only the unbounded `index` timing issue was found.

Unclear API: `index` is the only unclear prop; width, height, radius, className, style, ref, and `data-testid` are straightforward.

Missing tests: key prop behavior and accessibility intent need coverage.

Missing stories/docs: stories exist but do not cover radius variants or the accessible loading pattern; docs metadata exists only under `XDS_src/Skeleton`.
