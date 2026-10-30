'use client';

import {useCallback, useMemo, type ReactNode} from 'react';
import {Button} from 'components/Button';
import {ButtonGroup} from 'components/ButtonGroup';
import {useScheduleContext} from 'components/Schedule/context';
import type {
  Instant,
  ScheduleHeaderContent,
  ScheduleNavigationRange,
  SchedulePlugin,
  SchedulePluginPosition,
  ScheduleZonedInstant,
} from 'components/Schedule/types';
import useHotkey from 'hooks/useHotkey';
import {LogicalChevronEnd, LogicalChevronStart} from 'internal/LogicalChevron';
import {Temporal} from 'internal/temporal';
import {nowEpochMilliseconds} from 'internal/time';

export interface SchedulePaginationPluginOptions {
  /**
   * Whether ArrowLeft and ArrowRight navigate to the previous and next range.
   * @default false
   */
  hasHotkeys?: boolean;
  onViewDateChange: (date: Instant) => void;
  position?: SchedulePluginPosition;
}

function toZonedDateTime(date: ScheduleZonedInstant): Temporal.ZonedDateTime {
  return Temporal.Instant.fromEpochMilliseconds(
    date.instant,
  ).toZonedDateTimeISO(date.timezoneID);
}

function SchedulePaginationControls({
  hasHotkeys,
  onViewDateChange,
}: {
  hasHotkeys: boolean;
  onViewDateChange: (date: Instant) => void;
}): React.JSX.Element {
  const {view, viewDate} = useScheduleContext();
  const currentRange = useMemo(
    () => view.getDateRange(viewDate),
    [view, viewDate],
  );
  const previousDateRange = useMemo(
    () => view.getPreviousDateRange(viewDate),
    [view, viewDate],
  );
  const nextDateRange = useMemo(
    () => view.getNextDateRange(viewDate),
    [view, viewDate],
  );
  // Keep the view date's position in the range, measured in calendar days and
  // then time, so a range that spans a daylight saving change keeps the view
  // date's weekday and time of day.
  const navigateTo = useCallback(
    ({range, viewDate: next}: ScheduleNavigationRange) => {
      if (next != null) {
        onViewDateChange(next.instant);
        return;
      }
      const shift = toZonedDateTime(currentRange[0]).until(
        toZonedDateTime(range[0]),
        {largestUnit: 'days'},
      );
      onViewDateChange(toZonedDateTime(viewDate).add(shift).epochMilliseconds);
    },
    [currentRange, onViewDateChange, viewDate],
  );
  const onPreviousDate = useCallback(() => {
    navigateTo(previousDateRange);
  }, [navigateTo, previousDateRange]);
  const onToday = useCallback(() => {
    onViewDateChange(nowEpochMilliseconds());
  }, [onViewDateChange]);
  const onNextDate = useCallback(() => {
    navigateTo(nextDateRange);
  }, [navigateTo, nextDateRange]);
  useHotkey(
    'left',
    event => {
      if (event.defaultPrevented || event.repeat) {
        return;
      }
      event.preventDefault();
      onPreviousDate();
    },
    {isEnabled: hasHotkeys},
  );
  useHotkey(
    'right',
    event => {
      if (event.defaultPrevented || event.repeat) {
        return;
      }
      event.preventDefault();
      onNextDate();
    },
    {isEnabled: hasHotkeys},
  );

  return (
    <ButtonGroup label="Schedule pagination">
      <Button
        aria-keyshortcuts={hasHotkeys ? 'ArrowLeft' : undefined}
        icon={LogicalChevronStart}
        isIconOnly
        label={previousDateRange.label}
        onClick={onPreviousDate}
      />
      <Button label="Today" onClick={onToday} />
      <Button
        aria-keyshortcuts={hasHotkeys ? 'ArrowRight' : undefined}
        icon={LogicalChevronEnd}
        isIconOnly
        label={nextDateRange.label}
        onClick={onNextDate}
      />
    </ButtonGroup>
  );
}

function createSchedulePaginationPlugin({
  hasHotkeys = false,
  onViewDateChange,
  position = 'start',
}: SchedulePaginationPluginOptions): SchedulePlugin {
  return {
    renderHeader(
      startContent: ReactNode,
      centerContent: ReactNode,
      endContent: ReactNode,
    ): ScheduleHeaderContent {
      const controls = (
        <SchedulePaginationControls
          hasHotkeys={hasHotkeys}
          onViewDateChange={onViewDateChange}
        />
      );
      return position === 'start'
        ? {
            centerContent,
            endContent,
            startContent: (
              <>
                {controls}
                {startContent}
              </>
            ),
          }
        : {
            centerContent,
            endContent: (
              <>
                {endContent}
                {controls}
              </>
            ),
            startContent,
          };
    },
  };
}

export function useSchedulePaginationPlugin({
  hasHotkeys = false,
  onViewDateChange,
  position = 'start',
}: SchedulePaginationPluginOptions): SchedulePlugin {
  return useMemo(
    () =>
      createSchedulePaginationPlugin({
        hasHotkeys,
        onViewDateChange,
        position,
      }),
    [hasHotkeys, onViewDateChange, position],
  );
}
