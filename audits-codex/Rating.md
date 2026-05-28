# Rating Component Audit

Audited:

- `src/components/Rating/Rating.tsx`
- `src/components/Rating/Rating.stories.tsx`
- `src/components/Rating/Rating.test.tsx`
- `src/components/Rating/index.ts`

Note: untracked top-level `Rating.tsx` and `AdjustableRating.tsx` also exist in the worktree, but the exported Silver UI component lives under `src/components/Rating`.

## Findings

### High: Keyboard focus is effectively invisible

Interactive stars are native radios hidden with the visually-hidden style at `src/components/Rating/Rating.tsx:56`, while the focus-visible outline is defined on the wrapping `label` at `src/components/Rating/Rating.tsx:35`. The label itself is not focusable, so tabbing or arrowing through the radios focuses the clipped input rather than the visible star. Keyboard users can select values, but they cannot reliably see which star has focus.

Recommendation: expose a visible focus state tied to the focused input, for example with a `label:has(input:focus-visible)` style, an adjacent selector, or a different radio implementation where the visible control receives the focus outline. Add a keyboard/focus test or interaction story that would catch this.

### High: Multiple interactive Rating instances collide by default

Each radio input uses `name={label}` at `src/components/Rating/Rating.tsx:158`, and `label` defaults to `"Rating"` at `src/components/Rating/Rating.tsx:104`. Two interactive Rating components with the default label, or with the same custom label, become one native radio group. Browser selection and arrow-key behavior can then cross component boundaries even though each component renders its own `role="radiogroup"` at `src/components/Rating/Rating.tsx:144`.

Recommendation: generate a stable per-instance radio name with `useId()`, and optionally add a separate `name` prop for form integration. Keep `label` only as the accessible label. Add a regression test rendering two interactive ratings with the default props.

### Medium: `value` and `count` allow inconsistent UI and announcements

`count` is used directly to create stars at `src/components/Rating/Rating.tsx:127` and `src/components/Rating/Rating.tsx:146`, while `value` is used directly in the accessible read-only label at `src/components/Rating/Rating.tsx:117` and for fill comparisons at `src/components/Rating/Rating.tsx:129` and `src/components/Rating/Rating.tsx:165`. There is no documented or enforced range. Examples: `value={7}` with `count={5}` announces "7 out of 5" while showing five filled stars; fractional values fill whole stars by comparison; very large counts can render an unexpectedly large number of DOM nodes.

Recommendation: define the contract explicitly. Prefer clamping or rejecting invalid values, requiring integer `count > 0`, and documenting whether fractional ratings are unsupported. Add tests for out-of-range, zero, and custom-count interactive cases once the intended behavior is chosen.

### Medium: The interactive Storybook story does not demonstrate persistent selection

`Interactive` passes a fixed `value` and a no-op `onChange` at `src/components/Rating/Rating.stories.tsx:22`. Clicking a star fires the callback but the visible selected value snaps back because the story is not controlled with local state. This makes the main interactive story less useful for verifying consumer behavior.

Recommendation: render the story with local `useState`, and keep Controls wired for initial value where practical.

### Low: API semantics are implicit

The component becomes interactive only when `onChange` is present and both `isReadOnly` and `isDisabled` are false at `src/components/Rating/Rating.tsx:111`. `value` is required, but there is no uncontrolled `defaultValue` mode and no visible label, description, required, invalid, or described-by support. That may be acceptable for a compact rating primitive, but the current stories/docs do not state the controlled-only contract or the difference between display-only and form-field usage.

Recommendation: document the controlled API and interaction gate. If this is meant to be a form input, consider `name`, `isRequired`, `aria-describedby`, and validation props consistent with other input components.

## Tests

Existing tests cover read-only labeling, custom read-only count, disabled rendering, radiogroup rendering, click selection, keyboard selection, hidden star labels, read-only precedence over `onChange`, and passthrough props.

Missing high-value coverage:

- Two interactive ratings on the same page do not interfere with each other.
- Keyboard focus has a visible indicator on the star being focused.
- Hover preview and mouse-leave reset behavior.
- Interactive `count`.
- Disabled plus `onChange` does not call `onChange` and exposes the intended disabled semantics.
- Boundary behavior for `value={0}`, out-of-range values, fractional values, and invalid `count`.

## Stories / Docs

Stories exist for read-only, interactive, disabled, sizes, and custom count. Missing or weak stories:

- Stateful interactive selection.
- Custom `label`.
- Zero-value rating.
- Multiple ratings on one page.
- Disabled rating with `onChange` supplied, if disabled form-field behavior is intended.

No dedicated Rating docs file was found beyond the Storybook story.

## Performance

No material performance issue for the expected five-star use case. The only performance risk is the unbounded `count` prop, which is covered by the `value`/`count` validation finding above.

## Verification

Ran `pnpm vitest run src/components/Rating/Rating.test.tsx`: 9 tests passed.
