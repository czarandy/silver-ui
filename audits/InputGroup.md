# InputGroup Audit

## Summary

InputGroup groups multiple inputs into a single visually connected row. It consists of three files: `InputGroup.tsx` (the main container), `InputGroupText.tsx` (a static addon slot for prefixes/suffixes), and `InputGroupContext.ts` (React context for propagating group state to children). It uses a `cva` recipe for styling and delegates label/status rendering to the shared `Field` component.

## Issues

### Critical

- None

### High

- None

### Medium

- **`description` not present in the Field component when `isLabelHidden` is true**: When the label is hidden and a `description` is set simultaneously, the description text is still associated via `aria-describedby` on the group wrapper, but users may not realize the description renders in the hidden-label configuration. This is a minor API clarity concern; adding a note in JSDoc about this interaction would help.
- **Missing recipe file for InputGroupText**: `InputGroupText` relies entirely on `data-silver-input-group-text` attribute selectors defined in the parent recipe rather than having its own styles. This tight coupling via attribute-based selectors works but is fragile -- renaming the attribute in one file without updating the other would silently break all addon styling. Consider co-locating a comment noting this dependency.
- **`cx()` called with single argument in InputGroupText**: At line 22 of `InputGroupText.tsx`, `cx(className)` is called with only the user-provided `className`. There is no base class being merged, so `cx` is essentially a no-op passthrough. This is not a bug, but it obscures the fact that InputGroupText has no library-owned CSS class -- all its styling comes from parent selectors.

### Low

- **No story for `data-testid` or `description`**: While `WithStatus` shows `description`, there is no standalone `WithDescription` story to document that prop in isolation. The `data-testid` prop is tested but not demonstrated in stories.
- **Test for size propagation is weak**: The `propagates size to child TextInput via context` test (line 162-178) only asserts that `inputWrapper` is not null, which is a very weak assertion. It does not actually verify that the child received the `lg` size from context rather than its own `sm` prop.
- **`InputGroupText` has no tests**: The `InputGroupText` sub-component has no dedicated test file. It is exercised indirectly through `InputGroup.test.tsx`, but its `className`, `style`, `ref`, and `data-testid` forwarding are never tested.
- **No `description` field in `InputGroupContext`**: The context propagates `isDisabled`, `label`, `size`, and `statusType` but does not include `description`. This is likely fine since child inputs do not need the group description, but it is worth noting for consistency.

## Recommendations

1. Strengthen the size propagation test to verify the child input actually renders at `lg` size (e.g., by checking a class or computed style) rather than just asserting the wrapper exists.
2. Add a basic test file or test section for `InputGroupText` covering ref/className/style/data-testid forwarding.
3. Add a comment in `InputGroupText.tsx` noting that its styles are applied via parent attribute selectors in `InputGroup.recipe.ts`.
4. Overall the component is well-structured with good accessibility (proper `role="group"`, `aria-labelledby`, `aria-describedby`, `aria-disabled`), clean context usage, and thorough JSDoc.

## SVA Conversion

**Benefit: Low / None**

`InputGroup` already styles its multiple "elements" through a single `cva` (`InputGroup.recipe.ts`) that targets the addon and control children via attribute/child selectors (`& > [data-silver-input-group-text]`, `& > :not(...)`) with `isDisabled`/`size`/`status` variants. The wrapper renders one styled `div`; child inputs and `InputGroupText` (which carries no styles of its own, only a `data-silver-input-group-text` marker) are styled by the parent recipe's descendant selectors rather than by separate slot classes. Because the children are arbitrary consumer-provided inputs (not fixed slots the component renders), `sva` cannot attach slot classes to them and would not improve on the current selector-based approach. The remaining structure (`Field` wrapper) delegates styling to `Field`.
