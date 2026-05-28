# InputGroup Component Audit

Audited files:

- `src/components/InputGroup/InputGroup.tsx`
- `src/components/InputGroup/InputGroup.recipe.ts`
- `src/components/InputGroup/InputGroup.stories.tsx`
- `src/components/InputGroup/InputGroup.test.tsx`
- `src/components/InputGroup/InputGroupContext.ts`
- `src/components/InputGroup/InputGroupText.tsx`
- `src/components/InputGroup/index.ts`

---

## Logic Bugs

### 1. Recipe is exported but never used by the component (HIGH)

`InputGroup.recipe.ts` defines `inputGroupRecipe` with `cva()`, including variants for `isDisabled`, `size`, and `status`. However, `InputGroup.tsx` never imports or calls `inputGroupRecipe`. Instead, it defines its own ad-hoc `styles` object using raw `css()` calls (lines 30-62). This means:

- The recipe's `status` variant styles (border colors for error/success/warning on addons and control wrappers) are **never applied**.
- The recipe's structural styles (`isolation: 'isolate'`, `maxW: 'full'`, `flex: 1` on controls, `position: relative` on items) are **not active**.
- The recipe's addon sizing (`minH` per size variant) is **not applied**.
- Two independent style definitions exist for the same component, which will cause confusion for maintainers.

The recipe is exported from `index.ts` (line 3) and from the library's main `src/index.ts` (line 535), giving consumers the impression it is the source of truth.

### 2. `data-silver-input-group-text` attribute is never rendered (HIGH)

`InputGroup.recipe.ts` defines selectors that depend on `[data-silver-input-group-text]` (lines 4-7). However, `InputGroupText.tsx` never renders this data attribute on its `<div>`. This means even if the recipe were used, the addon selectors would not match any elements, and the control-vs-addon distinction in CSS would fail completely.

### 3. `isOptional` and `isRequired` can be true simultaneously

`InputGroupProps` (lines 20-21) accepts both `isOptional` and `isRequired` as independent booleans with no validation. The `Field` component renders "Optional" or "Required" text based on priority (`isOptional ? 'Optional' : isRequired ? 'Required' : null` in `Field.tsx` line 191), but a consumer can pass both `isOptional isRequired` and get silently conflicting semantics. This is a minor API footgun shared with other Field-based components.

---

## Performance

### 4. `useMemo` dependency array is correct but `contextValue` is inexpensive

`InputGroup.tsx` line 81-84: The `useMemo` for `contextValue` depends on `[isDisabled, label]`. This is appropriate since primitive values are compared by value. No performance concerns here.

### 5. Static `css()` calls are module-level (GOOD)

Both `InputGroup.tsx` and `InputGroupText.tsx` define their `styles` objects at module scope, avoiding re-computation on each render. This follows the project convention correctly.

---

## Accessibility Concerns

### 6. `<label htmlFor>` points to a `<div>`, not a form control (MEDIUM)

In `InputGroup.tsx`, `useId()` generates an `inputId` (line 80) which is:

- Passed to `<Field inputId={inputId}>` -- which renders `<label htmlFor={inputId}>`
- Set as `id={inputId}` on the group `<div role="group">` (line 110)

A `<label htmlFor>` pointing to a `<div>` does not create a valid label association per the HTML spec. Clicking the label will not focus any input. The `role="group"` with `aria-label={label}` (line 100) provides the actual group labeling, so the `<label>` is essentially decorative. This is not a regression since screen readers will announce the group label, but it is semantically incorrect and click-to-focus will not work.

Consider using `aria-labelledby` on the group div referencing the label's ID instead.

### 7. `aria-label` duplicates the visible label (MINOR)

`InputGroup.tsx` line 100: `aria-label={label}` is set on the `<div role="group">`. The Field component also renders a visible `<label>` with the same text. Screen readers may announce the label twice. Using `aria-labelledby` pointing to the label element's ID would be cleaner.

### 8. No `aria-describedby` linking group to description/status

When `description` or `status` are provided, they are rendered by the `<Field>` wrapper but not linked to the `<div role="group">` via `aria-describedby`. Screen readers will see the description visually but it won't be programmatically associated with the group.

### 9. Disabled group does not use `aria-disabled` (MINOR)

