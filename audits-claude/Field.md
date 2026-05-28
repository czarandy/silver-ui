# Field Component Audit

**Audited files:**

- `src/components/Field/Field.tsx`
- `src/components/Field/Field.stories.tsx`
- `src/components/Field/Field.test.tsx`
- `src/components/Field/index.ts`
- `src/components/Field/inputStyles.ts`
- `src/components/Field/inputUtils.tsx`
- `src/components/Field/types.ts`

---

## Performance Problems

**No significant issues found.**

The component is a straightforward render-only function with no state, effects, or expensive computations. The `styles` object (lines 104-163 of `Field.tsx`) is defined at module scope, so `css()` calls execute once at import time rather than on every render. The `cx` utility for class merging is lightweight.

Minor note: The `labelNode`, `descriptionNode`, and `statusNode` variables are created on every render even when they will not be used (e.g., `statusNode` is computed even when `status` is undefined, though it correctly evaluates to `null`). This is negligible overhead and not worth optimizing.

---

## Accessibility Concerns

1. **Tooltip trigger on the label info icon is not independently keyboard-focusable** (`Field.tsx`, lines 211-217). The tooltip wraps a `<span>` containing an `<Icon>`. Since the child is not text-only and not a focusable element, the `Tooltip` component renders a `display: contents` wrapper and attaches to the first child element (the `<span>`). That `<span>` has no `tabIndex`, so keyboard users cannot focus it to trigger the tooltip. Adding `tabIndex={0}` and `role="img"` with an `aria-label` (e.g., "More information") to the inner `<span>` would make the tooltip accessible to keyboard and screen reader users.

2. **`isRequired` does not set `aria-required` on the form control** (`Field.tsx`, line 191). The `isRequired` prop only controls the display of "Required" text next to the label. The actual `aria-required` attribute must be set by the consuming component (e.g., `TextInput` sets it at its own level). This is a reasonable architectural split, but it means a consumer who uses `Field` directly could forget to add `aria-required` to the child input. A note in the JSDoc for `isRequired` would help.

3. **`isOptional` and `isRequired` can both be set to `true` simultaneously** (`Field.tsx`, line 191). The ternary `isOptional ? 'Optional' : isRequired ? 'Required' : null` silently gives `isOptional` precedence. There is no runtime warning or TypeScript enforcement to prevent contradictory props. This could confuse developers and result in incorrect labeling.

4. **Status region uses both `role` and `aria-live`** (`Field.tsx`, lines 234-235). The status `<div>` has `role="alert"` (for errors) or `role="status"` alongside an explicit `aria-live` attribute. Since `role="alert"` implicitly sets `aria-live="assertive"` and `role="status"` implicitly sets `aria-live="polite"`, the explicit `aria-live` is redundant. While not harmful, it could cause double-announcements in some screen reader/browser combinations. Consider removing the explicit `aria-live` and relying on the role alone, or removing the role and relying on `aria-live` alone.

5. **Description is hidden along with the label when `isLabelHidden` is true** (`Field.tsx`, lines 254-258). When `isLabelHidden` is set, both the label and description are wrapped in `VisuallyHidden`. This means the description is only available to screen readers. If a consumer intended to show a description but hide the label, they cannot do so. This may be intentional, but the prop name `isLabelHidden` does not communicate that the description is also hidden.

---

## Logic Bugs

1. **Duplicate status type definitions** (`Field.tsx` lines 12-26 vs `types.ts` lines 1-13). `FieldStatus` in `Field.tsx` and `InputStatus` in `types.ts` are structurally identical (both have `type: InputStatusType` and `message?: string`), but `FieldStatus` adds `messageID?: string`. They are used in different contexts: `InputStatus` is the public prop type on input components like `TextInput`, while `FieldStatus` is the prop on `Field` itself. Consumers pass `InputStatus` to `TextInput`, which then maps it to `FieldStatus` by adding `messageID` (e.g., `TextInput.tsx` line 237: `{...status, messageID: statusMessageID}`). This is not a bug per se, but the near-duplication is confusing. `FieldStatus` could extend `InputStatus` (e.g., `interface FieldStatus extends InputStatus { messageID?: string }`) to make the relationship explicit and reduce maintenance risk.

2. **`getStatusMessageID` in `inputUtils.tsx` does not respect custom `messageID`** (`inputUtils.tsx`, lines 13-18). The helper always derives the ID as `${inputId}-status` when a message is present, but `FieldStatus` supports a custom `messageID`. Consuming components like `TextInput` call `getStatusMessageID` to get a generated ID, then pass that as `messageID` to `Field`. If a consumer passes a pre-set `messageID` on their `InputStatus` type, it would be ignored because `InputStatus` does not have a `messageID` field. This is not a bug in current usage but is a fragile pattern.

3. **`formatFileSize` lives in `inputUtils.tsx` but is only used by `FileInput`** (`inputUtils.tsx`, lines 32-42). This utility function is unrelated to field/input status logic and is only imported by `FileInput/FileInput.tsx`. It would be more appropriately placed in a shared `src/internal/` utility or within the `FileInput` component directory itself.

---

## Unclear API

1. **`inputId` is a required prop but other input components auto-generate it** (`Field.tsx`, line 52). When `Field` is used directly (not through a wrapper like `TextInput`), the consumer must manually provide an `inputId` and ensure it matches the `id` on their child input. This is error-prone. Consider accepting an optional `inputId` and auto-generating one via `useId()` when not provided, or at minimum document this coupling clearly.

