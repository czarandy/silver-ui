# TagsInput Component Audit

**Files reviewed:**

- `src/components/TagsInput/TagsInput.tsx`
- `src/components/TagsInput/TagsInput.stories.tsx`
- `src/components/TagsInput/TagsInput.test.tsx`
- `src/components/TagsInput/index.ts`
- `src/components/Combobox/BaseCombobox.tsx` (dependency)
- `src/components/Combobox/types.ts` (dependency)
- `src/components/Tag/Tag.tsx` (dependency)
- `src/components/Field/inputUtils.tsx` (dependency)

---

## Performance Problems

### P1. `filteredSource` recreated on every `selectedIDs` change, but closures capture stale `selectedIDs`

**File:** `TagsInput.tsx`, lines 279-312

The `filteredSource` object is memoized with `useMemo`, but its `search` and `bootstrap` closures capture `selectedIDs` by reference. This is correct in isolation, but the memo dependency on `selectedIDs` means a new `SearchSource` object is created on every render where `value` changes. Since `selectedIDs` is itself a new `Set` on every render where `value` changes (line 274-277), every tag add/remove creates a brand-new `filteredSource`, which is passed to `BaseCombobox` as `searchSource`. Inside `BaseCombobox`, the `searchSource` is a dependency of `useCallback` hooks (`runSearch`, `updateQuery`, `selectItem`) and a `useEffect` cleanup (line 345-352). This means those callbacks are all re-created whenever any tag is added or removed. This is a minor cascade but could cause unnecessary re-renders in a heavily optimized tree.

**Suggested fix:** Consider using a `useRef` to hold the current `selectedIDs` set and reading from it inside the search closures, so the `filteredSource` identity remains stable.

### P2. `removeItem` is not memoized

**File:** `TagsInput.tsx`, lines 323-328

`removeItem` is a plain closure inside the render body. Each tag's `onRemove` callback (line 378: `() => removeItem(item)`) is a new function reference on every render. This will cause every `<Tag>` to re-render even if React.memo were applied. This is a minor concern since `Tag` is not memoized, but it would block future optimization.

---

## Logic Bugs

### B1. Clear button fires `onChange` with incorrect semantics

**File:** `TagsInput.tsx`, lines 441-449

```tsx
onClick={event => {
  event.stopPropagation();
  for (const item of value) {
    onChange([], {item, type: 'remove'});
    break;
  }
}}
```

The `for...break` loop only ever processes the first item, making it equivalent to `onChange([], {item: value[0], type: 'remove'})`. If there are 3 tags, clearing fires a single `onChange` call with an empty array but only reports the first item as removed. This is semantically misleading -- the consumer receives a `change` object referencing only one removed item while all items were actually removed. Two possible intentions:

1. **If the intent is to fire one event per removed item:** the loop should not pass `[]` as the first argument each time, and should not `break`. But even then, firing multiple `onChange` calls synchronously with `[]` as the items each time is confusing.
2. **If the intent is a single "clear all" event:** the `for...break` pattern is unnecessarily obscure. A dedicated `type: 'clear'` change type would be clearer, or at minimum the code should be `onChange([], {item: value[0], type: 'remove'})` without the loop.

### B2. `tagOverflowBehavior` prop declared but never implemented

**File:** `TagsInput.tsx`, line 189 (type declaration), lines 231-265 (destructuring)

The `tagOverflowBehavior` prop is defined in `TagsInputProps` and exported in the `TagsInputOverflowBehavior` type (with values `'none' | 'unfocusedInline' | 'unfocusedLayer'`), but it is never destructured from props or referenced anywhere in the component body. Consumers who set `tagOverflowBehavior="unfocusedInline"` will see no effect. This is also passed through from `SearchFilterInput` (line 540 in that file), meaning that component is also broken for this feature.

### B3. Creatable item type assertion is unsound

**File:** `TagsInput.tsx`, lines 301-307

```tsx
{
  id: `${CREATABLE_ID_PREFIX}${searchQuery}`,
  label: `Create "${searchQuery}"`,
  auxiliaryData: {value: searchQuery},
} as T,
```

