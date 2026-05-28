# Badge Component Audit

**Files reviewed:**

- `src/components/Badge/Badge.tsx`
- `src/components/Badge/Badge.stories.tsx`
- `src/components/Badge/Badge.test.tsx`
- `src/components/Badge/index.ts`

---

## Performance

No issues found. The component is a simple, stateless function component with no hooks, no derived state, and no expensive computation. The `styles` object is defined at module scope (lines 53-88 of `Badge.tsx`) so CSS class names are computed once and reused. Wrapping this component in `React.memo` is unnecessary given it has no children tree to protect and renders a single `<span>`.

---

## Accessibility

### A1. Decorative icon is not marked `aria-hidden` (Badge.tsx, line 108)

The `icon` prop is rendered directly into the `<span>` without `aria-hidden="true"`. When an SVG icon is used alongside a text `label`, the icon is purely decorative and should be hidden from assistive technology. For comparison, the `Button` component in this codebase wraps its icon in `<span aria-hidden="true">` (Button.tsx, line 267).

**Recommendation:** Wrap the icon in `<span aria-hidden="true">`.

### A2. No semantic role for status-conveying variants (Badge.tsx, lines 93-111)

When a Badge uses the `success`, `warning`, or `error` variant, it communicates status visually but not programmatically. There is no `role` attribute (e.g., `role="status"`) and no ARIA live region. Other components in this codebase use `role="status"` for similar patterns (e.g., `Spinner.tsx`, `EmptyState.tsx`).

**Recommendation:** This is a minor concern since badges are typically static labels rather than dynamic status updates. However, consider documenting that consumers should add `role="status"` and `aria-live="polite"` when a badge is dynamically injected to convey a state change.

### A3. Color contrast may be insufficient for some light-background variants

Several color variants use `*.100` backgrounds with `*.800` text (lines 78-86). For example, `yellow: css({bg: 'yellow.100', color: 'yellow.800'})`. Depending on the exact token values, yellow-on-yellow and cyan-on-cyan pairings can fall below the WCAG 4.5:1 contrast ratio for small text.

**Recommendation:** Verify contrast ratios for all variant pairings against the resolved design tokens, especially `yellow`, `cyan`, and `orange`.

---

## Logic Bugs

No logic bugs found. The component correctly defaults `variant` to `'neutral'` (line 100), the `styles.variant` lookup is type-safe via `satisfies Record<BadgeVariant, string>` (line 87), and the `cx` utility correctly filters falsy class values.

---

## Unclear API

### U1. `label` accepts `ReactNode` but the name implies text-only (Badge.tsx, line 37)

The prop is typed as `ReactNode`, which allows arbitrary JSX, but the JSDoc says "Badge text or count." The prop name `label` also suggests a string. If the intent is truly text-only, the type should be `string | number`. If rich content is intentional, the JSDoc should reflect that.

### U2. No `size` prop

The badge has a fixed height of `h: '5'` (line 59) and a fixed font size of `fontSize: 'sm'` (line 63). Most badge implementations in design systems offer at least two sizes (e.g., `sm` and `md`). If this is intentional, it is fine, but worth noting.

---

## Missing Tests

### T1. No test for `variant` prop (Badge.test.tsx)

There is no test verifying that the `variant` prop results in the correct CSS class being applied. At minimum, test that a non-default variant like `variant="error"` applies the expected class.

### T2. No test for ref forwarding (Badge.test.tsx)

The component accepts a `ref` prop (Badge.tsx, line 38) but no test verifies that the ref is correctly attached to the outer `<span>`.

### T3. No test for default variant (Badge.test.tsx)

There is no test confirming that omitting `variant` results in the `neutral` variant being applied.

### T4. Icon rendering is not meaningfully tested (Badge.test.tsx, lines 7-11)

The test on line 8 renders `<Badge icon={<Check />} label="Active" />` but only asserts that the label text is present. It does not verify that the icon is actually rendered in the DOM. A query for the SVG element (e.g., via `querySelector('svg')` on the container) would make this test meaningful for the `icon` prop.

### T5. No test for `displayName` (Badge.tsx, line 114)

`Badge.displayName` is set to `'Badge'` but is not tested. This is minor but worth noting for components where `displayName` is used for runtime lookups.

---

## Missing Stories

### S1. Variants story omits 6 of 14 variants (Badge.stories.tsx, lines 6-15)

The `variants` array used in the `Variants` story includes only 8 of the 14 available variants:

**Included:** `neutral`, `info`, `success`, `warning`, `error`, `blue`, `purple`, `teal`

**Missing:** `cyan`, `green`, `orange`, `pink`, `red`, `yellow`

All variants should be shown so designers and developers can visually verify each color pairing.

### S2. No story for numeric label / count use case

The JSDoc for `label` says "Badge text or count" but there is no story demonstrating a numeric count (e.g., `label={42}`). This is a common badge pattern (e.g., notification counts).

### S3. No story for `className` or `style` customization

While these are tested, there is no story demonstrating how consumers can customize badge appearance via `className` or `style`. This is a low-priority gap.

### S4. No story for long text / overflow behavior

Given `whiteSpace: 'nowrap'` (line 66), it would be useful to have a story showing how the badge handles a long label to confirm it does not cause layout issues.

---

## Summary

The Badge component is clean and well-structured. The main findings are:

| Priority | Category        | Issue                                                |
| -------- | --------------- | ---------------------------------------------------- |
| Medium   | Accessibility   | A1: Icon not marked `aria-hidden`                    |
| Low      | Accessibility   | A3: Verify color contrast for light variants         |
| Medium   | Missing Tests   | T1: No variant test                                  |
| Medium   | Missing Tests   | T2: No ref forwarding test                           |
| Low      | Missing Tests   | T4: Icon rendering assertion is a no-op for the icon |
| Medium   | Missing Stories | S1: 6 variants missing from Variants story           |
| Low      | Missing Stories | S2: No numeric count story                           |
