/* eslint-disable silver-ui/require-component-props -- schedule views are internal view renderers */

import {css, cx} from 'styled-system/css';
import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateFormat,
} from '../../internal/plainDate';
import {Heading, Text} from '../Text';
import {useScheduleContext} from './context';
import {enumerateDates, eventOccursOnDate} from './dateMath';
import {
  getCategory,
  getEventTimeLabel,
  ScheduleFrame,
  styles as sharedStyles,
} from './shared';
import type {
  CalendarEvent,
  ScheduleView,
  ScheduleViewComponentProps,
  ZonedDateTime,
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
    gap: '4',
    p: '3',
  }),
  day: css({
    display: 'grid',
    gridTemplateColumns: '72px 1fr',
    gap: '3',
  }),
  dayHeading: css({
    textAlign: 'center',
  }),
  dayName: css({
    display: 'block',
    color: 'fg.muted',
  }),
  dayNumber: css({
    display: 'block',
    fontSize: '2xl',
    fontWeight: 'semibold',
  }),
  events: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
  }),
  eventRow: css({
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    alignItems: 'center',
    gap: '3',
  }),
  eventContent: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    minW: 0,
  }),
} as const;

/**
 * Renders a single event row in the list view.
 */
function ListEvent({event}: {event: CalendarEvent}): React.JSX.Element {
  const {categories, timezoneID} = useScheduleContext();
  const category = getCategory(categories, event);
  return (
    <div className={styles.eventRow}>
      <Text color="secondary" type="supporting">
        {getEventTimeLabel(event, timezoneID)}
      </Text>
      <div className={styles.eventContent}>
        <span
          aria-hidden="true"
          className={cx(
            sharedStyles.eventDot,
            // event dot picks up vars from this class
            sharedStyles.event,
          )}
        />
        <Text>{event.title}</Text>
        <Text color="secondary" type="supporting">
          {category.label}
        </Text>
      </div>
    </div>
  );
}

/**
 * Internal view component that renders events as a chronological day-by-day list.
 */
function ScheduleListView(
  _props: ScheduleViewComponentProps<ScheduleListViewOptions>,
): React.JSX.Element {
  const {date, events, range, timezoneID} = useScheduleContext();
  const days = enumerateDates(range.startDate, range.endDate);
  const title = plainDateFormat(date.toPlainDate(), {
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScheduleFrame title={title} titleLabel={title}>
      <div className={cx(sharedStyles.surface, styles.list)}>
        {days.map(day => {
          const dayEvents = events.filter(event =>
            eventOccursOnDate(event, day, timezoneID),
          );
          const fullDate = plainDateFormat(day, DATE_FORMAT_WITH_WEEKDAY);
          return (
            <section className={styles.day} key={day.toString()}>
              <Heading className={styles.dayHeading} level={3} type="display-3">
                <span className={styles.dayName}>
                  {plainDateFormat(day, {weekday: 'short'})}
                </span>
                <span className={styles.dayNumber}>{day.day}</span>
                <span className={sharedStyles.visuallyHidden}>{fullDate}</span>
              </Heading>
              <div className={styles.events}>
                {dayEvents.length > 0 ? (
                  dayEvents.map(event => (
                    <ListEvent event={event} key={event.id} />
                  ))
                ) : (
                  <Text color="secondary">No events</Text>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </ScheduleFrame>
  );
}

/**
 * Creates a list schedule view configuration.
 */
export function createScheduleListView({
  days = 7,
}: ScheduleListViewOptions = {}): ScheduleView<ScheduleListViewOptions> {
  return {
    component: ScheduleListView,
    getDateRange: (date: ZonedDateTime) => [
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
