import {Temporal} from '@js-temporal/polyfill';
import {
  useMemo,
  type CSSProperties,
  type ReactNode,
  type RefCallback,
} from 'react';
import {usePopover} from 'components/Popover/usePopover';
import {scheduleRecipe} from 'components/Schedule/Schedule.recipe';
import {scheduleEventRecipe} from 'components/Schedule/ScheduleEvent.recipe';
import {useScheduleContext} from 'components/Schedule/context';
import {isDayEvent} from 'components/Schedule/dateMath';
import type {
  CalendarEvent,
  ScheduleCategory,
  ScheduleCategoryMap,
  ScheduleEventPopoverControls,
  ScheduleHeaderContent,
  SchedulePlugin,
} from 'components/Schedule/types';
import {Spinner} from 'components/Spinner';
import {Heading} from 'components/Text';
import isReactNode from 'internal/isReactNode';
import {
  DATE_FORMAT_MONTH_YEAR,
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateFormat,
  plainDateFromInstant,
  plainDateIsBefore,
  plainDateIsEqual,
  type PlainDate,
} from 'internal/plainDate';
import {cva} from 'styled-system/css';

/**
 * Static slot classes for the schedule shell (root, frame/header, surface).
 * The recipe carries no variants, so a single evaluation is shared by the
 * shell and every view.
 */
export const scheduleClasses = scheduleRecipe();

const categoryFallback: ScheduleCategory = {label: 'Event', color: 'blue'};

const currentTimeIndicator = cva({
  base: {
    h: '0.5',
    bg: 'surface.orange.accent',
    borderRadius: 'full',
    pointerEvents: 'none',
    _before: {
      content: '""',
      position: 'absolute',
      insetInlineStart: '-6px',
      top: '50%',
      w: '2.5',
      h: '2.5',
      borderRadius: 'full',
      bg: 'surface.orange.accent',
      transform: 'translateY(-50%)',
    },
  },
  variants: {
    layout: {
      list: {
        position: 'relative',
      },
      timeGrid: {
        position: 'absolute',
        insetInline: '0',
        transform: 'translateY(2px)',
        zIndex: '20',
      },
    },
  },
});

/**
 * Shared current-time marker used by the list and time-grid schedule views.
 */
export function ScheduleCurrentTimeIndicator({
  layout,
  testId,
  style,
}: {
  layout: 'list' | 'timeGrid';
  testId: string;
  style?: CSSProperties;
}): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={currentTimeIndicator({layout})}
      data-testid={testId}
      style={style}
    />
  );
}

export function createCategoryMap(
  categories: ReadonlyArray<ScheduleCategory>,
): ScheduleCategoryMap {
  const categoryMap = new Map<string, ScheduleCategory>();
  categories.forEach(category => {
    if (!categoryMap.has(category.label)) {
      categoryMap.set(category.label, category);
    }
  });
  return categoryMap;
}

export function getCategory(
  categoryMap: ScheduleCategoryMap,
  event: CalendarEvent,
): ScheduleCategory {
  return (
    (event.category == null ? undefined : categoryMap.get(event.category)) ??
    (event.category != null
      ? {label: event.category, color: categoryFallback.color}
      : categoryFallback)
  );
}

export function formatDate(date: PlainDate): string {
  return plainDateFormat(date, DATE_FORMAT_WITH_WEEKDAY);
}

export function formatMonthTitle(date: PlainDate): string {
  return plainDateFormat(date, DATE_FORMAT_MONTH_YEAR);
}

export function formatWeekTitle(start: PlainDate, end: PlainDate): string {
  if (start.year === end.year && start.month === end.month) {
    return formatMonthTitle(start);
  }

  const startMonth = plainDateFormat(start, {month: 'long'});
  const endMonth = plainDateFormat(end, {month: 'long'});
  return start.year === end.year
    ? `${startMonth} - ${endMonth} ${end.year}`
    : `${startMonth} ${start.year} - ${endMonth} ${end.year}`;
}

export function formatListRangeTitle(start: PlainDate, end: PlainDate): string {
  return plainDateIsEqual(start, end)
    ? formatDate(start)
    : formatWeekTitle(start, end);
}

function formatTime(instant: number, timezoneID: string): string {
  return Temporal.Instant.fromEpochMilliseconds(instant)
    .toZonedDateTimeISO(timezoneID)
    .toLocaleString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
}

