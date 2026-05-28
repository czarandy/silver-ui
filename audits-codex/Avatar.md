# Avatar Audit

Scope: `src/components/Avatar/*`, related `Avatar.doc.mjs` copies, and Avatar coverage in `src/components/AvatarGroup/*`.

## Findings

### High - Image error state is not reset when image props change

`Avatar` stores `imageError` and `fallbackError` as component state, but the state is never reset when `src` or `fallbackSrc` changes (`src/components/Avatar/Avatar.tsx:168-178`). After one failed primary image, the same mounted Avatar will keep `showImage` false even if a later render provides a new valid `src`; after one failed fallback image, future `fallbackSrc` values are also suppressed (`src/components/Avatar/Avatar.tsx:213-227`). This can happen in virtualized lists, user switchers, profile updates, or any reused Avatar node.

Coverage gap: the existing fallback test only fires one error and does not rerender with a new `src`/`fallbackSrc` (`src/components/Avatar/Avatar.test.tsx:26-41`).

### Medium - Blank or whitespace names produce unnamed, empty avatars

`showInitials` only checks `name != null`, so `name=""` or `name="   "` suppresses the default icon while `getInitials` returns an empty string (`src/components/Avatar/Avatar.tsx:140-145`, `src/components/Avatar/Avatar.tsx:179`). `accessibleName` also accepts the blank value instead of falling back to `"Avatar"` (`src/components/Avatar/Avatar.tsx:180`, `src/components/Avatar/Avatar.tsx:203-210`). The result is a visual empty circle with `role="img"` and no meaningful accessible name.

Coverage gap: tests cover a normal name and the no-name default icon, but not empty or whitespace names (`src/components/Avatar/Avatar.test.tsx:8-16`, `src/components/Avatar/Avatar.test.tsx:43-47`).

### Medium - Public numeric sizes are undocumented in Storybook and mostly untested

The public type allows numeric sizes `16 | 20 | 24 | 32 | 36 | 40 | 48 | 60 | 64 | 72 | 96 | 128 | 144 | 180` (`src/components/Avatar/Avatar.tsx:16-32`), and docs describe named or numeric pixel values (`Avatar/Avatar.doc.mjs:59-63`, `XDS_src/Avatar/Avatar.doc.mjs:61-64`). Storybook controls only expose named sizes and the Sizes story only demonstrates named values (`src/components/Avatar/Avatar.stories.tsx:11-15`, `src/components/Avatar/Avatar.stories.tsx:31-40`). The direct Avatar tests also do not assert rendered dimensions or numeric size behavior.

This makes a public API path easy to regress visually, especially because status dot sizing depends on the resolved avatar size (`src/components/Avatar/AvatarStatusDot.tsx:80-94`).

### Low - Docs are stale relative to the exported component names

The docs still identify components as `XDSAvatar` and `XDSAvatarStatusDot` and list `xds-avatar` / `xds-avatar-status-dot` theming targets (`Avatar/Avatar.doc.mjs:26-35`, `Avatar/Avatar.doc.mjs:71-74`). The active package exports `Avatar` and `AvatarStatusDot` from `src/components/Avatar/index.ts:1-13`, and the implementation uses Panda classes rather than those XDS class names. The status slot example also references `XDSStatusDot`, not the exported `AvatarStatusDot` (`Avatar/Avatar.doc.mjs:65-69`).

### Low - Missing stories for fallback and status variants

Stories cover initials, primary image, named sizes, and some status usage (`src/components/Avatar/Avatar.stories.tsx:22-65`). Missing useful demonstrations:

- `fallbackSrc` with a broken primary `src`, matching the documented photo -> fallback image -> initials chain.
- No-name default icon state.
- Numeric sizes.
- `AvatarStatusDot` `neutral` variant; `success` and `error` are shown, but `neutral` is not (`src/components/Avatar/AvatarStatusDot.tsx:6`, `src/components/Avatar/Avatar.stories.tsx:43-65`).

### Low - Missing tests for fallback-chain edges and status variants

Current tests cover initials, accessible alt override, one primary-to-fallback image error, default icon accessible name, status rendering, medium status icon sizing, and root passthrough props (`src/components/Avatar/Avatar.test.tsx:7-100`). Missing key behavior tests:

- `src` and `fallbackSrc` changes after error state.
- fallback image failure falling through to initials/default icon.
- empty/whitespace `name`.
- numeric `size` dimensions and named-size mappings.
- `AvatarStatusDot` variant class application, neutral variant, and icon suppression at small avatar sizes.

## Categories With No Issues Found

- Performance: no significant performance issue found in the current implementation. Inline style object creation is minor, and image dimensions are constrained by the fixed avatar content box.
- Basic accessibility: normal named avatars, `alt` override, default icon accessible name, and labelled status dots are covered by existing tests.

## Verification

Ran `pnpm vitest run src/components/Avatar/Avatar.test.tsx`: 7 tests passed.
