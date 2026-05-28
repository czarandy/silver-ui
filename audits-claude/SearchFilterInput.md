# SearchFilterInput Audit

Audited files in `src/components/SearchFilterInput/`:

- `SearchFilterInput.tsx`
- `SearchFilterInputEditPopover.tsx`
- `SearchFilterInputFilterEditor.tsx`
- `SearchFilterInputTag.tsx`
- `SearchFilterInputValueEditor.tsx`
- `types.ts`
- `useSearchFilterInputConfig.ts`
- `useSearchFilterInputSource.ts`
- `formatFilterValue.ts`
- `internalConfig.ts`
- `index.ts`

---

## Performance Problems

### P1. `renderTag` and `renderItem` are recreated on every render

**File:** `SearchFilterInput.tsx`, lines 352 and 425

Both `renderTag` and `renderItem` are plain function declarations inside the component body (not wrapped in `useCallback`). They capture `filters`, `config`, `isReadOnly`, `isDisabled`, `maxTagLength`, `timezoneID`, `components`, and `configFromProps` from closure, and are passed as props to `TagsInput`. Every render creates new function references, which can trigger re-renders in the child.

### P2. `handleTagClick` and `handleSave` are not memoized

**File:** `SearchFilterInput.tsx`, lines 333 and 439

Both are plain function declarations inside the render body. While `handleSave` is only passed to the popover (which mounts/unmounts), `handleTagClick` is called from within `renderTag` closures on every tag, so the impact is limited. Still, consistency with the memoized `handleTagsInputChange` and `openEditor` would be preferable.

### P3. `syncToParent` called inside state updater may use stale closure

**File:** `SearchFilterInputEditPopover.tsx`, lines 367-371, 378-383, 387-391

`syncToParent` is a `useCallback` that captures `partialFilter` in its dependency array. It is called inside `setSubFilters(previous => { ... syncToParent(updated); ... })`. Calling `syncToParent` from inside a state updater function is semantically odd -- the state updater sees the latest `previous` sub-filters, but `syncToParent` spreads `partialFilter` from a potentially stale closure. This is mitigated because `partialFilter` is in the dependency array of `syncToParent`, but if `partialFilter` changes between render and the state updater running, the value could be stale. In practice this is unlikely to cause bugs with React's synchronous batching, but it is fragile.

### P4. `useSearchFilterInputConfig` does not memoize `definitions` array

**File:** `useSearchFilterInputConfig.ts`, lines 450-454

`useMemo` depends on `[configName, definitions]`. If the consumer passes an inline array literal for `definitions`, the memo will be invalidated on every render. The companion `createSearchFilterInputConfig` exists for the non-hook case, but the hook itself has no protection. Consider documenting that `definitions` should be a stable reference, or accepting it as a ref-stable array.

---

## Accessibility Concerns

### A1. Edit popover has `hasAutoFocus={false}` -- focus management may confuse screen readers

**File:** `SearchFilterInput.tsx`, line 548

The `Popover` wrapping the edit content has `hasAutoFocus={false}`. The `SearchFilterInputEditPopover` performs its own focus management via `requestAnimationFrame` (line 458), which queries for the first focusable element. This deferred custom approach may produce an accessibility gap: between the popover opening and the RAF firing, focus remains on the blurred `TagsInput`, leaving no clear focus target. The `Popover` component does have `aria-modal` and focus trap support, but skipping its built-in auto-focus may cause screen readers to announce nothing or announce the wrong element briefly.

### A2. Labels are visually hidden throughout the edit popover with no fallback grouping

**File:** `SearchFilterInputEditPopover.tsx`, lines 575-595 (field/operator/value selectors)

All three `Select`/editor controls inside the edit popover use `isLabelHidden` and generic labels like "Field", "Operator", "Value". When there are multiple nested sub-filter rows (lines 222-303, `NestedSubFilterRow`), a screen reader user encounters multiple identically-labeled "Field" and "Operator" selects with no group label or `aria-label` distinguishing which row they belong to. Consider wrapping each nested row in a `fieldset` / `group` with a descriptive `legend` or `aria-label`.

### A3. Nested sub-filter rows lack semantic list markup

**File:** `SearchFilterInputEditPopover.tsx`, lines 410-423

Nested sub-filter rows are rendered as `div` elements with no list semantics (`role="list"` / `role="listitem"`). Screen reader users have no indication of how many sub-filters exist or their position. The wrapping `div.nestedList` and each `div.nestedNode` are purely visual.

### A4. The `onKeyDown` handler on the edit popover root div suppresses `Escape` and `Enter`

**File:** `SearchFilterInputEditPopover.tsx`, lines 562-569

