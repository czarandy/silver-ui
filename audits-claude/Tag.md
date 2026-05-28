# Tag Component Audit

Audited files:

- `src/components/Tag/Tag.tsx`
- `src/components/Tag/Tag.stories.tsx`
- `src/components/Tag/Tag.test.tsx`
- `src/components/Tag/index.ts`

---

## Performance

### No issues found

The component uses static style objects (`as const`) defined at module scope, avoiding re-creation on every render. The `TagContent` helper is a plain function component (no unnecessary memoization overhead for a leaf-level presentational component). No inline object allocations inside render paths that would defeat React's reconciliation. The `cx()` utility is lightweight. Overall, performance is appropriate for a component of this complexity.

---

## Accessibility

### A1. `aria-description` is silently dropped when Tag renders as a Link (Bug)

**File:** `Tag.tsx`, lines 270-276 and 278-296

`sharedProps` includes `'aria-description': description` (line 271). When `href` is provided, sharedProps is spread onto `<Link>` (line 281). However, the `Link` component (`src/components/Link/Link.tsx`) destructures only its declared props and does not accept or forward `aria-description`. The attribute is silently swallowed -- it never reaches the DOM anchor element.

**Impact:** Screen reader users lose the `description` context on link-variant tags.

**Fix:** Either add `aria-description` support to `Link`, or apply it directly to a wrapper/child element that does reach the DOM.

### A2. `aria-label` is set redundantly on the Link branch

**File:** `Tag.tsx`, lines 272 and 285

