# Schedule Component Audit

Audited files in `src/components/Schedule/`:

- `Schedule.tsx`, `types.ts`, `index.ts`, `context.tsx`
- `CalendarEvent.ts`, `dateMath.ts`, `zonedDateTime.ts`, `shared.tsx`
- `DayView.tsx`, `WeeklyView.tsx`, `MonthlyView.tsx`, `ListView.tsx`, `TimeGridView.tsx`
- `plugins/index.tsx`, `plugins/PaginationPlugin.tsx`, `plugins/ViewSelectorPlugin.tsx`
- `Schedule.stories.tsx`, `Schedule.test.tsx`

---

## Performance Problems

### P1 - Module-level event loader cache never evicts entries

**File:** `Schedule.tsx`, lines 91-94

The `eventLoaderCache` is a module-level `WeakMap<loader, Map<string, EventRecord>>`. While the outer WeakMap allows the loader function to be garbage collected, the inner `Map<string, EventRecord>` grows without bound as the user paginates. Every unique `${start}:${end}` key is stored forever for the lifetime of the loader function. For long-lived apps where users browse many date ranges, this is a memory leak.

**Recommendation:** Add an LRU eviction policy or clear stale entries when new ones are added. Alternatively, limit the inner map to a fixed number of recent entries.

### P2 - O(events x days x hours) filtering in TimeGridView

**File:** `TimeGridView.tsx`, lines 222-225

For each hour of each day, the entire `events` array is filtered with `eventOccursOnDate` and `isEventInHour`. For a weekly view with 24 hours and 7 days, this is 168 filter passes over the full events array. Additionally, the all-day row at line 190-191 adds another 7 passes. This is O(H _ D _ E) where H = hours, D = days, E = events.

**Recommendation:** Pre-group events by day and then by hour in a single pass before rendering, and pass the pre-grouped data to cells.

### P3 - O(events x days) filtering in MonthlyView

**File:** `MonthlyView.tsx`, lines 131-133

Similarly, for each of the 42 grid cells (6 weeks x 7 days), all events are filtered. This is O(42 \* E).

**Recommendation:** Pre-compute a `Map<string, CalendarEvent[]>` grouped by date in a single pass.

### P4 - `Intl.DateTimeFormat` instantiated on every call

**File:** `shared.tsx`, lines 180-185 (`formatTime`), lines 187-191 (`formatHour`)
**File:** `TimeGridView.tsx`, lines 111-117 (`isEventInHour`)

`new Intl.DateTimeFormat(...)` is called every time these functions execute. `Intl.DateTimeFormat` construction is expensive. In `TimeGridView`, `isEventInHour` creates a new formatter for every event-hour-day combination.

**Recommendation:** Cache `Intl.DateTimeFormat` instances by timezone ID, or extract the hour using arithmetic on the zoned instant instead of formatting.

### P5 - `range` object reference instability in useMemo deps

**File:** `Schedule.tsx`, lines 205-243

`getRange(view, date)` is called at line 205 and returns a new object each render. This object is then included in the `useMemo` dependency array at line 240. Since it is a new object reference every render, the memoization never actually prevents re-computation. The `contextValue` is recalculated on every render regardless.

**Recommendation:** Memoize `range` separately, or compare its fields rather than the object reference.

### P6 - Redundant spread in TimeGridView event rendering

**File:** `TimeGridView.tsx`, lines 241-249

`{...event, category: category?.label ?? event.category}` creates a new event object for every event on every render. The spread result is identical to the original event (it looks up `category` by label, then sets `category` back to that same label or the original). This is a no-op copy.

**Recommendation:** Remove the spread and pass `event` directly to `CalendarEventPill`.

---

## Accessibility Concerns

### A1 - MonthlyView grid cells missing `aria-rowindex` and grid rows missing `role="row"`

**File:** `MonthlyView.tsx`, lines 130-160

Grid cells use `role="gridcell"` but are not wrapped in elements with `role="row"`. The ARIA grid pattern requires cells to be grouped into rows. Weekday column headers use `aria-colindex` but there is no `aria-rowindex` on data cells. Screen readers may not correctly announce cell positions.

