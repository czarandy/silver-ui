import type {ReactNode} from 'react';
import type {PlainDate} from '../../internal/dateTypes';
import type {CalendarEvent, ScheduleCategory} from './CalendarEvent';
import type {ZonedDateTime, ZonedDateTimeRange} from './zonedDateTime';

export type {PlainDate} from '../../internal/dateTypes';
export type {
  CalendarDayEvent,
  CalendarEvent,
  CalendarEventBase,
  CalendarInstantEvent,
  ScheduleCategory,
  ScheduleEventColor,
} from './CalendarEvent';
export type {ZonedDateTime, ZonedDateTimeRange} from './zonedDateTime';

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
  range: ZonedDateTimeRange;
}

export type ScheduleViewComponent<
  Options extends ScheduleViewOptions = ScheduleViewOptions,
> = (props: ScheduleViewComponentProps<Options>) => ReactNode;

export interface ScheduleViewBase {
  getDateRange: (date: ZonedDateTime) => ZonedDateTimeRange;
  getNextDateRange: (date: ZonedDateTime) => ScheduleNavigationRange;
  getPreviousDateRange: (date: ZonedDateTime) => ScheduleNavigationRange;
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

export interface SchedulePlugin {
  renderHeader?: (
    startContent: ReactNode,
    centerContent: ReactNode,
    endContent: ReactNode,
  ) => ScheduleHeaderContent;
}
