# Lightbox Audit

## Summary

Lightbox is a fullscreen dialog component for viewing image or video media with optional gallery navigation, zoom/pan, and keyboard controls. It includes a companion `useLightbox` hook for managing open/close state and trigger props. The component is well-structured with comprehensive tests and stories.

## Issues

### Critical

- None

### High

- None

### Medium

- **Scroll lock implementation is fragile:** `useScrollLock` directly mutates `document.body.style.overflow`, which can conflict with other components or libraries that also modify this property. If two lightboxes or other scroll-locking components overlap, the cleanup may restore the wrong value. Consider using a stack-based approach or a CSS class toggle instead of direct style mutation.
- **Image preloading creates unreferenced Image objects:** In the preloading effect (lines 298-315), `new Image()` objects are created and assigned a `src`, but the references are immediately discarded. While browsers typically still fetch them, the garbage collector could theoretically collect these before the fetch completes. Storing references until load completes would be more reliable.

### Low

- **No loading/error states for images:** The Lightbox does not handle slow-loading or broken image sources. There is no `onError` handler or placeholder for images that fail to load, unlike the Thumbnail component. Users see a blank space if an image URL is broken.
- **Zoom is limited to 2x with no configurability:** The zoom level toggles between 1x and 2x only. There is no way to configure the zoom levels or use pinch-to-zoom on touch devices. This is a minor API limitation for advanced use cases.
- **No `prefers-reduced-motion` handling for pan gestures:** While the image transition respects `prefers-reduced-motion` for zoom, the pan gesture itself does not have any reduced-motion consideration (though arguably dragging should track the pointer exactly regardless).
- **Missing story for `defaultIndex` prop:** While `ControlledIndex` story demonstrates `index`, there is no story specifically showing the `defaultIndex` prop for uncontrolled usage with a non-zero starting index.
- **`eslint-disable` for non-interactive element interactions:** The top-level disable comment (`jsx-a11y-x/no-noninteractive-element-interactions`) applies to the entire file. It would be better scoped to only the specific elements that need it.

## Recommendations

- Add an `onError` handler for images to show a fallback placeholder, consistent with the Thumbnail component pattern.
- Consider a CSS-class-based scroll lock (e.g., toggling a class on `document.documentElement`) for better interoperability with other scroll-locking components.
- Add a story demonstrating `defaultIndex` with a non-zero value.
- The test coverage is excellent, covering controlled/uncontrolled indexes, zoom, pan, navigation bounds, preloading, video, focus management, and the useLightbox hook.

## SVA Conversion

**Benefit: Strong**

`Lightbox.tsx` renders a large set of distinct styled DOM elements — dialog, container, close control, prev/next nav controls, media group, media wrap (zoom viewport), image, video, caption, counter, and shared control buttons — all from one standalone `css()` object with ~20 blocks (`dialog`, `container`, `mediaGroup`, `mediaWrap`, `zoomable`, `zoomed`, `dragging`, `image`, `imageDragging`, `video`, `caption`, `close`, `nav`, `prev`, `next`, `counter`, `controlButton`). Several elements are styled with per-element `cx()` conditional branches keyed on interaction state — `zoomable`/`zoomed`/`dragging` on the media wrap and `imageDragging` on the image — which are effectively runtime state variants. There is no recipe today. An `sva` with slots (`dialog`/`container`/`mediaWrap`/`image`/`caption`/`nav`/`counter`/`controlButton`) and variants for zoom/drag state plus a `position` variant for prev/next nav would consolidate the styling and replace the ternary class composition, closely matching the Divider pattern.