**Recommendation:** Wrap each week (7 cells) in a `<div role="row">` and add `aria-rowindex` to rows.

### A2 - MonthlyView `getGridCellName` passes empty categories array

**File:** `MonthlyView.tsx`, lines 97-99

`getEventAccessibleLabel(event, [], timezoneID)` is called with an empty categories array. This means the accessible label for events in grid cell names always falls back to the default "Event" category label instead of the actual category. The grid cell's `aria-label` gives incorrect category information.

**Recommendation:** Pass the actual `categories` from context, similar to how `TimeGridView.getCellName` does it.

### A3 - ListView events lack accessible labels

**File:** `ListView.tsx`, lines 68-92

The `ListEvent` component renders event title, time, and category as separate `<Text>` elements inside a `<div>`. There is no `role` or `aria-label` on the event row to associate these pieces for screen readers. The parent `<section>` has a heading but individual events are not identified as list items in an accessible way (they use a plain `<div>` container, not a `<ul>/<li>` structure).

**Recommendation:** Wrap each event in a semantically meaningful element (e.g., `<li>` inside a `<ul>`) and add an `aria-label` combining the event details.

### A4 - CalendarEventPill uses accessible label as visible text

**File:** `shared.tsx`, lines 211-218

`CalendarEventPill` renders the full accessible label (e.g., "Design review, Design, all day") as its visible text content. This means the visible pill shows category and time info that is meant for screen readers but clutters the visual display. Typically the pill should show just the title visually, with the full label as `aria-label`.

**Recommendation:** Render only `event.title` as visible text and put the full label in an `aria-label` attribute on the `<span>`.

### A5 - TimeGridView time label cells lack semantic association

**File:** `TimeGridView.tsx`, lines 218-219

Time labels (`<div className={styles.timeLabel}>`) are not row headers (`role="rowheader"`). Screen readers navigating the grid cannot associate time labels with their rows.

**Recommendation:** Add `role="rowheader"` to the time label divs.

### A6 - Hardcoded English weekday names in MonthlyView

**File:** `MonthlyView.tsx`, line 78

```typescript
const weekdays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
```

These are hardcoded English strings rather than using `Intl.DateTimeFormat` for localization. All other date formatting in the component uses `Intl` APIs.

**Recommendation:** Generate weekday names using `Intl.DateTimeFormat` with `{weekday: 'long'}`.

### A7 - Hardcoded Sunday start of week

**File:** `MonthlyView.tsx`, line 78 and `plainDate.ts` line 143

The week always starts on Sunday (via `plainDateSetStartOfWeek` using `dayOfWeek % 7`). Many locales use Monday as the first day. The component does not allow configuration of the first day of the week.

**Recommendation:** Accept a `weekStartsOn` option in view options and pass it through to the date math.

---

## Logic Bugs

### L1 - Monthly view "next/previous month" navigation uses hardcoded 32-day offset

**File:** `MonthlyView.tsx`, lines 193-199

```typescript
getNextDateRange: date => ({
  label: 'Next month',
  range: [
    date.startOfDay().addDays(32),
    date.startOfDay().addDays(64),
  ],
}),
```

Adding 32 days to navigate to the "next month" is unreliable. From January 1, adding 32 days lands on February 2. From January 31, adding 32 days lands on March 4, skipping February entirely. The `shiftToRange` function in `Schedule.tsx` (lines 286-296) computes the delta between the current range start and the new range start, then applies it to the current instant. Combined with the 32-day approximation, this can land on inconsistent dates.

**Recommendation:** Compute the next/previous month by adding/subtracting one calendar month to the first-of-month date rather than using a day offset.

### L2 - Event loader cache key uses string coercion of numbers

**File:** `Schedule.tsx`, line 107

```typescript
const key = `${start}:${end}`;
```

Since `Instant` is typed as `number`, this creates string keys like `"1747353600000:1747440000000"`. This works correctly but is fragile -- if `Instant` were ever changed to a different type or if floating-point instants were used, keys could collide or miss.

