# Avatar Audit

## Summary

The Avatar component displays a user profile image with initials or a fallback icon. It supports named and numeric sizes, a fallback image chain (`src` -> `fallbackSrc` -> initials/icon), and a `status` slot for `AvatarStatusDot`. Size is propagated via context for use by AvatarGroup and AvatarStatusDot.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **`AvatarImage` renders `<img alt="">` for both primary and fallback images.** The outer `<div role="img" aria-label="...">` provides the accessible name, and the inner `<img>` uses `alt=""` to hide it from the accessibility tree. This is technically correct (the image is decorative within the labeled container), but screen readers navigating by images may announce the outer div and skip the actual image. The pattern is acceptable but worth documenting as intentional.
- **No loading/skeleton state.** When `src` is provided, there is no visual feedback while the image loads. The fallback (initials or icon) is not shown during loading -- instead nothing visible appears until the image loads or errors. This can cause a flash of empty content on slow networks. Consider showing the fallback underneath the image until it loads.
- **`useMemo` for `resolveAvatarSize` is unnecessary.** On line 166-169 of `Avatar.tsx`, `resolveAvatarSize` is a pure synchronous function with no expensive computation (just a switch statement). Wrapping it in `useMemo` adds overhead without benefit. A direct call would be simpler and faster.

### Low

- **`CIRCLE_EDGE_OFFSET_RATIO` is module-level math.** `(1 - 1 / Math.SQRT2) / 2` is a constant for positioning the status dot at the circle's edge. A comment explaining the geometry would help maintainability.
- **Missing story for the no-name, no-src fallback icon case.** The test covers this (`renders a default icon when no image or name is provided`), but there is no corresponding story showing the generic user icon fallback.
- **Missing story for whitespace-only name.** The test covers `name="   "` falling back to the icon, but no story demonstrates this edge case.
- **`AvatarStatusDot` icon is hidden below size 36px.** The `resolveStatusDotSize` function returns `iconSize: 0` for avatars <= 36px. If a consumer passes an icon to `AvatarStatusDot` on a small avatar, it silently disappears. This could be confusing -- a dev-mode warning or documentation note would help.

## Recommendations

1. Consider showing the initials/icon fallback while the image is loading, then crossfading to the image once loaded.
2. Remove the `useMemo` wrapper around `resolveAvatarSize` since it's a trivial computation.
3. Add a story for the icon-only fallback (no name, no src).
4. Add a comment explaining the `CIRCLE_EDGE_OFFSET_RATIO` geometry.

## SVA Conversion

**Benefit: Moderate**

`Avatar.tsx` renders 4+ styled elements (root, content circle, image, fallback initials/icon, status corner) using a single-element root `cva` (`avatarRecipe`, only an `isGrouped` boolean variant) PLUS a standalone `const styles` object with 4 css() blocks (content, image, fallback, status). Because Avatar's many sizes are driven by computed numeric pixel values via inline `style` (not Panda size tokens), most per-element sizing cannot move into recipe variants, which limits the benefit. Still, an `sva` recipe with slots root/content/image/fallback/status would consolidate the static structural styling and the `isGrouped` variant into one place; `AvatarStatusDot.tsx` and `AvatarGroupOverflow` similarly mix a styles object with `variantClassName` lookups but rely heavily on inline numeric sizing.
