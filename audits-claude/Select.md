# Select Component Audit

Audited files:

- `src/components/Select/Select.tsx`
- `src/components/Select/SelectOption.tsx`
- `src/components/Select/Select.stories.tsx`
- `src/components/Select/Select.test.tsx`
- `src/components/Select/index.ts`

---

## Performance Problems

### P1. `selectedOption` linear scan runs on every render (Select.tsx:331-333)

```ts
const selectedOption = selectableOptions.find(option => option.value === value);
```

This `.find()` call is not memoized. It runs on every render even when neither `value` nor `options` changed. For typical option counts this is cheap, but it is inconsistent with the rest of the component which memoizes `selectableOptions` and `filteredValues`. Wrap in `useMemo` keyed on `[selectableOptions, value]` for consistency.

### P2. `renderOption` closure is recreated every render (Select.tsx:348-389)

The `renderOption` function captures `filteredValues`, `value`, `children`, and `onChange` in a closure that is rebuilt on every render. Unlike BaseCombobox, which at least memoizes its search source, the option rendering here is fully inline. For large option lists this means every render allocates N new click handlers. Consider memoizing or extracting a stable component.

### P3. `normalizeOption` is called redundantly (Select.tsx:392-418)

In the main render loop (lines 392-418), options that are strings or plain `SelectOptionData` objects are passed through `normalizeOption()` before being handed to `renderOption()`. Inside `renderOption()` (line 352), `normalizeOption(option)` is called **again**. This means every option is normalized twice per render. The inner `renderOption` already receives a `SelectOptionData`, so the re-normalization on line 352 is redundant.

### P4. Divider key collision (Select.tsx:398)

All dividers share `key="divider"`. If multiple dividers appear in the options list, React will warn about duplicate keys and may incorrectly reconcile DOM nodes. Use the array index or a unique counter for divider keys.

---

## Accessibility Concerns

### A1. No keyboard navigation for options (Select.tsx)

The Select component has **no keyboard navigation** for the option list. The Combobox sibling (`BaseCombobox.tsx`) implements ArrowUp/ArrowDown/Enter/Escape handling, highlighted index tracking, and `aria-activedescendant`. The Select has none of this. A keyboard-only user can open the popover but cannot navigate or select options with arrow keys. This is a significant WCAG 2.1 failure (2.1.1 Keyboard, 4.1.2 Name Role Value for listbox pattern).

### A2. Missing `aria-activedescendant` (Select.tsx:450-462)

The combobox trigger button declares `role="combobox"` and `aria-haspopup="listbox"`, but never sets `aria-activedescendant`. Per the ARIA combobox pattern, the trigger should track which option is currently focused/highlighted so screen readers can announce it.

### A3. Options lack stable IDs (Select.tsx:355-388)

The option buttons rendered by `renderOption` have no `id` attribute. Even if `aria-activedescendant` were added to the trigger, there would be no IDs to reference. Each option should get an `id` like `${inputId}-option-${index}` (similar to BaseCombobox line 388).

### A4. `aria-controls` references a non-existent ID (Select.tsx:451)

The trigger sets `aria-controls={${inputId}-listbox}`, but the listbox `<div>` (line 422) does not have an `id` attribute. The referenced element does not exist in the DOM, which is an ARIA violation.

### A5. Search input not associated with listbox (Select.tsx:424-431)

When `hasSearch` is true, the search input appears inside the listbox container but has no `role` or relationship to the combobox pattern. There is no `aria-controls` on the search input pointing to the listbox, and the search input is not announced as part of the combobox widget.

### A6. Section groups lack `aria-labelledby` (Select.tsx:405-415)

Section `<div role="group">` elements use `aria-label={option.title}` which works, but the section heading `<div>` (line 410) lacks an `id`. If the heading were given an ID, `aria-labelledby` would be more robust than `aria-label` and would keep the label text in sync automatically.

---

## Logic Bugs

### L1. `isDefaultOpen` does not auto-close on selection (Select.tsx:325, 365)

When `isDefaultOpen={true}`, the popover opens immediately. On selecting an option (line 365), `setIsOpen(false)` closes it. However, on clear (line 476), `setIsOpen` is not called, so the popover state is unaffected. This is correct but inconsistent -- the clear button does not close the dropdown while option selection does.

### L2. Search query persists across open/close when opened via Popover internal toggle (Select.tsx:326, 366, 506)

The query is reset to `''` when an option is selected (line 366), but if the user opens the dropdown, types a search query, and then closes it by clicking outside (handled by `Popover.onOpenChange`), the query is **not** cleared. The next time the dropdown opens, the stale query remains and options are still filtered. The `onOpenChange` callback (line 506) is `setIsOpen` -- it does not reset the query.

### L3. Export naming collision (index.ts:4, 10)

The index file exports the `SelectOption` **type** from `Select.tsx` (line 4) and the `SelectOption` **component** from `SelectOption.tsx` (renamed as `SelectOptionLayout`, line 10). The type and the component share the name `SelectOption` in the source, which is confusing. Consumers importing `SelectOption` get the **type alias** (which is `SelectDivider | SelectOptionData | SelectSection | string`), not the layout component. This naming is likely to surprise users.

