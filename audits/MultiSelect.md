# MultiSelect Audit

## Summary

MultiSelect is a multi-value dropdown selector with checkbox-style options. It supports search filtering, select-all, sections/dividers, disabled options, loading states, multiple trigger display modes (count, labels, badges), and custom option rendering. It uses a Popover for the dropdown and a shared `useListboxNavigation` hook for keyboard navigation.

## Issues

### Critical

- None

### High

- **No recipe file -- all styles inline**: MultiSelect defines all its styles as inline `css()` calls rather than using a `cva` recipe. This is inconsistent with the project pattern (e.g., InputGroup, NumberInput, and others use `.recipe.ts` files). While functional, it means consumers cannot override variant styles through the recipe system and the component cannot benefit from recipe-level theming.
- **Search input is inside the listbox**: The `<input type="search">` element is rendered as a direct child of the `<div role="listbox">`. According to WAI-ARIA, a listbox should only contain elements with `role="option"` (or `role="group"` wrapping options). Placing an `<input>` inside the listbox is an ARIA violation that can confuse assistive technologies. The search input should be a sibling of the listbox, not a child.

### Medium

- **`commitChange` wrapper is unnecessary indirection**: The `commitChange` callback (lines 439-443) simply calls `onChange` with no additional logic. The `useCallback` wrapping provides no value since `onChange` is already stable (or not) from the consumer. This adds indirection without benefit.
- **`onClick` on wrapper div uses eslint-disable for accessibility**: The outer div at line 705-719 has an `onClick` handler with an eslint-disable comment for `click-events-have-key-events` and `no-static-element-interactions`. While the comment explains the rationale, the pattern of having a non-interactive wrapper intercept clicks is a common accessibility concern. The click handler should ideally be consolidated onto the button element only.
- **`toggleValue` performs linear search on every toggle**: At line 448, `selectableOptions.find()` is called to check if an option is disabled. For large option lists this is O(n) per toggle. A Map lookup would be more efficient, though unlikely to matter in practice.
- **Missing story for `isRequired`/`isOptional`**: The stories do not demonstrate the `isRequired` or `isOptional` necessity props, even though the component accepts them through `FieldNecessity`.
- **Missing story for `labelIcon`**: The `labelIcon` prop is accepted but has no story demonstrating it.

### Low

- **No test for `className` and `style` forwarding**: While `ref` forwarding is tested, the `className` and `style` props are not tested.
- **No test for `isDefaultOpen`**: The `isDefaultOpen` prop is accepted but never tested.
- **`SelectOption` imported in stories from sibling component**: Stories import `SelectOption` from `../Select`, creating a dependency on another component's exports for the story file. This is fine for composition but worth noting.
- **Section heading ID sanitization is basic**: The regex `replace(/[^a-zA-Z0-9_-]/g, '-')` at line 634 could produce duplicate IDs if multiple sections have labels that differ only in special characters. Adding the `sectionCount` suffix mitigates this.

## Recommendations

1. Move the search input outside the `role="listbox"` div to fix the ARIA violation. Place it as a sibling above the listbox.
2. Consider extracting styles into a `.recipe.ts` file with `cva` for consistency with other components, even if there are no variant-driven styles.
3. Remove the `commitChange` wrapper or add the intended validation/transformation logic to justify its existence.
4. Add stories for `isRequired`, `isOptional`, `labelIcon`, and `isDefaultOpen` to improve documentation coverage.
5. The component is otherwise well-built with excellent keyboard navigation, proper ARIA attributes on the combobox trigger, disabled option handling, and thorough test coverage of core interactions.
