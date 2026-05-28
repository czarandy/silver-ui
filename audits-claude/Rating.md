# Rating Component Audit

**Files reviewed:**

- `src/components/Rating/Rating.tsx`
- `src/components/Rating/Rating.stories.tsx`
- `src/components/Rating/Rating.test.tsx`
- `src/components/Rating/index.ts`

---

## Performance

### P1. `Array.from` creates a new array on every render (Rating.tsx, lines 127 and 146)

Both the read-only and interactive branches call `Array.from({length: count}, ...)` on every render. Since `count` defaults to 5 and is typically a small, stable number, this is not a meaningful performance concern in practice. No action required.

### P2. `StarIcon` is not memoized (Rating.tsx, lines 80-95)

`StarIcon` is a plain function component that renders an `Icon` with a class name toggle. Given that it produces a single lightweight SVG element and the parent renders at most ~10 of them, memoization would add overhead without measurable benefit. No action required.

### P3. Duplicate style objects `input` and `srOnly` (Rating.tsx, lines 56-77)

The `styles.input` and `styles.srOnly` objects are identical CSS declarations (visually-hidden pattern). This is not a performance issue per se, but it generates two identical Panda CSS class names at build time. They could be consolidated into a single token.

**Recommendation:** Remove `styles.srOnly` and reuse `styles.input`, or extract a shared `visuallyHidden` style.

---

## Accessibility

### A1. Radio inputs lack individual accessible names via `aria-label` (Rating.tsx, lines 154-160)

Each `<input type="radio">` has a visually-hidden `<span>` sibling with text like "3 stars", but this text is inside the `<label>` element alongside the decorative `StarIcon`. Because the label wraps the input, assistive technology will announce the full label content including the icon (which is correctly `aria-hidden` via the `Icon` component). This works correctly. No issue.

### A2. Multiple Rating instances with the same `label` will collide on radio `name` (Rating.tsx, line 158)

The `name` attribute on each radio input is set to `label`, which defaults to `'Rating'`. If two interactive Rating components appear on the same page without distinct `label` props, their radio groups will share the same `name`, causing the browser to treat them as a single radio group. Selecting a star in one will deselect the star in the other.

**Recommendation:** Either generate a unique `name` per instance (e.g., using `React.useId()`) or document that `label` must be unique when multiple Ratings coexist. Using `useId()` would be the more robust solution.

### A3. No `aria-required` or `aria-invalid` support (Rating.tsx)

For form usage, there is no way to indicate that a rating is required or that the current value is invalid. While this may be out of scope for V1, it limits the component's use in form contexts.

**Recommendation:** Consider adding optional `isRequired` and `isInvalid` props that map to `aria-required` and `aria-invalid` on the radiogroup container.

### A4. Disabled state does not set `aria-disabled` on the container (Rating.tsx, lines 114-133)

When `isDisabled` is true, the component renders with `role="img"` and reduced opacity, but does not set `aria-disabled="true"`. Since the read-only/disabled path renders as `role="img"` (not interactive), this is a minor concern -- the content is already perceived as static. However, if a consumer expects `aria-disabled` for styling or testing selectors, it is absent.

**Recommendation:** Low priority. Consider adding `aria-disabled={isDisabled || undefined}` to the container div.

### A5. Stars in the read-only branch lack `aria-hidden` on the decorative `<span>` wrappers (Rating.tsx, line 128)

The `<span className={styles.readOnly}>` wrapping each `StarIcon` in the read-only branch has no `aria-hidden`. Since the entire container has `role="img"` with an `aria-label`, the children are implicitly presentation. This is acceptable per the ARIA spec, but explicit `aria-hidden="true"` would be more defensive.

**Recommendation:** Low priority. The `role="img"` with `aria-label` already causes ATs to treat children as presentational.

---

## Logic Bugs

### L1. `value` prop is not clamped or validated (Rating.tsx)

If a consumer passes `value={-1}` or `value={100}` with the default `count=5`, the component will render incorrectly (all empty or all filled, respectively) without any warning. Similarly, non-integer values like `value={2.5}` will fill 2 stars since the comparison `i < value` handles it, but the radio `checked` state (`value === starValue`) will have no match, meaning no radio appears selected for a half-star value.

**Recommendation:** Consider clamping `value` to `[0, count]` or adding a development-mode warning for out-of-range values.

### L2. `count` is not validated (Rating.tsx, line 100)

A `count` of 0 or a negative number will render an empty container. `count={0}` produces `Array.from({length: 0})` which is harmless but useless. A negative count also results in an empty array.

**Recommendation:** Low priority. Consider a dev-mode warning if `count < 1`.

---

## Unclear API

### U1. `value` is required but there is no "uncontrolled" mode (Rating.tsx, line 18)

The `value` prop is required (`value: number`), which means the component is always controlled. There is no `defaultValue` prop for an uncontrolled use case. The component does not manage its own state for the selected value -- `hoverValue` is only for hover preview. This is a deliberate design choice and is fine, but consumers must always manage state externally even for simple cases.

**Recommendation:** Document that Rating is a controlled component. Optionally, consider supporting `defaultValue` for simpler use cases.

### U2. The relationship between `onChange`, `isReadOnly`, and `isDisabled` is implicit (Rating.tsx, line 111)

The component determines interactivity via `!isReadOnly && !isDisabled && onChange != null`. This means:

