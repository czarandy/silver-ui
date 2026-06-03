# AvatarGroup Audit

## Summary

AvatarGroup renders a horizontally stacked row of Avatar components with consistent sizing and negative-margin overlap. It uses context to enforce a shared size on child Avatars and provides an `AvatarGroupOverflow` indicator for truncated lists. The overflow can render as a static indicator or an interactive button.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **`rootStyle` object is recreated on every render.** In `AvatarGroup.tsx` (line 67-70), the `rootStyle` object containing the CSS custom property `--avatar-group-overlap` is recreated on every render. Since it is spread with `...style`, it cannot be trivially memoized, but when `style` is `undefined` (the common case), a `useMemo` could avoid unnecessary object allocation and style recalculation.
- **No `max` / `limit` prop for automatic truncation.** Consumers must manually slice their avatar list and compute the overflow count. A `max` prop that auto-slices children and renders the overflow indicator would reduce boilerplate and prevent off-by-one errors.
- **`AvatarGroupOverflow` ref type cast.** On line 112 of `AvatarGroupOverflow.tsx`, `ref={ref as Ref<HTMLButtonElement>}` uses a type assertion to narrow the `Ref<HTMLElement>` to `Ref<HTMLButtonElement>`. This is type-safe at runtime but bypasses the type system. A discriminated union or overloaded component signature would be cleaner.

### Low

- **`AvatarGroupOverflow` uses `role="img"` for the static indicator.** This is reasonable for a "+3" badge, but `role="status"` might be more semantically appropriate since it conveys a count of additional items.
- **No story for an empty group.** What happens if `AvatarGroup` has zero children? The component renders an empty group div, which is harmless but could be documented.
- **Test for `AvatarGroupOverflow` outside of `AvatarGroup` context.** The test `supports custom overflow content` (line 73) renders `AvatarGroupOverflow` without wrapping it in `AvatarGroup`. This works because the component falls back to `DEFAULT_SIZE`, but it means the test doesn't validate the context integration path for custom content.
- **Overlap ratio is hardcoded.** The `OVERLAP_RATIO = 0.25` is not configurable. For very large or very small avatars, consumers might want tighter or looser stacking.

## Recommendations

1. Consider adding a `max` prop for automatic child truncation and overflow count calculation.
2. Memoize `rootStyle` when `style` is undefined to avoid unnecessary re-renders.
3. Consider using `role="status"` instead of `role="img"` on the static overflow indicator.
4. Add a test that validates `AvatarGroupOverflow` custom content within an `AvatarGroup` context.