---

## Unclear API

### U1. `children` prop is non-obvious (Select.tsx:44-45)

The `children` prop is a render function `(option: SelectOptionData) => ReactNode` for custom option rendering. This is an uncommon pattern -- most React component libraries use a `renderOption` prop name for this. The name `children` suggests the Select wraps child elements, not that it accepts a render callback.

### U2. `value` accepts `string | null` but options only store `string` (Select.tsx:148, 109)

The `value` prop is `string | null`, and `onChange` fires `string | null`. However, there is no documented way to represent "no selection" other than `null` or `undefined`. The component handles both but the type allows `undefined` (via the optional `?`), `null`, or a string. The difference between `undefined` and `null` is not documented.

### U3. `isOptional` and `isRequired` can both be true (Select.tsx:92-97)

Both `isOptional` and `isRequired` are independent boolean props with no validation. A consumer could set both to `true` simultaneously, producing contradictory field labels. Consider making them mutually exclusive or using a single prop.

### U4. `SelectOptionLayout` export name is awkward (index.ts:10)

The `SelectOption` component is re-exported as `SelectOptionLayout` to avoid the naming collision with the `SelectOption` type. This name is not intuitive -- consumers would expect `SelectOption` to be the component. Consider renaming the type union to `SelectOptionType` or `SelectOptionInput` instead.

---

## Missing Tests

### T1. No keyboard navigation tests

There are zero tests for keyboard interaction (ArrowUp, ArrowDown, Enter, Escape). This is partially because keyboard navigation is not implemented (see A1), but even basic keyboard tests (e.g., Enter to open, Escape to close) are absent.

### T2. No test for search/filter behavior

The `hasSearch` prop is only tested indirectly in the "supports custom option rendering" test (line 59-80), which merely checks the search input exists. There is no test that typing in the search input actually filters options.

### T3. No test for disabled state

No test verifies that `isDisabled={true}` prevents opening the dropdown or selecting options.

### T4. No test for `isLoading` state

No test verifies the loading spinner appears or that the trigger is disabled during loading.

### T5. No test for sections and dividers

The `SelectSection` and `SelectDivider` option types are untested. No test verifies that section headings render, that dividers render, or that section options are selectable.

### T6. No test for `startIcon` prop

No test verifies the start icon renders in the trigger.

### T7. No test for `status` prop

No test verifies that error/warning/success states render correctly or that `aria-invalid` is set.

### T8. No test for `placeholder` prop

No test verifies the placeholder text renders when no value is selected.

### T9. No test for option with `disabled` flag

Individual options can be marked `disabled`, but there is no test verifying that clicking a disabled option does not fire `onChange`.

### T10. `SelectOption` component has no dedicated tests

`SelectOption.tsx` (the layout helper) has no test file. It is only indirectly tested through the Select "custom options" test.

---

## Missing Stories

### S1. No story for disabled state

There is no story demonstrating `isDisabled={true}`.

### S2. No story for loading state

There is no story demonstrating `isLoading={true}`.

### S3. No story for sections and dividers

There is no story demonstrating `SelectSection` or `SelectDivider` options.

### S4. No story for status/validation states

There is no story demonstrating `status={{ type: 'error', message: '...' }}` or other validation states.

### S5. No story for sizes

There is no story demonstrating `size="sm"`, `size="md"`, or `size="lg"`.

### S6. No story for `startIcon` prop

There is no story demonstrating the `startIcon` prop.

### S7. No story for `isLabelHidden`

There is no story demonstrating the hidden label variant.

### S8. No story for `placeholder` customization

The meta `args` set a placeholder, but there is no story showing an unselected state where the placeholder is visible (all stories pre-select `'ada'`).

### S9. `CustomOptions` story is not interactive

The `CustomOptions` story (line 36-48) passes a hardcoded `value="ada"` and no `onChange`, making it non-interactive. Users cannot test selecting a different option in this story.

---

## Summary

| Category        | Critical   | Moderate   | Minor      |
| --------------- | ---------- | ---------- | ---------- |
| Performance     | 0          | 2 (P1, P2) | 2 (P3, P4) |
| Accessibility   | 2 (A1, A4) | 2 (A2, A3) | 2 (A5, A6) |
| Logic Bugs      | 0          | 1 (L2)     | 2 (L1, L3) |
| Unclear API     | 0          | 2 (U1, U4) | 2 (U2, U3) |
| Missing Tests   | 1 (T1)     | 4 (T2-T5)  | 5 (T6-T10) |
| Missing Stories | 0          | 3 (S1-S3)  | 6 (S4-S9)  |

**Top priority fixes:**

1. **A1/T1**: Implement keyboard navigation (ArrowUp/Down/Enter/Escape) with highlighted index tracking, matching the pattern in BaseCombobox.
2. **A4**: Add `id={${inputId}-listbox}` to the listbox `<div>`.
3. **L2**: Clear the search query when the popover closes (in the `onOpenChange` callback).
4. **P4**: Fix duplicate divider keys.
