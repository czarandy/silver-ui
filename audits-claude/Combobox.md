# Combobox Component Audit

Audited files:

- `src/components/Combobox/types.ts`
- `src/components/Combobox/index.ts`
- `src/components/Combobox/Combobox.tsx`
- `src/components/Combobox/BaseCombobox.tsx`
- `src/components/Combobox/ComboboxItem.tsx`
- `src/components/Combobox/Combobox.stories.tsx`
- `src/components/Combobox/Combobox.test.tsx`

---

## Performance Problems

### 1. `runSearch` callback recreated on every `maxMenuItems` or `searchSource` change

**File:** `BaseCombobox.tsx`, line 256-288

`runSearch` depends on `maxMenuItems` and `searchSource` in its dependency array. Since `searchSource` is an object prop, if the consumer does not memoize it (e.g., creates it inline), `runSearch` will be recreated on every render, which cascades into `updateQuery` also being recreated (line 290-326), potentially causing stale closure issues or unnecessary re-renders. The `Combobox` wrapper does not memoize `searchSource` itself -- it passes it through directly from props.

**Severity:** Low-medium. The component works correctly, but consumers who forget to memoize their `searchSource` may see unnecessary debounce timer resets or subtle re-render overhead.

### 2. `results.map` re-renders all items on highlight change

**File:** `BaseCombobox.tsx`, lines 374-406

When `highlightedIndex` changes (on every ArrowUp/ArrowDown keypress), the entire results list re-renders because highlighted state is computed inline. The option buttons are rendered inline rather than as memoized child components.

**Severity:** Low. With `maxMenuItems` defaulting to 10, this is unlikely to be noticeable, but could matter with custom `renderItem` functions that are expensive.

### 3. `createStaticSource` performs linear scan with no early termination optimization

**File:** `types.ts`, lines 58-68

The `search` method in `createStaticSource` calls `item.label.toLowerCase()` and all `keywords` on every search, for every item. For large static lists (hundreds of items), this is O(n\*k) per keystroke. There is no caching of lowercased labels.

**Severity:** Low. The debounce (default 150ms) mitigates this. Only relevant for very large static lists.

---

## Accessibility Concerns

### 1. Missing `aria-label` or accessible name on the input when used in `BaseCombobox` standalone

**File:** `BaseCombobox.tsx`, lines 412-482

The `<input>` element has `role="combobox"` but no `aria-label` or `aria-labelledby` prop. When used via `Combobox`, the `<Field>` component provides a `<label htmlFor={inputId}>` which associates the label. However, when `BaseCombobox` is used standalone (it is exported publicly and used by `TagsInput`), there is no guarantee that a label is associated. The component accepts `inputId` but not `aria-label` or `aria-labelledby`.

**Severity:** Medium. Consumers using `BaseCombobox` directly must ensure a label is associated externally, but the API does not make this easy or obvious.

**Suggestion:** Add an `aria-label` or `aria-labelledby` prop to `BaseComboboxProps`.

### 2. Listbox options use `<button>` elements instead of `<div>` or `<li>`

**File:** `BaseCombobox.tsx`, lines 377-404

The ARIA combobox pattern (WAI-ARIA APG) expects `role="option"` children inside `role="listbox"`. Using `<button>` elements with `role="option"` is technically valid (the role overrides the implicit button role), but it is unconventional. Some screen readers may announce these as "button" in addition to "option", causing confusion.

**Severity:** Low. Functionally works, but could cause minor screen-reader announcement oddities.

### 3. No live region announcing result count

**File:** `BaseCombobox.tsx`

When search results appear or change, there is no `aria-live` region announcing how many results were found. The WAI-ARIA combobox pattern recommends an assertive or polite live region such as "3 results available" to inform screen reader users.

**Severity:** Medium. Screen reader users relying on non-visual cues will not know when results appear or how many there are without tabbing into the listbox.

### 4. `Escape` key does not restore the previous input value

**File:** `BaseCombobox.tsx`, line 471-473

