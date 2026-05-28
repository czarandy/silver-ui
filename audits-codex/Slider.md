# Slider Audit

Audited the exported implementation in `src/components/Slider/Slider.tsx`, its barrel export, tests, and related docs/story coverage. Also found a parallel `XDS_src/Slider` implementation with `Slider.doc.mjs` and tests; the package export uses `src/components/Slider`.

## Findings

### High: no Storybook stories for Slider

- `src/components/Slider/Slider.stories.tsx` is missing. `rg --files | rg 'stories|doc|docs'` finds many component stories, but none for Slider.
- Important public props and modes are therefore not demonstrated: single value, range values, `marks`, `orientation="vertical"`, `formatValue`, `valueDisplay="text" | "none"`, `isDisabled`, `status`, custom `min`/`max`/`step`, and `minStepsBetweenThumbs`.
- This is a larger gap for Slider than for static components because drag, keyboard, tooltip, range, and vertical behavior are hard to inspect from API docs alone.

### Medium: range thumbs expose global ARIA bounds even when a tighter range is enforced

- File: `src/components/Slider/Slider.tsx:412-419`, `src/components/Slider/Slider.tsx:715-716`
- `minStepsBetweenThumbs` prevents a lower thumb from moving above `upper - gap` and an upper thumb from moving below `lower + gap`, but each thumb still exposes `aria-valuemin={min}` and `aria-valuemax={max}`.
- Screen reader users can be told a value is available even though keyboard interaction immediately clamps it away. For range sliders, the lower thumb should expose an effective max of the upper value minus the gap, and the upper thumb should expose an effective min of the lower value plus the gap.

### Medium: out-of-range or reversed controlled values render invalid state

- File: `src/components/Slider/Slider.tsx:314-319`, `src/components/Slider/Slider.tsx:567-583`, `src/components/Slider/Slider.tsx:693-730`
- Rendered values are not clamped or normalized before computing track fill, thumb position, or `aria-valuenow`. A controlled `value={150}` with `max={100}` renders `aria-valuenow="150"` and positions the thumb/fill at 150%. A range like `value={[80, 20]}` produces a negative filled-track width.
- Interaction handlers clamp new values, but initial and controlled renders can still expose broken layout and invalid ARIA. Either clamp/normalize during render or document that callers must keep values within bounds and sorted.

### Medium: horizontal interaction has no RTL behavior

- File: `src/components/Slider/Slider.tsx:381-387`, `src/components/Slider/Slider.tsx:525-532`
- Pointer math always maps `rect.left` to `min` and `rect.right` to `max`, and keyboard handling always maps `ArrowLeft` to decrease and `ArrowRight` to increase.
- If the library supports `dir="rtl"` layouts, horizontal sliders will feel reversed visually and behaviorally. There is no prop or doc guidance defining LTR-only behavior.

### Low: mark labels are visible but hidden from assistive technology

- File: `src/components/Slider/Slider.tsx:647-691`
- The entire marks container has `aria-hidden="true"`, including visible `mark.label` text. If marks communicate meaningful scale anchors such as "Low", "Medium", "High", those labels are not exposed.
- If labels are intended to be decorative, this should be documented. Otherwise, keep decorative ticks hidden but expose labels through visible text or `aria-valuetext`/descriptions.

### Low: callback memoization is defeated by depending on the rest `props` object

- File: `src/components/Slider/Slider.tsx:342`, `src/components/Slider/Slider.tsx:425-452`
- `emitChange` and `emitChangeEnd` depend on `props`, which is a new rest object every render. That recreates these callbacks and all downstream handlers even when only stable callbacks were passed.
- The practical impact is small for a single Slider, but the fix is straightforward: destructure `onChange` and `onChangeEnd` explicitly and depend on those callbacks instead of the whole rest object.

## Tests

Existing public tests cover baseline labels/ARIA, formatted visible text, vertical `aria-orientation`, disabled guards, keyboard `onChange`/`onChangeEnd`, range spacing by keyboard, pointer down/up commit, and mark-label snapping (`src/components/Slider/Slider.test.tsx:12-181`).

Missing or thin coverage:

- Primary drag behavior is not tested: the pointer test fires `pointerDown` and `pointerUp`, but no `pointerMove` (`src/components/Slider/Slider.test.tsx:137-160`).
- Vertical pointer math is untested; only the ARIA attribute is asserted (`src/components/Slider/Slider.test.tsx:50-67`).
- Range pointer behavior is untested: closest-thumb selection, dragging either thumb, and range `onChangeEnd`.
- Keyboard coverage omits `Home`, `End`, `PageUp`, and `PageDown` in the public `src` tests (`src/components/Slider/Slider.tsx:534-545`).
- Render behavior for out-of-bounds values, reversed ranges, custom `min`/`max`, and dynamic range ARIA bounds is untested.

Verification run: `pnpm vitest run src/components/Slider/Slider.test.tsx` passed with 9 tests.

## Accessibility

Baseline slider semantics are present: `role="slider"`, labels, value attributes, orientation, disabled state, invalid state, and description/status wiring are implemented. Issues found are the range ARIA bounds, RTL behavior if supported, and hidden visible mark labels noted above.

## Performance

No severe performance issue found. The main concern is the rest-object dependency causing handler churn; otherwise the component does simple per-render percent calculations and maps only the provided marks/thumbs.

## API Clarity

The public API is generally understandable, but controlled value invariants are unclear. The component should either enforce or document that `value` must be within `[min, max]`, range values must be sorted, `step` should be positive, and `minStepsBetweenThumbs` is meaningful only for range sliders.

## Docs

`XDS_src/Slider/Slider.doc.mjs` documents the XDS variant, including props and usage. I did not find equivalent generated docs for `src/components/Slider`, and there are no public Slider stories.
