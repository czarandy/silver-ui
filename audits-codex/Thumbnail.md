# Thumbnail Audit

Audited active files:

- `src/components/Thumbnail/Thumbnail.tsx`
- `src/components/Thumbnail/Thumbnail.stories.tsx`
- `src/components/Thumbnail/Thumbnail.test.tsx`
- `src/components/Thumbnail/index.ts`

Also checked `XDS_src/Thumbnail/*` for reference only. The active build/test/storybook surface is `src`: `tsconfig.json:21`, `vitest.config.ts:17`, `.storybook/main.ts:8`.

## Findings

### High - Image error state is never reset when `src` changes

`Thumbnail` stores image load failure in `hasImageError`, and `hasImage` stays false once any image errors (`src/components/Thumbnail/Thumbnail.tsx:167-168`). There is no effect or keying logic to clear that state when a later render receives a new `src`. A reused thumbnail that first renders a broken URL will keep showing the placeholder/skeleton even after the caller supplies a valid replacement URL.

Coverage gap: tests only render a successful image once and never fire an image `error` event or rerender with a new `src` (`src/components/Thumbnail/Thumbnail.test.tsx:7-17`).

### Medium - Loading state is not exposed on the thumbnail container

When `isLoading` is true, the component changes visuals to a skeleton or spinner overlay (`src/components/Thumbnail/Thumbnail.tsx:171-179`, `src/components/Thumbnail/Thumbnail.tsx:215-219`), but the root does not expose `aria-busy` or another loading state (`src/components/Thumbnail/Thumbnail.tsx:187-197`). The spinner has `role="status"` via `Spinner`, but the skeleton-only loading path has no status semantics. Assistive technology users may not know the thumbnail attachment is still loading.

Coverage gap: the loading test only asserts the labelled root exists, not busy/status semantics or the spinner overlay path (`src/components/Thumbnail/Thumbnail.test.tsx:41-45`).

### Medium - Root `aria-label` is placed on a non-semantic `div`

The root always receives `aria-label={accessibleName}` (`src/components/Thumbnail/Thumbnail.tsx:187-197`), but it remains a plain `div` with no role. That label is not a reliable accessible name for non-interactive placeholder or skeleton thumbnails. Interactive thumbnails are labelled by the inner button (`src/components/Thumbnail/Thumbnail.tsx:203-210`), and image thumbnails can rely on `<img alt>`, but the non-interactive no-image/loading states are effectively unlabelled aside from tooltip plumbing.

### Medium - Active docs are missing

There is no `src/components/Thumbnail/*.doc.mjs` or other active docs file for the exported `Thumbnail`. The only detailed docs are in `XDS_src/Thumbnail/Thumbnail.doc.mjs`, but `XDS_src` is outside the active TypeScript include, Vitest include, and Storybook story glob. Consumers therefore rely on inline prop comments and two sparse stories for API guidance.

### Low - `label` and `alt` relationship is unclear

The prop comments define `alt` as image alt text and `label` as "Accessible label and tooltip text" (`src/components/Thumbnail/Thumbnail.tsx:11-37`), while `accessibleName` prefers `label` over `alt` (`src/components/Thumbnail/Thumbnail.tsx:170`). With both props set, action labels become `Open photo.jpg` / `Remove photo.jpg` and omit the image description. With neither prop set, all controls fall back to generic names such as `Open thumbnail` (`src/components/Thumbnail/Thumbnail.tsx:205`, `src/components/Thumbnail/Thumbnail.tsx:225`). The API should document which prop is required for file identity vs image content, or combine both when both are present.

### Low - Missing stories for important props and states

Storybook has only `Default` and a compact `States` row (`src/components/Thumbnail/Thumbnail.stories.tsx:18-31`). Missing useful demonstrations:

- `onClick` interactive thumbnail.
- `onRemove` remove button.
- Combined `onClick` plus `onRemove`.
- `isDisabled`.
- `isLoading` with `src`, which shows the spinner overlay rather than the skeleton.
- Broken image/error placeholder using a failing `src`.
- `alt` vs `label` guidance through examples.

### Low - Missing tests for key behavior

Current active coverage has 3 tests (`src/components/Thumbnail/Thumbnail.test.tsx:6-46`). Missing key behavior tests:

- Broken image fallback and resetting `hasImageError` when `src` changes.
- Placeholder rendering when no `src` is provided.
- `isLoading` with `src` showing the spinner overlay.
- `isDisabled` suppressing click and remove controls.
- `isLoading` suppressing the click button.
- Remove click not triggering the thumbnail `onClick`.
- Ref forwarding to the root.
- Accessible names when both `label` and `alt` are provided, and when neither is provided.

## Categories With No Issues Found

- Performance: no significant performance issue found. The component has a fixed 64px box, no expensive loops, and only one local state value.
- Basic image rendering: normal successful image rendering and basic click/remove callbacks are covered by existing tests.

## Verification

Ran `pnpm vitest run src/components/Thumbnail/Thumbnail.test.tsx`: 1 test file passed, 3 tests passed.
