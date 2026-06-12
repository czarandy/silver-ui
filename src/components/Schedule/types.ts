import type {ReactNode} from 'react';
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

export interface SchedulePlugin {
  renderHeader?: (
    startContent: ReactNode,
    centerContent: ReactNode,
    endContent: ReactNode,
  ) => ScheduleHeaderContent;
}
