# TextArea Component Audit

**Audited files:**

- `src/components/TextArea/TextArea.tsx`
- `src/components/TextArea/TextArea.stories.tsx`
- `src/components/TextArea/TextArea.test.tsx`
- `src/components/TextArea/index.ts`

---

## Performance Problems

1. **Inline arrow function created on every render for `onChange`** (`TextArea.tsx`, line 141). The `onChange` handler `event => onChange?.(event.target.value, event)` creates a new function reference on every render. This causes the `<textarea>` element to receive a new `onChange` prop each time, preventing React from skipping the prop diff for that attribute. While this is a micro-optimization and unlikely to cause real-world issues, it is inconsistent with how the component handles `onBlur`, `onFocus`, and `onPaste` (which are passed through directly without wrappers). Consider wrapping in `useCallback` if the component is later converted to use `React.memo`.

2. **No memoization despite being a controlled component that will re-render on every keystroke.** The component is a plain function (not wrapped in `memo`). Since `value` changes on every keystroke, the parent re-renders the TextArea on every character typed. The component performs no expensive computation so this is not a practical problem today, but if additional features are added (e.g., auto-resize, markdown preview), memoization should be considered. This matches the pattern used by sibling components (`TextInput`, `Button`), so it is consistent.

---

## Accessibility Concerns

1. **`aria-invalid` is set to `true` when `isOverLimit` but there is no associated error message** (`TextArea.tsx`, line 131). When `value.length > maxLength`, `aria-invalid` becomes `true`, but no `status` prop is automatically set. This means a screen reader announces the field as invalid with no explanation of why. The character counter (e.g., "125/120") is linked via `aria-describedby`, but the counter text alone does not convey an error -- it is just a ratio. Consider either: (a) automatically generating an error status message like "Exceeds maximum of 120 characters" when over limit, or (b) documenting that consumers must provide a `status` prop with `type: 'error'` when the value exceeds `maxLength`.

2. **Character counter uses color alone to indicate over-limit state** (`TextArea.tsx`, lines 158-165). When `isOverLimit` is true, the counter text color changes to `'active'` (from `'secondary'`). Color alone is not sufficient to convey information per WCAG 1.4.1 (Use of Color). Screen reader users relying on `aria-describedby` will hear "125/120" but receive no semantic indication that this is an error condition. Consider adding an `aria-live="polite"` region or a visually hidden prefix like "Over limit:" when `isOverLimit` is true.

3. **No `aria-label` or accessible name for the character counter** (`TextArea.tsx`, lines 158-165). The counter renders as `{value.length}/{maxLength}` (e.g., "5/120"). While this is visually clear, screen readers will announce it as "5 slash 120", which is ambiguous. Consider rendering it as `<Text aria-label={`${value.length} of ${maxLength} characters`}>` or using a visually hidden descriptive prefix.

4. **`isOptional` and `isRequired` can both be `true` simultaneously** (`TextArea.tsx`, lines 74-75). Both props default to `false` and there is no validation preventing `isOptional={true} isRequired={true}`. This would render "(Optional)" text via Field while also setting `aria-required="true"` on the textarea -- a contradictory signal for assistive technologies. Consider a runtime warning or TypeScript discriminated union to prevent this combination.

5. **`isLoading` sets `aria-busy` but provides no screen reader announcement** (`TextArea.tsx`, line 129). Unlike the `Button` component (which renders a visually hidden `aria-live="polite"` region announcing "Loading"), the TextArea only sets `aria-busy={true}` on the textarea element. Screen readers do not consistently announce `aria-busy` changes. Consider adding a live region that announces the loading state.

6. **Missing `statusVariant` passthrough to `Field`** (`TextArea.tsx`, line 102-114). The `Field` component supports a `statusVariant` prop (`'attached' | 'detached'`) that controls how the status message is positioned, but `TextArea` does not expose this prop. This means TextArea always uses the default `'attached'` variant, while other Field-based components could potentially offer both. This is a minor API gap rather than a strict accessibility issue.

---

## Logic Bugs

1. **`maxLength` is not enforced -- it is only advisory** (`TextArea.tsx`, lines 97-99, 157-166). The `maxLength` prop controls the character counter display and the `isOverLimit` flag, but does not set the native `maxLength` attribute on the `<textarea>` element. This means users can type past the limit (the counter will show e.g., "125/120" in a different color). This may be intentional (allowing soft validation), but it is undocumented and differs from the native HTML `maxLength` behavior which prevents typing beyond the limit. If soft validation is the intent, the prop should be named something like `softMaxLength` or `characterLimit` to distinguish from native behavior. If hard enforcement is desired, pass `maxLength` to the `<textarea>` element.

2. **`value` defaults to `''` but the component is controlled-only** (`TextArea.tsx`, line 67). The `value` prop defaults to an empty string, meaning the textarea always operates in controlled mode. There is no uncontrolled mode support (no `defaultValue` prop). This is consistent with `TextInput` but means consumers who want an uncontrolled textarea cannot use this component. This is a design decision rather than a bug, but it should be documented.

3. **Counter display shows `0/N` even when `value` is provided** (`TextArea.test.tsx`, line 17). The test renders `<TextArea label="Notes" maxLength={10} onChange={onChange} value="" />` and asserts `screen.getByText('0/10')`. This is correct for `value=""`, but the test never verifies the counter updates when `value` changes. Since the component is controlled, the counter will show the correct count based on the `value` prop, but this behavior is not tested.

---

## Unclear API

1. **No JSDoc comments on any props** (`TextArea.tsx`, lines 21-48). Unlike the sibling `TextInput` component and `Button` component, which have JSDoc comments on every prop in their interface, `TextAreaProps` has no documentation comments at all. This makes the API harder to discover via IDE tooltips and Storybook's auto-generated docs. Every prop should have a brief JSDoc description.

