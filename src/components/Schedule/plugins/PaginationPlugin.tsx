'use client';

import {ChevronLeft, ChevronRight} from 'lucide-react';
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
import {nowEpochMilliseconds} from 'internal/time';

export interface SchedulePaginationPluginOptions {
  onViewDateChange: (date: Instant) => void;
  position?: SchedulePluginPosition;
}

function SchedulePaginationControls({
  onViewDateChange,
}: {
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

  return (
    <ButtonGroup label="Schedule pagination">
      <Button
        icon={ChevronLeft}
        isIconOnly
        label={previousDateRange.label}
        onClick={onPreviousDate}
      />
      <Button label="Today" onClick={onToday} />
      <Button
        icon={ChevronRight}
        isIconOnly
        label={nextDateRange.label}
        onClick={onNextDate}
      />
    </ButtonGroup>
  );
}

function createSchedulePaginationPlugin({
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
        <SchedulePaginationControls onViewDateChange={onViewDateChange} />
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
  onViewDateChange,
  position = 'start',
}: SchedulePaginationPluginOptions): SchedulePlugin {
  return useMemo(
    () => createSchedulePaginationPlugin({onViewDateChange, position}),
    [onViewDateChange, position],
  );
}
