'use client';

import {Check} from 'lucide-react';
import {useMemo, type ReactNode} from 'react';
import {DropdownMenu, DropdownMenuItem} from 'components/DropdownMenu';
import {Icon} from 'components/Icon';
import {useScheduleContext} from 'components/Schedule/context';
import type {
  ScheduleHeaderContent,
  SchedulePlugin,
  SchedulePluginPosition,
  ScheduleView,
  ScheduleViewBase,
} from 'components/Schedule/types';

export interface ScheduleViewSelectorOption<
  View extends ScheduleViewBase = ScheduleView,
> {
  label: string;
  view: View;
}

export interface ScheduleViewSelectorPluginOptions<
  View extends ScheduleViewBase = ScheduleView,
> {
  onChangeView?: (view: View) => void;
  position?: SchedulePluginPosition;
}

function ScheduleViewSelectorControl<View extends ScheduleViewBase>({
  onChangeView,
  options,
}: {
  onChangeView?: (view: View) => void;
  options: ReadonlyArray<ScheduleViewSelectorOption<View>>;
}): React.JSX.Element {
  const {view} = useScheduleContext();
  const currentOption = options.find(option => option.view === view);

  return (
    <DropdownMenu
      button={{
        isDisabled: onChangeView == null,
        label: currentOption?.label ?? 'View',
        size: 'sm',
      }}
      menuWidth={160}>
      {options.map(option => (
        <DropdownMenuItem
          endContent={
            option.view === view ? (
              <Icon
                color="primary"
                data-testid="schedule-view-selector-selected-icon"
                icon={Check}
                size="sm"
              />
            ) : null
          }
          key={option.label}
          label={option.label}
          onClick={() => onChangeView?.(option.view)}
        />
      ))}
    </DropdownMenu>
  );
}

function createScheduleViewSelectorPlugin<View extends ScheduleViewBase>(
  options: ReadonlyArray<ScheduleViewSelectorOption<View>>,
  {
    onChangeView,
    position = 'end',
  }: ScheduleViewSelectorPluginOptions<View> = {},
): SchedulePlugin {
  return {
    renderHeader(
      startContent: ReactNode,
      centerContent: ReactNode,
      endContent: ReactNode,
    ): ScheduleHeaderContent {
      const selector = (
        <ScheduleViewSelectorControl
          onChangeView={onChangeView}
          options={options}
        />
      );
      return position === 'start'
        ? {
            centerContent,
            endContent,
            startContent: (
              <>
                {startContent}
                {selector}
              </>
            ),
          }
        : {
            centerContent,
            endContent: (
              <>
                {endContent}
                {selector}
              </>
            ),
            startContent,
          };
    },
  };
}

export function useScheduleViewSelectorPlugin<View extends ScheduleViewBase>(
  options: ReadonlyArray<ScheduleViewSelectorOption<View>>,
  pluginOptions: ScheduleViewSelectorPluginOptions<View> = {},
): SchedulePlugin {
  const {onChangeView, position = 'end'} = pluginOptions;
  return useMemo(
    () => createScheduleViewSelectorPlugin(options, {onChangeView, position}),
    [onChangeView, options, position],
  );
}