The root `div` has an `onKeyDown` handler that calls `event.preventDefault()` for both `Enter` (when save is possible) and `Escape`. While this is needed for form control, the `div` has no `role` attribute (`jsx-a11y-x/no-static-element-interactions` is eslint-disabled on line 1). The popover's parent already provides `role="dialog"`, so this `div` is a nested static element with key handlers -- acceptable but worth noting.

### A5. `SearchFilterInputTag` does not forward `size` prop

**File:** `SearchFilterInputTag.tsx`, line 42

The `Tag` rendered by `SearchFilterInputTag` does not receive a `size` prop, unlike the inline default `renderTag` in `SearchFilterInput.tsx` (line 420 passes `size={size}`). When a consumer uses a custom `Tag` component override, the tags will always render at the default size regardless of the `SearchFilterInput` `size` prop. This is also a visual consistency issue.

---

## Logic Bugs

### L1. `IntegerEditor` and `FloatEditor` can emit `null` as the value, violating the type contract

**File:** `SearchFilterInputValueEditor.tsx`, lines 140 and 163

`NumberInput.onChange` has signature `(value: number | null) => void`. Both editors pass the value directly: `onChange({type: 'integer', value})`. When the user clears the number input, `value` is `null`, producing `{type: 'integer', value: null}`. The `FilterValueInteger` type declares `value: number` (line 122 of `types.ts`), so this is a runtime type violation. The object `{type: 'integer', value: null}` is truthy, so `isSaveDisabled` (which checks `partialFilter.value == null`) will be `false`, and the user can save a filter with `value: null`. Downstream consumers (e.g., `formatFilterValue`, `matchesFilter`) may produce NaN or incorrect results.

**Fix:** Guard the `onChange` call: `if (value != null) onChange({type: 'integer', value})` (or set `value` to `undefined` to signal incomplete).

### L2. `onEnter` prop is accepted but never used in `SearchFilterInputValueEditor`

**File:** `SearchFilterInputValueEditor.tsx`, lines 30 and 609

The `onEnter` prop is declared in the interface and destructured from props (line 514), but it is consumed only by `void onEnter;` on line 609 (a no-op to suppress the unused-variable warning). None of the sub-editors wire up Enter key handling. This means pressing Enter inside a `TextInput` value editor in the popover does nothing unless the parent's `onKeyDown` on the root div catches it. The `onKeyDown` on the root div (line 562 of `SearchFilterInputEditPopover.tsx`) does handle Enter globally, so this is not a broken feature, but the prop is dead code.

### L3. `useEffect` auto-save for `empty` operator type can fire redundantly

**File:** `SearchFilterInputEditPopover.tsx`, lines 468-476

When the operator type is `empty`, this effect calls `onSave(...)` immediately. If `onSave` causes a parent re-render that remounts the edit popover (e.g., due to the popover closing and the component being conditionally rendered), this could fire twice. The `[isEmptyType, onSave, partialFilter.field, partialFilter.operator]` dependencies include `onSave`, which in `SearchFilterInput.tsx` is defined as a plain function (`handleSave`, line 439), meaning its reference changes every render. In practice the popover closes after the first save, so this is unlikely to loop, but the dependency on an unstable `onSave` reference is fragile.

### L4. `timezoneID` is not forwarded to the default `SearchFilterInputEditPopover`

**File:** `SearchFilterInput.tsx`, lines 483-491

When an `EditorOverride` is present (line 480), `timezoneID` is passed. But when the default `SearchFilterInputEditPopover` is used (line 483), `timezoneID` is not passed. The `SearchFilterInputEditPopover` component does not accept a `timezoneID` prop either. This means date formatting inside the edit popover may differ from the tag formatting, which does receive `timezoneID`.

---

## Unclear API

### U1. `SearchFilterInputTag` `size` prop is missing

**File:** `types.ts`, lines 269-278 (`SearchFilterInputTagProps`)

The `SearchFilterInputTagProps` interface does not include a `size` prop, even though the parent `SearchFilterInput` has a `size` prop. Custom `Tag` component overrides cannot match the visual size of the surrounding input.

### U2. `components` override system uses `OperatorValue['type']` as keys, which is non-obvious

**File:** `types.ts`, lines 291-298

`SearchFilterInputComponents` is `Partial<Record<OperatorValue['type'], SearchFilterInputComponentOverride>>`. This means keys are `'string' | 'integer' | 'float' | 'enum' | 'custom' | ...`. The mapping from operator value type to component override is not immediately intuitive -- a consumer might expect to key by field key or operator key instead. This is a design decision rather than a bug, but could benefit from documentation.

### U3. `popoverSaveButtonLabel` is a narrow customization point

**File:** `SearchFilterInput.tsx`, line 130

Only the save button label is customizable. There is no `popoverCancelButtonLabel` or `popoverDeleteButtonLabel`. If a consumer needs i18n, they would need to use the `components` override system to replace the entire editor, which is heavyweight for simple label changes.

