# DateTimeInput Audit

Reviewed:

- `src/components/DateTimeInput/DateTimeInput.tsx`
- `src/components/DateTimeInput/DateTimeInput.stories.tsx`
- `src/components/DateTimeInput/DateTimeInput.test.tsx`
- `src/components/DateTimeInput/index.ts`
- Related child components: `DateInput`, `TimeInput`, `Field`

Note: there is also an untracked parallel `XDS_src/DateTimeInput` implementation with docs and extensive tests, but the exported package component in `src/index.ts` points at `src/components/DateTimeInput`.

## Findings

### High: Empty DateTimeInput cannot build a value from user input

`DateTimeInput` derives `date` and `time` only from the controlled `value` prop (`DateTimeInput.tsx:87`) and `combineDateTime` returns `undefined` unless both parts are present (`DateTimeInput.tsx:55-60`). The date and time handlers then call `onChange(combineDateTime(...))` (`DateTimeInput.tsx:116`, `DateTimeInput.tsx:130`).

When `value` is initially `undefined`, selecting a date first emits `undefined` because `time` is missing; entering a time first emits `undefined` because `date` is missing. A normal controlled parent therefore has no partial value to store and the control cannot progress from empty to populated. The only existing test starts with a complete value (`DateTimeInput.test.tsx:10-14`), so this primary flow is untested.

Recommendation: keep internal draft date/time state until both parts are available, or define a clear defaulting behavior such as date selection using a default time. Add tests for date-first and time-first entry from an empty value.

### High: Visible label, description, required, and status are not associated with the actual inputs

The outer `Field` is given a fresh `fieldId` (`DateTimeInput.tsx:86`, `DateTimeInput.tsx:92-101`), but no rendered input uses that id. The actual inputs are created inside `DateInput` and `TimeInput`, which generate their own ids (`DateInput.tsx:86`, `DateInput.tsx:154`; `TimeInput.tsx:70`, `TimeInput.tsx:112`). This leaves the visible `label` rendered by the outer `Field` pointing at a non-existent control.

The child inputs get hidden labels (`DateTimeInput.tsx:110`, `DateTimeInput.tsx:125`), so they still have names like "Meeting date" and "Meeting time", but the visible label click does not focus a control and the composite field is not exposed as a grouped datetime field. Outer `description` and `status` are also rendered by `Field` (`DateTimeInput.tsx:93`, `DateTimeInput.tsx:101`) without being connected to either child input via `aria-describedby`; `DateInput` and `TimeInput` only set `aria-describedby`, `aria-invalid`, and `aria-required` from their own props (`DateInput.tsx:147-150`, `TimeInput.tsx:103-106`), which `DateTimeInput` does not pass through.

Recommendation: model the two controls as a field group or forward description/status/required semantics to both child inputs. Avoid rendering an outer label with `htmlFor` that targets no control.

### Medium: Min/max validation can emit out-of-range datetimes

The date input only receives date portions of `min` and `max` (`DateTimeInput.tsx:113-114`), and the time input only receives boundary times when the current selected date matches the boundary date (`DateTimeInput.tsx:128-129`). On date changes, the component immediately combines the new date with the existing time (`DateTimeInput.tsx:116`) without clamping or rejecting it.

Example: with `min="2026-05-21T09:00"` and current `value="2026-05-22T08:00"`, changing the date to `2026-05-21` emits `2026-05-21T08:00`, below the minimum. The time input may become constrained on the next render, but the invalid value has already been sent to consumers.

Recommendation: validate or clamp the combined datetime before calling `onChange`, and add tests for boundary-date transitions.

### Medium: Status visuals are incomplete for the composed inputs

`status` is accepted by `DateTimeInputProps` (`DateTimeInput.tsx:31`) and passed only to the outer `Field` (`DateTimeInput.tsx:101`). Because it is not passed to `DateInput` or `TimeInput` (`DateTimeInput.tsx:106-132`), neither input receives the error/warning border, status icon, `aria-invalid`, or status-message `aria-describedby` behavior implemented by the children (`DateInput.tsx:105-106`, `DateInput.tsx:149`, `DateInput.tsx:171-175`; `TimeInput.tsx:87-88`, `TimeInput.tsx:105`, `TimeInput.tsx:139-143`).

Recommendation: either style and annotate the composite row as one status-bearing field, or pass appropriate status state into both child controls.

### Medium: API has controlled-only behavior but does not say so

`onChange` is required while `value` is optional (`DateTimeInput.tsx:28`, `DateTimeInput.tsx:33`), and there is no internal state for partial selections. That makes the component look usable without a value but, because of the first finding, it is not useful from an empty state. `ref` is also forwarded only to the date input (`DateTimeInput.tsx:117`), which is not obvious from the prop name (`DateTimeInput.tsx:29`).

Recommendation: document the controlled contract and ref target, or adjust the API to support uncontrolled/partial composition explicitly.

## Coverage Gaps

Tests are too thin. The only test verifies changing the time portion when a full value already exists (`DateTimeInput.test.tsx:6-21`). Missing tests include:

- selecting a date from empty value and entering a time from empty value
- updating the date portion
- clearing date and time with `hasClear`
- `min`/`max` boundary behavior for both date and time
- `hasSeconds`
- disabled and loading states
- required, description, status, and aria behavior
- `numberOfMonths` and `dateConstraints` pass-through

Stories are too thin. `DateTimeInput.stories.tsx` has only `Default` (`DateTimeInput.stories.tsx:4-13`). Important props without stories include `hasClear`, `hasSeconds`, `min`, `max`, `dateConstraints`, `numberOfMonths`, `size`, `description`, `labelTooltip`, `isRequired`, `isOptional`, `isDisabled`, `isLoading`, and `status`.

Docs are missing for the exported `src/components/DateTimeInput` component. The only DateTimeInput doc found is under untracked `XDS_src/DateTimeInput/DateTimeInput.doc.mjs`, which does not document the exported `src` implementation.

## Categories With No Issues Found

Performance: no material performance problem found. `splitDateTime` runs on every render for `value`, `min`, and `max` (`DateTimeInput.tsx:87-89`), but this is trivial string work and the child components are not memoized, so memoizing the split values would not meaningfully improve performance.

Exports: `src/components/DateTimeInput/index.ts` correctly re-exports the component, props, and `ISODateTimeString`.
