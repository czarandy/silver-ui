# RadioGroup Audit

Audited files:

- `src/components/RadioGroup/RadioGroup.tsx`
- `src/components/RadioGroup/RadioGroupItem.tsx`
- `src/components/RadioGroup/RadioGroupContext.tsx`
- `src/components/RadioGroup/RadioGroup.stories.tsx`
- `src/components/RadioGroup/RadioGroup.test.tsx`
- `src/components/RadioGroup/index.ts`
- `src/components/Field/Field.tsx`
- `src/components/Item/Item.tsx`

## Findings

### Medium: Field label targets a non-labelable radiogroup div

`Field` always renders a native `<label htmlFor={inputId}>` (`src/components/Field/Field.tsx:192-198`). `RadioGroup` passes that same `inputId` to a `<div role="radiogroup">` (`src/components/RadioGroup/RadioGroup.tsx:155` and `src/components/RadioGroup/RadioGroup.tsx:168-179`). A `div` is not a labelable form element, so the visible field label is not connected through native label semantics and clicking it will not focus any radio.

Impact: the group still gets an accessible name from `aria-label={label}` (`src/components/RadioGroup/RadioGroup.tsx:171`), but pointer and assistive-technology behavior is weaker than the normal radio-group pattern. A `<fieldset>/<legend>` path or `aria-labelledby` tied to a real label/legend element would make the visible label the programmatic label without relying on an invalid `htmlFor` target.

### Medium: No public name prop for form integration

`RadioGroup` generates an internal name with `useId()` (`src/components/RadioGroup/RadioGroup.tsx:130`) and passes it to every item through context (`src/components/RadioGroup/RadioGroup.tsx:136-146`, `src/components/RadioGroup/RadioGroupItem.tsx:160`). Consumers cannot provide the submitted field name.

Impact: the component is usable as a controlled React widget, but native form submission produces an implementation-generated key instead of a domain field name. This is unclear for a radio input API and makes the component harder to use in plain HTML forms or form libraries that depend on native `name`.

### Low: Row click target is smaller than the visual item

Each option renders as an `Item` row, but `RadioGroupItem` does not pass an `onClick` to `Item` (`src/components/RadioGroup/RadioGroupItem.tsx:190-215`). Only the hidden input over the control (`src/components/RadioGroup/RadioGroupItem.tsx:153-165`) and the text label (`src/components/RadioGroup/RadioGroupItem.tsx:201-209`) toggle the radio. Descriptions, whitespace, `startContent`, and `endContent` are visually part of the row but are not selection targets.

Impact: this is not a correctness bug for native radios, but it is a discoverability and ergonomics issue for a list-style radio component. It is especially noticeable when options have descriptions or leading/trailing content.

### Low: Unused status in context can cause unnecessary item rerenders

`RadioGroupContextValue` includes `status` (`src/components/RadioGroup/RadioGroupContext.tsx:12`), and the memoized context value depends on it (`src/components/RadioGroup/RadioGroup.tsx:143-146`). `RadioGroupItem` never reads `context.status` (`src/components/RadioGroup/RadioGroupItem.tsx:142-165`).

Impact: changing validation status recreates the provider value and rerenders every item even though item rendering does not depend on status. This is minor for small groups, but it is avoidable churn.

## Tests

Existing tests cover `onChange` value emission, controlled checked-state updates, and group-level disabled propagation (`src/components/RadioGroup/RadioGroup.test.tsx:9-64`). Focused run: `pnpm vitest run src/components/RadioGroup/RadioGroup.test.tsx` passed, 3 tests.

Missing or weak coverage:

- No test for the group label/description/status accessibility contract, including `role="radiogroup"`, accessible name, `aria-describedby`, `aria-invalid`, and required state.
- No test for item-level `isDisabled`, where one option is disabled and another remains interactive.
- No test for `RadioGroupItem.description` rendering and its input-level `aria-describedby` wiring (`src/components/RadioGroup/RadioGroupItem.tsx:155` and `src/components/RadioGroup/RadioGroupItem.tsx:195-199`).
- No test for `isRequired`, `isLabelHidden`, `labelTooltip`, `size="sm"`, or `orientation`.
- No test for `startContent`/`endContent` or for the error thrown when `RadioGroupItem` is rendered outside a group (`src/components/RadioGroup/RadioGroupItem.tsx:142-145`).

## Stories And Docs

Existing stories demonstrate the default controlled group, horizontal layout, an item description, and error status (`src/components/RadioGroup/RadioGroup.stories.tsx:6-40`). I did not find separate docs beyond TypeScript/JSDoc and Storybook.

Missing stories:

- No story for group-level disabled state or item-level disabled state.
- No story for `isRequired`, `isOptional`, `isLabelHidden`, or `labelTooltip`.
- No story for `size="sm"`.
- No story for `startContent` or `endContent` on `RadioGroupItem`.
- No story showing a longer described option set where the row-click-target limitation would be visible.

## Category Notes

- Performance: no major performance problems found. The only issue is the unused `status` value in context causing avoidable item rerenders.
- Accessibility: base radio inputs use native `<input type="radio">`, shared names, checked state, disabled state, and group `aria-describedby`/`aria-invalid`. The main issue is the invalid native label association for the group container.
- Logic bugs: no high-severity logic bug found in controlled selection, disabled propagation, or required propagation.
- API clarity: the largest API gap is the missing public `name` prop. The API also does not make it obvious that only the control/label text, not the whole visual item row, is clickable.