### U4. `SearchFilterInputEditPopoverProps` is exported but uses `InternalSearchFilterInputConfig`

**File:** `SearchFilterInputEditPopover.tsx`, line 19 / `index.ts`, line 8

The `SearchFilterInputEditPopover` is exported from `index.ts`, and its `config` prop expects `InternalSearchFilterInputConfig` (an internal type from `internalConfig.ts`). Consumers who want to use it directly must first call `useInternalSearchFilterInputConfig()`. The `SearchFilterInputFilterEditor` wrapper exists to solve this (accepts public `SearchFilterInputConfig`), but the exported `SearchFilterInputEditPopover` exposes an internal type in the public API.

---

## Missing Tests

The component has **no test file** (`SearchFilterInput.test.tsx` does not exist). Given the component's complexity (560+ lines in the main file, 640+ in the edit popover, 610+ in the value editor), this is a significant gap. The following scenarios should be tested:

### T1. Basic rendering and filter display

- Renders with no filters
- Renders tags for provided filters
- Tags display correct field label, operator label, and formatted value

### T2. Adding a filter

- Selecting a field/operator from the combobox dropdown adds a filter
- Selecting a field that requires a value opens the edit popover
- Selecting a field with `empty` type operator auto-adds the filter without a popover

### T3. Removing a filter

- Clicking the remove button on a tag removes the filter
- `onChange` is called with the correct `changeType='remove'` and `index`

### T4. Editing a filter

- Clicking a tag opens the edit popover in edit mode
- Changing the value and saving calls `onChange` with `changeType='edit'`
- Clicking "Delete" in the edit popover removes the filter

### T5. Read-only and disabled states

- `isReadOnly` prevents tag clicks, tag removal, and editing
- `isDisabled` prevents interaction
- Per-filter `isReadOnly` prevents editing that specific filter

### T6. Keyboard interaction

- Enter key in the edit popover saves
- Escape key in the edit popover cancels

### T7. `useSearchFilterInputConfig` and `applyFilters`

- `applyFilters` correctly filters data for each operator type (string contains/starts with, number equals/greater than, enum is/is not, boolean is true/is false, date before/after, etc.)
- Edge cases: empty filter array returns all data, mismatched field types return false

### T8. `formatFilterValue`

- Truncation at `maxLength`
- Enum label resolution
- Date formatting with and without `timezoneID`
- List summary ("N items") when joined string exceeds `maxLength`

### T9. `useSearchFilterInputSource`

- `bootstrap()` returns all visible fields
- `search()` matches by field label, aliases, operator label
- Content search field produces a content search item when no exact match
- Value matching for enum fields

---

## Missing Stories

The component has **no stories file** (`SearchFilterInput.stories.tsx` does not exist). Every other component in the library follows the pattern of having a `.stories.tsx` file. The following stories should be created:

### S1. Default / basic usage

A story with a simple config (2-3 fields with different types) and interactive filter management.

### S2. All value types

A story demonstrating each operator value type: `string`, `string_list`, `integer`, `float`, `time`, `date_absolute`, `date_relative`, `date_range`, `enum`, `enum_list`, `entity_list`, `custom`, `empty`, `nested`.

### S3. Sizes

Stories for `size="sm"`, `size="md"`, `size="lg"`.

### S4. Disabled and read-only states

- `isDisabled={true}`
- `isReadOnly={true}`
- Per-filter `isReadOnly`

### S5. Pre-populated filters

A story that starts with existing filters to show the tag rendering.

### S6. Custom components override

A story demonstrating the `components` prop to override a Tag or Editor for a specific operator value type.

### S7. Result count

Stories showing `resultCount` as a number and as a string.

### S8. Content search field

A story with `contentSearchFieldKey` configured to show the "search all" behavior.

### S9. Tag overflow

A story demonstrating `tagOverflowBehavior` with many filters.

### S10. `useSearchFilterInputConfig` helper

A story using the `useSearchFilterInputConfig` hook with `FieldDefinition[]` and `applyFilters` to demonstrate the convenience API.

### S11. Nested filters

A story demonstrating nested/grouped filter support.

---

## Summary of Severity

| Category        | Count        | High Severity                                                         |
| --------------- | ------------ | --------------------------------------------------------------------- |
| Performance     | 4            | P1 (render churn on every keystroke)                                  |
| Accessibility   | 5            | A2 (indistinguishable nested rows), A5 (size mismatch)                |
| Logic Bugs      | 4            | L1 (null value violates type contract), L4 (timezoneID not forwarded) |
| Unclear API     | 4            | U1 (missing size prop), U4 (internal type in public API)              |
| Missing Tests   | 9 scenarios  | All -- no test file exists                                            |
| Missing Stories | 11 scenarios | All -- no stories file exists                                         |
