# MultiSelect Component Audit

**Files reviewed:**

- `src/components/MultiSelect/MultiSelect.tsx`
- `src/components/MultiSelect/MultiSelect.stories.tsx`
- `src/components/MultiSelect/MultiSelect.test.tsx`
- `src/components/MultiSelect/index.ts`

---

## Performance

### P1. `enabledOptions` and `selectedOptions` are recomputed every render (MultiSelect.tsx, lines 393-398)

`selectableOptions` is correctly memoized, but the two derived arrays `enabledOptions` (line 393) and `selectedOptions` (line 396) are computed with `.filter()` on every render without `useMemo`. When the options list is large and the component re-renders frequently (e.g., during search typing), these allocations add up. By contrast, `filteredValues` on line 399 is properly memoized.

**Recommendation:** Wrap both in `useMemo` keyed on `[selectableOptions, selectedValues]`.

### P2. `allSelected` is recomputed every render (MultiSelect.tsx, lines 412-414)

The `allSelected` derivation iterates `enabledOptions` on every render. Since it depends on `enabledOptions` and `selectedValues`, it should also be memoized or derived inside the same `useMemo` as `enabledOptions`.

### P3. `normalizeOption` is called redundantly (MultiSelect.tsx, line 487)

Inside `renderOption` (line 487), `normalizeOption(option)` is called even though the caller at lines 527 and 551 already calls `normalizeOption` before passing the option. This means every string/object option is normalized twice. The `renderOption` function should accept a `MultiSelectOptionData` that is already normalized, which is the pattern used in the `for` loop at lines 526-553.

### P4. Search filtering creates a new `Set` on every keystroke (MultiSelect.tsx, lines 399-411)

This is correctly memoized via `useMemo`, so it is not a bug, but worth noting that for very large option lists (hundreds+), the `filteredValues` set is rebuilt on every character typed. For most use cases this is fine. If large option counts become common, consider debouncing the query.

---

## Accessibility

### A1. No keyboard navigation within the listbox (MultiSelect.tsx, lines 555-591)

The dropdown options use `<button>` elements with `role="option"` inside a `role="listbox"`, but there is no arrow-key navigation implemented. According to the WAI-ARIA Listbox pattern, users should be able to press Up/Down arrows to move between options, Home/End to jump to first/last, and type-ahead to filter. Currently, users must Tab through each option individually, which is cumbersome for long lists.

The sibling `Select` component has the same gap, so this may be a known library-wide pattern, but it is the most significant accessibility concern.

**Recommendation:** Implement `onKeyDown` on the listbox container to handle arrow keys, Home, End, and optionally type-ahead selection.

### A2. Options use `<button>` elements but have `role="option"` (MultiSelect.tsx, lines 493-521)

Using `<button>` with `role="option"` is a role conflict. The implicit role of `<button>` is `button`, and overriding it to `option` can confuse assistive technology. The WAI-ARIA Listbox pattern recommends using `<div>` or `<li>` elements with `role="option"` and `tabindex` for focusability.

**Recommendation:** Switch option elements from `<button>` to `<div role="option" tabindex="0">` (or `-1` if managed via `aria-activedescendant`).

### A3. `<input type="search">` is placed inside `role="listbox"` (MultiSelect.tsx, lines 562-569)

The search input is a child of the `role="listbox"` container (lines 555-591). ARIA requires that all children of a `listbox` have the role `option`, `group`, or `presentation`. An `<input>` element violates this constraint and may cause screen readers to ignore the search field or produce unexpected announcements.

**Recommendation:** Move the search input outside and above the `role="listbox"` container, or wrap the entire dropdown in a composite widget.

### A4. Select-all button is inside the listbox but lacks a distinguishing role (MultiSelect.tsx, lines 571-588)

The "Select all" option is rendered identically to regular options, with `role="option"`. This makes it indistinguishable from a data option for screen reader users. Consider labeling it differently or placing it outside the `listbox`.

### A5. The `aria-controls` ID does not match any element (MultiSelect.tsx, line 607)

The combobox trigger sets `aria-controls={`${inputId}-listbox`}` but the listbox `<div>` at line 555 has no `id` attribute. The `aria-controls` reference points to a nonexistent element, which means the programmatic relationship between trigger and listbox is broken.

**Recommendation:** Add `id={`${inputId}-listbox`}` to the listbox `<div>` on line 555.

### A6. Divider key collision (MultiSelect.tsx, line 531)

All dividers share the same hardcoded `key="divider"`. If the options list contains multiple dividers, React will emit a key warning and may incorrectly reconcile DOM nodes.

