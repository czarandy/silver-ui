import type {Temporal} from '@js-temporal/polyfill';

export type ISODateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PlainDate = Temporal.PlainDate;

export interface DateRange {
  end: ISODateString;
  start: ISODateString;
}