**Severity:** Low. Currently correct but worth documenting.

### L3 - `formatHour` uses a fixed date (Jan 1 2026 UTC) that could produce incorrect DST labels

**File:** `shared.tsx`, lines 187-191

```typescript
export function formatHour(hour: number, timezoneID: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    timeZone: timezoneID,
  }).format(new Date(Date.UTC(2026, 0, 1, hour)));
}
```

The hour labels are always computed relative to January 1 2026 UTC, not the date being viewed. In timezones with DST, the label for hour 0 on January 1 may differ from hour 0 on July 15 (e.g., EST vs EDT). This could show the wrong hour label during DST transitions.

**Recommendation:** Pass the actual date being rendered and compute the hour relative to that date.

### L4 - ListView ignores `options.days` parameter in rendering

**File:** `ListView.tsx`, lines 94-97

The `ScheduleListView` component does not use `options.days` from its props; it reads `range` from context. The `days` option is only used in the view factory's `getDateRange`. This works but means the `_props` parameter is correctly unused (prefixed with `_`), and the coupling between the factory and the renderer is purely through context, which is fine but the `_props` name is slightly misleading since the options do matter (just indirectly).

**Severity:** Not a bug, but worth noting for clarity.

### L5 - ListEvent dot element has conflicting CSS classes

**File:** `ListView.tsx`, lines 78-83

```tsx
<span
  aria-hidden="true"
  className={cx(sharedStyles.eventDot, sharedStyles.event)}
/>
```

The `eventDot` and `event` styles are both applied. `event` sets `display: block`, `overflow: hidden`, `textOverflow: ellipsis`, `whiteSpace: nowrap`, `px`, `py`, `bg`, `color` etc. The `eventDot` sets `display: inline-block`, `w: 2`, `h: 2`, `borderRadius: full`. The `event` class overrides the dot's display and adds padding/bg properties that are not intended for a dot indicator. The comment says "event dot picks up vars from this class" but it also picks up all the layout and text styles.

**Recommendation:** Extract just the CSS custom property declarations (`--schedule-event-bg`, etc.) into a separate utility class, and apply only that plus `eventDot`.

---

## Unclear API

### U1 - `date` vs `focusDate` distinction is confusing

**File:** `Schedule.tsx`, lines 49-57

The `date` prop controls which range is displayed (what month/week/day is rendered), while `focusDate` highlights "today" within that range. The naming is ambiguous -- `date` sounds like it should be the focused/highlighted date. Documentation on the props exists but the names themselves could be clearer.

**Recommendation:** Consider renaming to `viewDate` (the date that determines the rendered range) and `today` or `currentDate` (the highlighted "today" marker).

### U2 - `ScheduleCategory` matching uses `label` as identifier

**File:** `CalendarEvent.ts`, line 22 (`category?: string`) and `shared.tsx`, line 164

Events reference categories by their `label` string, and category lookup is done via `categories.find(c => c.label === event.category)`. This means the category `label` serves double duty as both display text and identifier. If two categories share a label, only the first will match. If a label is changed, all event `category` fields must be updated.

**Recommendation:** Add an explicit `id` or `value` field to `ScheduleCategory` for matching, keeping `label` purely for display.

### U3 - Plugin system lacks type safety for composition

**File:** `types.ts`, lines 70-76

Plugins only have a `renderHeader` hook. The plugin interface provides no way to add footer content, respond to events, or interact with the schedule in other ways. The system is extensible but the single-hook design may require breaking changes to add new extension points.

**Severity:** Minor -- acceptable for current scope but worth noting for roadmap.

### U4 - `ScheduleViewOptions` is typed as bare `object`

**File:** `types.ts`, line 32

```typescript
export type ScheduleViewOptions = object;
```

This provides no type safety. Any object satisfies it. View-specific option types (`ScheduleDayViewOptions`, etc.) extend it but the base type carries no meaningful constraint.

**Severity:** Low -- this is a common pattern for extensibility.

