import {createContext, use} from 'react';
import type {
  CalendarEvent,
  ScheduleCategory,
  SchedulePlugin,
  ScheduleRange,
  ScheduleViewBase,
  ZonedDateTime,
} from './types';

export interface ScheduleContextValue {
  categories: ReadonlyArray<ScheduleCategory>;
  events: ReadonlyArray<CalendarEvent>;
  highlightDate: ZonedDateTime;
  isLoading: boolean;
  plugins: ReadonlyArray<SchedulePlugin>;
  range: ScheduleRange;
  timezoneID: string;
  view: ScheduleViewBase;
  viewDate: ZonedDateTime;
}

export const ScheduleContext = createContext<ScheduleContextValue | null>(null);
ScheduleContext.displayName = 'ScheduleContext';

export function useScheduleContext(): ScheduleContextValue {
  const context = use(ScheduleContext);
  if (context == null) {
    throw new Error('Schedule views must be rendered inside Schedule.');
  }
  return context;
}
