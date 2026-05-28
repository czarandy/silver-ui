# Alert Component Audit

Audited files:

- `src/components/Alert/Alert.tsx`
- `src/components/Alert/Alert.recipe.ts`
- `src/components/Alert/Alert.test.tsx`
- `src/components/Alert/index.ts`

Note: No `Alert.stories.tsx` file exists.

---

## Performance

### P1. `defaultIcons` creates JSX elements at module scope

**File:** `Alert.tsx`, lines 89-94

The `defaultIcons` record is created at module scope, meaning four `<Icon>` JSX elements are allocated when the module is first imported, regardless of which (or whether any) Alert is rendered. These are React elements (plain objects), so they are lightweight and will be reused across renders, which is actually a net positive for reconciliation -- React will see the same element reference every time. However, if the `Icon` component ever becomes expensive to construct (e.g., context-dependent), this pattern would break. This is a minor concern, not a bug.

### P2. No transition on collapsible content -- content is mount/unmount toggled

**File:** `Alert.tsx`, lines 224-232

When `showContent` is false, the collapsible children are completely unmounted (not rendered at all). This means every expand/collapse cycle triggers a full mount/unmount of the child subtree. For simple content this is fine, but if children are complex (e.g., tables, forms), this could be expensive. Compare with `AccordionItem` (AccordionItem.tsx line 110) which uses `hidden` attribute to keep children in the DOM, avoiding remount costs.

This is a design tradeoff, not necessarily a bug, but worth noting that the pattern differs from AccordionItem.

---

## Accessibility

### A1. Collapsible toggle button lacks `aria-expanded` attribute (Bug)

**File:** `Alert.tsx`, lines 191-206

The expand/collapse button toggles `isExpanded` state and updates its label between "Collapse" and "Expand", but it does not set `aria-expanded` on the button element. Screen readers rely on `aria-expanded` to communicate the current disclosure state. Compare with `AccordionItem` (AccordionItem.tsx line 97), which correctly sets `aria-expanded={isOpen}` on its trigger button.

**Impact:** Screen reader users cannot determine whether the collapsible section is currently expanded or collapsed without parsing the button label.

**Fix:** Add `aria-expanded={isExpanded}` to the collapse toggle `<Button>`. If the `Button` component supports it, pass it directly; otherwise, add it via an `aria-expanded` prop or spread. Also consider adding `aria-controls` pointing to the content region's `id`.

### A2. Collapsible content region has no `id` or `aria-controls` linkage

**File:** `Alert.tsx`, lines 191-206 and 224-232

The toggle button and the collapsible content `<div>` are not linked via `aria-controls`/`id`. This means assistive technology cannot programmatically associate the button with the region it controls. The AccordionItem does not do this either, but it is still a best practice per the WAI-ARIA disclosure pattern.

**Fix:** Generate a unique `id` (e.g., via `useId()`) for the content div and set `aria-controls={contentId}` on the toggle button.

### A3. `role="alert"` is always present for error/warning status, even on initial render

**File:** `Alert.tsx`, lines 82-87 and 165

The `role="alert"` attribute (used for `error` and `warning` statuses) implicitly creates a live region equivalent to `aria-live="assertive"`. This means the alert content will be announced by screen readers whenever it appears in the DOM. If the Alert is present in the initial page load (not dynamically injected), this can cause unexpected announcements on page load, as some screen readers will announce static `role="alert"` elements.

This is a known nuance of `role="alert"`. Many component libraries use this approach, so it is an acceptable tradeoff, but worth documenting for consumers.

### A4. Dismissed content is removed from the DOM without notification

**File:** `Alert.tsx`, lines 148, 156-158, and 211-218

When the dismiss button is clicked, the component sets `isDismissed` to `true` and returns `null`, removing the entire alert from the DOM. There is no mechanism (such as an `aria-live` region or focus management) to inform screen reader users that the alert has been dismissed. After dismissal, focus is lost to the document body.

**Impact:** Screen reader users may be disoriented when the alert disappears without any announcement or focus redirection.

**Fix:** Consider moving focus to a logical next element after dismissal, or announcing the dismissal via a live region.

