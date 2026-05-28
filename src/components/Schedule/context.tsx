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
  date: ZonedDateTime;
  events: ReadonlyArray<CalendarEvent>;
  focusDate: ZonedDateTime;
  isLoading: boolean;
  nextDateLabel: string;
  onNextDate: () => void;
  onPreviousDate: () => void;
  onToday: () => void;
  plugins: ReadonlyArray<SchedulePlugin>;
  previousDateLabel: string;
  range: ScheduleRange;
  timezoneID: string;
  view: ScheduleViewBase;
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