The synthetic creatable item is cast to `T` with `as T`, but `T` may have required fields beyond `SearchableItem` (e.g., if `T` includes required `auxiliaryData` of a specific shape, or additional properties). The `onChange` handler then receives this item typed as `T`, which could cause runtime errors downstream if the consumer accesses `T`-specific fields. The `eslint-disable` comment acknowledges this.

### B4. Backspace-to-remove uses stale `query` via closure

**File:** `TagsInput.tsx`, lines 420-425

```tsx
onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Backspace' && query === '' && value.length > 0) {
```

The `query` referenced here is the `TagsInput`-level `useState` value (line 273), but the actual input value lives inside `BaseCombobox`'s own `query` state (BaseCombobox.tsx line 237). The `TagsInput` `query` is only updated via the `onQueryChange` callback (line 427-429), which is called from `BaseCombobox.updateQuery`. If `BaseCombobox` clears its query internally (e.g., after selecting an item at line 336: `setQuery('')`), the `TagsInput` `onQueryChange` is NOT called in `selectItem` -- only `onChange` is called. This means after selecting an item, `TagsInput.query` could remain stale (non-empty) if the last `onQueryChange` set it to something. However, reviewing `BaseCombobox.selectItem` (line 328-343), it sets `setQuery('')` but does NOT call `onQueryChange?.('')`. So `TagsInput.query` could be out of sync with the actual input query after an item selection, causing the Backspace-to-remove-last-tag feature to not trigger when the user expects it to.

---

## Accessibility Concerns

### A1. Wrapper `<div>` uses focus/blur handlers without a role

**File:** `TagsInput.tsx`, lines 345-367

The wrapper `<div>` has `onBlur` and `onFocus` handlers but no ARIA role. The eslint-disable comment (`jsx-a11y-x/no-static-element-interactions`) acknowledges this. While the focus observation pattern is legitimate for compound widgets, screen readers have no way to understand this container's purpose. Consider adding `role="group"` with an `aria-label` matching the field label to provide semantic grouping for the tags + input.

### A2. No `aria-live` region for tag add/remove announcements

When tags are added or removed, screen reader users receive no announcement. The visual change (a tag appearing/disappearing) is not communicated. Consider an `aria-live="polite"` region that announces changes like "Added Ada Lovelace" or "Removed Grace Hopper, 2 tags remaining".

### A3. Tags are not keyboard-navigable

**File:** `TagsInput.tsx`, lines 371-384

Selected tags are rendered inside `<span>` wrappers. While each tag has a remove button that is focusable, there is no arrow-key navigation between tags. In many multi-select combobox implementations (WAI-ARIA pattern), Left/Right arrows move focus between tags when the input is empty. Currently, the only keyboard interaction with tags is Backspace to remove the last one.

### A4. The clear button lacks contextual screen reader information

**File:** `TagsInput.tsx`, line 442

`aria-label={`Clear ${label}`}` is good, but it does not indicate how many items will be cleared. A more informative label like `Clear all ${value.length} ${label}` would help screen reader users understand the scope of the action.

---

## Unclear API

### U1. `onChange` callback signature is confusing for "clear"

**File:** `TagsInput.tsx`, line 139

The `onChange` type is `(items: T[], change: TagsInputChange<T>) => void`. The `TagsInputChange` union has types `'add' | 'create' | 'remove'`. There is no `'clear'` type, so the clear button (line 441-449) fires a `'remove'` change with only the first item. Consumers cannot distinguish between "user removed one tag" and "user cleared all tags" without checking whether the new items array is empty. Adding a `'clear'` change type would improve the API.

### U2. `isOptional` and `isRequired` are both exposed without mutual exclusion

**File:** `TagsInput.tsx`, lines 108-114

Both `isOptional` and `isRequired` are independent boolean props. Nothing prevents setting both to `true`, which would produce contradictory field annotations. Consider using a single `necessity?: 'optional' | 'required'` prop, or at least documenting the precedence.