### A5. Icon is `aria-hidden` but has no text fallback for the status semantic

**File:** `Alert.tsx`, line 174

The status icon is wrapped in `<span aria-hidden="true">`, which is correct for hiding decorative icons. However, the status semantic (error, info, success, warning) is conveyed only through the `role` attribute (`alert` or `status`) and the visual icon color. There is no visually hidden text like "Error:" or "Warning:" prefixed to the title to give screen reader users the same status categorization that sighted users get from the icon and color.

The `role` attribute distinguishes urgency (alert vs. status) but does not communicate the specific status type (error vs. warning, or info vs. success).

**Fix:** Consider adding a visually hidden status label, e.g., `<VisuallyHidden>{status}:</VisuallyHidden>` before the title, or including the status in `aria-label` on the root element.

---

## Logic Bugs

### L1. Dismiss is uncontrolled-only -- no way to control dismissed state externally

**File:** `Alert.tsx`, lines 148 and 156-158

The `isDismissed` state is entirely internal. There is no `isDismissed` or `onDismissChange` prop, and no way to reset the alert after dismissal (e.g., to show it again). Once dismissed, the component returns `null` and the only way to show it again is to unmount and remount the component (change the `key`).

Similarly, `isExpanded` is uncontrolled-only (line 149). There is no `isExpanded` / `onExpandedChange` prop pair for controlled usage. Compare with `AccordionItem` which supports both controlled (`isOpen`) and uncontrolled (`isDefaultOpen`) modes.

This is more of a design limitation than a bug, but it limits composability.

### L2. `alertRecipe()` is called with no arguments -- the recipe has no variants

**File:** `Alert.tsx`, line 162; `Alert.recipe.ts`, lines 3-9

`alertRecipe` is a `cva()` with only a `base` style (display flex, flex-direction column, font-family). It defines no variants, so calling it with `()` always returns the same class string. This is not a bug, but the recipe exists solely for the base style, which could be a plain `css()` call instead. The recipe infrastructure adds conceptual overhead without benefit here.

### L3. `section` container body area has no border radius but still has side/bottom borders

**File:** `Alert.tsx`, lines 115-123 and 226-230

When `container` is `section`, the body area (`styles.body`) still gets side and bottom borders (`borderInlineWidth: '1px'`, `borderBlockEndWidth: '1px'`) but no border radius (the `styles.bodyCard` class is only applied for `container === 'card'`). The header in `section` mode also has no border radius (recipe line 24: `section: {}`). However, neither the header nor body in `section` mode has any border styling at all on the header, meaning the body borders appear without corresponding header borders, creating a visual inconsistency where the body has a partial border "box" but the header does not.

This may be intentional (section headers are borderless, body has subtle borders), but without a story demonstrating `container="section"` with children, it is hard to verify.

---

## Unclear API

### U1. `onDismiss` fires after internal state already hides the component

**File:** `Alert.tsx`, lines 213-216

The dismiss handler sets `isDismissed` to `true` before calling `onDismiss?.()`. Since the component will return `null` on the next render regardless of what `onDismiss` does, the callback cannot prevent dismissal. The prop name `onDismiss` suggests a notification callback, which is fine, but consumers who want to control dismissal (e.g., confirm before dismissing, or animate out) cannot do so. A more flexible API would support `onDismiss` as a gate (return false to prevent) or provide controlled `isDismissed`/`onDismissChange` props.

### U2. `title` is typed as `ReactNode` but rendered inside `<Text>` with fixed styling

**File:** `Alert.tsx`, lines 79 and 178-180

The `title` prop accepts `ReactNode`, so consumers can pass complex JSX. However, it is rendered inside `<Text as="p" type="label" weight="semibold">`, which applies paragraph semantics and fixed typography. If a consumer passes a heading element or styled component as `title`, the result may be unexpected (e.g., a `<h3>` nested inside a `<p>`, which is invalid HTML).

**Fix:** Document that `title` should be plain text or inline elements only, or validate/restrict the type to `string`.

### U3. `children` prop name is ambiguous for collapsible content

