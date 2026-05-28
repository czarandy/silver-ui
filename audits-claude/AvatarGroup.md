# AvatarGroup Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/AvatarGroup/AvatarGroup.tsx`
- `src/components/AvatarGroup/AvatarGroupOverflow.tsx`
- `src/components/AvatarGroup/AvatarGroupContext.ts`
- `src/components/AvatarGroup/AvatarGroup.recipe.ts`
- `src/components/AvatarGroup/AvatarGroup.stories.tsx`
- `src/components/AvatarGroup/AvatarGroup.test.tsx`
- `src/components/AvatarGroup/index.ts`
- `src/components/Avatar/Avatar.tsx` (consumer of AvatarGroupContext)
- `src/components/Avatar/Avatar.recipe.ts` (isGrouped variant)

---

## Performance Problems

### 1. No performance concerns with context memoization (None)

**File:** `AvatarGroup.tsx`, lines 56-59

The context value is correctly memoized with `useMemo` keyed on `[numericSize, overlap, size]`. Since `numericSize` and `overlap` are derived from `size`, they are stable across renders when `size` does not change. This prevents unnecessary re-renders of child Avatars and AvatarGroupOverflow.

### 2. Inline style objects created on every render in AvatarGroupOverflow (Low)

**File:** `AvatarGroupOverflow.tsx`, lines 93-99

The `rootStyle` object is created fresh on every render. Since AvatarGroupOverflow is a leaf component that typically renders once and is not re-rendered frequently, this is low-impact. However, if the parent re-renders often, `rootStyle` will always be a new reference, which could cause unnecessary DOM updates. Wrapping it in `useMemo` keyed on `[overlap, numericSize, style]` would prevent this.

### 3. `css()` calls at module scope are efficient (None)

**File:** `AvatarGroupOverflow.tsx`, lines 44-73

The `css()` calls in `styles` are at module scope, so they run once and produce static class names. This is the correct pattern for Panda CSS.

---

## Accessibility Concerns

### 1. Overflow span lacks a semantic role (Medium)

**File:** `AvatarGroupOverflow.tsx`, lines 116-124

When `onClick` is not provided, the overflow indicator renders as a `<span>` with `aria-label="N more"` but no explicit `role`. A bare `<span>` is not a landmark or widget, so the `aria-label` may be ignored by some assistive technologies (per the WAI-ARIA spec, `aria-label` is only reliably announced on elements with an implicit or explicit role). Consider adding `role="img"` or `role="status"` to the non-interactive span so the label is reliably announced.

### 2. Button overflow uses `aria-label` but no `aria-roledescription` (Low)

**File:** `AvatarGroupOverflow.tsx`, lines 102-113

The button renders with `aria-label="N more"`, which is good. However, it is announced as "N more, button" by screen readers. Consider whether `aria-roledescription` would improve clarity (e.g., "overflow indicator") to give users better context about what the button does. This is a polish item, not a blocker.

### 3. Default group label is generic (Low)

**File:** `AvatarGroup.tsx`, line 46

The default `aria-label` is `"Avatars"`, which is appropriately generic. In practice, consumers should provide a descriptive label (e.g., "Project members", "Team"). The stories demonstrate this well (line 10 of stories uses "Project members"). No action needed, but a JSDoc reminder on the prop could encourage specific labels.

### 4. `count={0}` produces "0 more" and "+0" (Low)

**File:** `AvatarGroupOverflow.tsx`, lines 91-92

When `count={0}`, the component renders `aria-label="0 more"` and displays `+0`. While this is technically correct, it is semantically meaningless. The component does not guard against `count <= 0`. Consider either documenting that `count` must be positive, or rendering nothing when `count <= 0`.

---

## Logic Bugs

### 1. Overlap CSS variable set on both Avatar and AvatarGroupOverflow independently (Low)

**File:** `Avatar.tsx`, lines 182-184; `AvatarGroupOverflow.tsx`, lines 93-94

