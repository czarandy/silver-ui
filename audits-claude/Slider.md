# Slider Component Audit

**Files reviewed:**

- `src/components/Slider/Slider.tsx`
- `src/components/Slider/Slider.test.tsx`
- `src/components/Slider/index.ts`

**Missing files:**

- No `Slider.stories.tsx`
- No `Slider.recipe.ts`

---

## Performance Problems

### 1. `emitChange` and `emitChangeEnd` depend on `props` spread object, causing unnecessary re-creation

- **File:** `Slider.tsx`, lines 425-452
- Both `emitChange` and `emitChangeEnd` list `props` (the rest-spread object) in their `useCallback` dependency arrays. Because `props` is a new object on every render, these callbacks are re-created every render, defeating the purpose of `useCallback`. This cascades: `updateValue` (line 454) depends on `emitChange`, `handlePointerDown` (line 466) depends on `updateValue`, and `handleKeyDown` (line 517) depends on `emitChange` and `emitChangeEnd`. Effectively, nearly every handler is re-created on every render.
- **Fix:** Extract `props.onChange` and `props.onChangeEnd` into individual variables or refs before passing them into the callbacks, so the dependency arrays reference stable values.

### 2. `filledStyle` is re-computed on every render via an IIFE

- **File:** `Slider.tsx`, lines 567-583
- The filled track style is calculated using an immediately-invoked function expression on every render. This is a minor concern since the computation is cheap, but wrapping it in `useMemo` with `[isRange, values, min, max, isHorizontal]` would be more idiomatic and prevent unnecessary object allocations.

### 3. `getNextValues` captures `values` in its closure

- **File:** `Slider.tsx`, lines 403-423
- This callback depends on `values`, which means it is recreated whenever the value changes. During a drag operation, `values` changes on every pointer move, causing `getNextValues`, `updateValue`, and downstream handlers to be recreated on every frame. Consider using a ref for the current values inside drag callbacks or restructuring to avoid this churn.

