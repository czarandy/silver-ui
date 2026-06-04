# TextArea Audit

## Summary

Multi-line text input field with optional character counter. Built on the shared `Field` wrapper and `inputRecipe` styles. Supports validation status, description, loading state, spellcheck control, start icon, max length with visual counter, and standard textarea props (rows, placeholder, paste handler).

## Issues

### Critical

- None.

### High

- None.

### Medium

- **Character counter does not enforce the limit.** The `maxLength` prop displays a counter and sets `aria-invalid` when exceeded, but does not use the native `maxlength` HTML attribute to prevent input beyond the limit. This is likely intentional (soft limit), but consumers might expect hard enforcement. The behavior should be documented clearly. If hard enforcement is desired, add a separate `hasHardLimit` prop or use the native attribute.
- **Missing story for `startIcon`.** The `startIcon` prop is accepted and rendered but no story demonstrates it. There are stories for many states (disabled, loading, sizes, status) but the icon slot is never shown.
- **Missing story for `hasSpellCheck={false}`.** The prop defaults to `true` and can be set to `false`, but no story demonstrates this.
- **Missing story for `onPaste`.** The `onPaste` callback is a niche but useful prop (e.g., for image paste handling) with no story.
- **No story for hidden label.** The `isLabelHidden` prop is accepted but no story demonstrates it.

### Low

- **No recipe file.** Styles are inline `css()` calls. Consistent within the component.
- **No test for `onFocus` or `onBlur` callbacks.** These event handlers are passed through to the textarea but untested.
- **No test for `onPaste` callback.** Accepted but untested.
- **No test for `placeholder` rendering.** The placeholder prop is standard and likely works, but has no explicit test.
- **No test for `rows` prop.** The prop controls visible rows but is untested. This is a direct HTML passthrough so low risk.
- **No test for `isLoading` state.** The loading state renders a spinner and sets `aria-busy`, but no test verifies this. The TextInput component has a loading test; TextArea should match.
- **No test for `startIcon` rendering.** The icon slot is implemented but not tested.
- **No test for `hasSpellCheck` behavior.** Direct HTML attribute, low risk, but untested.
- **`onChange` signature includes the event.** The callback is `(value: string, event: ChangeEvent<HTMLTextAreaElement>) => void`. The `TextAreaStory` in stories only uses `setValue` (which takes one argument), silently ignoring the event. This is fine but means the story does not demonstrate the event parameter.
- **Counter text is not announced dynamically.** The character count updates but is not in an `aria-live` region. Screen reader users must manually navigate to the counter to learn the current count. Consider adding `aria-live="polite"` to the counter for real-time feedback, though this could be chatty.

## Recommendations

1. Document whether `maxLength` is a soft or hard limit. If hard enforcement is ever needed, consider adding native `maxlength` as an option.
2. Add a story for `startIcon`.
3. Add tests for `isLoading` (aria-busy + spinner), `onFocus`/`onBlur`, and `startIcon`.
4. Consider making the character counter a live region for accessibility, or at least adding a note about how screen reader users discover the count.

## SVA Conversion

**Benefit: Low / None**

TextArea renders a wrapper div, the `textarea` control, optional icon slots, a spinner, status icon, and a character counter Text — but nearly all the styling comes from Field's shared `inputRecipe`/`inputStyles` (root, `control`, `iconSlot`). The component's own `const styles = {...}` in `TextArea.tsx` is just 4 small `css()` blocks (`wrapper`, `textarea`, `counter`, `counterOverLimit`), each a thin layout/override on top of the shared input styles, applied via `cx()`. The only conditional branch is `isOverLimit ? styles.counterOverLimit`. There are no component-owned size/orientation/variant matrices to consolidate (size/status are handled by `inputRecipe`), so an sva here would mostly re-wrap a handful of trivial overrides. Not worth converting; the shared Field recipes are the right place for any slot consolidation.