### U3. The `tagOverflowBehavior` prop is exported but nonfunctional

This was already noted as a logic bug, but from an API perspective it is confusing to expose a typed prop with documented values that has no effect.

---

## Missing Tests

### T1. No test for `hasCreate` behavior

The `hasCreate` prop enables free-text tag creation and is a significant feature. There is no test verifying:

- A "Create" option appears when typing text that doesn't match existing items.
- Selecting the "Create" option fires `onChange` with `type: 'create'`.
- The created item has the correct `id` and `label` (raw text, not the `Create "..."` label).
- The "Create" option does NOT appear when `isAtMax` is reached.

### T2. No test for `maxEntries` enforcement

The `maxEntries` prop limits the number of selected tags and visually hides the input when at max. There is no test verifying:

- The input is hidden/disabled when `value.length >= maxEntries`.
- No more items can be added once `maxEntries` is reached.

### T3. No test for Backspace-to-remove-last-tag

The keyboard interaction at lines 420-425 (pressing Backspace when the input is empty removes the last tag) is untested.

### T4. No test for the `hasClear` button

The clear-all functionality (lines 440-454) has no test coverage. Should verify:

- The clear button appears when `hasClear` is true and there are selected tags.
- The clear button does not appear when disabled or when there are no tags.
- Clicking clear fires `onChange` with an empty array.

### T5. No test for `isDisabled` behavior

No test verifies that the component is non-interactive when disabled.

### T6. No test for `onBlur` / `onFocus` focus management

The compound focus boundary logic (lines 356-365) that only fires `onBlur`/`onFocus` when focus enters/leaves the container (not when moving between child elements) is untested.

### T7. No test for `handleRef` imperative API

The `useImperativeHandle` (lines 314-320) exposes `focus()` and `blur()` methods but has no test coverage.

### T8. No test for `startIcon`, `endContent`, or `renderTag` rendering

These rendering customization props have no test coverage.

### T9. No test for already-selected items being filtered from results

The `filteredSource` (lines 279-312) filters out items that are already in `value`. This behavior is untested.

---

## Missing Stories

### S1. No story for `isDisabled`

The disabled state is a key visual and interaction state with no story.

### S2. No story for `maxEntries`

No story demonstrates the behavior when the maximum number of tags is reached.

### S3. No story for `hasClear`

The clear button is not demonstrated in any story.

### S4. No story for validation status

The `status` prop (error, warning, success states) is not demonstrated.

### S5. No story for sizes

The `size` prop (`'sm' | 'md' | 'lg'`) is not demonstrated.

### S6. No story for `renderTag` / `renderItem`

Custom rendering of tags and dropdown items is not demonstrated.

### S7. No story for `endContent`

The `endContent` slot is not demonstrated.

### S8. No story for `tagOverflowBehavior`

The overflow behavior prop is not demonstrated (and as noted above, is not implemented).

### S9. No story for `isRequired` / `isOptional`

Field necessity variants are not demonstrated.

### S10. The `Creatable` story has a mismatched `value` arg

**File:** `TagsInput.stories.tsx`, line 42

```tsx
export const Creatable: Story = {
  args: {hasCreate: true, value: []},
```

The `value: []` arg is passed through `args`, but `TagsInputStory` (line 23) creates its own `useState` initialized to `[people[0]]`, and the `{...args}` spread is applied first, meaning the component's `value` prop comes from `useState`, not from `args`. The `value: []` in args has no effect since it is overridden by the explicit `value={value}` on line 34. This is misleading.

---

## Summary of Severity

| Category        | Critical | High           | Medium | Low |
| --------------- | -------- | -------------- | ------ | --- |
| Performance     | -        | -              | P1     | P2  |
| Logic Bugs      | B4       | B1, B2         | B3     | -   |
| Accessibility   | -        | A1, A2         | A3     | A4  |
| Unclear API     | -        | U1             | U2, U3 | -   |
| Missing Tests   | -        | T1, T2, T3, T4 | T5-T9  | -   |
| Missing Stories | -        | S1-S5          | S6-S9  | S10 |
