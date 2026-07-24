'use client';

import {useCallback, useMemo, type ReactNode} from 'react';
import {Button} from 'components/Button';
import {ButtonGroup} from 'components/ButtonGroup';
import {useScheduleContext} from 'components/Schedule/context';
import type {
  Instant,
  ScheduleHeaderContent,
  SchedulePlugin,
  SchedulePluginPosition,
  ScheduleZonedInstantRange,
} from 'components/Schedule/types';
import useHotkey from 'hooks/useHotkey';
import {LogicalChevronEnd, LogicalChevronStart} from 'internal/LogicalChevron';
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
  const shiftToRange = useCallback(
    (nextRange: ScheduleZonedInstantRange) => {
      onViewDateChange(
        viewDate.instant + nextRange[0].instant - currentRange[0].instant,
      );
    },
    [currentRange, onViewDateChange, viewDate],
  );
  const onPreviousDate = useCallback(() => {
    shiftToRange(previousDateRange.range);
  }, [previousDateRange, shiftToRange]);
  const onToday = useCallback(() => {
    onViewDateChange(nowEpochMilliseconds());
  }, [onViewDateChange]);
  const onNextDate = useCallback(() => {
    shiftToRange(nextDateRange.range);
  }, [nextDateRange, shiftToRange]);
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
