# DateRangeInput Audit

Files reviewed:

- `src/components/DateRangeInput/DateRangeInput.tsx`
- `src/components/DateRangeInput/DateRangeInput.test.tsx`
- `src/components/DateRangeInput/DateRangeInput.stories.tsx`
- `src/components/DateRangeInput/index.ts`
- `src/components/Calendar/Calendar.tsx`
- `src/components/DateInput/DateInput.tsx`
- `XDS_src/DateRangeInput/XDSDateRangeInput.tsx`
- `XDS_src/DateRangeInput/XDSDateRangeInput.test.tsx`
- `XDS_src/DateRangeInput/DateRangeInput.doc.mjs`

## Findings

### High: Reopening an existing range does not focus the selected month

`DateRangeInput` renders `Calendar` without `focusDate` (`src/components/DateRangeInput/DateRangeInput.tsx:119`), so `Calendar` falls back to today when it initializes with no internal value (`src/components/Calendar/Calendar.tsx:421`, `src/components/Calendar/Calendar.tsx:435`). Because the popover unmounts/remounts the calendar, a selected range in another month opens on the current month instead of the range start. The sibling `DateInput` passes `focusDate={value}` (`src/components/DateInput/DateInput.tsx:119`).

Recommendation: pass `focusDate={value?.start}` to the range calendar and add a test that opens a value outside the current month.

### Medium: Clear remains actionable while loading

The calendar trigger and text input are disabled for `isLoading` (`src/components/DateRangeInput/DateRangeInput.tsx:134`, `src/components/DateRangeInput/DateRangeInput.tsx:140`, `src/components/DateRangeInput/DateRangeInput.tsx:154`), but the clear button only checks `!isDisabled` (`src/components/DateRangeInput/DateRangeInput.tsx:162`). A user can clear a value while the field is otherwise busy.

Recommendation: hide or disable clear when `isLoading` is true, and test that loading disables all mutation paths.

### Medium: Keyboard/accessibility semantics are split across a read-only input and separate trigger

The labelled control is a focusable read-only textbox (`src/components/DateRangeInput/DateRangeInput.tsx:147`), but it cannot open the picker or accept typed input. The actionable picker trigger is a separate icon-only button before it (`src/components/DateRangeInput/DateRangeInput.tsx:138`). Keyboard users can tab into a control named by the field label but cannot change it from there.

Recommendation: make the labelled control the trigger button/combobox, or make the read-only input unfocusable and associate the label with the actual trigger. At minimum, test tab order, accessible names, `aria-expanded`, and picker opening from keyboard.

### Medium: Primary date-range selection flow is untested

The public test file has one test covering formatted display and clear (`src/components/DateRangeInput/DateRangeInput.test.tsx:7`). It does not open the popover, select start/end dates, assert `onChange`, verify disabled/loading/status/description/required behavior, or cover `min`, `max`, `dateConstraints`, and `numberOfMonths`. `Calendar` has a direct range test (`src/components/Calendar/Calendar.test.tsx:27`), but not the composed `DateRangeInput` user flow.

Recommendation: add focused interaction tests for open/select/close, focus month from selected value, loading/disabled behavior, status ARIA, description linkage, clear visibility, and constraints pass-through.

### Medium: Important props have no stories

The public story file only exports `Default` (`src/components/DateRangeInput/DateRangeInput.stories.tsx:16`). There are no stories for empty/placeholder, `hasClear`, `min`/`max` or `dateConstraints`, `numberOfMonths={1}`, disabled, loading, status, description, required/optional, hidden label, or sizes.

Recommendation: add stories for the high-traffic states above. This component has many visual and behavioral states that cannot be evaluated from the default selected-range story.

### Low: API uses `undefined` for empty while the XDS variant/docs use `null`

The public API uses `value?: DateRange` and clears via `onChange(undefined)` (`src/components/DateRangeInput/DateRangeInput.tsx:47`, `src/components/DateRangeInput/DateRangeInput.tsx:53`, `src/components/DateRangeInput/DateRangeInput.tsx:166`). The XDS implementation and docs require `value: DateRange | null` and clear with `null` (`XDS_src/DateRangeInput/XDSDateRangeInput.tsx:245`, `XDS_src/DateRangeInput/XDSDateRangeInput.tsx:251`, `XDS_src/DateRangeInput/DateRangeInput.doc.mjs:17`). This is not a runtime bug, but it is easy to confuse across parallel implementations.

Recommendation: document the public empty-value convention in stories/docs, or align the APIs if these components are intended to converge.

### Low: `hasClear` default differs from XDS docs

The public component defaults `hasClear` to `false` (`src/components/DateRangeInput/DateRangeInput.tsx:79`), while XDS defaults and docs say `true` (`XDS_src/DateRangeInput/XDSDateRangeInput.tsx:356`, `XDS_src/DateRangeInput/DateRangeInput.doc.mjs:25`). This makes the default public story omit the clear affordance even with a selected value.

Recommendation: either keep the public default but document it with an explicit story, or align with XDS.

### Low: Minor formatting performance issue

`formatRange` formats both endpoints every time `value` changes (`src/components/DateRangeInput/DateRangeInput.tsx:56`), and `plainDateFormat` creates a new `Intl.DateTimeFormat` each call (`src/internal/plainDate.ts:156`). This is not a significant issue for typical form usage, but referentially unstable `value` objects will bypass the `useMemo` guard (`src/components/DateRangeInput/DateRangeInput.tsx:93`).

Recommendation: no urgent fix. If this component appears in large filter tables, cache shared formatters in `plainDateFormat` or memoize by `value.start`/`value.end`.

## Categories With No Major Issues

- Index/export: `src/components/DateRangeInput/index.ts` correctly exports the component and public types.
- Basic rendering: selected ranges format as expected and the existing clear test covers the happy path.
- Styling structure: the component consistently reuses shared `Field`/`inputStyles`; no component-specific recipe appears to be missing for the current implementation style.