export function formatTimezoneAbbreviation(
  date: PlainDate,
  timezoneID: string,
): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    timeZone: timezoneID,
    timeZoneName: 'short',
  });
  const parts = formatter.formatToParts(
    date.toZonedDateTime(timezoneID).epochMilliseconds,
  );
  return parts.find(part => part.type === 'timeZoneName')?.value ?? timezoneID;
}

export function formatHour(hour: number): string {
  return Temporal.PlainTime.from({hour}).toLocaleString(undefined, {
    hour: 'numeric',
  });
}

export function getEventTimeLabel(
  event: CalendarEvent,
  timezoneID: string,
): string {
  if (isDayEvent(event)) {
    return 'all day';
  }

  return `${formatTime(event.start, timezoneID)} - ${formatTime(event.end, timezoneID)}`;
}

function getEventStartTimeLabel(
  event: CalendarEvent,
  timezoneID: string,
): string | null {
  return isDayEvent(event) ? null : formatTime(event.start, timezoneID);
}

export function getEventAccessibleLabel(
  event: CalendarEvent,
  categoryMap: ScheduleCategoryMap,
  timezoneID: string,
): string {
  const category = getCategory(categoryMap, event);
  return `${event.title}, ${category.label}, ${getEventTimeLabel(event, timezoneID)}`;
}

export function getMinutesSinceStartOfDay(
  instant: number,
  timezoneID: string,
): number {
  const zonedTime = Temporal.Instant.fromEpochMilliseconds(instant)
    .toZonedDateTimeISO(timezoneID)
    .toPlainTime();
  return zonedTime.hour * 60 + zonedTime.minute;
}

export function isEventInPast(
  event: CalendarEvent,
  currentTime: number,
  timezoneID: string,
): boolean {
  if (isDayEvent(event)) {
    return plainDateIsBefore(
      event.end,
      plainDateFromInstant(currentTime, timezoneID),
    );
  }

  return event.end <= currentTime;
}

/**
 * ARIA/positioning props spread onto an event pill that has been promoted to a
 * clickable `<button>` trigger by {@link useScheduleEventPopover}.
 */
export interface ScheduleEventTriggerProps {
  'aria-controls': string;
  'aria-expanded': boolean;
  'aria-haspopup': 'dialog' | 'menu';
  onClick: () => void;
  ref: RefCallback<HTMLElement>;
}

/**
 * Whether any registered plugin provides event popover content, meaning event
 * pills should render as interactive triggers.
 */
export function hasEventPopoverPlugin(
  plugins: ReadonlyArray<SchedulePlugin>,
): boolean {
  return plugins.some(plugin => plugin.renderEventPopover != null);
}

/**
 * Wires an event pill to its popover when an event popover plugin is active.
 * Returns `triggerProps` to spread onto the pill's `<button>` root and the
 * rendered `popover` layer to place as a sibling. Both are `undefined` when no
 * plugin supplies content for the event, in which case the pill stays a static,
 * non-interactive element (unchanged default behavior).
 */
export function useScheduleEventPopover(event: CalendarEvent): {
  popover?: ReactNode;
  triggerProps?: ScheduleEventTriggerProps;
} {
  const {categoryMap, plugins, timezoneID} = useScheduleContext();
  const popover = usePopover({
    // Content renders its own close affordance via the `controls.close` passed
    // to renderEventPopover, so suppress the built-in close button.
    hasCloseButton: false,
    label: getEventAccessibleLabel(event, categoryMap, timezoneID),
    role: 'dialog',
  });
  const {hide} = popover;
  const controls = useMemo(
    (): ScheduleEventPopoverControls => ({close: hide}),
    [hide],
  );
  const content = useMemo((): ReactNode => {
    for (const plugin of plugins) {
      const node = plugin.renderEventPopover?.(event, controls);
      if (isReactNode(node)) {
        return node;
      }
    }
    return null;
  }, [controls, event, plugins]);
  if (!isReactNode(content)) {
    return {};
  }
  return {
    popover: popover.render(content, {
      alignment: 'start',
      offsetX: 8,
      offsetY: -3,
      placement: 'end',
    }),
    triggerProps: {
      ...popover.triggerProps,
      onClick: popover.toggle,
      ref: popover.triggerRef,
    },
  };
}

