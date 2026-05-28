# EmptyState Component Audit

**Files reviewed:**

- `/Users/agoder/silver-ui/src/components/EmptyState/EmptyState.tsx` (148 lines)
- `/Users/agoder/silver-ui/src/components/EmptyState/EmptyState.stories.tsx` (26 lines)
- `/Users/agoder/silver-ui/src/components/EmptyState/EmptyState.test.tsx` (37 lines)
- `/Users/agoder/silver-ui/src/components/EmptyState/index.ts` (1 line)

---

## Performance

**No significant issues found.**

- The component is a pure presentational function with no hooks, effects, or derived state. Rendering cost is minimal.
- Styles are defined at module scope using `css()` calls (lines 51-93), which means Panda CSS processes them once at build time rather than per-render. This is correct.
- The conditional `cx()` call on every render (line 112) is trivial and not a concern.
- **Minor observation:** The component is not wrapped in `React.memo`. For a simple presentational component this is fine -- memoizing would add overhead for a component that is rarely re-rendered in a hot loop. No action needed.

---

## Accessibility

### Issue 1 (Medium): `role="status"` implies a live region, which may cause unexpected announcements

**File:** `EmptyState.tsx`, line 119

The root `<div>` uses `role="status"`, which per WAI-ARIA carries an implicit `aria-live="polite"`. This means any time the EmptyState component appears or its content changes, assistive technologies will announce the entire contents to the user. This is appropriate for dynamic status messages (e.g., spinners, toast notifications) but not necessarily for a static placeholder that is present on initial page load.

- If the EmptyState is rendered once on mount (the typical case), screen readers will announce the title and description as part of the normal document flow via the heading anyway, so `role="status"` adds a redundant announcement.
- If the EmptyState is conditionally rendered (e.g., replacing a list when items are deleted), the live-region announcement is useful.

**Recommendation:** Consider switching to `role="region"` with an `aria-label` (or `aria-labelledby` pointing at the heading), or make the role configurable via a prop. Alternatively, if `role="status"` is intentional, document clearly that this component is designed for dynamic empty states, not static page-level placeholders.

### Issue 2 (Low): No `aria-label` or `aria-labelledby` on the root

**File:** `EmptyState.tsx`, lines 111-120

The root element has no `aria-label` or `aria-labelledby`. While the heading inside provides context, pairing `role="status"` (or `role="region"`) with an explicit accessible name is best practice so screen readers can identify the landmark.

### Issue 3 (Low): Icon container correctly uses `aria-hidden="true"`

**File:** `EmptyState.tsx`, line 122

This is correctly implemented -- the decorative icon is hidden from assistive technologies. No action needed.

---

## Logic Bugs

**No logic bugs found.**

- Null checks for `icon`, `description`, and `actions` (lines 121, 128, 134) use `!= null`, which correctly handles both `null` and `undefined`.
- Default values for `headingLevel` (3) and `isCompact` (false) are reasonable.
- The `displayName` is set (line 147), which helps with React DevTools debugging.

---

## API Clarity

### Issue 1 (Low): `description` is limited to `string`, preventing rich text

**File:** `EmptyState.tsx`, line 22

The `description` prop is typed as `string`. Other component libraries (e.g., Chakra, Mantine) often allow `ReactNode` for the description to support inline links, bold text, or other rich content. If this is an intentional constraint for consistency, it should be documented. Otherwise, consider widening to `ReactNode`.

### Issue 2 (Low): No `size` or `orientation` prop

The component has `isCompact` as a boolean toggle (line 36), which provides two sizes. If more granularity is needed in the future, a `size` enum (e.g., `'sm' | 'md' | 'lg'`) would be more extensible than adding more booleans. For now, `isCompact` is adequate.

### Issue 3 (Info): API is otherwise clean and well-documented

All props have JSDoc descriptions with `@default` annotations where applicable. The prop naming is consistent with the rest of the codebase (e.g., `className`, `data-testid`, `style`, `ref`). The component correctly uses the `Heading` sub-component from `Text` to render semantically correct headings.

---

## Missing Tests