`InputGroup.tsx` applies a visual `disabled` CSS class (opacity + cursor) but does not set `aria-disabled="true"` on the group container. The child inputs do get `disabled` propagated via context, so this is cosmetic, but `aria-disabled` on the group would provide a more complete accessibility tree.

---

## Unclear API

### 10. Two styling systems coexist: inline `css()` vs. exported recipe

As noted in issue #1, the component uses inline `css()` styles while also exporting a `cva` recipe. It is unclear to consumers whether they should use `inputGroupRecipe` for custom integrations or whether it is dead code. The recipe contains significantly more sophisticated styles (status colors, addon selectors, control wrapper targeting) that suggest it was intended to replace the inline styles but was never wired up.

### 11. `size` prop only controls the group container height

`InputGroup.tsx` applies `styles.size[size]` (line 103) which sets the container height, but does not propagate `size` through context to child inputs. Each child input must receive its own `size` prop independently. This could lead to mismatched sizes if a consumer sets `size="sm"` on the group but forgets to set it on the child TextInput.

Consider adding `size` to `InputGroupContextValue` so children can read and default to the group's size.

### 12. `status` is not propagated through context

Similarly, `status` is passed to `<Field>` for the outer label/message display but is not included in `InputGroupContextValue`. Child inputs within the group do not automatically receive the status styling. The recipe (if it were used) handles this via CSS selectors, but the current inline styles do not.

---

## Missing Stories

### 13. No story for `isDisabled`

The disabled state is tested (test file line 56) but has no visual story demonstrating it.

### 14. No story for `size` variants

The `size` prop (`sm`, `md`, `lg`) has no stories showing the different sizes. The default meta sets `size: 'md'` but there is no comparison story.

### 15. No story for `isOptional` / `isRequired`

These props are accepted but never demonstrated in stories.

### 16. No story for `isLabelHidden`

The visually hidden label variant has no story.

### 17. No story for `labelTooltip`

The tooltip feature has no visual demonstration.

### 18. No story for multiple inputs in a group

All stories show one TextInput or NumberInput with addons. There is no story demonstrating two inputs side-by-side in a group (e.g., a date range with two inputs separated by a dash addon).

### 19. No story for `InputGroupText` standalone usage or customization

`InputGroupText` is exported publicly but has no independent story or even argTypes in the existing stories.

---

## Missing Tests

### 20. No test for `size` prop rendering

There is no test verifying that the size variant class is applied to the group container.

### 21. No test for `className`, `style`, or `ref` forwarding

The component accepts `className`, `style`, and `ref` props per the project convention ("Every component forwards className, style, and ref"), but none are tested. The `data-testid` forwarding is tested (line 45), but `className` and `style` merging is not.

### 22. No test for `isOptional` / `isRequired` indicator rendering

The Field renders "Optional" or "Required" text, but this is never verified in InputGroup tests.

### 23. No test for `isLabelHidden` (label visually hidden but accessible)

There is no test confirming the label is still accessible to screen readers when `isLabelHidden` is true.

### 24. No test for `labelTooltip`

No test exercises the tooltip prop.

### 25. No test for `InputGroupText` in isolation

`InputGroupText` has no dedicated test file. It is only tested indirectly through InputGroup tests.

### 26. No test for context propagation to non-TextInput/NumberInput children

The test suite only verifies disabled propagation to TextInput (line 56). There is no test with NumberInput disabled, and no test verifying that arbitrary children receive context.

---

## Summary of Priority Issues

| Priority | Issue  | Description                                                              |
| -------- | ------ | ------------------------------------------------------------------------ |
| HIGH     | #1     | Recipe is exported but never used; component has duplicate inline styles |
| HIGH     | #2     | `data-silver-input-group-text` attribute missing from InputGroupText     |
| MEDIUM   | #6     | `<label htmlFor>` points to a div, not a form control                    |
| MEDIUM   | #8     | No `aria-describedby` on group for description/status                    |
| MEDIUM   | #11    | `size` not propagated through context to children                        |
| MEDIUM   | #12    | `status` not propagated through context to children                      |
| LOW      | #13-19 | Missing stories for several props                                        |
| LOW      | #20-26 | Missing tests for several behaviors                                      |
