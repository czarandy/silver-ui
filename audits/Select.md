# Select Audit

## Summary

Single-select dropdown field built on custom listbox navigation with popover-based menu. Supports search filtering, sections/dividers, custom option rendering via `renderOption` and `SelectOption`, icons, clear button, loading state, and validation. Uses the shared `Field` wrapper and `useListboxNavigation` hook.

## Issues

### Critical

- None.

### High

- **Search input placed inside the `role="listbox"` container.** The `<input type="search">` for filtering is rendered as a direct child of the `<div role="listbox">`. ARIA spec requires listbox children to be `role="option"` (or groups thereof). Screen readers may not announce the search input correctly or may skip it entirely. The search input should be placed outside the listbox or the listbox should be restructured so the search is a sibling.

### Medium

- **Options use `<button>` elements with `role="option"`.** Buttons inside a listbox are non-standard. The WAI-ARIA combobox pattern expects option elements (`<div>` or `<li>`) not interactive `<button>` elements. The `onClick` behavior works fine visually, but assistive technology may announce these as "button" rather than "option", leading to confused role announcements. Consider using `<div role="option">` with `onClick` handlers instead.
- **Missing `aria-label` on option icons.** When `option.icon` is set and `renderOptionProp` is null, the icon is rendered without an accessible name. Since the icon is decorative (the label text follows), this is acceptable in most cases but the `<span>` wrapper could use `aria-hidden="true"` to ensure screen readers skip the icon slot entirely.
- **No recipe file.** Unlike many other components in this codebase, Select defines all its styles inline via `css()` calls. This is not a bug, but it is inconsistent with components that use `.recipe.ts` files for variant-driven styling.
- **No story for `isReadOnly` or disabled options.** There is no story demonstrating disabled individual options, and the disabled option test uses `fireEvent.click` rather than `userEvent.click`, which does not fully simulate real user behavior. The test does pass but using `userEvent` would be more realistic.

### Low

- **`renderOption` callback is recreated on every render when `highlightedValue` changes.** The `renderOption` function includes `highlightedValue` in its dependency array, which means every mouse-over or keyboard navigation triggers a new callback reference and rerenders all option nodes. For small lists this is negligible, but for large option sets it could cause noticeable jank. Consider memoizing options individually or using CSS-driven highlighting via data attributes.
- **`emitChange` dependency on `props` object (Slider-style concern).** Not directly applicable here, but the `commitOption` callback only depends on `onChange`, which is clean.
- **No test for `ref` forwarding.** The component accepts a `ref` prop for the combobox button but no test verifies ref forwarding works correctly.
- **No test for `description` or `labelTooltip` rendering.** These props are passed through to `Field` and likely work, but there is no explicit coverage.
- **Story always starts with a pre-selected value.** The `SelectStory` wrapper always initializes with `'ada'` selected. Only `EmptySelectStory` starts with `null`, and it is only used by `CustomPlaceholder`. Consider adding an explicit "Empty/No selection" story.

## Recommendations

1. Move the search `<input>` outside of the `role="listbox"` container. A common pattern is to place it in the popover but above/before the listbox.
2. Replace `<button role="option">` with `<div role="option">` to avoid conflicting role semantics.
3. Add a story for disabled options to demonstrate partial-disable behavior.
4. Add a test for ref forwarding to the combobox button.
5. Consider debouncing the search filter for very large option sets to avoid blocking the main thread during rapid typing.
