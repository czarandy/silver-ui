/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

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
  ScheduleFrame,
} from 'components/Schedule/shared';
import {useCurrentTime} from 'components/Schedule/useCurrentTime';
import {Text} from 'components/Text';
import {Tooltip} from 'components/Tooltip';
import {cx} from 'internal/cx';
import {css} from 'styled-system/css';
import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateFormat,
  plainDateFromInstant,
  plainDateIsEqual,
} from '../../internal/plainDate';
import type {
  CalendarEvent,
  Instant,
  ScheduleView,
  ScheduleZonedInstant,
} from './types';

export interface ScheduleListViewOptions {
  /**
   * Number of days shown in the list.
   * @default 7
   */
  days?: number;
}

const styles = {
  list: css({
    display: 'flex',
    flexDirection: 'column',
  }),
  day: css({
    display: 'grid',
    gridTemplateColumns: '112px minmax(0, 1fr)',
    alignItems: 'start',
    columnGap: '3',
    p: '3',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  dayLast: css({
    borderBlockEndWidth: 0,
  }),
  dayHeading: css({
    m: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '2',
    color: 'fg.muted',
    fontFamily: 'body',
    fontSize: 'lg',
    fontWeight: 'semibold',
    lineHeight: 'tight',
    whiteSpace: 'nowrap',
  }),
  dayWeekday: css({
    display: 'inline-block',
    fontSize: 'lg',
  }),
  dayNumber: css({
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    w: '30px',
    h: '30px',
    borderRadius: 'full',
    fontWeight: 'bold',
  }),
  dayNumberCurrent: css({
    bg: 'primary',
    color: 'fg.onPrimary',
  }),
  events: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
  }),
  eventRow: css({
    display: 'grid',
    gridTemplateColumns: '160px minmax(0, 1fr)',
    alignItems: 'center',
    gap: '3',
  }),
  eventPast: css({
    opacity: 0.64,
  }),
  eventContent: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    minW: 0,
  }),
  eventTime: css({
    whiteSpace: 'nowrap',
  }),
  nowRow: css({
    h: '0.5',
    bg: 'fg.danger',
    borderRadius: 'full',
  }),
} as const;

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
  const category = getCategory(categoryMap, event);
  return (
    <div
      className={cx(styles.eventRow, isPast && styles.eventPast)}
      data-state={isPast ? 'past' : undefined}>
      <Text className={styles.eventTime} color="secondary" type="supporting">
        {isDayEvent(event) ? 'All day' : getEventTimeLabel(event, timezoneID)}
      </Text>
      <div className={styles.eventContent}>
        <Tooltip content={category.label} hasHoverIndication={false}>
          <span
            aria-label={category.label}
            className={scheduleEventRecipe({color: category.color}).dot}
            role="img"
          />
        </Tooltip>
        <Text>{event.title}</Text>
      </div>
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
            return (
              <section
                className={cx(
                  styles.day,
                  index === visibleDays.length - 1 && styles.dayLast,
                )}
                key={day.toString()}>
                <h4
                  aria-current={isHighlightedDay ? 'date' : undefined}
                  aria-label={fullDate}
                  className={styles.dayHeading}>
                  <span
                    className={cx(
                      styles.dayNumber,
                      isHighlightedDay && styles.dayNumberCurrent,
                    )}>
                    {day.day}
                  </span>
                  <span className={styles.dayWeekday}>
                    {plainDateFormat(day, {weekday: 'short'})}
                  </span>
                </h4>
                <div className={styles.events}>
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
    <div
      aria-hidden="true"
      className={styles.nowRow}
      data-testid="schedule-list-current-time"
      key="current-time"
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
