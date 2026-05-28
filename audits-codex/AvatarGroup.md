# AvatarGroup Audit

Audited files:

- `src/components/AvatarGroup/AvatarGroup.tsx`
- `src/components/AvatarGroup/AvatarGroupOverflow.tsx`
- `src/components/AvatarGroup/AvatarGroupContext.ts`
- `src/components/AvatarGroup/AvatarGroup.recipe.ts`
- `src/components/AvatarGroup/AvatarGroup.stories.tsx`
- `src/components/AvatarGroup/AvatarGroup.test.tsx`
- `src/components/AvatarGroup/index.ts`
- `src/components/Avatar/Avatar.tsx`
- `src/components/Avatar/Avatar.recipe.ts`
- `AvatarGroup.doc.mjs`
- `XDS_src/AvatarGroup/*`

## Findings

### Medium: Static overflow label is not reliably exposed to assistive tech

`AvatarGroupOverflow` renders the non-clickable overflow indicator as a plain `span` with `aria-label` (`src/components/AvatarGroup/AvatarGroupOverflow.tsx:116-124`). A generic static span has no semantic role, so screen readers may expose only the visible `+3` text, or skip the label semantics that the tests expect. This is especially important because the visible content is abbreviated while the intended accessible text is `"3 more"` (`src/components/AvatarGroup/AvatarGroupOverflow.tsx:91-92`).

Impact: static overflow can be unclear to screen reader users. Consider `role="img"` with the existing `aria-label`, or render visually hidden text alongside an `aria-hidden` visual `+N`.

### Medium: Docs describe an API that the primary component does not have

`AvatarGroup.doc.mjs` is still XDS-oriented and mentions `XDSAvatarGroup`, `XDSAvatarGroupOverflow`, `XDSAvatar`, `xstyle`, and `xds-avatar-group` (`AvatarGroup.doc.mjs:10-43`). It also tells consumers to "Set max" (`AvatarGroup.doc.mjs:12`, `AvatarGroup.doc.mjs:55`, `AvatarGroup.doc.mjs:91`, `AvatarGroup.doc.mjs:103`), but the primary exported component has no `max` prop (`src/components/AvatarGroup/AvatarGroup.tsx:13-42`) and expects consumers to slice children themselves. The overflow docs omit the actual required `count` prop and optional `onClick` prop (`src/components/AvatarGroup/AvatarGroupOverflow.tsx:13-41`), and incorrectly mark custom `children` as required (`AvatarGroup.doc.mjs:42-44`).

Impact: consumers following docs can try unsupported props or miss required overflow configuration. The docs should be rewritten for `AvatarGroup`/`AvatarGroupOverflow` and the current `className`/`style` API.

### Low: Nested images can duplicate avatar names in a group

`Avatar` renders a root `div` with `role="img"` and `aria-label` (`src/components/Avatar/Avatar.tsx:202-211`), then renders a nested `img` with the same `alt` text when an image source is available (`src/components/Avatar/Avatar.tsx:213-219`, `src/components/Avatar/Avatar.tsx:221-227`). Inside an `AvatarGroup`, this can expose each photo twice in the accessibility tree.

Impact: grouped image avatars may be verbose. If the root is the semantic avatar, nested image `alt` should likely be empty/hidden; otherwise the root role should be reconsidered.

### Low: Key layout behavior is under-tested

The group overlap is the central behavior, but no test asserts that grouped avatars receive the negative overlap variable or grouped recipe styling (`src/components/Avatar/Avatar.tsx:181-185`, `src/components/Avatar/Avatar.recipe.ts:20-22`). Overflow sizing from group context is also untested even though it is computed dynamically (`src/components/AvatarGroup/AvatarGroupOverflow.tsx:88-99`).

Impact: regressions could make the component render as a plain row while existing tests still pass.

## Tests

Existing tests cover the group role/name, default accessible label, group size overriding an avatar's own size through status-dot sizing, static overflow text, clickable overflow behavior, custom overflow content, and root `className`/`style`/`data-testid`/`ref` (`src/components/AvatarGroup/AvatarGroup.test.tsx:9-95`).

Missing or weak coverage:

- No test for actual overlap styling on grouped avatars.
- No test for overflow width/height/font size inheriting the group `size`.
- No test that `AvatarGroupOverflow` forwards `className`, `style`, `data-testid`, and refs for both span and button paths.
- No accessibility test that would catch duplicate image exposure or the static overflow `span` semantics.
- No test for multiple groups with different sizes on the same page.

Focused run: `pnpm vitest run src/components/AvatarGroup/AvatarGroup.test.tsx` passed, 7 tests.

## Stories And Docs

Existing stories demonstrate a basic group, static overflow, and clickable overflow (`src/components/AvatarGroup/AvatarGroup.stories.tsx:24-53`). The `size` prop is available as a named-size control and `aria-label` is set in default args (`src/components/AvatarGroup/AvatarGroup.stories.tsx:9-18`).

Missing stories:

- No story showing all supported sizes, and numeric `AvatarSize` values are supported by the component but absent from the Storybook control (`src/components/AvatarGroup/AvatarGroup.stories.tsx:14-17`; `src/components/Avatar/Avatar.tsx:19-34`).
- No story showing custom overflow `children`.
- No story showing avatars with status dots inside a group.
- No story showing that group `size` overrides child avatar `size`.

Docs need alignment with the primary `src/components/AvatarGroup` API as noted above.

## Category Notes

- Performance: no significant issues found. `AvatarGroup` does not clone or inspect children, and memoizes the context value with the right dependencies (`src/components/AvatarGroup/AvatarGroup.tsx:54-59`).
- Accessibility: group naming is covered for the base case (`src/components/AvatarGroup/AvatarGroup.tsx:63-69`). The main concerns are static overflow semantics and duplicate nested image names.
- Logic bugs: no high-severity logic bugs found in sizing or context propagation. The main behavior risk is missing test coverage for overlap and overflow sizing.
- API clarity: the implementation has a small compositional API, but docs are stale and the lack of built-in `max`/slicing should be stated consistently.
