# Lightbox Audit

Audited exported implementation:

- `src/components/Lightbox/Lightbox.tsx`
- `src/components/Lightbox/useLightbox.tsx`
- `src/components/Lightbox/index.ts`

Also checked `XDS_src/Lightbox`, but it is outside the active build/test/storybook surface: `tsconfig.json:21` includes only `src`, `vitest.config.ts:17` includes only `src/**/*.test.{ts,tsx}`, and `.storybook/main.ts:8` includes only `../src/**/*.stories.@(ts|tsx)`.

## Findings

### High: Empty media arrays crash during render

`media` accepts `ReadonlyArray<LightboxMedia>` (`src/components/Lightbox/Lightbox.tsx:78`), but the component does not reject or handle an empty array. With `media={[]}`, `currentItem` is `undefined` (`src/components/Lightbox/Lightbox.tsx:235-239`) and render immediately reads `currentItem.type` (`src/components/Lightbox/Lightbox.tsx:241`), crashing before any fallback UI can render. Either require a non-empty array type/runtime guard or define an empty state.

### Medium: Arrow-key gallery navigation can hijack video controls

The dialog-level `onKeyDown` always prevents `ArrowLeft`/`ArrowRight` and navigates the gallery (`src/components/Lightbox/Lightbox.tsx:329-336`). When focus is inside the rendered `<video controls>` (`src/components/Lightbox/Lightbox.tsx:390-397`), those same keys are expected to seek media in native controls. In a mixed/video gallery, keyboard users can lose expected video control behavior. The handler should ignore events originating from interactive media controls or scope gallery shortcuts to non-interactive targets.

### Medium: Zoom is pointer-only and not announced as a control

`hasZoom` is exposed as an important capability (`src/components/Lightbox/Lightbox.tsx:63-66`), but zoom toggles only on double-click (`src/components/Lightbox/Lightbox.tsx:370-376`) and pan only on pointer drag (`src/components/Lightbox/Lightbox.tsx:377-388`). There is no keyboard-operable zoom button, no state announcement, and no instructions exposed to assistive tech. This makes the zoom feature inaccessible to keyboard and many assistive-technology users.

### Medium: Public Lightbox has no active tests

There is no `src/components/Lightbox/Lightbox.test.tsx` or hook test. The only Lightbox test file is `XDS_src/Lightbox/XDSLightbox.test.tsx`, but Vitest excludes it (`vitest.config.ts:17`). Key behavior lacking active coverage: open/close via `showModal`/`close`, Escape and backdrop close, focus restoration, single image rendering, captions, video/autoplay, gallery buttons and arrow keys, controlled vs uncontrolled `index`, clamping/invalid indexes, zoom/pan reset, empty media handling, and `useLightbox` trigger props.

### Medium: Public Lightbox has no active Storybook stories

There is no `src/components/Lightbox/Lightbox.stories.tsx`, and Storybook only loads stories from `src` (`.storybook/main.ts:8`). Important props and modes without active stories: single image, caption, gallery, controlled `index`/`onIndexChange`, `defaultIndex`, `hasZoom`, video, `hasAutoPlay`, `className`/`style`, and `useLightbox`/`getTriggerProps(index)`.

### Low: Negative indexes produce inconsistent UI

The upper bound is clamped with `Math.min(index, mediaItems.length - 1)`, but the lower bound is not (`src/components/Lightbox/Lightbox.tsx:238`). A negative controlled `index` or `defaultIndex` falls back to the first media item (`src/components/Lightbox/Lightbox.tsx:239`) while the gallery counter can display `0 / n` (`src/components/Lightbox/Lightbox.tsx:426-429`) and navigation state is based on the negative index (`src/components/Lightbox/Lightbox.tsx:242-243`). Clamp to `[0, length - 1]` or document invalid indexes.

### Low: Video captions API is missing

Video support renders a `<track kind="captions" />` without a `src` (`src/components/Lightbox/Lightbox.tsx:390-397`), and `LightboxMedia` has no way to pass caption tracks (`src/components/Lightbox/Lightbox.tsx:23-40`). This does not provide actual captions for videos. Add a captions track API or remove the empty track and document that callers must provide accessible captioned media elsewhere.

### Low: Pointer pan updates React state on every pointermove

During drag, every `pointermove` calls `setPan` (`src/components/Lightbox/Lightbox.tsx:284-301`), which re-renders the component and updates inline transform style (`src/components/Lightbox/Lightbox.tsx:244-247`, `src/components/Lightbox/Lightbox.tsx:399-408`). This is probably acceptable for small images, but high-frequency dragging large media can jank. Consider `requestAnimationFrame` throttling or transform updates outside React state if this becomes a performance hotspot.

### Low: API/docs surface is unclear

The active `src` Lightbox has inline prop comments but no active docs/story file. `XDS_src/Lightbox/Lightbox.doc.mjs` documents `XDSLightbox`, not the exported `Lightbox`, and omits some public props such as `defaultIndex` and `hasAutoPlay` from its prop table (`XDS_src/Lightbox/Lightbox.doc.mjs:9-50`). `useLightbox` also returns trigger props that replace consumer `onClick`/`onKeyDown` handlers rather than composing them (`src/components/Lightbox/useLightbox.tsx:75-89`), which should be documented or adjusted.

## Category Notes

- Accessibility: Issues found for video arrow keys, pointer-only zoom, and missing video captions.
- Logic bugs: Empty arrays crash; negative indexes create inconsistent gallery state.
- Performance: Only the pointermove re-render concern was found.
- API clarity: Needs active docs/stories and clearer trigger-prop composition semantics.
- Missing tests: No active tests for exported `Lightbox` or `useLightbox`.
- Missing stories: No active Storybook stories for the exported component.