The `children` prop serves a specific purpose -- it is collapsible body content that requires an expand/collapse toggle. The name `children` does not convey this. A name like `expandableContent` or `details` would be more self-documenting. This is a minor naming concern.

---

## Missing Tests

The test file has 5 tests covering: role mapping, dismiss behavior, collapse toggle, default expanded, and passthrough props. The following behaviors are untested:

### T1. `status` variants (all four)

Only `warning` (role=alert) and `success` (role=status) are tested. No test covers `error` (role=alert) or `info` (role=status) to verify role mapping and default icon rendering.

### T2. `container` prop

No test verifies behavior differences between `container="card"` and `container="section"`. While these primarily affect CSS classes, a test asserting the correct classes are applied would prevent regressions.

### T3. `description` prop

No test verifies that the description text is rendered when provided.

### T4. `endContent` prop

No test verifies that `endContent` is rendered in the expected position within the header.

### T5. Custom `icon` prop

No test verifies that a custom icon overrides the default status icon.

### T6. `isDismissable` without `onDismiss`

No test verifies that dismissal works when `onDismiss` is not provided (the `?.` optional call on line 215 handles this, but it is untested).

### T7. `isDismissable={false}` (default) hides dismiss button

No test verifies that the dismiss button is absent when `isDismissable` is not set.

### T8. `isDefaultExpanded` with no children

No test verifies behavior when `isDefaultExpanded={true}` is set but no children are provided. The component handles this correctly (`hasChildren` is false, so `showContent` is false), but it is not tested.

### T9. Keyboard interaction

No test verifies that the expand/collapse and dismiss buttons are keyboard accessible (focus, Enter/Space activation). The underlying `Button` component likely handles this, but integration-level keyboard tests would add confidence.

### T10. Focus management after dismissal

No test verifies where focus goes after the alert is dismissed. Currently, focus is lost.

---

## Missing Stories

**No stories file exists.** The component has zero Storybook coverage. This is the most significant gap in the audit.

The following stories should be created in `Alert.stories.tsx`:

### S1. Default story

A basic alert with each status (`error`, `info`, `success`, `warning`) to show the default icon and color.

### S2. Statuses story

A grid or stack of all four statuses side by side for visual comparison.

### S3. WithDescription story

An alert with both `title` and `description` to show the two-line layout.

### S4. Dismissable story

An alert with `isDismissable={true}` demonstrating the dismiss button.

### S5. WithChildren (collapsible) story

An alert with `children` content, demonstrating the expand/collapse toggle.

### S6. DefaultExpanded story

An alert with `isDefaultExpanded={true}` and children, showing the expanded state on load.

### S7. WithEndContent story

An alert with `endContent` (e.g., a button or link) in the header area.

### S8. SectionContainer story

An alert with `container="section"` to show the visual difference from the default card container.

### S9. CustomIcon story

An alert with a custom `icon` prop overriding the default status icon.

### S10. KitchenSink story

An alert combining `description`, `endContent`, `isDismissable`, and `children` to demonstrate all features simultaneously.

---

## Summary

| Category        | Issues                                                                         |
| --------------- | ------------------------------------------------------------------------------ |
| Performance     | 2 (both minor/informational)                                                   |
| Accessibility   | 5 (1 bug: missing aria-expanded, 4 concerns)                                   |
| Logic Bugs      | 3 (1 design limitation, 1 unnecessary recipe, 1 possible visual inconsistency) |
| Unclear API     | 3                                                                              |
| Missing Tests   | 10 untested behaviors                                                          |
| Missing Stories | 10 needed stories (entire file missing)                                        |

The most impactful issues are:

1. **A1**: The expand/collapse button is missing `aria-expanded`, which is a concrete accessibility bug. This should be fixed immediately.
2. **S1-S10**: The component has zero Storybook stories, making it impossible to visually verify or document any variant, state, or interaction.
3. **A4**: Dismissed alerts lose focus without notification, which can disorient screen reader users.
4. **L1**: Dismiss and expand states are uncontrolled-only, limiting composability compared to peer components like AccordionItem.
5. **T1-T10**: Several important behaviors (description, endContent, custom icon, container variants) lack test coverage.