/**
 * Renders an event pill root as either a clickable `<button>` trigger (when
 * `triggerProps` is supplied) or a static `<span>`, keeping identical classes
 * and data attributes so the two forms look the same.
 */
function EventPillRoot({
  children,
  className,
  dataState,
  dataTestId,
  triggerProps,
}: {
  children: ReactNode;
  className?: string;
  dataState?: 'past';
  dataTestId: string;
  triggerProps?: ScheduleEventTriggerProps;
}): React.JSX.Element {
  if (triggerProps != null) {
    return (
      <button
        className={className}
        data-state={dataState}
        data-testid={dataTestId}
        type="button"
        {...triggerProps}>
        {children}
      </button>
    );
  }
  return (
    <span className={className} data-state={dataState} data-testid={dataTestId}>
      {children}
    </span>
  );
}

/**
 * Renders a colored pill displaying an event's accessible label.
 */
export function CalendarEventPill({
  event,
  isPast = false,
}: {
  event: CalendarEvent;
  isPast?: boolean;
}): React.JSX.Element {
  const {categoryMap, timezoneID} = useScheduleContext();
  const {popover, triggerProps} = useScheduleEventPopover(event);
  const category = getCategory(categoryMap, event);
  const classes = scheduleEventRecipe({
    color: category.color,
    isPast,
    isInteractive: triggerProps != null,
  });
  return (
    <>
      <EventPillRoot
        className={classes.event}
        dataState={isPast ? 'past' : undefined}
        dataTestId={`schedule-event-${event.id}`}
        triggerProps={triggerProps}>
        <span className={classes.title}>
          {isDayEvent(event)
            ? event.title
            : getEventAccessibleLabel(event, categoryMap, timezoneID)}
        </span>
      </EventPillRoot>
      {popover}
    </>
  );
}

export function CalendarMonthEventPill({
  event,
  isPast = false,
}: {
  event: CalendarEvent;
  isPast?: boolean;
}): React.JSX.Element {
  const {categoryMap, timezoneID} = useScheduleContext();
  const {popover, triggerProps} = useScheduleEventPopover(event);
  const category = getCategory(categoryMap, event);
  const startTimeLabel = getEventStartTimeLabel(event, timezoneID);
  const classes = scheduleEventRecipe({
    color: category.color,
    isPast,
    isFullWidth: true,
    isInteractive: triggerProps != null,
  });
  return (
    <>
      <EventPillRoot
        className={classes.event}
        dataState={isPast ? 'past' : undefined}
        dataTestId={`schedule-event-${event.id}`}
        triggerProps={triggerProps}>
        {startTimeLabel != null ? (
          <span className={classes.time}>{startTimeLabel}</span>
        ) : null}
        <span className={classes.title}>{event.title}</span>
      </EventPillRoot>
      {popover}
    </>
  );
}

/**
 * Layout wrapper that renders the schedule header (with plugin slots) and body.
 */
export function ScheduleFrame({
  children,
  title,
  titleLabel,
}: {
  /**
   * View content rendered below the header.
   */
  children: ReactNode;
  /**
   * Title displayed in the header center slot.
   */
  title: ReactNode;
  /**
   * Accessible label for the enclosing section.
   */
  titleLabel: string;
}): React.JSX.Element {
  const {isLoading, plugins} = useScheduleContext();
  const initialHeader: ScheduleHeaderContent = {
    startContent: null,
    centerContent: (
      <span className={scheduleClasses.headerTitleContent}>
        <Heading level={2}>{title}</Heading>
        {isLoading ? (
          <Spinner
            aria-label="Loading events"
            className={scheduleClasses.headerTitleSpinner}
            size="sm"
          />
        ) : null}
      </span>
    ),
    endContent: null,
  };
  const header = plugins.reduce(
    (content, plugin) =>
      plugin.renderHeader?.(
        content.startContent,
        content.centerContent,
        content.endContent,
      ) ?? content,
    initialHeader,
  );

  return (
    <section aria-label={titleLabel} className={scheduleClasses.frame}>
      <div className={scheduleClasses.header}>
        <div className={scheduleClasses.headerSlotStart}>
          {header.startContent}
        </div>
        <div className={scheduleClasses.headerSlotCenter}>
          {header.centerContent}
        </div>
        <div className={scheduleClasses.headerSlotEnd}>{header.endContent}</div>
      </div>
      {children}
    </section>
  );
}
