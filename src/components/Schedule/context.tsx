'use client';

import {createContext, use} from 'react';
import type {
  CalendarEvent,
  ScheduleCategory,
  ScheduleCategoryMap,
  ScheduleEventBorderStyle,
  SchedulePlugin,
  ScheduleRange,
  ScheduleViewBase,
  ScheduleZonedInstant,
} from 'components/Schedule/types';

export interface ScheduleContextValue {
  categories: ReadonlyArray<ScheduleCategory>;
  categoryMap: ScheduleCategoryMap;
  eventBorderStyle: ScheduleEventBorderStyle;
  events: ReadonlyArray<CalendarEvent>;
  highlightDate: ScheduleZonedInstant;
  isLoading: boolean;
  plugins: ReadonlyArray<SchedulePlugin>;
  range: ScheduleRange;
  timezoneID: string;
  view: ScheduleViewBase;
  viewDate: ScheduleZonedInstant;
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
