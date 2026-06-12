/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import {scheduleListViewRecipe} from 'components/Schedule/ListView.recipe';
import {scheduleEventRecipe} from 'components/Schedule/ScheduleEvent.recipe';
import {useScheduleContext} from 'components/Schedule/context';
import {
  enumerateDates,
  eventOccursOnDate,
  isDayEvent,
} from 'components/Schedule/dateMath';
import {
  getCategory,
  getEventTimeLabel,
  isEventInPast,
  formatListRangeTitle,
  scheduleClasses,
  ScheduleCurrentTimeIndicator,
  ScheduleFrame,
  useScheduleEventPopover,
} from 'components/Schedule/shared';
import type {
  CalendarEvent,
  Instant,
  ScheduleView,
  ScheduleZonedInstant,
} from 'components/Schedule/types';
import {useCurrentTime} from 'components/Schedule/useCurrentTime';
import {Text} from 'components/Text';
import {Tooltip} from 'components/Tooltip';
import {cx} from 'internal/cx';
import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateFormat,
  plainDateFromInstant,
  plainDateIsEqual,
} from 'internal/plainDate';

export interface ScheduleListViewOptions {
  /**
   * Number of days shown in the list.
   * @default 7
   */
  days?: number;
}

const styles = scheduleListViewRecipe();

/**
 * Renders a single event row in the list view.
 */
function ListEvent({
  event,
  isPast,
}: {
  event: CalendarEvent;
  isPast: boolean;
}): React.JSX.Element {
  const {categoryMap, timezoneID} = useScheduleContext();
  const {popover, triggerProps} = useScheduleEventPopover(event, {
    placement: 'end',
  });
  const category = getCategory(categoryMap, event);
  const eventDataState = isPast ? 'past' : undefined;
  const classes = scheduleListViewRecipe({
    isInteractiveEvent: triggerProps != null,
    isPastEvent: isPast,
  });
  const eventContent = (
    <>
      <Tooltip content={category.label} hoverIndication="never">
        <span
          aria-label={category.label}
          className={scheduleEventRecipe({color: category.color}).dot}
          role="img"
        />
      </Tooltip>
      <Text>{event.title}</Text>
    </>
  );
  return (
    <div className={classes.eventRow} data-state={eventDataState}>
      <Text className={classes.eventTime} color="secondary" type="supporting">
        {isDayEvent(event) ? 'All day' : getEventTimeLabel(event, timezoneID)}
      </Text>
      {triggerProps != null ? (
        <button
          className={classes.eventContent}
          data-state={eventDataState}
          data-testid={`schedule-event-${event.id}`}
          type="button"
          {...triggerProps}>
          {eventContent}
        </button>
      ) : (
        <div
          className={classes.eventContent}
          data-state={eventDataState}
          data-testid={`schedule-event-${event.id}`}>
          {eventContent}
        </div>
      )}
      {popover}
    </div>
  );
}

/**
 * Internal view component that renders events as a chronological day-by-day list.
 */
function ScheduleListView(): React.JSX.Element {
  const {events, highlightDate, isLoading, range, timezoneID} =
    useScheduleContext();
  const days = enumerateDates(range.startDate, range.endDate);
  const currentTime = useCurrentTime();
  const currentPlainDate = plainDateFromInstant(currentTime, timezoneID);
  const highlightPlainDate = highlightDate.toPlainDate();
  const endDate = range.endDate.add({days: -1});
  const title = formatListRangeTitle(range.startDate, endDate);
  const visibleDays = days
    .map(day => {
      const dayEvents = events.filter(event =>
        eventOccursOnDate(event, day, timezoneID),
      );
      const isCurrentDay = plainDateIsEqual(day, currentPlainDate);
      const isHighlightedDay = plainDateIsEqual(day, highlightPlainDate);
      const isBaseDay = plainDateIsEqual(day, range.startDate);
      return {
        day,
        dayEvents,
        isCurrentDay,
        isHighlightedDay,
        isVisible: dayEvents.length > 0 || isCurrentDay || isBaseDay,
      };
    })
    .filter(dayRecord => dayRecord.isVisible);

  return (
    <ScheduleFrame title={title} titleLabel={title}>
      <div className={cx(scheduleClasses.surface, styles.list)}>
        {visibleDays.map(
          ({day, dayEvents, isCurrentDay, isHighlightedDay}, index) => {
            const fullDate = plainDateFormat(day, DATE_FORMAT_WITH_WEEKDAY);
            const dayClasses = scheduleListViewRecipe({
              isHighlightedDay,
              isLastDay: index === visibleDays.length - 1,
            });
            return (
              <section className={dayClasses.day} key={day.toString()}>
                <h4
                  aria-current={isHighlightedDay ? 'date' : undefined}
                  aria-label={fullDate}
                  className={dayClasses.dayHeading}>
                  <span className={dayClasses.dayNumber}>{day.day}</span>
                  <span className={dayClasses.dayWeekday}>
                    {plainDateFormat(day, {weekday: 'short'})}
                  </span>
                </h4>
                <div className={dayClasses.events}>
                  {renderListRows({
                    currentTime,
                    events: dayEvents,
                    isShowingCurrentTime: isCurrentDay && !isLoading,
                    timezoneID,
                  })}
                </div>
              </section>
            );
          },
        )}
      </div>
    </ScheduleFrame>
  );
}

function renderListRows({
  currentTime,
  events,
  isShowingCurrentTime,
  timezoneID,
}: {
  currentTime: Instant;
  events: ReadonlyArray<CalendarEvent>;
  isShowingCurrentTime: boolean;
  timezoneID: string;
}): React.JSX.Element[] {
  const rows = events.map(event => (
    <ListEvent
      event={event}
      isPast={isEventInPast(event, currentTime, timezoneID)}
      key={event.id}
    />
  ));

  if (!isShowingCurrentTime) {
    return rows;
  }

  const marker = (
    <ScheduleCurrentTimeIndicator
      key="current-time"
      layout="list"
      testId="schedule-list-current-time"
    />
  );
  const insertIndex = events.findIndex(
    event => !isDayEvent(event) && event.start > currentTime,
  );

  if (insertIndex < 0) {
    return [...rows, marker];
  }

  return [...rows.slice(0, insertIndex), marker, ...rows.slice(insertIndex)];
}

/**
 * Creates a list schedule view configuration.
 */
export function createScheduleListView({
  days = 7,
}: ScheduleListViewOptions = {}): ScheduleView<ScheduleListViewOptions> {
  return {
    component: ScheduleListView,
    getDateRange: (date: ScheduleZonedInstant) => [
      date.startOfDay(),
      date.startOfDay().addDays(days),
    ],
    getNextDateRange: date => ({
      label: 'Next range',
      range: [
        date.startOfDay().addDays(days),
        date.startOfDay().addDays(days * 2),
      ],
    }),
    getPreviousDateRange: date => ({
      label: 'Previous range',
      range: [date.startOfDay().addDays(-days), date.startOfDay()],
    }),
    options: {days},
  };
}
