# AspectRatio Audit

Audited 2026-05-28.

Files reviewed:

- `src/components/AspectRatio/AspectRatio.tsx`
- `src/components/AspectRatio/AspectRatio.recipe.ts`
- `src/components/AspectRatio/AspectRatio.stories.tsx`
- `src/components/AspectRatio/AspectRatio.test.tsx`
- `src/components/AspectRatio/index.ts`
- `src/index.ts`

Context: `src/index.ts:327-332` exports the `src/components/AspectRatio` implementation. The root `AspectRatio/` and `XDS_src/AspectRatio/` copies also exist in the worktree, but they are separate/untracked copies and were not treated as the exported component surface for this audit.

## Findings

### Medium: `style.aspectRatio` can silently override the required `ratio` prop

`AspectRatio` requires `ratio`, but the root style is built as `{aspectRatio: ratio, ...style}` in `src/components/AspectRatio/AspectRatio.tsx:54-59`. A consumer can pass `style={{aspectRatio: 1}}` with `ratio={16 / 9}` and the required prop is ignored. That makes the main API contract ambiguous and can create layout bugs that are hard to spot.

Recommendation: either apply `style` first and `aspectRatio` last, or document and test that inline `style.aspectRatio` intentionally wins.

### Medium: Standard div props and ARIA attributes are not forwarded

`AspectRatioProps` only accepts `children`, `className`, `data-testid`, `ratio`, `ref`, and `style` in `src/components/AspectRatio/AspectRatio.tsx:9-33`; the component then destructures exactly those props in `src/components/AspectRatio/AspectRatio.tsx:45-52`. Consumers cannot pass `id`, `title`, `role`, `aria-label`, `aria-labelledby`, `aria-describedby`, event handlers, or other normal `div` props to the root.

This is an accessibility/API limitation for a generic layout primitive: the component itself does not need semantics, but consumers need a way to add them when the ratio box is the labeled media/embed container.

Recommendation: extend `React.HTMLAttributes<HTMLDivElement>` or `ComponentPropsWithoutRef<'div'>`, omit conflicting props as needed, and spread the rest onto the root.

### Low: Invalid ratios are accepted with no guard or documented behavior

`ratio` is typed as `number` in `src/components/AspectRatio/AspectRatio.tsx:22-25` and written directly to CSS in `src/components/AspectRatio/AspectRatio.tsx:58`. Values such as `0`, negative numbers, `NaN`, and `Infinity` are possible at runtime and can produce broken or ignored `aspect-ratio` styles.

Recommendation: document that `ratio` must be a finite positive number, and consider a development warning for invalid values.

### Low: Exported component has stories but no component docs file

The exported component has Storybook coverage in `src/components/AspectRatio/AspectRatio.stories.tsx`, but there is no colocated docs metadata file under `src/components/AspectRatio/`. The root and `XDS_src` copies include `AspectRatio.doc.mjs`, but those describe `XDSAspectRatio` with `xstyle`, not the exported `AspectRatio` API.

Recommendation: add docs for the exported component, or make clear which docs system owns the `src/components` API.

### Low: Missing tests for important API edges

Existing tests cover the happy path for `ratio`, child rendering, and `className`/`style`/`data-testid`/`ref` in `src/components/AspectRatio/AspectRatio.test.tsx:5-47`.

Missing coverage:

- Conflict behavior between `ratio` and `style.aspectRatio`.
- Forwarding standard div/ARIA props if rest props are added.
- Invalid ratio behavior if validation or warnings are added.
- The load-bearing inner wrapper created at `src/components/AspectRatio/AspectRatio.tsx:59`, or at least a behavior-level assertion that children are placed in a full-size wrapper.

### Low: Missing stories for key use cases and API behavior

Stories demonstrate a 16:9 image and a ratio comparison grid in `src/components/AspectRatio/AspectRatio.stories.tsx:15-48`.

Missing useful stories:

- Embedded media such as `iframe` or `video`, which is called out in the component description at `src/components/AspectRatio/AspectRatio.tsx:6-8`.
- Constrained/responsive parent width, since the recipe sets `w: '100%'` in `src/components/AspectRatio/AspectRatio.recipe.ts:4-10`.
- Prop behavior for `className`/`style` once the intended `style.aspectRatio` precedence is settled.

## Category Notes

- Performance: no issues found. Styles are module-scoped, and the component has no state, effects, observers, or expensive computations.
- Accessibility: the only issue found is the missing standard prop/ARIA forwarding above; the component itself is a non-interactive layout wrapper.
- Logic/API clarity: the main risks are `style.aspectRatio` precedence and lack of invalid-ratio behavior.
- Tests/stories: present but thin; they cover basic rendering, not edge behavior or embedded/responsive use cases.
