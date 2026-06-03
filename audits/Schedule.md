# Schedule Audit

## Summary

Schedule is a read-only calendar shell supporting day, week, month, and list views. It is the most complex component in this audit, consisting of 14+ files including the main Schedule component, four view components (DayView, WeeklyView, MonthlyView, ListView), a time grid renderer (TimeGridView), date math utilities, a custom ZonedDateTime abstraction, a current-time hook, shared rendering utilities, a context provider, a CalendarEvent model, and two plugin components (PaginationPlugin, ViewSelectorPlugin). It supports static and async event loading (via Suspense), timezone-aware rendering, event categories with color coding, past/current event state styling, configurable hour ranges and heights, plugin-based header customization, and view switching.

## Issues

### Critical

- None identified.

### High

- **`readAsyncEvents` throws promises for Suspense without error boundary guidance**: The async loading mechanism throws promises to trigger Suspense boundaries. If a consumer does not wrap the Schedule in a Suspense boundary, React will crash with an unhelpful error. The component does wrap its content in `<Suspense>` internally, but the `readAsyncEvents` function is called inside `resolveEvents` which is called in `ScheduleViewContent` render, which is correctly inside the Suspense boundary. However, the error path (`status === 'rejected'`) throws an error that will propagate to the nearest error boundary, and there is no built-in error boundary or `onError` callback.

### Medium

- **`TimeGridView` recalculates `getTimedEventLayouts` for every hour cell per day**: Inside the hour loop, `getTimedEventLayouts` is called for each `(day, hour)` combination with the full events list, then filtered to `layout.startHour === hour`. This means the layout computation runs `hours.length * days.length` times, each time iterating all events. For a weekly view with 24 hours, that's 168 full layout computations. This should be computed once per day outside the hour loop.
- **`useCurrentTime` uses a global `setInterval` shared across all Schedule instances**: The `useCurrentTime` hook uses a module-level `setInterval` that fires every 60 seconds. While efficient for single instances, the subscription mechanism calls every listener on every tick. The `getServerSnapshot` returns `0`, which means server-rendered schedules will show epoch time 0 for current-time-dependent features.
- **`ScheduleViewContent` useMemo depends on `range` which is a new object every render**: `getRange()` is called during render and returns a new object. Since `range` is a dependency of the `useMemo` that creates `contextValue`, the context value changes every render, defeating memoization and causing all context consumers to re-render.
- **Monthly view filters events per day cell with O(events \* days) complexity**: In `ScheduleMonthlyView`, each day cell runs `events.filter(event => eventOccursOnDate(event, day, timezoneID))` independently. For 42 days and many events, this is O(42 \* events) per render. Pre-grouping events by date would be more efficient.
- **No error handling UI for async event loading failures**: When the async loader rejects, the error propagates to the nearest error boundary. There is no built-in fallback UI or `onError` callback prop on Schedule. Consumers must provide their own error boundary.
- **`onViewDateChange` is required for navigation but not marked as such**: The `onViewDateChange` prop is optional, but without it, clicking Previous/Next/Today buttons has no effect (the view date doesn't change). This is confusing because the buttons are always rendered and appear clickable.

### Low

- **`formatHour` accepts but ignores `_timezoneID` parameter**: The function signature includes `_timezoneID` but uses `Temporal.PlainTime` without timezone context. The parameter should be removed or used.
- **No story for error handling with async events**: While there is an `AsyncEvents` story, there is no story showing what happens when async loading fails.
- **`weekdays` array in `MonthlyView` is hardcoded to Sunday-start**: The monthly view always renders weekday headers starting from Sunday. Unlike the weekly view and Calendar component which support `weekStartsOn`, the monthly view has no such option.
- **`ListView` does not use the `options` parameter**: The `ScheduleListView` component receives `_props` but destructures nothing from `options`. The `days` count is already baked into the view configuration, so the component ignores the parameter.
- **Category color lookup is O(n) per event**: `getCategory()` performs a linear search through the categories array for every event rendering. For schedules with many events and categories, a Map lookup would be more efficient.
- **`createEventFromISO` uses regex to distinguish day vs instant events**: The `DATE_ONLY_RE` regex (`/^\d{4}-\d{2}-\d{2}$/`) is simple but does not validate month/day ranges. Invalid dates like `2026-13-45` would pass the regex and produce invalid Temporal.PlainDate objects.
- **No test for the `categories` prop on Schedule**: While tests verify category label behavior, there is no test that explicitly validates category color rendering.
- **No test for the `plugins` prop composability with multiple plugins**: While there are tests for individual plugins and plugin ordering, complex multi-plugin interactions are not tested.
- **`ScheduleFrame` reduces plugins in render**: The `plugins.reduce()` call in `ScheduleFrame` runs during render on every update. If plugins are expensive, this could be a bottleneck, though current plugins are lightweight.
- **`zonedDateTime.ts` creates recursive closures**: Each `ZonedDateTime` method (`addDays`, `startOfDay`) creates a new `ZonedDateTime` that captures the outer scope via closure. Deep chains like `date.addDays(1).addDays(1).addDays(1)` create nested closures, though this is unlikely to be an issue in practice.

## Recommendations

- **Performance priority**: Move `getTimedEventLayouts` computation outside the hour loop in `TimeGridView` to compute once per day. Pre-group events by date in monthly view.
- **Memoize `range`** in `ScheduleViewContent` to prevent unnecessary context re-renders.
- **Add `weekStartsOn` to monthly view** for consistency with weekly view and Calendar.
- **Consider a built-in error fallback** for async event loading, or at minimum an `onError` prop.
- The test coverage is excellent (35+ tests covering filtering, async loading, categories, loading state, error handling, list/week/day/month views, ARIA grid structure, event sizing, time labels, current time, navigation, plugins, view selectors, date math, and zoned date-time utilities). Stories are comprehensive with 16 stories covering all views, async events, plugins, categories, timezones, edge cases, and current-time scenarios.