Both `Avatar` and `AvatarGroupOverflow` set `--avatar-group-overlap` as an inline style variable, and both consume it via `&:not(:first-child) { marginInlineStart: var(--avatar-group-overlap) }` in their respective CSS. This works correctly because each element carries its own CSS variable, and the `:not(:first-child)` selector correctly skips the first child. However, the overlap is applied to every child's own style, which is mildly redundant -- the variable is defined on each element but only consumed by that same element. An alternative would be to set the variable once on the parent, but the current approach is functionally correct.

### 2. AvatarGroupOverflow outside AvatarGroup falls back to DEFAULT_SIZE but zero overlap (Low)

**File:** `AvatarGroupOverflow.tsx`, lines 88-90

When used outside an `AvatarGroup`, `group` is `null`, so `numericSize` falls back to `DEFAULT_SIZE` (36) and `overlap` falls back to `0`. This produces a reasonable standalone render. However, the `DEFAULT_SIZE` of 36 in AvatarGroupOverflow does not match the default size of the `AvatarGroup` component (which defaults to `'small'` = 36 via `resolveAvatarSize`), only by coincidence. If the default size mapping for `'small'` ever changes, these would diverge. Consider importing and using `resolveAvatarSize('small')` instead of a hardcoded `36`.

### 3. No validation that children are Avatar or AvatarGroupOverflow (Low)

**File:** `AvatarGroup.tsx`, line 70

`AvatarGroup` accepts `ReactNode` children and renders them without any validation. Non-Avatar children (e.g., plain `<div>` elements) would render inside the group and receive the overlap CSS variable styling, potentially producing broken layouts. This is standard practice in React component libraries (composition over enforcement), so this is informational rather than a bug.

---

## Unclear API

### 1. `AvatarGroupContext` and `useAvatarGroup` are not exported from the public API (Informational)

**File:** `index.ts`, lines 1-9

The `AvatarGroupContext` and `useAvatarGroup` hook are not exported from the package's public API. This is correct -- they are implementation details consumed internally by `Avatar` and `AvatarGroupOverflow`. No action needed.

### 2. `AvatarGroupVariants` is exported but the recipe has no variants (Low)

**File:** `AvatarGroup.recipe.ts`, lines 1-11; `index.ts`, line 9

The `avatarGroupRecipe` uses `cva()` with only a `base` style and no `variants` object. The `AvatarGroupVariants` type is exported but will always be `{}` (an empty object). This adds unnecessary API surface. Consider removing the export unless variants are planned.

### 3. Relationship between AvatarGroup `size` and child Avatar `size` is well-documented (None)

**File:** `AvatarGroup.tsx`, lines 35-37

The JSDoc on `size` clearly states: "Individual Avatar size props are ignored while inside the group so the stack remains visually consistent." The implementation in `Avatar.tsx` (line 171: `const resolvedSize = avatarGroup?.size ?? size`) correctly prioritizes the group size. Good.

### 4. `ref` type on AvatarGroupOverflow is `Ref<HTMLElement>`, could be more specific (Low)

**File:** `AvatarGroupOverflow.tsx`, line 36

The `ref` prop is typed as `Ref<HTMLElement>`. Since the component renders either a `<button>` or a `<span>`, `Ref<HTMLElement>` is the correct union supertype. However, when `onClick` is provided, the ref is cast to `Ref<HTMLButtonElement>` (line 108), which is safe but requires a type assertion. An alternative would be to use a discriminated union type for the props, but the current approach is pragmatic and standard.

---

## Missing Tests

### 1. No test for different `size` values on overflow indicator (Medium)

The test at line 29 verifies that `size="medium"` affects child Avatar sizing (via AvatarStatusDot dimensions), but there is no test verifying that different sizes correctly propagate to `AvatarGroupOverflow`'s rendered dimensions or font size.

### 2. No test for `AvatarGroupOverflow` ref forwarding (Medium)

**File:** `AvatarGroup.test.tsx`

The test at line 78 verifies ref forwarding on `AvatarGroup`, but there is no test for ref forwarding on `AvatarGroupOverflow` (for both the button and span variants).

### 3. No test for `AvatarGroupOverflow` className/style/data-testid pass-through (Medium)

**File:** `AvatarGroup.test.tsx`