### Issue 1 (Medium): No test for `isCompact` mode

**File:** `EmptyState.test.tsx`

There is no test verifying that the `isCompact` prop applies the compact CSS class. This is a user-facing behavioral difference (tighter spacing, column-stacked actions) that should be validated.

**Suggested test:**

```tsx
it('applies compact styles when isCompact is true', () => {
  render(<EmptyState data-testid="empty" isCompact title="Nothing here" />);
  // Verify that the compact class is applied to the root element
  expect(screen.getByTestId('empty')).toHaveClass(/* compact class token */);
});
```

### Issue 2 (Medium): No test for `headingLevel` prop

**File:** `EmptyState.test.tsx`

There is no test verifying that the `headingLevel` prop controls the rendered heading element (e.g., `<h2>` vs. `<h3>`). The default is `3`, but no test confirms the default or a custom value.

**Suggested test:**

```tsx
it('renders the heading at the specified level', () => {
  render(<EmptyState headingLevel={2} title="Empty" />);
  expect(
    screen.getByRole('heading', {level: 2, name: 'Empty'}),
  ).toBeInTheDocument();
});
```

### Issue 3 (Low): No test for icon rendering in isolation

**File:** `EmptyState.test.tsx`

The existing test (line 8) renders icon alongside title, description, and actions. There is no test for rendering with only `icon` and `title` (no description, no actions), nor does it verify that the icon container has `aria-hidden="true"`.

### Issue 4 (Low): No test for `style` prop

**File:** `EmptyState.test.tsx`

The `className` prop is tested (line 35) but `style` is not. The Badge test covers `style` (Badge.test.tsx line 24), so this is a gap relative to sibling component tests.

### Issue 5 (Low): No test for `ref` forwarding

**File:** `EmptyState.test.tsx`

The `ref` prop is documented and accepted but not tested. A test should verify that a ref is correctly forwarded to the root `<div>`.

---

## Missing Stories

### Issue 1 (Medium): No story for `description` omitted (title-only state)

**File:** `EmptyState.stories.tsx`

All stories include both `title` and `description` via the default `args` (line 10-11). There is no story showing an EmptyState with only a title and no description, which is a valid and common use case.

### Issue 2 (Medium): No story for `headingLevel` customization

**File:** `EmptyState.stories.tsx`

The `headingLevel` prop (default 3) has no dedicated story demonstrating alternative heading levels. This would be useful for consumers embedding the component at different positions in a page hierarchy.

### Issue 3 (Low): No story for icon-less state

**File:** `EmptyState.stories.tsx`

All stories inherit the `icon` from meta `args` (line 12). There is no story demonstrating an EmptyState without an icon.

### Issue 4 (Low): No story for multiple actions

**File:** `EmptyState.stories.tsx`

The `WithAction` story (line 21) shows a single button. There is no story demonstrating multiple action buttons, which is a supported use case given the flex-wrap styling on the actions container (line 87).

### Issue 5 (Info): Compact + actions combination not demonstrated

**File:** `EmptyState.stories.tsx`

The `Compact` story (line 23) does not include actions. When `isCompact` is true, the actions container switches to `flexDirection: column` (line 91-92), but this behavior is not visually demonstrated.

---

## Summary

| Category        | Critical | Medium | Low    | Info  |
| --------------- | -------- | ------ | ------ | ----- |
| Performance     | 0        | 0      | 0      | 0     |
| Accessibility   | 0        | 1      | 2      | 0     |
| Logic Bugs      | 0        | 0      | 0      | 0     |
| API Clarity     | 0        | 0      | 2      | 1     |
| Missing Tests   | 0        | 2      | 3      | 0     |
| Missing Stories | 0        | 2      | 3      | 1     |
| **Total**       | **0**    | **5**  | **10** | **2** |

The component is well-implemented with clean code, good JSDoc, and no logic bugs. The main gaps are in test and story coverage -- several props (`isCompact`, `headingLevel`, `style`, `ref`) lack tests, and stories could better demonstrate the full API surface. The most substantive concern is whether `role="status"` is the correct ARIA role for all use cases of this component.
