# Lightbox Component Audit

**Files reviewed:**

- `src/components/Lightbox/Lightbox.tsx`
- `src/components/Lightbox/useLightbox.tsx`
- `src/components/Lightbox/index.ts`

---

## Performance Problems

### 1. `close`, `goPrev`, and `goNext` are recreated every render

**File:** `Lightbox.tsx`, lines 303-313

`close`, `goPrev`, and `goNext` are plain arrow functions defined in the render body. They are passed to `Button` `onClick` handlers, causing those child components to receive new function references on every render. Wrapping them in `useCallback` (as `setIndex` already is on line 251) would prevent unnecessary child re-renders.

### 2. `useLightbox` creates a new JSX `element` on every render

**File:** `useLightbox.tsx`, lines 90-99

The `element` property returned from `useLightbox` is an inline JSX expression, not wrapped in `useMemo`. Every render of the consuming component produces a new React element tree. Because `lightboxProps` is destructured from `options` (which is a new object each call), memoizing this is non-trivial, but it is worth documenting or considering `React.memo` on the `Lightbox` component itself to short-circuit re-renders when props are unchanged.

### 3. Window-level event listeners in drag effect

**File:** `Lightbox.tsx`, lines 284-301

The `pointermove` and `pointerup` listeners are added to `window` every time `isDragging` transitions to `true`, which is correct. However, `setPan` inside `handlePointerMove` creates a new object on every pointer move event. For high-frequency pointer events this is fine for typical usage but could become a concern on low-end devices. This is minor and acceptable.

### 4. No image preloading for gallery navigation

**File:** `Lightbox.tsx`

When using the gallery, the next/previous image is not preloaded. Users navigating quickly through a gallery may see loading delays. Consider preloading adjacent images via `new Image()` in an effect keyed on `currentIndex`.

---

## Accessibility Concerns

### 1. Gallery counter is not announced to screen readers

**File:** `Lightbox.tsx`, lines 426-430

The counter (`1 / 5`) is a visual `<div>` with no `aria-live` region. When the user navigates with arrow keys, screen readers will not announce the updated position. Add `aria-live="polite"` and optionally `role="status"` to the counter element.

### 2. `aria-label` on `<dialog>` changes with each slide and duplicates the image alt

**File:** `Lightbox.tsx`, line 317

The `<dialog>` uses `aria-label={currentItem.alt}`, which means:

- The label changes as users navigate, which can be confusing for screen readers.
- It duplicates the `alt` attribute already on the `<img>` inside (line 400) or the `aria-label` on the `<video>` (line 391).

A static label like `"Media lightbox"` or `"Image viewer"` would be more appropriate for the dialog. The individual media alt text is already provided on the media elements themselves.

### 3. Navigation button labels are hardcoded as "Previous image" / "Next image"

**File:** `Lightbox.tsx`, lines 356, 421

When viewing a video, the buttons still say "Previous image" and "Next image". These should say "Previous" / "Next" or adapt based on media type.

### 4. `<video>` has an empty captions track

**File:** `Lightbox.tsx`, line 396

The `<track kind="captions" />` element has no `src` attribute, so it provides no actual captions. This satisfies a lint rule but does not provide real accessibility. The `LightboxMedia` interface should support a `captionsSrc` property for video captions, or the empty track should be documented as a known limitation.

### 5. No visible focus indicator on the dialog itself

**File:** `Lightbox.tsx`, line 110

`outline: 'none'` is set on the dialog element. While focus management is handled via `showModal()` (which traps focus natively), when the dialog itself receives focus there is no visible focus ring. This is acceptable for `<dialog>` elements that use `showModal()`, since the browser handles focus trapping, but worth noting.

### 6. `useLightbox` trigger props use `role="button"` and `tabIndex={0}` without `aria-haspopup`

**File:** `useLightbox.tsx`, lines 76-88

The trigger props returned by `getTriggerProps` apply `role="button"` and `tabIndex: 0` but do not include `aria-haspopup="dialog"` to indicate that activating the trigger opens a dialog. Adding this would improve the screen reader experience.

### 7. No reduced-motion support for zoom transitions

**File:** `Lightbox.tsx`, lines 152-153

The image has `transitionProperty: 'transform'` and `transitionDuration: 'normal'` for zoom animation. Unlike other components in the codebase (e.g., `Progress`, `Spinner`, `Switch`), there is no `@media (prefers-reduced-motion: reduce)` override to disable or shorten the animation.

---

## Logic Bugs

### 1. Empty media array causes runtime crash

**File:** `Lightbox.tsx`, lines 235-239

If `media` is an empty array `[]`, then:

- `mediaItems.length` is `0`
- `Math.min(index, mediaItems.length - 1)` resolves to `Math.min(0, -1)` = `-1`
- `mediaItems[-1]` is `undefined`
- `mediaItems[-1] ?? mediaItems[0]` is also `undefined`
- Accessing `currentItem.alt` (line 241) and `currentItem.type` (line 241) will throw a `TypeError`.

While callers should not pass an empty array, the component should guard against this defensively -- either with an early return or a runtime invariant.

### 2. `defaultIndex` is not synced when it changes

**File:** `Lightbox.tsx`, line 228

`useState(defaultIndex)` only uses the initial value. If `defaultIndex` changes after mount (e.g., a parent re-renders with a different default), the uncontrolled index will not update. This is standard React behavior for default/initial props, but it is undocumented and could surprise users. Comparable to `defaultValue` on inputs -- acceptable but worth noting in JSDoc.