The test at line 78 verifies these props on `AvatarGroup` root, but there is no test for `AvatarGroupOverflow` accepting and applying `className`, `style`, or `data-testid`.

### 4. No test for overlap CSS variable (Medium)

**File:** `AvatarGroup.test.tsx`

No test verifies that the `--avatar-group-overlap` CSS variable is correctly set on child elements. This is the core visual mechanism of the component.

### 5. No test for numeric `size` values (Low)

**File:** `AvatarGroup.test.tsx`

All tests use named sizes (`'small'`, `'medium'`). There is no test verifying that numeric size values (e.g., `size={64}`) work correctly through the group context.

### 6. No test for `AvatarGroupOverflow` used outside `AvatarGroup` (Low)

The test at line 72 renders `AvatarGroupOverflow` standalone (outside `AvatarGroup`), which implicitly tests the fallback behavior. However, it does not assert on the rendered dimensions or verify the fallback values. The test only checks text content.

### 7. No test for `count={0}` edge case (Low)

No test verifies behavior when `AvatarGroupOverflow` is given `count={0}` or a negative number.

---

## Missing Stories

### 1. No story demonstrating different sizes (Medium)

**File:** `AvatarGroup.stories.tsx`

The `size` prop is listed in `argTypes` (line 14) so it can be changed via Storybook controls, but all stories render with the default `size='small'`. A dedicated story showing all sizes side-by-side would help visual QA. For example:

```tsx
export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {(['tiny', 'xsmall', 'small', 'medium', 'large'] as const).map(size => (
        <AvatarGroup key={size} size={size} aria-label={`${size} group`}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" />
          <Avatar name="Katherine Johnson" />
        </AvatarGroup>
      ))}
    </div>
  ),
};
```

### 2. No story demonstrating numeric sizes (Low)

No story shows `AvatarGroup` with a numeric `size` prop (e.g., `size={64}`). The `argTypes` only list named sizes.

### 3. No story demonstrating custom overflow content (Medium)

**File:** `AvatarGroup.stories.tsx`

The `AvatarGroupOverflow` component accepts `children` to override the default `+N` text. This is tested (line 72 of tests) but not demonstrated in stories.

### 4. No story demonstrating overflow with `data-testid` or `ref` (Low)

These are standard passthrough props and typically do not need stories. Informational only.

### 5. No story demonstrating AvatarGroup with status dots (Low)

The interaction between `AvatarGroup` and `AvatarStatusDot` is tested (line 29 of tests) but not demonstrated in stories. Since AvatarGroup overrides child Avatar sizes, showing that status dots scale correctly would be useful visual documentation.

---

## Summary

| Category        | Critical | High | Medium | Low |
| --------------- | -------- | ---- | ------ | --- |
| Performance     | 0        | 0    | 0      | 1   |
| Accessibility   | 0        | 0    | 1      | 3   |
| Logic Bugs      | 0        | 0    | 0      | 3   |
| Unclear API     | 0        | 0    | 0      | 2   |
| Missing Tests   | 0        | 0    | 4      | 3   |
| Missing Stories | 0        | 0    | 2      | 2   |

**Top priorities:**

1. **Add `role` to the non-interactive overflow span** (`AvatarGroupOverflow.tsx:116-124`) -- without a role, the `aria-label` may be silently ignored by assistive technology.
2. **Add tests for overlap CSS variable propagation** -- this is the core visual mechanism and has zero test coverage.
3. **Add tests for `AvatarGroupOverflow` ref, className, style, and data-testid pass-through** -- these are tested for `AvatarGroup` but not for the overflow sub-component.
4. **Add a "Sizes" story** showing all size variants side-by-side for visual QA.
5. **Add a "Custom Overflow Content" story** demonstrating the `children` override on `AvatarGroupOverflow`.

**Overall assessment:** The AvatarGroup component is well-structured, cleanly implemented, and follows good patterns (context memoization, proper displayName, clear JSDoc, composition over enforcement). The main gaps are in test coverage for the overflow sub-component and an accessibility concern with the non-interactive overflow indicator's missing role.