---

## Missing Tests

### T1 - No test for monthly view navigation bug (L1)

There is no test verifying that monthly view pagination correctly navigates across all months, especially February (28/29 days) and months of varying length. The existing navigation test (line 207) only covers day view.

### T2 - No test for `onToday` callback

The `onToday` function (Schedule.tsx line 308) calls `updateDate(Date.now())`. There is no test verifying the "Today" button functionality.

### T3 - No test for async event loading error handling

**File:** `Schedule.tsx`, lines 140-144

The `readAsyncEvents` function has error handling that wraps non-Error values in `new Error(String(...))`. There is no test covering the case where an async event loader rejects.

### T4 - No test for async event loading Suspense fallback

**File:** `Schedule.tsx`, lines 321-337

There is no test verifying that the Suspense fallback (loading state) renders correctly while async events are being fetched. The existing async test (line 95) only checks the resolved state.

### T5 - No test for `focusDate` defaulting to `Date.now()`

**File:** `Schedule.tsx`, line 270

When `focusDate` is not provided, it defaults to `Date.now()` captured at mount time. This is not tested.

### T6 - No test for `timezoneID` defaulting to browser timezone

**File:** `Schedule.tsx`, line 269

When `timezoneID` is not provided, it defaults to `getBrowserTimezoneID()`. This path is not tested.

### T7 - No test for day events spanning multiple days

There is no test for how multi-day events (e.g., start: `2026-05-10`, end: `2026-05-15`) render across day boundaries in monthly or list views.

### T8 - No unit tests for `dateMath.ts` utility functions

`eventOverlapsRange`, `eventOccursOnDate`, `enumerateDates`, `getScheduleRangeFromDates`, and `getBrowserTimezoneID` have no dedicated unit tests. They are indirectly exercised through integration tests but edge cases (empty ranges, zero-duration events, DST boundaries) are not covered.

### T9 - No unit tests for `zonedDateTime.ts`

`createZonedDateTime`, `zonedDateTimeFromInstant`, and `scheduleRangeToZonedDateTimeRange` have no tests. The `addDays` and `startOfDay` methods are exercised indirectly.

### T10 - No test for the `ref` prop

The `ref` prop (Schedule.tsx line 69) is not tested.

### T11 - No test for `data-testid` prop

The `data-testid` prop (Schedule.tsx line 45) is not tested.

### T12 - No test for `className` and `style` props

The `className` and `style` passthrough props are not tested.

---

## Missing Stories

### S1 - No story demonstrating async event loading

The `events` prop accepts either a static array or an async loader function. Only the static array form is demonstrated. An async story would show the loading/Suspense state.

### S2 - No story demonstrating the ViewSelectorPlugin

The `useScheduleViewSelectorPlugin` hook is exported and tested, but there is no story showing view switching in action.

### S3 - No story demonstrating custom plugins

The plugin system is a core extensibility mechanism but no story shows a custom plugin.

### S4 - No story demonstrating events without categories

No story shows what events look like when `categories` is omitted (fallback to default blue "Event" styling).

### S5 - No story demonstrating empty state (no events)

No story shows the schedule with zero events to demonstrate how the component handles empty state.

### S6 - No story demonstrating multi-day events

No story shows events spanning multiple days and how they render across day boundaries.

### S7 - No story demonstrating different timezone rendering

The `timezoneID` prop is always set to `"UTC"` in stories. A story showing the same events rendered in different timezones would be valuable.

### S8 - No story demonstrating `minHour`/`maxHour` edge cases

The day and week views accept `minHour` and `maxHour` options. The week story uses `{maxHour: 18, minHour: 8}`, but there is no story with the full 0-23 range or unusual ranges.

### S9 - No story for the `focusDate` prop (today highlighting)

No story demonstrates how the current day is highlighted differently from the `date` prop that controls the visible range.

### S10 - No story for `weekCount` option on MonthlyView

`createScheduleMonthlyView` accepts a `weekCount` option (defaulting to 6). No story shows `weekCount: 5` or other values.