- Passing `onChange` without `isReadOnly` or `isDisabled` renders as interactive.
- Passing `onChange` with `isReadOnly` renders as read-only (onChange is ignored).
- Omitting `onChange` always renders as read-only regardless of other props.

The interplay is reasonable but not immediately obvious from the types. A consumer might pass `isDisabled` with `onChange` expecting a disabled-but-interactive-looking radiogroup, but they will get a static `role="img"` instead.

**Recommendation:** Low priority. Consider documenting the interactivity rules in JSDoc on the component or props.

### U3. No way to clear the rating (select 0 stars) (Rating.tsx)

Once a star is selected, there is no built-in mechanism to clear the rating back to 0. Clicking the currently-selected star does not toggle it off -- it calls `onChange` with the same value. Some rating components allow clicking the current value to deselect.

**Recommendation:** Consider an `allowClear` or `allowHalf` prop, or document that clearing must be handled externally.

---

## Missing Tests

### T1. No test for hover preview behavior (Rating.test.tsx)

The component implements hover-to-preview via `onMouseEnter` on each label and `onMouseLeave` on the container (Rating.tsx, lines 142, 153). There is no test verifying that hovering over a star updates the visual display, or that leaving the component resets it. This is the most significant interactive behavior left untested.

**Recommendation:** Add a test using `userEvent.hover()` on a star and verifying the displayed state changes, then `userEvent.unhover()` to verify it resets.

### T2. No test for the `size` prop (Rating.test.tsx)

The `size` prop is passed through to `StarIcon` and then to `Icon`, but no test verifies this propagation. At minimum, verify that the rendered Icon receives the expected size class.

**Recommendation:** Low priority since this is a pass-through prop, but a snapshot or class-name assertion would catch regressions.

### T3. No test for the `label` prop affecting radio group name and aria-label (Rating.test.tsx)

The `label` prop is used as both the `aria-label` on the radiogroup container and the `name` attribute on radio inputs. No test verifies a custom `label` value is correctly applied to both.

**Recommendation:** Add a test with a custom `label` and verify the radiogroup has the correct `aria-label` and radio inputs have the correct `name`.

### T4. No test for `count` in interactive mode (Rating.test.tsx)

The `count` prop is tested in read-only mode (line 16) but not in interactive mode. A test should verify that `count={10}` renders 10 radio inputs.

### T5. No test for disabled + onChange interaction (Rating.test.tsx)

There is no test verifying that `isDisabled` with `onChange` renders as non-interactive (role="img" instead of radiogroup). The test on line 73 covers `isReadOnly` + `onChange` but not `isDisabled` + `onChange`.

### T6. No test for `displayName` (Rating.tsx, line 173)

`Rating.displayName` is set but not tested. Minor.

---

## Missing Stories

### S1. No story for hover behavior (Rating.stories.tsx)

The `Interactive` story provides an `onChange` callback but uses a static value (`value: 2`). Because the story does not use Storybook state management (e.g., `useArgs`), the rating cannot actually be changed by clicking. The hover preview works visually, but the click has no persistent effect. This makes it difficult to evaluate the interactive behavior in Storybook.

**Recommendation:** Use Storybook's `useArgs` hook or a wrapper component with `useState` to make the `Interactive` story fully functional:

```tsx
export const Interactive: Story = {
  render: function InteractiveRating(args) {
    const [value, setValue] = useState(args.value ?? 2);
    return <Rating {...args} onChange={setValue} value={value} />;
  },
  args: {value: 2},
};
```

### S2. No story demonstrating `label` prop (Rating.stories.tsx)

The `label` prop is important for accessibility (it sets the `aria-label` and radio `name`) but no story demonstrates it. A story with a custom label would help verify screen-reader output.

### S3. No story for `isDisabled` + `onChange` (Rating.stories.tsx)

The `Disabled` story renders without `onChange`, so it uses the read-only path. There is no story showing a disabled Rating that was previously interactive, to confirm the visual disabled state.

### S4. No story demonstrating zero-value state (Rating.stories.tsx)

No story shows `value={0}` (all stars empty). This is a common initial state and should be visually verifiable.

### S5. No story for multiple Ratings on the same page (Rating.stories.tsx)

Given the radio `name` collision issue (A2), a story with two Ratings side by side would expose the bug visually.

---

## Summary

| Priority | Category        | Issue                                                                             |
| -------- | --------------- | --------------------------------------------------------------------------------- |
| High     | Accessibility   | A2: Radio `name` collision when multiple Ratings share the same `label`           |
| Medium   | Missing Tests   | T1: Hover preview behavior is untested                                            |
| Medium   | Missing Stories | S1: Interactive story is not actually interactive (no state)                      |
| Medium   | Logic Bugs      | L1: `value` is not clamped; fractional values leave no radio checked              |
| Medium   | Missing Tests   | T3: Custom `label` not tested for name/aria-label                                 |
| Medium   | Missing Tests   | T5: `isDisabled` + `onChange` path not tested                                     |
| Low      | Performance     | P3: Duplicate `input`/`srOnly` style objects                                      |
| Low      | Accessibility   | A3: No `aria-required`/`aria-invalid` for form usage                              |
| Low      | Unclear API     | U2: Interactivity rules between `onChange`/`isReadOnly`/`isDisabled` are implicit |
| Low      | Unclear API     | U3: No mechanism to clear rating back to 0                                        |
| Low      | Missing Stories | S4: No zero-value story                                                           |
| Low      | Missing Stories | S5: No multi-instance story to expose name collision                              |
