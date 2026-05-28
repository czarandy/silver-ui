# InputGroup Audit

Audited:

- `src/components/InputGroup/InputGroup.tsx`
- `src/components/InputGroup/InputGroupText.tsx`
- `src/components/InputGroup/InputGroupContext.ts`
- `src/components/InputGroup/InputGroup.recipe.ts`
- `src/components/InputGroup/InputGroup.stories.tsx`
- `src/components/InputGroup/InputGroup.test.tsx`
- Related integrations in `src/components/TextInput/TextInput.tsx`, `src/components/NumberInput/NumberInput.tsx`, and `src/components/Field/Field.tsx`

## Findings

### High: group description/status are not programmatically associated with the actual input

`InputGroup` renders `description` and `status` through `Field` (`InputGroup.tsx:88-98`), and `Field` creates IDs for those nodes (`Field.tsx:185-190`, `Field.tsx:220-245`). However, the grouped child inputs return early when `useInputGroup()` is present (`TextInput.tsx:221-223`, `NumberInput.tsx:239-241`), so they do not receive the group's `descriptionID`, status message ID, or `aria-invalid` state. The group container also lacks `aria-describedby` (`InputGroup.tsx:99-111`).

Impact: in the `WithStatus` story (`InputGroup.stories.tsx:50-61`), a screen reader can reach the text input, but the error message and helper text are not announced as part of that input. The existing test only checks that the text is visible (`InputGroup.test.tsx:24-43`), not that it is wired into the accessibility tree.

### High: group `isRequired` is visual only for child controls

`InputGroup` passes `isRequired` to `Field` (`InputGroup.tsx:91-95`), which renders the required indicator (`Field.tsx:191-209`). The actual input gets `aria-required` only from its own prop (`TextInput.tsx:181-182`, `NumberInput.tsx:170-171`), and `InputGroupContext` only carries `isDisabled` and `label` (`InputGroupContext.ts:3-7`). A required `InputGroup` therefore does not mark the contained input as required unless consumers duplicate the prop on the child.

### Medium: `status` styling is not applied to the grouped control or addons

`InputGroup` passes `status` only to `Field` (`InputGroup.tsx:97-98`); the local group styles do not read it (`InputGroup.tsx:30-62`). `TextInput` and `NumberInput` style their wrappers only from their own `status` props (`TextInput.tsx:166-170`, `NumberInput.tsx:156-160`), so `WithStatus` renders the error message but leaves the input/addon borders in their normal state. `InputGroup.recipe.ts` has status selectors (`InputGroup.recipe.ts:112-124`), but the component never imports or calls `inputGroupRecipe`.

### Medium: `size` does not propagate to children

The `size` prop only changes the group container height (`InputGroup.tsx:57-61`, `InputGroup.tsx:101-104`). Child inputs still default independently to `md` (`TextInput.tsx:130-134`) unless the consumer also passes `size` to each child. This makes `size="sm"`/`"lg"` easy to misrender and is not demonstrated or tested.

### Medium: visible label is attached to a non-labelable div

`InputGroup` uses one generated ID for both `Field.inputId` and the `div role="group"` (`InputGroup.tsx:80`, `InputGroup.tsx:88-90`, `InputGroup.tsx:99-110`). `Field` renders `<label htmlFor={inputId}>` (`Field.tsx:193-198`), but a `div` is not a labelable form control, so clicking the visible label will not focus the child input. The group does have `aria-label={label}` (`InputGroup.tsx:100`), but `aria-labelledby` from the rendered label would be a clearer relationship.

### Medium: exported recipe appears stale or unusable with the current components

`index.ts` publicly exports `inputGroupRecipe` (`index.ts:1-6`), but `InputGroup.tsx` uses a separate inline `styles` object (`InputGroup.tsx:30-62`). The recipe selectors depend on `[data-silver-input-group-text]` (`InputGroup.recipe.ts:4-7`), while `InputGroupText` never renders that attribute (`InputGroupText.tsx:38-42`). Consumers using the exported recipe would not get the intended addon/control distinction.

### Low: disabled semantics are only partially defined

`isDisabled` is propagated to supported child inputs through context (`InputGroup.tsx:81-83`, `TextInput.tsx:161-187`, `NumberInput.tsx:140-177`) and is tested for `TextInput` (`InputGroup.test.tsx:56-65`). The group container itself has only visual disabled styling (`InputGroup.tsx:53-56`, `InputGroup.tsx:101-105`) and no `aria-disabled`. The API also accepts arbitrary `children`, so it is unclear whether non-input children are expected to be disabled.

## Stories

Missing stories:

- `isDisabled`
- `size="sm"` and `size="lg"` comparison
- `isRequired` and `isOptional`
- `isLabelHidden`
- `labelTooltip`
- success and warning statuses, not only error
- `InputGroupText` with icon/custom content

Existing stories cover the basic prefix/suffix URL case, a currency `NumberInput`, and an error message (`InputGroup.stories.tsx:16-62`).

## Tests

Missing tests:

- child input receives/announces group description and status via `aria-describedby`
- group `status` results in invalid semantics/styling for the child control
- `isRequired` reaches the actual child input
- `size` behavior, especially non-default sizes
- `NumberInput` disabled propagation, not just `TextInput`
- `className`, `style`, and `ref` forwarding
- `InputGroupText` data/structure needed by the exported recipe, if the recipe remains public

Existing tests cover basic rendering, visible description/status text, `data-testid`, and disabled propagation to `TextInput` (`InputGroup.test.tsx:8-66`).

## Performance

No performance issues found. Styles are declared at module scope (`InputGroup.tsx:30-62`, `InputGroupText.tsx:13-28`), and the context value is memoized with the relevant primitive dependencies (`InputGroup.tsx:81-84`).