**Recommendation:** Generate unique keys for dividers, e.g., using the loop index.

---

## Logic Bugs

### L1. Divider key collision causes React warning (MultiSelect.tsx, line 531)

As noted in A6, all dividers use `key="divider"`. If a consumer provides two `{type: 'divider'}` entries, React will log a duplicate key warning. This is both a correctness issue (reconciliation may be wrong) and a console noise issue.

### L2. Search query is not cleared when popover closes (MultiSelect.tsx, lines 387, 654-656)

When the user types a search query and then closes the popover, the `query` state persists. Reopening the dropdown shows the stale filter, which can be confusing. The sibling `Select` component has the same issue, but the `Select` at least clears the query on option selection (Select.tsx, line 365). MultiSelect never clears it because selecting an option does not close the dropdown.

**Recommendation:** Reset `query` to `''` when `isOpen` transitions to `false`, e.g., via a `useEffect` watching `isOpen` or by intercepting `onOpenChange`.

### L3. `toggleAll` does not respect search filter (MultiSelect.tsx, lines 431-447)

When `hasSearch` and `hasSelectAll` are both enabled, "Select all" toggles ALL enabled options regardless of the current search filter. A user who searches for "admin" and clicks "Select all" would expect only the visible "admin" options to be selected, but all options (including hidden ones) are toggled.

**Recommendation:** Intersect `enabledOptions` with `filteredValues` in `toggleAll` so it only affects visible options.

### L4. `changeAction` errors are silently swallowed (MultiSelect.tsx, line 418)

The `void changeAction?.(nextValue)` expression discards the promise without a `.catch()`. If the async action throws, the rejection is unhandled and will surface as an unhandled promise rejection warning.

**Recommendation:** Either add `.catch()` handling or document that the consumer is responsible for error handling within `changeAction`.

---

## Unclear API

### U1. `changeAction` purpose is ambiguous (MultiSelect.tsx, lines 58-61)

The prop name `changeAction` and its JSDoc ("Async action called after `onChange`") do not clearly convey when or why to use it versus `onChange`. It appears to be a "fire-and-forget" side-effect hook, but consumers may wonder: Should they use it for saving to a server? Does it affect loading state? Does the component handle errors? The Select component does not have an equivalent prop, making this inconsistent.

**Recommendation:** Improve the JSDoc to clarify the use case, or consider removing it in favor of letting consumers handle async effects in their `onChange` handler.

### U2. `maxBadges` only applies to `triggerDisplay="badges"` (MultiSelect.tsx, lines 133-136, 464-465)

The `maxBadges` prop is accepted regardless of the `triggerDisplay` value but is silently ignored when `triggerDisplay` is `'count'` or `'labels'`. This is not documented and could confuse consumers.

**Recommendation:** Add a JSDoc note that `maxBadges` only takes effect when `triggerDisplay` is `'badges'`.

### U3. No `onOpenChange` callback (MultiSelect.tsx)

Unlike `Popover` which exposes `onOpenChange`, the `MultiSelect` does not expose a way for consumers to react to the dropdown opening/closing. This limits controlled usage scenarios (e.g., fetching options on open).

---

## Missing Tests

### T1. No test for `hasSearch` / search filtering (MultiSelect.test.tsx)

There is no test verifying that the search input filters the visible options. This is a critical interaction that should be covered.

### T2. No test for `hasSelectAll` (MultiSelect.test.tsx)

The select-all toggle is untested. Tests should verify: (a) clicking "Select all" selects all enabled options, (b) clicking it again deselects them, (c) disabled options are not affected.

### T3. No test for disabled options (MultiSelect.test.tsx)

The `disabled` property on `MultiSelectOptionData` is untested. A test should verify that clicking a disabled option does not trigger `onChange`.

### T4. No test for `triggerDisplay` modes (MultiSelect.test.tsx)

The three trigger display modes (`'count'`, `'labels'`, `'badges'`) are untested. Tests should verify the rendered trigger text for each mode.

### T5. No test for sections and dividers (MultiSelect.test.tsx)

Structured options (`MultiSelectSection` and `MultiSelectDivider`) are untested. Tests should verify that section headings render and that options within sections are selectable.

### T6. No test for `changeAction` (MultiSelect.test.tsx)

The async `changeAction` callback is untested. Tests should verify it is called after `onChange` and that promise rejection does not break the component.

### T7. No test for `isLoading` state (MultiSelect.test.tsx)

The loading state (which renders a `Spinner` and disables the trigger) is untested.