### 3. Zoom state persists across open/close cycles

**File:** `Lightbox.tsx`, lines 261-266

Zoom and pan reset when `currentIndex` or `currentItem.src` change (line 266), but they do NOT reset when the lightbox is closed and reopened on the same image. If a user zooms in, closes the lightbox, then reopens it, the image remains zoomed. The effect should also depend on `isOpen` or reset in the open/close layout effect.

### 4. Controlled index has no bounds validation

**File:** `Lightbox.tsx`, line 234

When using controlled mode (`index` prop), there is no validation that the index is within `[0, mediaItems.length - 1]`. A negative index or an index beyond the array length will result in `undefined` for `currentItem`, leading to the same crash described in bug #1. The `Math.min` on line 238 only clamps the upper bound; it does not clamp negative values.

---

## Unclear API

### 1. `media` prop accepts both a single item and an array

**File:** `Lightbox.tsx`, line 78

`media: LightboxMedia | ReadonlyArray<LightboxMedia>` is a convenience union, but it creates ambiguity in the type system. Users must check `Array.isArray()` in their own code when transforming media. The component handles this internally (line 235-236), but it might be cleaner to always accept an array and let callers wrap single items. This is a minor style concern.

### 2. No `onClose` shorthand

**File:** `Lightbox.tsx`, line 86

The API uses `onOpenChange(false)` to close. While this is consistent with Dialog and AlertDialog in this codebase, many lightbox libraries provide a dedicated `onClose` callback. The existing pattern is consistent, so this is acceptable.

### 3. `hasZoom` and `hasAutoPlay` naming

**File:** `Lightbox.tsx`, lines 59, 65

These prop names use the `has` prefix, which typically describes a state ("has children") rather than a capability. The codebase may use this convention elsewhere, but `isZoomable` / `autoPlay` would be more intuitive. Minor naming concern.

---

## Missing Tests

The Lightbox component has **no test file** (`Lightbox.test.tsx`). This is a significant gap -- 71 out of 73 components in the codebase have test files. The following behaviors should be tested:

### Critical tests to add:

1. **Open/close lifecycle** -- `showModal()` is called when `isOpen` becomes true; `close()` is called when false; focus returns to trigger element.
2. **Backdrop click closes** -- clicking the dialog element itself calls `onOpenChange(false)`.
3. **Escape key (cancel event)** -- pressing Escape calls `onOpenChange(false)` via the `onCancel` handler.
4. **Gallery navigation** -- ArrowLeft/ArrowRight key handlers update the index; prev/next buttons work; bounds are respected (no wrapping past first/last).
5. **Controlled vs. uncontrolled index** -- controlled mode calls `onIndexChange` without updating internal state; uncontrolled mode updates internal state.
6. **Zoom toggle** -- double-click toggles zoom between 1 and 2; zoom is disabled for video.
7. **Pan/drag** -- pointer events move the image when zoomed; dragging is disabled at zoom level 1.
8. **Zoom reset on navigation** -- zoom and pan reset when changing slides.
9. **Single media vs. gallery** -- prev/next buttons and counter are hidden for single media.
10. **Video rendering** -- video element renders with controls and optional autoplay.
11. **Ref forwarding** -- `ref` prop is forwarded to the `<dialog>` element.
12. **`data-testid` and `className`** passthrough.
13. **`useLightbox` hook** -- `open()`, `close()`, `triggerProps`, `getTriggerProps(index)`, `isOpen`, `index`, and `element` all work correctly.
14. **Empty media array** -- should not crash (once the bug is fixed).

---

## Missing Stories

The Lightbox component has **no stories file** (`Lightbox.stories.tsx`). This is a significant gap -- 59 out of 73 components have stories. The following stories should be added:

### Essential stories:

1. **Default (single image)** -- basic usage with one image, demonstrating open/close.
2. **Gallery** -- multiple images with prev/next navigation, showing the counter.
3. **Video** -- single video media item with controls.
4. **Mixed media** -- gallery with both images and videos.
5. **With captions** -- media items with captions displayed below.
6. **Zoom enabled** -- demonstrates `hasZoom` with double-click zoom and pan.
7. **Autoplay video** -- demonstrates `hasAutoPlay` for video.
8. **Controlled index** -- demonstrates `index` and `onIndexChange` props for controlled gallery navigation.
9. **useLightbox hook** -- demonstrates the convenience hook with trigger props on thumbnail images.
10. **useLightbox gallery** -- demonstrates `getTriggerProps(index)` for opening at a specific gallery position.

---

## Summary

| Category        | Severity    | Count               |
| --------------- | ----------- | ------------------- |
| Performance     | Low-Medium  | 4                   |
| Accessibility   | Medium-High | 7                   |
| Logic Bugs      | High        | 4                   |
| Unclear API     | Low         | 3                   |
| Missing Tests   | High        | Entire file missing |
| Missing Stories | Medium      | Entire file missing |

**Highest priority items:**

1. Add a test file -- this is one of only ~2 components in the entire codebase without tests.
2. Add a stories file -- the component cannot be visually reviewed or demonstrated in Storybook.
3. Fix the empty-array crash (logic bug #1) and add negative-index clamping (logic bug #4).
4. Fix zoom state persisting across open/close cycles (logic bug #3).
5. Add `aria-live="polite"` to the gallery counter for screen reader announcements.
6. Use a static `aria-label` on the dialog instead of the changing media alt text.
