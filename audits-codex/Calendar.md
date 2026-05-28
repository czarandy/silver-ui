# Calendar Audit

Scope: `src/components/Calendar/Calendar.tsx`, `src/components/Calendar/Calendar.stories.tsx`, `src/components/Calendar/Calendar.test.tsx`, package usage in `DateInput`/`DateRangeInput`, and the `XDS_src/Calendar` reference/docs.

## Findings

### High

- `focusDate` makes navigation inert unless the parent also updates `focusDate`. `Calendar` always derives the visible month from `focusDate` when present (`src/components/Calendar/Calendar.tsx:437`) and refuses to update internal focus state in navigation/imperative navigation when that prop is set (`src/components/Calendar/Calendar.tsx:487`, `src/components/Calendar/Calendar.tsx:499`). This breaks consumers that use `focusDate` as an initial visible month. `DateInput` does exactly that by passing `focusDate={value}` without `onFocusDateChange` (`src/components/DateInput/DateInput.tsx:119`), so a populated date input cannot navigate to another month from its calendar popover. The Storybook default also passes `focusDate` without a handler (`src/components/Calendar/Calendar.stories.tsx:24`), so the navigation buttons in the main stories do not actually change months. The XDS reference treats focus as controlled only when both `focusDate` and `onFocusDateChange` are provided (`XDS_src/Calendar/XDSCalendar.tsx:240`).

### Medium

- Keyboard navigation can bypass `min`/`max` month navigation constraints. The prev/next buttons are disabled from `canNavigatePrevious`/`canNavigateNext` (`src/components/Calendar/Calendar.tsx:460`, `src/components/Calendar/Calendar.tsx:565`), but grid keyboard navigation calls `navigateMonth` directly with no equivalent guard (`src/components/Calendar/Calendar.tsx:688`, `src/components/Calendar/Calendar.tsx:697`). Visible outside-month days are only `aria-disabled`, not actually disabled (`src/components/Calendar/Calendar.tsx:861`, `src/components/Calendar/Calendar.tsx:928`), and the focus selector includes `button:not([disabled])` (`src/components/Calendar/Calendar.tsx:688`), so arrows can focus nonselectable outside days and then move to months the buttons disallow.

- The grid semantics are weak for assistive tech. Day buttons replace native button semantics with `role="gridcell"` (`src/components/Calendar/Calendar.tsx:914`, `src/components/Calendar/Calendar.tsx:940`), so screen readers may expose dates as cells rather than actionable controls. Column headers are rendered outside the `role="grid"` element (`src/components/Calendar/Calendar.tsx:753`, `src/components/Calendar/Calendar.tsx:765`), so they are not owned by the grid they label. When two months are shown, each `MonthGrid` independently computes a tabbable day (`src/components/Calendar/Calendar.tsx:575`, `src/components/Calendar/Calendar.tsx:673`, `src/components/Calendar/Calendar.tsx:791`), creating multiple tab stops in one calendar widget.

- Package-facing docs are missing or mismatched. I found no `Calendar.doc.mjs` under `src/components/Calendar`; the only doc file is `XDS_src/Calendar/Calendar.doc.mjs`. That reference doc describes `handleRef` (`XDS_src/Calendar/Calendar.doc.mjs:81`), but the package component exposes the imperative handle through `ref` (`src/components/Calendar/Calendar.tsx:101`). Consumers of the package API do not get accurate generated docs for this component.

### Low

- Date label formatting is more expensive than it needs to be. Every rendered day creates a new `Intl.DateTimeFormat` through `plainDateFormat` (`src/internal/plainDate.ts:156`), and every day calls it for `aria-label` (`src/components/Calendar/Calendar.tsx:916`). In range mode, hover updates `hoveredDate` on every enter/leave (`src/components/Calendar/Calendar.tsx:934`) and re-renders all visible day cells, so two-month calendars can repeatedly recreate dozens of formatters. Cache formatter instances or precompute labels with the generated day data if this appears in hot popovers.

## Stories

Existing stories cover single selection, a controlled range value, two months, min/max constraints, and week numbers (`src/components/Calendar/Calendar.stories.tsx:36`, `src/components/Calendar/Calendar.stories.tsx:38`, `src/components/Calendar/Calendar.stories.tsx:45`, `src/components/Calendar/Calendar.stories.tsx:51`, `src/components/Calendar/Calendar.stories.tsx:58`).

Missing or weak story coverage:

- No story demonstrates working month navigation with `onFocusDateChange`; current defaults lock navigation because of the `focusDate` issue.
- No story demonstrates `defaultValue`/uncontrolled usage.
- No story demonstrates `dateConstraints` with custom disabled rules, only `min`/`max`.
- No dedicated stories for `hasOutsideDays={false}` or `hasVariableRowCount`.
- `weekStartsOn` is only shown coupled to week numbers, not as a standalone locale/layout option.

## Tests

`pnpm vitest run src/components/Calendar/Calendar.test.tsx` passes: 5 tests.

Current package tests cover basic rendering/selection, single `onChange`, forward range selection, min/max disabled dates, and root props/ref (`src/components/Calendar/Calendar.test.tsx:7`, `src/components/Calendar/Calendar.test.tsx:16`, `src/components/Calendar/Calendar.test.tsx:27`, `src/components/Calendar/Calendar.test.tsx:44`, `src/components/Calendar/Calendar.test.tsx:53`).

Missing test coverage:

- Prev/next month navigation, both uncontrolled and controlled with `onFocusDateChange`.
- Regression for `focusDate` used as an initial date without a handler, especially through `DateInput`.
- Keyboard navigation across days/months, including min/max boundaries, PageUp/PageDown, Home/End, and Escape cancellation in range mode.
- `numberOfMonths`, `weekStartsOn`, `hasWeekNumbers`, `hasOutsideDays`, and `hasVariableRowCount`.
- `dateConstraints`.
- `defaultValue` in single and range modes.
- Reverse range selection and controlled range rendering.

## No Issues Found

- Basic date generation, min/max disabled state, single selection callbacks, and forward range selection are covered by existing tests and passed in the focused run.