Pressing Escape closes the popover but leaves the query text in the input. Per the ARIA combobox pattern, Escape should optionally clear or revert the input to its previous state. This is a minor UX concern but worth noting.

**Severity:** Low.

### 5. Tag in selected state is not keyboard-accessible for editing

**File:** `Combobox.tsx`, lines 236-245

When a value is selected, a `<Tag>` with an `onClick` handler is displayed. The `Tag` component renders a `<span>` by default, which is not focusable via keyboard. Users cannot tab to the tag to re-enter editing mode without using a mouse.

**Severity:** Medium. Keyboard-only users cannot re-enter editing mode by interacting with the tag. They must use the clear button or start typing (if the hidden input receives focus).

---

## Logic Bugs

### 1. `onBlur` is not handled -- popover stays open when tabbing away

**File:** `BaseCombobox.tsx`

There is no `onBlur` handler on the input. When the user tabs away from the combobox, the popover remains open until the Popover's own light-dismiss behavior closes it. If the Popover does not handle this (it uses the native popover API which does dismiss on outside clicks, but tabbing away from the trigger may not trigger a dismiss in all browsers), the dropdown could remain visible.

**Severity:** Low-medium. Depends on the Popover implementation. Worth verifying in browser testing.

### 2. `hasEntriesOnFocus` + clearing query does not close menu when it should

**File:** `BaseCombobox.tsx`, lines 299-305

When `hasEntriesOnFocus` is `false` and the user clears the query (backspaces to empty), the menu closes and results are cleared. But when `hasEntriesOnFocus` is `true` and the user clears the query, the code falls through to line 308 which triggers a `bootstrap` search, re-opening the menu. This is likely intentional, but there is no way for a user to dismiss the results by clearing the field when `hasEntriesOnFocus` is enabled -- they must press Escape. This should be documented or reconsidered.

**Severity:** Low. Arguably working as designed, but the interaction could surprise users.

### 3. Race condition potential with synchronous `searchSource` and `debounceMs > 0`

**File:** `BaseCombobox.tsx`, lines 314-316

When `debounceMs > 0`, the search is always delayed via `setTimeout`. If `searchSource.search()` returns synchronously (as `createStaticSource` does), the debounce still fires. This is correct behavior, but during the debounce window, the old results remain visible. The user sees stale results for 150ms by default. With synchronous sources, `debounceMs={0}` is recommended but this is not documented.

**Severity:** Low. Both stories set `debounceMs={0}`, suggesting awareness, but the default of 150ms could confuse users with static sources.

### 4. `ComboboxItem` ignores `ref`, `style`, `className`, and `data-testid` when `item.element` is set

**File:** `ComboboxItem.tsx`, lines 80-82

When `item.element` is provided, the component returns `<>{item.element}</>`, ignoring all other props (`ref`, `className`, `style`, `description`, `icon`, `isDisabled`, `data-testid`). This is a silent prop-swallowing issue.

**Severity:** Low-medium. Consumers passing both `item.element` and other props will see those props silently ignored.

---

## Unclear API

### 1. `isOptional` and `isRequired` are both exposed -- mutually exclusive but not enforced

**File:** `Combobox.tsx`, lines 66-77

Both `isOptional` and `isRequired` props exist. Setting both to `true` simultaneously is not prevented and the resulting behavior depends on the `Field` component. These should ideally be a single prop or have a runtime warning.

**Severity:** Low. This is inherited from the `Field` pattern, not specific to Combobox.

### 2. `SearchSource` is generic but `cancel()` semantics are unclear

**File:** `types.ts`, lines 29-30

The `cancel()` method on `SearchSource` is optional and described as "Optional cancellation for in-flight async searches." However, `BaseCombobox` calls `cancel()` in several places (before new searches, on unmount, on selection). If `cancel()` has side effects beyond aborting a fetch, this could cause issues. The contract is underspecified.

**Severity:** Low. The current usage is reasonable, but the interface could benefit from documenting that `cancel()` may be called multiple times and should be idempotent.

### 3. `value` prop is required but can be `null` -- naming could be clearer

**File:** `Combobox.tsx`, line 139

