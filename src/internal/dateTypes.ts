import type {Temporal} from 'internal/temporal';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PlainDate = Temporal.PlainDate;

export interface DateRange {
  end: PlainDate;
  start: PlainDate;
}