When `isLabelHidden` is true, `sharedProps` sets `aria-label` (line 272), and the `<Link>` also receives `label={isLabelHidden ? label : undefined}` (line 285), which the Link component maps to its own `aria-label`. This results in two competing `aria-label` sources. Only one will win (the `Link`'s explicit `label` prop takes precedence in the Link implementation), but the intent is unclear and the duplicate is confusing.

**Fix:** Remove the `aria-label` from `sharedProps` for the link branch, or remove the `label` prop on `<Link>` and rely solely on `sharedProps`.

### A3. No `role` attribute on the onClick+onRemove span variant

**File:** `Tag.tsx`, lines 318-344

When both `onClick` and `onRemove` are provided, the root element is a `<span>` (line 320) containing two `<button>` elements. The outer `<span>` receives the interactive class (line 263) which adds `cursor: pointer` and hover styles, but the span itself is not interactive -- the buttons inside are. This is fine structurally, but the `<span>` has no semantic role. Screen readers will announce it as a generic container, which is acceptable, but the visual hover effect on the whole tag (from `styles.interactive` at line 263) may mislead sighted keyboard users into thinking the entire tag is a single click target.

### A4. Disabled link tag remains navigable

**File:** `Tag.tsx`, lines 278-296

When `href` is set and `isDisabled` is true, the tag renders as a `<Link>` with `isDisabled={isDisabled}`. The Link component uses `aria-disabled` and `tabIndex={-1}` for disabled links (rather than the HTML `disabled` attribute, which anchors don't support). However, the Tag also applies `styles.disabled` (line 267) which sets `pointer-events: none`. Combined, this works, but the CSS-only pointer-events approach does not prevent keyboard activation (Enter key on a focused link). The Link component handles this by calling `event.preventDefault()` when disabled (Link.tsx line 119), so this is actually covered -- no bug, just worth noting that the defense is in the Link layer, not Tag.

### A5. Remove button lacks hover/active feedback

**File:** `Tag.tsx`, lines 146-166

The remove button has `_focusVisible` styles but no `_hover` or `_active` styles. This makes it harder for sighted mouse users to confirm they are targeting the remove button vs. the tag body.

---

## Logic Bugs

### L1. onClick+onRemove branch does not use TagContent, duplicating icon/label/remove rendering

**File:** `Tag.tsx`, lines 318-344

When both `onClick` and `onRemove` are provided, the component renders its own inline JSX (lines 321-343) instead of using the `TagContent` helper. This duplication means any future changes to `TagContent` (e.g., adding a badge, changing label markup) must be manually mirrored here.

The inline version also differs subtly from `TagContent`:

- The label in the inline version (line 327) is rendered as a raw text node inside a `<button>`, not wrapped in `<span className={styles.label}>`. This means the label in this branch does **not** get `text-overflow: ellipsis` or `overflow: hidden` truncation.
- The `isLabelHidden` check (line 327) uses `<VisuallyHidden>` directly instead of the `<span className={styles.label}>` wrapper, which is consistent with `TagContent`, but the non-hidden path differs.

### L2. The `onRemove` guard in the onClick+onRemove branch is always true (dead code)

**File:** `Tag.tsx`, line 330

The condition `onRemove != null ?` on line 330 is inside a branch that is only entered when `onClick != null` (line 318) and was **not** entered by the `onClick != null && onRemove == null` branch (line 299). Therefore, `onRemove` is guaranteed to be non-null at this point. The ternary is dead code and can be simplified to always render the remove button.

---

## Unclear API

### U1. `description` prop name is ambiguous

**File:** `Tag.tsx`, line 47

The prop is named `description` but maps to `aria-description`. Users might expect it to render visible description text. Consider renaming to `ariaDescription` or documenting more prominently that this is screen-reader-only.

### U2. `icon` accepts `ReactNode` but relies on SVG-specific CSS targeting

**File:** `Tag.tsx`, lines 59 and 112-116

The `icon` prop is typed as `ReactNode`, but the root style (lines 112-116) targets `& > svg` to set flex-shrink and sizing via CSS custom properties. If a consumer passes a non-SVG icon (e.g., an `<img>` or a wrapped `<Icon>` that renders a `<span>`), the sizing rules won't apply. The type is overly permissive relative to what actually works.

### U3. No `tooltip` prop (unlike Button)

The `Button` component offers a `tooltip` prop. Tag does not, despite being a similarly compact interactive element. This inconsistency may surprise consumers who expect Tag to follow the same pattern.

---

## Missing Tests

The test file has only 3 tests (33 lines) compared to Button's 30+ tests (371 lines). The following behaviors are untested:

### T1. `onClick` handler

No test verifies that clicking a tag with `onClick` (and no `href`) fires the handler or renders the tag as a `<button>`.

### T2. `onClick` + `onRemove` together

No test covers the combined onClick+onRemove branch (lines 318-344), which is the most complex rendering path. This is also the branch with the duplicated rendering logic (see L1).

### T3. `isDisabled` behavior

No test verifies that a disabled tag suppresses click handlers, applies the disabled attribute on buttons, or renders correctly.

### T4. `size` prop

No test verifies that different sizes apply the correct CSS classes.

### T5. `color` prop

No test verifies that color variants apply the correct CSS classes.

### T6. `isLabelHidden` prop

No test verifies that the label is visually hidden but accessible to screen readers.

### T7. `description` prop

No test verifies that `aria-description` is applied to the root element.

### T8. `icon` rendering

No test verifies that an icon is rendered alongside the label.

### T9. `endContent` rendering

No test verifies that endContent appears in the expected position.

### T10. `ref` forwarding

No test verifies that the ref is forwarded to the correct DOM element (span, button, or anchor depending on props).

### T11. `data-testid` and `className` pass-through

No test verifies that custom className and data-testid are applied to the root element.

### T12. `style` pass-through

No test verifies that inline styles are applied.

### T13. Remove button `stopPropagation`

No test verifies that clicking the remove button does not trigger the parent tag's onClick handler.

---

## Missing Stories

The stories file has 4 stories (44 lines). Many important props and states lack visual coverage:

### S1. No `Sizes` story

The `size` prop (`sm`, `md`, `lg`) has no story demonstrating the visual differences.

### S2. No `Disabled` story

The `isDisabled` prop is not demonstrated.

### S3. No `Clickable` story (onClick)

Tags with `onClick` (rendering as buttons) have no story.

### S4. No `ClickableRemovable` story (onClick + onRemove)

The combined interactive+removable state has no story. This is the most complex variant.

### S5. No `LinkTag` story (href)

Tags rendered as links via `href` have no story.

### S6. No `WithEndContent` story

The `endContent` prop is not demonstrated.

### S7. No `HiddenLabel` story (isLabelHidden)

The `isLabelHidden` prop is not demonstrated.

### S8. No `WithDescription` story

The `description` prop (aria-description) is not demonstrated.

### S9. No `argTypes` configuration

Unlike Button's stories, Tag's meta does not define `argTypes` with controls for `color`, `size`, `isDisabled`, etc. This limits the interactive exploration experience in Storybook.

### S10. No `RemovableLink` story

A tag that is both a link and removable (href + onRemove) has no story.

---

## Summary

| Category        | Issues                                       |
| --------------- | -------------------------------------------- |
| Performance     | 0                                            |
| Accessibility   | 5 (1 bug, 1 redundancy, 3 minor)             |
| Logic Bugs      | 2 (1 duplicated rendering path, 1 dead code) |
| Unclear API     | 3                                            |
| Missing Tests   | 13 untested behaviors                        |
| Missing Stories | 10 missing stories                           |

The most impactful issues are:

1. **A1**: `aria-description` silently dropped on link tags (accessibility bug).
2. **L1**: Duplicated rendering logic in the onClick+onRemove branch creates a maintenance hazard and introduces a truncation inconsistency.
3. **T1-T13**: Test coverage is minimal -- only 3 of ~16 meaningful behaviors are tested.
4. **S1-S10**: Story coverage is thin -- only 4 of ~14 meaningful prop combinations are demonstrated.
