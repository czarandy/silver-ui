import {Temporal} from '@js-temporal/polyfill';

export function nowEpochMilliseconds(): number {
  return Temporal.Now.instant().epochMilliseconds;
}

export function getBrowserTimezoneID(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function nowMonotonicMilliseconds(): number {
  return performance.now();
}