### T8. No test for `isDisabled` state (MultiSelect.test.tsx)

No test verifies that the trigger button is disabled and the clear button is hidden when `isDisabled` is true.

### T9. No test for deselecting an option (MultiSelect.test.tsx)

The existing toggle test (line 22) only tests selecting a new option. There is no test for deselecting an already-selected option.

### T10. No test for `children` custom render (MultiSelect.test.tsx)

The custom render function prop is untested. The sibling `Select` component tests this (Select.test.tsx, line 59).

### T11. No test for ref forwarding (MultiSelect.test.tsx)

The `ref` prop is accepted but not tested.

---

## Missing Stories

### S1. No story for `triggerDisplay="labels"` (MultiSelect.stories.tsx)

The `'labels'` trigger display mode has no story. Stories exist for `'badges'` and the default `'count'`, but the comma-separated label display is not demonstrated.

### S2. No story for disabled options (MultiSelect.stories.tsx)

There is no story showing options with `disabled: true`, which is a supported feature.

### S3. No story for sections and dividers (MultiSelect.stories.tsx)

Structured options using `MultiSelectSection` and `MultiSelectDivider` types have no stories. These are part of the public API (`index.ts` exports the types) but are never visually demonstrated.

### S4. No story for `isDisabled` state (MultiSelect.stories.tsx)

No story shows the disabled state of the entire component.

### S5. No story for `isLoading` state (MultiSelect.stories.tsx)

No story shows the loading spinner and disabled trigger.

### S6. No story for `status` validation (MultiSelect.stories.tsx)

No story demonstrates error/warning/success status states with status messages below the field.

### S7. No story for `children` custom option rendering (MultiSelect.stories.tsx)

The Select component has a `CustomOptions` story (Select.stories.tsx, line 37) but MultiSelect has no equivalent, despite supporting the same `children` render prop.

### S8. No story for `description` or `labelTooltip` (MultiSelect.stories.tsx)

These Field-level props are accepted but never demonstrated.

### S9. No story for `maxBadges` overflow (MultiSelect.stories.tsx)

The `Badges` story only shows 2 selected items with the default `maxBadges=3`, so the overflow "+N" behavior is never visible. The story should select more items than `maxBadges` to demonstrate truncation.

---

## Additional Notes

### N1. No `.recipe.ts` file

The project memory notes that components should follow the "Button pattern: recipe in `.recipe.ts` using `cva`." The MultiSelect uses inline `css()` calls at module scope instead of a recipe file. The sibling `Select` component also lacks a recipe file, so this appears to be an accepted pattern for complex interactive components. Worth noting for consistency.

### N2. Significant code duplication with Select component

MultiSelect and Select share nearly identical code for: styles, `normalizeOption`, `getSelectableOptions`, option rendering, divider/section rendering, search filtering, and trigger/field wiring. A shared utility module or base component could reduce the ~200 lines of duplicated code and ensure both components stay in sync when bugs are fixed (e.g., the search-query-not-cleared issue exists in both).

---

## Summary

| Priority | Category        | Issue                                                         |
| -------- | --------------- | ------------------------------------------------------------- |
| High     | Accessibility   | A1: No keyboard navigation in listbox                         |
| High     | Accessibility   | A5: `aria-controls` references nonexistent ID                 |
| High     | Logic Bug       | L3: Select-all ignores search filter                          |
| Medium   | Accessibility   | A2: `<button>` with `role="option"` is a role conflict        |
| Medium   | Accessibility   | A3: `<input>` inside `role="listbox"` violates ARIA           |
| Medium   | Logic Bug       | L1/A6: Duplicate divider keys                                 |
| Medium   | Logic Bug       | L2: Search query persists after close                         |
| Medium   | Missing Tests   | T1: No search filter test                                     |
| Medium   | Missing Tests   | T2: No select-all test                                        |
| Medium   | Missing Tests   | T3: No disabled options test                                  |
| Medium   | Missing Tests   | T4: No trigger display mode tests                             |
| Medium   | Missing Stories | S1-S3: Labels mode, disabled options, sections/dividers       |
| Low      | Performance     | P1: `enabledOptions`/`selectedOptions` not memoized           |
| Low      | Performance     | P3: Redundant `normalizeOption` calls                         |
| Low      | Unclear API     | U1: `changeAction` purpose is ambiguous                       |
| Low      | Unclear API     | U2: `maxBadges` silently ignored for non-badge display        |
| Low      | Missing Stories | S6-S9: status, custom render, description, maxBadges overflow |