The `value` prop is typed as `T | null` and is required. The name `value` with a `null` option is standard React controlled-component convention, so this is fine, but the prop being required means consumers must always pass `value={null}` for uncontrolled initial state. There is no uncontrolled mode.

**Severity:** Informational. Controlled-only is a valid design choice.

---

## Missing Tests

The test file (`Combobox.test.tsx`) has only **2 test cases**. For a component of this complexity (keyboard navigation, async search, debouncing, popover management, disabled state), coverage is notably thin. The codebase median is ~7-9 tests for comparably complex components.

### Missing test scenarios:

1. **Keyboard navigation** -- ArrowDown/ArrowUp cycling through results, Enter to select, Escape to close. None of these are tested.
2. **Debounce behavior** -- No test verifies that searches are debounced or that rapid typing only triggers one search.
3. **Async search source** -- All tests use synchronous `createStaticSource`. No test covers async search, loading states, or error handling.
4. **Disabled state** -- No test verifies that a disabled combobox cannot be interacted with.
5. **`hasEntriesOnFocus`** -- No test verifies that focusing the input shows bootstrap results.
6. **`emptySearchResultsText`** -- No test verifies the empty state message appears for zero-result searches.
7. **`maxMenuItems`** -- No test verifies that results are truncated.
8. **`onQueryChange` callback** -- Not tested.
9. **`onOpenChange` callback** -- Not tested.
10. **`renderItem` custom rendering** -- Not tested.
11. **`startIcon` rendering** -- Not tested.
12. **`status` validation display** -- Not tested.
13. **`hasClear={false}`** -- No test verifies the clear button is hidden.
14. **`BaseCombobox` standalone** -- No tests for BaseCombobox used directly (it is a public export).
15. **`ComboboxItem`** -- No tests at all for the ComboboxItem component.
16. **`createStaticSource` with keywords** -- No test for the `keywords` option.

---

## Missing Stories

The stories file (`Combobox.stories.tsx`) has only **2 stories**: `Default` and `CustomItems`. For a component with this many props and states, more stories are needed.

### Missing story scenarios:

1. **Disabled state** (`isDisabled={true}`) -- No story demonstrates a disabled combobox.
2. **With validation status** (`status`) -- No story shows error, warning, or success states.
3. **With start icon** (`startIcon`) -- No story demonstrates the start icon slot.
4. **Pre-selected value** -- No story shows the component initialized with a selected value (tag visible).
5. **Without clear button** (`hasClear={false}`) -- No story.
6. **Different sizes** (`size="sm"`, `size="lg"`) -- No story demonstrates size variants.
7. **Async search source** -- No story demonstrates an async/remote search source with loading state.
8. **Empty search results** -- No story demonstrates the empty state with custom `emptySearchResultsText`.
9. **With description and label tooltip** -- No story demonstrates field description or label tooltip.
10. **BaseCombobox standalone** -- No story for the standalone base component (it is exported publicly).
11. **Large item list / scrolling** -- No story demonstrates the scrollable dropdown with many items.
12. **`isRequired` / `isOptional`** -- No story demonstrates required/optional field indicators.

---

## Summary

| Category        | Issues Found | Severity                                    |
| --------------- | ------------ | ------------------------------------------- |
| Performance     | 3            | Low                                         |
| Accessibility   | 5            | 2 Medium, 3 Low                             |
| Logic Bugs      | 4            | 1 Low-Medium, 3 Low                         |
| Unclear API     | 3            | Low / Informational                         |
| Missing Tests   | 16 scenarios | High (only 2 of ~18+ needed tests exist)    |
| Missing Stories | 12 scenarios | Medium (only 2 of ~14 useful stories exist) |

**Top priorities:**

1. Add keyboard navigation tests (ArrowDown, ArrowUp, Enter, Escape).
2. Add accessibility live region for result count announcements.
3. Add `aria-label`/`aria-labelledby` prop to `BaseComboboxProps` for standalone use.
4. Make the selected-value Tag keyboard-accessible.
5. Add stories for disabled, validation status, sizes, and pre-selected value states.
