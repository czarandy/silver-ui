# NumberInput Audit

Audited:

- `src/components/NumberInput/NumberInput.tsx`
- `src/components/NumberInput/NumberInput.stories.tsx`
- `src/components/NumberInput/NumberInput.test.tsx`
- `src/components/NumberInput/index.ts`
- Related `Field`/`InputGroup` behavior where it affects NumberInput.

## Findings

### Medium: grouped inputs can reference non-existent description/status IDs

When `NumberInput` is rendered inside `InputGroup`, it returns `inputWrapper` directly and skips rendering its own `Field` (`src/components/NumberInput/NumberInput.tsx:239`). However, it still computes `descriptionID`/`statusMessageID` (`NumberInput.tsx:136`) and passes them to `aria-describedby` on the input (`NumberInput.tsx:168`). If a consumer passes `description` or `status` to the grouped `NumberInput`, those referenced elements are never rendered, producing dangling ARIA references. Status icons can still render inside the group (`NumberInput.tsx:231`), which makes the unsupported state look partially functional.

Recommendation: either ignore child `description`/`status` while grouped, document that grouped status belongs on `InputGroup`, or render/propagate IDs consistently.

### Medium: invalid min/max/integer input is silently rejected without user-facing feedback

`parseNumberInput` returns `null` for out-of-range and non-integer values (`NumberInput.tsx:90`, `NumberInput.tsx:93`, `NumberInput.tsx:96`). `onChange` then simply does not fire (`NumberInput.tsx:199`), and the only component feedback is `aria-invalid` while the pending string is displayed (`NumberInput.tsx:149`, `NumberInput.tsx:169`). On blur, pending text is cleared (`NumberInput.tsx:192`), so the field reverts to the previous committed value without explaining what happened.

Recommendation: provide a visible validation message, expose a rejection callback, or make the silent rejection behavior explicit in docs.

### Medium: clear button can leave keyboard focus in an unstable place

The clear button only calls `onChange(null)` (`NumberInput.tsx:222`, `NumberInput.tsx:226`). In controlled usage, that typically removes the button on the next render, but focus is not returned to the input. Keyboard and screen-reader users may lose their place after activating clear.

Recommendation: keep an internal input ref and focus the input after clearing.

### Medium: public API is under-documented for a stateful parsing component

The prop interfaces have no JSDoc (`NumberInput.tsx:24`), and there is no dedicated docs file under `src/components/NumberInput`. This leaves important behavior ambiguous: `hasClear` changes the `onChange` type (`NumberInput.tsx:56`), `value` may be `null` even when `hasClear` is absent (`NumberInput.tsx:53`), `isIntegerOnly` rejects decimals (`NumberInput.tsx:32`), and `min`/`max` are both native attributes and internal validation gates (`NumberInput.tsx:179`).

Recommendation: document controlled value semantics, invalid-input behavior, `null` behavior, and the grouped-input constraints.

### Low: units are visible but not programmatically associated with the value

`units` renders as a trailing `<span>` (`NumberInput.tsx:221`), but it is not included in the label or `aria-describedby`. A screen-reader user hearing "Quantity, spin button, 2" may not hear "GB" or "%".

Recommendation: associate units through `aria-describedby` or ask consumers to include the unit in `label`.

### Low: no material performance issue found

The component is a small leaf input. `useMemo` around `displayValue` (`NumberInput.tsx:143`) is not buying much because the computation is trivial, but this is readability-level overhead rather than a real performance problem.

## Tests

Current test coverage is very thin: `NumberInput.test.tsx` has two tests, covering valid `onChange` and clear (`NumberInput.test.tsx:7`, `NumberInput.test.tsx:18`). The focused test run passes: `pnpm vitest run src/components/NumberInput/NumberInput.test.tsx`.

Missing important tests:

- `min`/`max` rejection and boundary acceptance.
- `isIntegerOnly` decimal rejection.
- invalid pending input display, `aria-invalid`, and blur reversion.
- `status` message/ARIA behavior.
- `description`, `isRequired`, `isDisabled`, `htmlName`, `autoComplete`, `step`, `units`, `startIcon`, `onFocus`, `onBlur`, `onEnter`, and `onKeyDown`.
- `InputGroup` integration, especially disabled propagation and child `description`/`status` behavior.
- focus behavior after clicking clear.

## Stories / Docs

Stories are minimal: only `Default` and `WithUnits` exist (`NumberInput.stories.tsx:13`, `NumberInput.stories.tsx:14`). `WithUnits` demonstrates `units`, `min`, `max`, and `hasClear` only by args (`NumberInput.stories.tsx:15`), but no story uses state or Storybook args to show real typing, clearing, blur, or validation behavior.

Missing useful stories:

- controlled interactive story;
- `status` variants;
- `isIntegerOnly`;
- boundary validation with `min`/`max`;
- disabled state;
- required/optional and description text;
- size variants;
- start icon;
- InputGroup usage.

No dedicated docs file was found for the `src/components/NumberInput` component.