2. **`onChange` signature differs from native** (`TextArea.tsx`, line 37). The `onChange` callback is `(value: string, event: ChangeEvent<HTMLTextAreaElement>) => void`, with value first and event second. This is consistent with `TextInput` but differs from native React textarea `onChange` which provides only the event. This design choice is not documented.

3. **`startIcon` prop exists but no `endIcon` or `endContent` prop** (`TextArea.tsx`, line 44). The `TextInput` component supports `endContent` for rendering content after the input, but `TextArea` does not. This API asymmetry between sibling components may confuse consumers expecting a consistent API surface.

4. **`rows` prop interacts non-obviously with `minH: '20'` CSS** (`TextArea.tsx`, lines 56-58, 69). The textarea has `minH: '20'` (5rem in Panda CSS default spacing) and `resize: 'vertical'`. The `rows` prop defaults to 3, which determines the textarea's intrinsic height. If the computed height of 3 rows is less than 5rem, the `minH` wins, making the `rows` prop appear to have no effect for small row counts. This interaction is not documented.

5. **`hasSpellCheck` prop defaults to `true`** (`TextArea.tsx`, line 77). This differs from native browser behavior where `spellcheck` defaults to browser-dependent behavior (usually `true` for textareas, but not guaranteed). The explicit `true` default is reasonable but should be documented so consumers know it is intentionally enabled.

---

## Missing Tests

1. **No test for `ref` forwarding.** There is no test verifying that a ref passed to TextArea is attached to the underlying `<textarea>` element.

2. **No test for `isDisabled` behavior.** There is no test asserting that the textarea is disabled when `isDisabled={true}`, or that `onChange` is not called when disabled.

3. **No test for `status` rendering.** There is no test verifying that error/warning/success status renders the status icon, applies the correct border styling, or sets `aria-invalid`.

4. **No test for `isOverLimit` behavior.** There is no test for the case when `value.length > maxLength`, which should set `aria-invalid` and change the counter color.

5. **No test for `isLoading` state.** There is no test verifying that the loading spinner renders and `aria-busy` is set.

6. **No test for `isLabelHidden`.** There is no test verifying the label is visually hidden but still accessible.

7. **No test for `description` prop.** There is no test verifying description text is rendered and linked via `aria-describedby`.

8. **No test for `isRequired` / `isOptional`.** There is no test verifying that `aria-required` is set or that the optional/required indicator text appears.

9. **No test for `placeholder` prop.** There is no test verifying placeholder text is rendered.

10. **No test for `startIcon` rendering.** There is no test verifying that the start icon is displayed.

11. **No test for `className` and `style` prop forwarding.** There is no test verifying that custom class names and styles are applied to the wrapper.

12. **No test for `onBlur` and `onFocus` handlers.** There is no test verifying these events fire correctly.

13. **No test for `onPaste` handler.** There is no test verifying paste events are forwarded.

14. **No test for `data-testid` forwarding.** There is no test verifying the test ID is applied to the textarea element.

15. **No test for `htmlName` prop.** There is no test verifying the `name` attribute is set on the textarea.

16. **No test for `aria-describedby` composition.** The component composes `aria-describedby` from up to three sources (description, status message, counter). There is no test verifying these are correctly joined.

17. **No test for `labelTooltip` rendering.** There is no test verifying the tooltip icon appears next to the label.

---

## Missing Stories

1. **No story for `isDisabled` state.** There is no story demonstrating a disabled textarea.

2. **No story for `status` variants.** There are no stories demonstrating error, warning, or success states with status messages. The sibling `TextInput` has a `WithStatus` story.

3. **No story for `isLoading` state.** There is no story demonstrating the loading spinner.

4. **No story for `startIcon`.** There is no story demonstrating a textarea with a start icon.

5. **No story for `isLabelHidden`.** There is no story demonstrating a textarea with a visually hidden label.

6. **No story for `description`.** There is no story demonstrating a textarea with description text below the label.

7. **No story for `isRequired` / `isOptional`.** There are no stories demonstrating the required/optional indicators.

8. **No story for `labelTooltip`.** There is no story demonstrating the label tooltip.

9. **No story for `size` variants.** There is no story demonstrating `sm`, `md`, and `lg` sizes side by side.

10. **No story for over-limit counter.** The `WithCounter` story shows `value: 'Draft note'` with `maxLength: 120`, but there is no story showing the over-limit state (e.g., `value` with more characters than `maxLength`) to demonstrate the color change behavior.

11. **No story for `rows` prop.** There is no story demonstrating different row counts (e.g., 1 row vs 10 rows).

12. **No story for `hasSpellCheck={false}`.** There is no story demonstrating spell check disabled.

13. **No interactive story with state management.** Both existing stories use Storybook args but do not demonstrate controlled typing via `useState`. A consumer looking at the stories cannot see the component respond to typing without manually wiring up the `onChange` arg in Storybook.

---

## Additional Observations

- **No `.recipe.ts` file.** Unlike the recommended pattern described in `MEMORY.md` ("recipe in `.recipe.ts` using `cva`, component with `forwardRef` merging `className` via `cx()`"), the TextArea component defines its styles inline using `css()` calls in a `styles` object. This is consistent with the `TextInput` sibling component (which also uses inline `css()` instead of a recipe), but deviates from the documented architectural pattern. Since the TextArea has no variants managed through `cva`, inline styles are arguably appropriate.
- **`displayName` is set** (`TextArea.tsx`, line 171), which is good for React DevTools.
- **`index.ts` exports are correct.** Both the component and its props type are exported.
- **The component does not use `forwardRef`.** It uses the React 19 pattern of accepting `ref` as a regular prop, which is the modern approach.
