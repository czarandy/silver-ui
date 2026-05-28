# Schedule Audit

Implementation audited: `src/components/Schedule/*`, exported from `src/index.ts`.
Stories: `src/components/Schedule/Schedule.stories.tsx`.
Tests: `src/components/Schedule/Schedule.test.tsx`.
No separate docs/MDX file was found.

## Findings

### High: Multi-hour and overnight timed events render in the wrong time grid cells

`TimeGridView` buckets timed events by `event.start` hour only (`src/components/Schedule/TimeGridView.tsx:107-118`) after first checking that the event occurs on the rendered date (`src/components/Schedule/TimeGridView.tsx:223-226`, `src/components/Schedule/dateMath.ts:67-86`). A 4:00-6:00 event only appears in the 4 PM cell, and an overnight 11 PM-2 AM event is considered to occur on both dates but still uses the original 11 PM start hour for each date. That means the second day can show the event in the 11 PM cell instead of the 12 AM/1 AM cells, or not at all when the start hour is outside the visible range.

Coverage gap: tests cover an overnight event only in list view (`src/components/Schedule/Schedule.test.tsx:127-154`) and time-grid all-day cells (`src/components/Schedule/Schedule.test.tsx:188-205`), but not multi-hour, cross-midnight, or visible-range clipping behavior in day/week time grids.

### Medium: Async event loader cache can serve stale data and cannot retry failures

Async events are cached forever by loader function identity plus `start:end` (`src/components/Schedule/Schedule.tsx:91-146`). If a parent keeps the same loader identity while changing hidden filters, server state, auth context, or refresh state for the same date range, `Schedule` returns the old fulfilled record and never calls the loader again. Rejected records are also retained and thrown on every future render for that range, so a transient failure cannot recover without changing the loader identity.

The public `ScheduleEventSource` type exposes only `(start, end) => Promise<events>` (`src/components/Schedule/types.ts:19-21`), so there is no clear refresh key, cache policy, or retry API. Tests verify the happy path (`src/components/Schedule/Schedule.test.tsx:95-125`) but do not cover rerendering the same range with changed backing data or recovering after rejection.

### Medium: ARIA grid structure is incomplete

The monthly view puts `columnheader` and `gridcell` elements directly under the `role="grid"` container (`src/components/Schedule/MonthlyView.tsx:117-141`) without `row` wrappers. The time grid also has non-row children directly under the grid (`corner`, all-day label, and time labels) and separates time labels from the row that owns the cells (`src/components/Schedule/TimeGridView.tsx:163-221`). Screen readers expect grid content to be organized by rows with cells owned by those rows; the current structure may expose a confusing table/grid model even though role queries pass.

Coverage gap: tests assert the presence of grid roles and a few labels (`src/components/Schedule/Schedule.test.tsx:171-205`), but they do not validate row structure, row/column relationships, or time label semantics.

### Medium: Time-grid rendering does repeated O(days _ hours _ events) work

For every rendered hour and day, `TimeGridView` scans the full event list and recalculates date/hour membership (`src/components/Schedule/TimeGridView.tsx:214-227`). `isEventInHour` also creates a new `Intl.DateTimeFormat` for each candidate event check (`src/components/Schedule/TimeGridView.tsx:107-117`). Monthly and list views similarly filter all events for every date (`src/components/Schedule/MonthlyView.tsx:130-133`, `src/components/Schedule/ListView.tsx:107-110`). This is likely acceptable for small demos but can become expensive for dense calendars or async-loaded ranges.

### Low: Stories miss important props and states

Stories demonstrate the four built-in views with static events, categories, controlled date, `focusDate`, and `timezoneID` (`src/components/Schedule/Schedule.stories.tsx:49-78`). Missing stories for important public behavior:

- Async `events` source and loading spinner.
- Empty/no-events states, especially list view's "No events" rows.
- Custom `plugins`, view selector plugin, and pagination plugin positioning.
- Non-UTC timezone rendering.
- `weekCount`, `minHour`/`maxHour` edge cases, and category fallback for uncategorized events.

### Low: Tests miss several public behaviors

Existing tests cover event creation, filtering, async happy path, list grouping, basic ARIA roles, previous navigation, plugin replacement, and view selector rendering (`src/components/Schedule/Schedule.test.tsx:18-311`). Missing tests for key behavior:

- Next and Today pagination callbacks (`src/components/Schedule/Schedule.tsx:305-313`).
- Loading fallback/spinner while async events are pending (`src/components/Schedule/Schedule.tsx:321-337`).
- Async rejection and retry/cache invalidation behavior.
- Non-UTC timezone and DST boundaries.
- Monthly `weekCount`, list `days`, and invalid/edge `minHour`/`maxHour` options (`src/components/Schedule/MonthlyView.tsx:167-208`, `src/components/Schedule/ListView.tsx:139-158`, `src/components/Schedule/DayView.tsx:36-66`, `src/components/Schedule/WeeklyView.tsx:41-74`).

## Categories With No Additional Issues Found

- Component implementation, stories, and tests are present.
- Export surface is wired through `src/components/Schedule/index.ts` and `src/index.ts`.
- Basic static event filtering and basic plugin rendering have test coverage.
