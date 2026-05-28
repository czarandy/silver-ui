# Avatar Component Audit

Audited: 2026-05-28
Files reviewed:

- `src/components/Avatar/Avatar.tsx`
- `src/components/Avatar/Avatar.recipe.ts`
- `src/components/Avatar/Avatar.stories.tsx`
- `src/components/Avatar/Avatar.test.tsx`
- `src/components/Avatar/AvatarSizeContext.ts`
- `src/components/Avatar/AvatarStatusDot.tsx`
- `src/components/Avatar/index.ts`

---

## Performance

### Issue 1: `imageError` and `fallbackError` state not reset when `src` or `fallbackSrc` change

**File:** `Avatar.tsx`, lines 168-169
**Severity:** Medium

When `src` changes (e.g., when a different user's avatar is displayed without unmounting the component), the `imageError` state remains `true` from the previous failed image. The component will skip directly to the fallback or initials for the new `src`, even though the new URL may be perfectly valid. The same problem applies to `fallbackSrc` and `fallbackError`.

**Recommendation:** Reset `imageError` to `false` when `src` changes, and reset `fallbackError` to `false` when `fallbackSrc` changes. This can be done with `useEffect` calls or, more idiomatically in React 19, by deriving the error state from the previous src value using a ref or key pattern:

```tsx
const [imageError, setImageError] = useState(false);
const prevSrc = useRef(src);
if (prevSrc.current !== src) {
  prevSrc.current = src;
  setImageError(false);
}
```

### Issue 2: Inline style objects created every render

**File:** `Avatar.tsx`, lines 187-198
**Severity:** Low

`contentStyle`, `fallbackStyle`, and `statusStyle` are plain objects created on every render. Since `numericSize` is memoized, these could also be memoized. However, the cost is minimal for a single Avatar render. This only becomes relevant if many Avatars are rendered in a virtualized list.

**Recommendation:** No action needed for now. If profiling reveals unnecessary child re-renders caused by new style object references, wrap these in `useMemo`.

---

## Accessibility

### Issue 3: Redundant `alt` on inner `<img>` duplicates the outer `aria-label`

**File:** `Avatar.tsx`, lines 202-215
**Severity:** Low

The root `<div>` has `role="img"` and `aria-label={accessibleName}` (line 203-210), and the inner `<img>` also has `alt={accessibleName}` (line 215). Screen readers may announce the name twice -- once for the `role="img"` container and once for the nested `<img>`.

**Recommendation:** Set `alt=""` on the inner `<img>` elements since the parent `<div role="img">` already carries the accessible name. The image is purely presentational within the labeled container.

### Issue 4: `AvatarStatusDot` with no `label` is invisible to assistive technology

**File:** `AvatarStatusDot.tsx`, lines 111-115
**Severity:** Medium

When `label` is not provided, the status dot renders as a `<div>` with no `role` and no accessible name (line 115: `role={label != null ? 'img' : undefined}`). If a status dot is visually present but has no label, screen reader users will not know it exists. This is either a valid "decorative" case or a potential a11y gap depending on usage.

**Recommendation:** If a visible status dot always conveys meaningful information, make `label` required. If it can be purely decorative, add `aria-hidden="true"` when `label` is omitted so it is explicitly excluded from the accessibility tree.

### Issue 5: Color-only status variants may be insufficient for color-blind users

**File:** `AvatarStatusDot.tsx`, lines 52-60
**Severity:** Low

The `success`, `neutral`, and `error` variants are differentiated only by background color (green, gray, red). Users with color vision deficiency may not be able to distinguish between them. The `icon` prop partially addresses this, but it is optional and only visible at medium+ avatar sizes.

**Recommendation:** Consider documenting that the `icon` prop should be used alongside the variant for color-blind accessibility, or add a subtle shape/pattern distinction (e.g., checkmark for success, dash for neutral, X for error) at larger sizes by default.

---

## Logic Bugs

### Issue 6: `name` of only whitespace renders empty initials div

**File:** `Avatar.tsx`, line 179 and lines 140-154
**Severity:** Low

If `name` is `"   "` (only whitespace), `name != null` is `true` so `showInitials` becomes `true`, but `getInitials("   ")` returns `""` (line 143 returns empty string). This renders an empty `<div className={styles.fallback}>` with no visible content. The component should fall through to the default icon instead.

**Recommendation:** Change the `showInitials` condition to also check that initials are non-empty:

```tsx
const initials = name != null ? getInitials(name) : '';
const showInitials = !showImage && !showFallbackImage && initials !== '';
```

### Issue 7: `AvatarSizeContext` is not exported from the component index

**File:** `index.ts`, lines 1-14
**Severity:** Low

`useAvatarSize` and `AvatarSizeContext` are not exported from the component's `index.ts`. Currently only `AvatarStatusDot` consumes the context internally, but if a consumer wants to build a custom status indicator or size-aware child, they cannot access the avatar's resolved size.

**Recommendation:** Export `useAvatarSize` from `index.ts` as a public API for advanced consumers who need to build custom status overlays or size-responsive content within an Avatar.

---

## Unclear API

### Issue 8: `AvatarSizeContext` uses `createContext` value prop (React 19) without `Provider`

**File:** `AvatarSizeContext.ts`, line 5; `Avatar.tsx`, line 201
**Severity:** Info

The component uses `<AvatarSizeContext value={...}>` directly, which is a React 19 feature. This is fine given `peerDependencies` requires `react >= 19`, but it is worth noting for anyone backporting.

### Issue 9: Numeric sizes are a closed union rather than accepting any number

**File:** `Avatar.tsx`, lines 16-30
**Severity:** Low

`AvatarNumericSize` is a union of 14 specific pixel values. If a consumer needs 28px or 56px, they cannot use the typed API and must cast. The component itself does not enforce these values -- any number would work at runtime since the size is used as inline CSS.

**Recommendation:** Consider whether the strict union is intentional (for design-system consistency) or unnecessarily restrictive. If strict, document the reasoning. If flexible sizes are acceptable, widen the type to `number`.

---

## Missing Tests

### Issue 10: No test for `src` changing after an error (stale error state)

**File:** `Avatar.test.tsx`
**Severity:** Medium

There is no test that verifies the component correctly shows a new image when `src` is updated after a previous image failed. This is the scenario described in Issue 1 and is a real bug.

### Issue 11: No test for whitespace-only `name`

**File:** `Avatar.test.tsx`
**Severity:** Low

No test verifies what happens when `name` is `"   "` (whitespace only). Per Issue 6, this currently renders an empty fallback div rather than the default icon.

### Issue 12: No test for numeric `size` prop

**File:** `Avatar.test.tsx`
**Severity:** Low

All tests use the default `'small'` named size or `'medium'`. There is no test verifying that a numeric size like `64` produces the correct pixel dimensions.

### Issue 13: No test for `AvatarStatusDot` in isolation

**File:** `Avatar.test.tsx`
**Severity:** Low

`AvatarStatusDot` is only tested as a child of `Avatar`. There is no test for its behavior when rendered outside an `Avatar` (e.g., using the default context value of 36px), or for the `neutral`/`error` variants.

### Issue 14: No test for `fallbackSrc` also failing (double error fallback)

**File:** `Avatar.test.tsx`
**Severity:** Low

The test at line 26 verifies the fallback image appears when the primary `src` fails, but does not verify that when the `fallbackSrc` also fails, the component falls through to initials or the default icon.

### Issue 15: No test for `resolveAvatarSize` utility

**File:** `Avatar.test.tsx`
**Severity:** Low

`resolveAvatarSize` is exported as a public API (listed in `index.ts` and the root `src/index.ts`) but has no dedicated unit tests verifying the named-to-numeric mappings.

---

## Missing Stories

### Issue 16: No story for `fallbackSrc`

**File:** `Avatar.stories.tsx`
**Severity:** Medium

There is no story demonstrating the `fallbackSrc` prop. This is an important feature for consumers to understand -- how the component gracefully degrades from a broken primary image to a fallback image to initials to the default icon.

### Issue 17: No story for the default icon fallback (no `name`, no `src`)

**File:** `Avatar.stories.tsx`
**Severity:** Low

There is no story showing the default User icon fallback when neither `name` nor `src` is provided. This is useful for demonstrating the "empty" or "anonymous" state.

### Issue 18: No story for numeric sizes

**File:** `Avatar.stories.tsx`, lines 31-41
**Severity:** Low

The `Sizes` story only demonstrates named sizes (`tiny` through `large`). There is no story demonstrating numeric sizes, which is important since numeric sizes are a key part of the public API (14 different values).

### Issue 19: No story for `AvatarStatusDot` variants

**File:** `Avatar.stories.tsx`, lines 43-65
**Severity:** Low

The `WithStatus` story shows `success` (default) and `error` variants but does not show the `neutral` variant. A comprehensive status story should demonstrate all three variants side by side.

### Issue 20: Storybook `argTypes.size` only lists named sizes

**File:** `Avatar.stories.tsx`, lines 12-15
**Severity:** Low

The `size` argType control lists only the 5 named sizes and omits all 14 numeric sizes. A consumer exploring the Storybook cannot discover or experiment with numeric sizes through the controls panel.

---

## Summary

| Category        | Critical | Medium | Low    | Info  |
| --------------- | -------- | ------ | ------ | ----- |
| Performance     | 0        | 1      | 1      | 0     |
| Accessibility   | 0        | 1      | 2      | 0     |
| Logic Bugs      | 0        | 0      | 2      | 0     |
| Unclear API     | 0        | 0      | 1      | 1     |
| Missing Tests   | 0        | 1      | 4      | 0     |
| Missing Stories | 0        | 1      | 3      | 0     |
| **Total**       | **0**    | **4**  | **13** | **1** |

The highest-priority items are:

1. **Issue 1** (Performance/Bug): Stale `imageError`/`fallbackError` state when `src`/`fallbackSrc` props change.
2. **Issue 4** (Accessibility): Status dot with no `label` is invisible to assistive technology without being explicitly hidden.
3. **Issue 10** (Missing Test): No test coverage for the stale error state bug.
4. **Issue 16** (Missing Story): No story demonstrating the fallback image degradation chain.
