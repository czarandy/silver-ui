import {ChevronLeft, ChevronRight} from 'lucide-react';
import {useMemo, type ReactNode} from 'react';
import {Button} from '../../Button';
import {ButtonGroup} from '../../ButtonGroup';
import {useScheduleContext} from '../context';
import type {
  ScheduleHeaderContent,
  SchedulePlugin,
  SchedulePluginPosition,
} from '../types';

export interface SchedulePaginationPluginOptions {
  position?: SchedulePluginPosition;
}

function SchedulePaginationControls(): React.JSX.Element {
  const {
    nextDateLabel,
    onNextDate,
    onPreviousDate,
    onToday,
    previousDateLabel,
  } = useScheduleContext();
  return (
    <ButtonGroup label="Schedule pagination" size="sm">
      <Button
        icon={ChevronLeft}
        isIconOnly
        label={previousDateLabel}
        onClick={onPreviousDate}
      />
      <Button label="Today" onClick={onToday} size="sm" />
      <Button
        icon={ChevronRight}
        isIconOnly
        label={nextDateLabel}
        onClick={onNextDate}
      />
    </ButtonGroup>
  );
}

function createSchedulePaginationPlugin({
  position = 'start',
}: SchedulePaginationPluginOptions = {}): SchedulePlugin {
  return {
    renderHeader(
      startContent: ReactNode,
      centerContent: ReactNode,
      endContent: ReactNode,
    ): ScheduleHeaderContent {
      const controls = <SchedulePaginationControls />;
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

export const defaultSchedulePaginationPlugin = createSchedulePaginationPlugin();

export function useSchedulePaginationPlugin({
  position = 'start',
}: SchedulePaginationPluginOptions = {}): SchedulePlugin {
  return useMemo(() => createSchedulePaginationPlugin({position}), [position]);
}