**Verdict:** The `props` dependency issue (#1) is the most impactful because it defeats memoization across the entire handler chain. Issues #2 and #3 are minor but worth addressing for a polished library component.

---

## Accessibility Concerns

### 1. No RTL (right-to-left) support

- **File:** `Slider.tsx`, lines 375-389 (getValueFromPosition), lines 525-547 (handleKeyDown)
- The slider does not account for `dir="rtl"` layouts. In an RTL context, `ArrowLeft` should increase the value and `ArrowRight` should decrease it, and the position-to-value mapping should be inverted horizontally. Currently both keyboard and pointer interactions assume LTR.

### 2. ArrowDown/ArrowLeft and ArrowUp/ArrowRight are conflated for vertical orientation

- **File:** `Slider.tsx`, lines 526-531
- For a vertical slider, `ArrowUp` should increase the value and `ArrowDown` should decrease it (which is correct), but `ArrowLeft` and `ArrowRight` are mapped identically to decrease/increase respectively. The WAI-ARIA Slider pattern recommends that `ArrowLeft`/`ArrowRight` operate on the horizontal axis. Mapping `ArrowLeft` to decrease on a vertical slider is not harmful but is non-standard. More critically, in an RTL context this becomes wrong (see issue #1).

### 3. Thumb elements lack an accessible name linkable to the visible label via `id`

- **File:** `Slider.tsx`, lines 709-732
- For single-value sliders, the thumb receives `id={inputId}` (line 726), which allows the `<Field>` label's `htmlFor` to point to it. However, for range sliders (`isRange === true`), `id` is set to `undefined` (line 726), so neither thumb is programmatically associated with the visible label element. The `aria-label` attribute provides an accessible name, but screen readers will not announce the visible `<label>` text when focusing a range thumb because `htmlFor` has no matching element. Consider giving range thumbs unique IDs and using `aria-labelledby` to reference both the label element and the thumb-specific description.

### 4. Missing `aria-required` attribute

- **File:** `Slider.tsx`, lines 709-732
- The component accepts `isRequired` and passes it to `<Field>`, but the thumb `[role="slider"]` elements never receive `aria-required="true"`. Screen readers will not convey the required state.

### 5. Mark labels are not associated with any ARIA structure

- **File:** `Slider.tsx`, lines 656-689
- Tick mark labels are purely visual `<span>` elements with `aria-hidden="true"` on their container. Screen readers have no way to discover the available marks. This is acceptable when marks are purely decorative, but when marks represent meaningful values (e.g., price tiers), consider exposing them via `aria-valuetext` or a visually-hidden list.

---

## Logic Bugs

### 1. Range thumb enforcement can clamp the lower thumb below `min`

- **File:** `Slider.tsx`, lines 413-419
- When `thumbIndex === 0`, the code computes `nextValues[0] = Math.min(nextValues[0], nextValues[1] - minGap)`. If `nextValues[1]` is close to `min`, then `nextValues[1] - minGap` can be less than `min`. The subsequent `clamp` on line 418 corrects this, but the resulting value may violate the `minStepsBetweenThumbs` constraint. For example, with `min=0`, `step=5`, `minStepsBetweenThumbs=2`, and `value=[5, 10]`, pressing `ArrowRight` on the lower thumb computes `nextValues[0] = Math.min(10, 10 - 10) = 0`, then clamps to `0`. The gap between `0` and `10` is correct in this case, but the logic is fragile and could break if the upper thumb is also at `min + minGap`. The two constraints (clamp to range AND maintain gap) should be resolved together rather than sequentially.

### 2. `getClosestThumb` tie-breaking always favors the lower thumb

- **File:** `Slider.tsx`, lines 392-400
- When a user clicks exactly at the midpoint between two range thumbs, `Math.abs(newValue - lower) <= Math.abs(newValue - upper)` will return `true` (because of `<=`), always selecting the lower thumb. This is a minor UX issue -- when both thumbs overlap (e.g., both at 50), the user can never select the upper thumb by clicking. Consider checking which thumb is in the direction of the click relative to the current position.

### 3. `pendingValuesRef` may hold stale values for `onChangeEnd`

- **File:** `Slider.tsx`, lines 363-365, 508-515
- The `useEffect` on line 363 updates `pendingValuesRef.current` to `values` on every render. The `handlePointerUp` callback (line 508) reads `pendingValuesRef.current` to emit `onChangeEnd`. However, `handlePointerUp` is memoized with `[emitChangeEnd, values]` in its dependency array. If `values` changes due to an `onChange` call but the component has not yet re-rendered (and thus the effect has not run), `pendingValuesRef.current` will have the value set by `emitChange` (line 427), which is correct. But the `values` captured in the fallback `?? values` (line 514) would be stale. This is a latent risk -- the fallback path is only hit if `pendingValuesRef.current` is null, which should not happen during a drag, but the code structure is fragile.

---

## Unclear API

### 1. `isOptional` and `isRequired` are not meaningful for sliders

- **File:** `Slider.tsx`, lines 56-64, `SliderBaseProps`
- Sliders always have a value (they are not clearable), so `isOptional` and `isRequired` do not serve a clear purpose. They are passed to `<Field>`, which renders "Optional"/"Required" text, but a slider cannot be "empty." This may confuse consumers. If these are inherited from a shared Field pattern, consider documenting that they only affect the label hint text.

### 2. Discriminated union type is not truly discriminated

- **File:** `Slider.tsx`, lines 115-150
- `SliderProps = SliderRangeProps | SliderSingleProps` relies on the runtime shape of `value` (`Array.isArray`) to distinguish between modes, not a discriminant property like `mode: 'single' | 'range'`. This works at runtime but provides weaker TypeScript narrowing for consumers. Passing `minStepsBetweenThumbs` to a single slider is not a type error because TypeScript cannot narrow based on `value`'s type alone in all contexts.

### 3. No `name` prop for form integration

- **File:** `Slider.tsx`, `SliderBaseProps`
- The component has no `name` prop and renders no `<input>` elements, making it unusable with native form submission or `FormData` APIs. If form integration is expected, a hidden `<input type="range">` (or two for range mode) would be needed.

---

## Missing Tests

### 1. No test for pointer drag (pointerMove) behavior

- **File:** `Slider.test.tsx`
- The test at line 137 covers `pointerDown` and `pointerUp` but never fires `pointerMove`. The drag interaction -- the slider's primary use case -- is untested. A test should verify that moving the pointer after `pointerDown` fires `onChange` with updated values.

### 2. No test for Home, End, PageUp, PageDown keyboard shortcuts

- **File:** `Slider.test.tsx`
- Only `ArrowRight` is tested (line 104). The `Home` (jump to min), `End` (jump to max), `PageUp` (step _ 10), and `PageDown` (step _ 10) shortcuts are not covered.

### 3. No test for vertical orientation pointer interaction

- **File:** `Slider.test.tsx`
- The vertical orientation is only tested for its `aria-orientation` attribute (line 61). Pointer interactions on a vertical slider use `clientY` and inverted math, which is not exercised.

### 4. No test for range pointer interaction

- **File:** `Slider.test.tsx`
- Range mode is tested only via keyboard (line 110). Pointer-based interaction with range sliders (closest-thumb selection, drag behavior) is not tested.

### 5. No test for tooltip display during drag

- **File:** `Slider.test.tsx`
- The `valueDisplay="tooltip"` mode (the default) is never tested. There is no assertion that a tooltip appears on focus or during a drag.

### 6. No test for `onPointerCancel` handling

- **File:** `Slider.tsx`, line 624
- The component binds `onPointerCancel={handlePointerUp}`, but no test verifies that a cancelled pointer interaction correctly commits or resets state.

### 7. No test for min/max edge values

- **File:** `Slider.test.tsx`
- There is no test verifying that a pointer click beyond the track bounds clamps correctly to `min` or `max`.

### 8. No test for `step <= 0` edge case

- **File:** `Slider.tsx`, line 308
- The `snapToStep` function handles `step <= 0` by returning the raw value, but this is not tested and the behavior is undocumented.

---

## Missing Stories

### 1. No stories file exists at all

- **Expected file:** `src/components/Slider/Slider.stories.tsx`
- The Slider component has zero Storybook coverage. For a component library, this is a significant gap. At minimum, the following stories should exist:

#### Essential stories:

1. **Default** -- Single-value slider with default props
2. **Range** -- Dual-thumb range slider (`value={[20, 80]}`)
3. **WithMarks** -- Slider with tick marks and labels
4. **CustomFormat** -- Using `formatValue` to show units (e.g., `$50`, `72F`)
5. **ValueDisplayText** -- `valueDisplay="text"` showing value next to slider
6. **ValueDisplayNone** -- `valueDisplay="none"` hiding value entirely
7. **Vertical** -- `orientation="vertical"`
8. **Disabled** -- `isDisabled={true}`
9. **WithStatus** -- `status={{type: 'error', message: '...'}}`
10. **MinStepsBetweenThumbs** -- Range slider demonstrating thumb gap enforcement
11. **CustomStep** -- Non-default step values (e.g., `step={5}`, `step={0.1}`)
12. **MinMaxCustom** -- Custom `min`/`max` bounds (e.g., `min={-50}`, `max={200}`)

---

## Summary

| Category        | Severity    | Count           |
| --------------- | ----------- | --------------- |
| Performance     | Medium      | 3               |
| Accessibility   | Medium-High | 5               |
| Logic Bugs      | Low-Medium  | 3               |
| Unclear API     | Low         | 3               |
| Missing Tests   | Medium      | 8               |
| Missing Stories | High        | 1 (entire file) |

The Slider component is well-structured with clean separation of concerns, good ARIA baseline (roles, value attributes, orientation), and solid keyboard support. The main gaps are: (1) no Storybook stories at all, (2) thin test coverage that misses the primary drag interaction, (3) the `props` spread in `useCallback` dependencies defeating memoization, and (4) no RTL support for keyboard or pointer interactions.