2. **`inputUtils.tsx` functions are not exported from `index.ts`** (`index.ts`, lines 1-8). The functions `getDescribedBy`, `getStatusMessageID`, `getStatusIcon`, and `formatFileSize` are imported via deep path (`../Field/inputUtils`) by 14 sibling components. They are not re-exported from the Field barrel `index.ts` or the root `src/index.ts`. If these are considered internal-only utilities, they should arguably live in `src/internal/`. If they are part of the public API for building custom field components, they should be exported.

3. **`statusVariant` naming and behavior** (`Field.tsx`, lines 96-97, 265-275). The `attached` variant renders the status message visually connected to the input (negative margin, no top border-radius), while `detached` renders it with spacing. The prop name and values are clear, but there is no JSDoc description explaining what "attached" vs "detached" look like visually.

4. **`data-testid={undefined}` on description** (`Field.tsx`, line 226). The description `<Text>` element has `data-testid={undefined}` explicitly set. This is a no-op (React ignores `undefined` attribute values), but it looks like either a leftover from development or a placeholder for a future prop. It should be removed for clarity.

---

## Missing Tests

1. **No test for `isLabelHidden`**. The `isLabelHidden` prop wraps the label and description in `VisuallyHidden`, which is a key accessibility feature. There is no test verifying that the label remains in the DOM (for screen readers) when hidden, or that the description is also hidden.

2. **No test for `isOptional` / `isRequired` indicators**. The component renders "Optional" or "Required" text next to the label based on these props, but no test verifies this text appears or that the correct indicator is shown.

3. **No test for the conflicting `isOptional` + `isRequired` case**. As noted above, both can be `true` simultaneously. A test should document the expected behavior (currently `isOptional` wins).

4. **No test for status message rendering with different types**. The single test covers `status.type === 'error'` and checks for `role="alert"`, but there are no tests for `warning` or `success` statuses, which should render `role="status"` and use `aria-live="polite"`.

5. **No test for `statusVariant`**. There is no test verifying the different DOM structures produced by `statusVariant="attached"` (wraps children and status in a container div) vs `statusVariant="detached"` (renders them as siblings).

6. **No test for `labelTooltip`**. The tooltip rendering is not tested at all.

7. **No test for `labelIcon`**. The conditional rendering of the icon slot before the label text is untested.

8. **No test for `descriptionID` / `status.messageID` generation**. The component generates IDs for the description and status message (`${inputId}-description`, `${inputId}-status`) and respects custom IDs when provided. None of this ID logic is tested.

9. **No tests for `inputUtils.tsx` utilities**. The `getDescribedBy`, `getStatusMessageID`, `getStatusIcon`, and `formatFileSize` functions have zero test coverage despite being used by 14+ components.

10. **No tests for `inputStyles.ts`**. This is a static style definition and is less critical to test, but verifying that the exported object has the expected keys and structure could prevent regressions.

---

## Missing Stories

1. **Only one story (`Default`)**. The stories file (`Field.stories.tsx`, lines 13-19) has a single story showing a basic field with a description. The following important props and states lack dedicated stories:
   - **`isRequired`** -- Should show the "Required" indicator next to the label.
   - **`isOptional`** -- Should show the "Optional" indicator next to the label.
   - **`isDisabled`** -- Should show the disabled label styling (`cursor: not-allowed`, muted color).
   - **`isLabelHidden`** -- Should demonstrate a field with a visually hidden label (important for accessibility review).
   - **`labelIcon`** -- Should show an icon rendered before the label text.
   - **`labelTooltip`** -- Should show the info icon with a hoverable tooltip.
   - **`status` with each type** -- Should show `error`, `warning`, and `success` status messages below the input.
   - **`statusVariant="attached"` vs `"detached"`** -- Should show side-by-side comparison of the two visual treatments.
   - **Error status with `role="alert"`** -- Should demonstrate the live region behavior for screen readers.

2. **The Default story uses a raw `<input>` element**. The story renders `<input id="field-story" />` as a child, which does not apply any of the `inputStyles` that real consumers use. This means the story does not accurately represent what `Field` looks like in practice. Using a `TextInput`-like styled input would be more representative.

3. **No composition stories**. There are no stories showing `Field` composed with different child controls (e.g., textarea, select, checkbox) or nested within form layouts, which would help demonstrate the component's flexibility.

---

## Additional Observations

- **`displayName` is set** (`Field.tsx`, line 280), which is good for React DevTools.
- **`index.ts` exports are clean** (lines 1-8) -- all public types and the `inputStyles` object are properly re-exported.
- **The component is widely used** -- at least 14 sibling components (TextInput, Select, TextArea, NumberInput, Combobox, DateInput, DateRangeInput, TimeInput, RadioGroup, CheckboxInput, Slider, TagsInput, Switch, InputGroup) depend on `Field`, `inputStyles`, or `inputUtils`. Changes to this component have broad impact and warrant thorough test coverage.
- **`inputUtils.tsx` is doing double duty** as both field-specific utilities (`getDescribedBy`, `getStatusMessageID`, `getStatusIcon`) and an unrelated file utility (`formatFileSize`). Consider splitting these concerns.
