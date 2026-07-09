import type {HTMLAttributes, ReactNode} from 'react';
import type {
  CalendarEvent,
  ScheduleCategory,
} from 'components/Schedule/CalendarEvent';
import type {
  ScheduleZonedInstant,
  ScheduleZonedInstantRange,
} from 'components/Schedule/scheduleZonedInstant';
import type {PlainDate} from 'internal/dateTypes';

export type {PlainDate} from 'internal/dateTypes';
export type {
  CalendarDayEvent,
  CalendarEvent,
  CalendarEventBase,
  CalendarInstantEvent,
  ScheduleCategory,
  ScheduleEventColor,
} from 'components/Schedule/CalendarEvent';
export type {
  ScheduleZonedInstant,
  ScheduleZonedInstantRange,
} from 'components/Schedule/scheduleZonedInstant';

export type Instant = number;

export type ScheduleEventSource =
  | ReadonlyArray<CalendarEvent>
  | ((start: Instant, end: Instant) => Promise<ReadonlyArray<CalendarEvent>>);

export type ScheduleDate = Instant;

export type ScheduleCategoryMap = ReadonlyMap<string, ScheduleCategory>;

export interface ScheduleRange {
  end: Instant;
  endDate: PlainDate;
  start: Instant;
  startDate: PlainDate;
}

export type ScheduleViewOptions = object;

export interface ScheduleViewComponentProps<
  Options extends ScheduleViewOptions = ScheduleViewOptions,
> {
  options: Options;
}

export interface ScheduleNavigationRange {
  label: string;
  range: ScheduleZonedInstantRange;
}

export type ScheduleViewComponent<
  Options extends ScheduleViewOptions = ScheduleViewOptions,
> = (props: ScheduleViewComponentProps<Options>) => ReactNode;

export interface ScheduleViewBase {
  getDateRange: (date: ScheduleZonedInstant) => ScheduleZonedInstantRange;
  getNextDateRange: (date: ScheduleZonedInstant) => ScheduleNavigationRange;
  getPreviousDateRange: (date: ScheduleZonedInstant) => ScheduleNavigationRange;
}

export interface ScheduleView<
  Options extends ScheduleViewOptions = ScheduleViewOptions,
> extends ScheduleViewBase {
  component: ScheduleViewComponent<Options>;
  options: Options;
}

export interface ScheduleHeaderContent {
  centerContent: ReactNode;
  endContent: ReactNode;
  startContent: ReactNode;
}

export type SchedulePluginPosition = 'start' | 'end';

export interface ScheduleEventPopoverControls {
  /**
   * Closes the open event popover.
   */
  close: () => void;
}

export interface ScheduleTimeGridEventRenderProps {
  event: CalendarEvent;
  hourHeight: number;
  maxHour: number;
  minHour: number;
  timezoneID: string;
}

export interface ScheduleEventPropsRenderProps {
  event: CalendarEvent;
  layout: 'inline' | 'month' | 'timeGrid';
  timezoneID: string;
}

export interface ScheduleMonthCellPropsRenderProps {
  date: PlainDate;
  timezoneID: string;
}

export interface ScheduleTimeGridCellPropsRenderProps {
  date: PlainDate;
  hour: number;
  hourHeight: number;
  maxHour: number;
  minHour: number;
  timezoneID: string;
}

export interface SchedulePlugin {
  getEventProps?: (
    props: ScheduleEventPropsRenderProps,
  ) => HTMLAttributes<HTMLElement>;
  getMonthCellProps?: (
    props: ScheduleMonthCellPropsRenderProps,
  ) => HTMLAttributes<HTMLElement>;
  getTimeGridCellProps?: (
    props: ScheduleTimeGridCellPropsRenderProps,
  ) => HTMLAttributes<HTMLElement>;
  /**
   * Provides the popover content shown when an event pill is clicked. Receives
   * `controls` (e.g. `close`) so content can dismiss the popover. Return
   * `null`/`undefined` to decline (e.g. to opt out for a specific event). When
   * multiple plugins implement this, the first to return non-nullish content
   * wins.
   */
  renderEventPopover?: (
    event: CalendarEvent,
    controls: ScheduleEventPopoverControls,
  ) => ReactNode;
  renderHeader?: (
    startContent: ReactNode,
    centerContent: ReactNode,
    endContent: ReactNode,
  ) => ScheduleHeaderContent;
  /**
   * Appends content inside each hour cell in day/week time-grid views, as a
   * sibling of the cell's event blocks. Use it to render overlays anchored to
   * the cell (e.g. a draft event). Return `null`/`undefined` to opt out for a
   * specific cell.
   */
  renderTimeGridCellContent?: (
    props: ScheduleTimeGridCellPropsRenderProps,
  ) => ReactNode;
  /**
   * Appends content inside timed event blocks in day/week time-grid views.
   * Return `null`/`undefined` to opt out for a specific event.
   */
  renderTimeGridEventContent?: (
    props: ScheduleTimeGridEventRenderProps,
  ) => ReactNode;
}
