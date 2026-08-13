'use client';

import {useMemo} from 'react';
import type {
  SchedulePlugin,
  ScheduleTimeGridCellPropsRenderProps,
} from 'components/Schedule/types';
import {token} from 'styled-system/tokens';

const DEFAULT_UNAVAILABLE_COLOR = token('colors.bg.subtle');
const MINUTES_PER_HOUR = 60;

/**
 * A half-open unavailable range within one rendered hour cell. Minute values
 * are relative to the start of the cell: `0` is the hour boundary and `60` is
 * the next hour boundary.
 */
export interface ScheduleUnavailableRange {
  endMinute: number;
  startMinute: number;
}

export interface ScheduleAvailabilityPluginOptions {
  /**
   * Returns the unavailable portions of a time-grid cell. Ranges may be
   * unsorted or overlapping; the plugin clamps them to the cell and merges
   * them before painting. Invalid or empty ranges are ignored.
   */
  getUnavailableRanges: (
    props: ScheduleTimeGridCellPropsRenderProps,
  ) => ReadonlyArray<ScheduleUnavailableRange>;
  /**
   * CSS color used for unavailable time.
   * @default The `bg.subtle` semantic color token.
   */
  unavailableColor?: string;
}

function clampMinute(minute: number): number {
  return Math.min(MINUTES_PER_HOUR, Math.max(0, minute));
}

function normalizeUnavailableRanges(
  ranges: ReadonlyArray<ScheduleUnavailableRange>,
): ScheduleUnavailableRange[] {
  const normalized = ranges
    .filter(
      ({endMinute, startMinute}) =>
        Number.isFinite(endMinute) && Number.isFinite(startMinute),
    )
    .map(({endMinute, startMinute}) => ({
      endMinute: clampMinute(endMinute),
      startMinute: clampMinute(startMinute),
    }))
    .filter(({endMinute, startMinute}) => endMinute > startMinute)
    .sort((a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute);
  const merged: ScheduleUnavailableRange[] = [];

  for (const range of normalized) {
    const previous = merged.at(-1);
    if (previous == null || range.startMinute > previous.endMinute) {
      merged.push({...range});
    } else {
      previous.endMinute = Math.max(previous.endMinute, range.endMinute);
    }
  }

  return merged;
}

function minuteToPercent(minute: number): string {
  const percentage = Number(((minute / MINUTES_PER_HOUR) * 100).toFixed(6));
  return `${percentage}%`;
}

function unavailableRangesToBackground(
  ranges: ReadonlyArray<ScheduleUnavailableRange>,
  unavailableColor: string,
): string | undefined {
  if (ranges.length === 0) {
    return undefined;
  }
  if (
    ranges.length === 1 &&
    ranges[0]?.startMinute === 0 &&
    ranges[0].endMinute === MINUTES_PER_HOUR
  ) {
    return unavailableColor;
  }

  const stops: string[] = [];
  let minute = 0;
  for (const range of ranges) {
    if (range.startMinute > minute) {
      stops.push(
        `transparent ${minuteToPercent(minute)}`,
        `transparent ${minuteToPercent(range.startMinute)}`,
      );
    }
    stops.push(
      `${unavailableColor} ${minuteToPercent(range.startMinute)}`,
      `${unavailableColor} ${minuteToPercent(range.endMinute)}`,
    );
    minute = range.endMinute;
  }
  if (minute < MINUTES_PER_HOUR) {
    stops.push(
      `transparent ${minuteToPercent(minute)}`,
      `transparent ${minuteToPercent(MINUTES_PER_HOUR)}`,
    );
  }

  return `linear-gradient(to bottom, ${stops.join(', ')})`;
}

/**
 * Paints unavailable portions of Schedule day/week hour cells. Availability
 * resolution stays with the consumer so recurring rules, overrides, and time
 * zones can follow the application's domain model; the plugin owns range
 * normalization and theme-aware gray shading.
 */
export function useScheduleAvailabilityPlugin({
  getUnavailableRanges,
  unavailableColor = DEFAULT_UNAVAILABLE_COLOR,
}: ScheduleAvailabilityPluginOptions): SchedulePlugin {
  return useMemo(
    () => ({
      getTimeGridCellProps: props => {
        const ranges = normalizeUnavailableRanges(getUnavailableRanges(props));
        const availability =
          ranges.length === 0
            ? 'available'
            : ranges.length === 1 &&
                ranges[0]?.startMinute === 0 &&
                ranges[0].endMinute === MINUTES_PER_HOUR
              ? 'unavailable'
              : 'partial';
        const background = unavailableRangesToBackground(
          ranges,
          unavailableColor,
        );

        return {
          'data-schedule-availability': availability,
          style: background == null ? undefined : {background},
        };
      },
    }),
    [getUnavailableRanges, unavailableColor],
  );
}
