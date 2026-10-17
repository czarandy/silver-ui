'use client';

import {useMemo, type ReactNode} from 'react';
import {DropdownMenu, DropdownMenuItem} from 'components/DropdownMenu';
import {Kbd} from 'components/Kbd';
import {useScheduleContext} from 'components/Schedule/context';
import type {
  ScheduleHeaderContent,
  SchedulePlugin,
  SchedulePluginPosition,
  ScheduleView,
  ScheduleViewBase,
} from 'components/Schedule/types';
import useHotkey from 'hooks/useHotkey';

function normalizeHotkey(hotkey: string | undefined): string | null {
  const normalizedHotkey = hotkey?.trim();
  return normalizedHotkey == null || normalizedHotkey.length === 0
    ? null
    : normalizedHotkey;
}

export interface ScheduleViewSelectorOption<
  View extends ScheduleViewBase = ScheduleView,
> {
  /**
   * Key that switches to this view. Matching is case-insensitive.
   */
  hotkey?: string;
  label: string;
  view: View;
}

export interface ScheduleViewSelectorPluginOptions<
  View extends ScheduleViewBase = ScheduleView,
> {
  onChangeView?: (view: View) => void;
  position?: SchedulePluginPosition;
}

function ScheduleViewHotkey<View extends ScheduleViewBase>({
  hotkey,
  onChangeView,
  view,
}: {
  hotkey: string;
  onChangeView: ((view: View) => void) | undefined;
  view: View;
}): null {
  useHotkey(
    hotkey,
    event => {
      if (event.defaultPrevented || event.repeat) {
        return;
      }
      event.preventDefault();
      onChangeView?.(view);
    },
    {isEnabled: onChangeView != null},
  );
  return null;
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
    <>
      {options.map(option => {
        const hotkey = normalizeHotkey(option.hotkey);
        return hotkey == null ? null : (
          <ScheduleViewHotkey
            hotkey={hotkey}
            key={`${hotkey}-${option.label}`}
            onChangeView={onChangeView}
            view={option.view}
          />
        );
      })}
      <DropdownMenu
        button={{
          isDisabled: onChangeView == null,
          label: currentOption?.label ?? 'View',
        }}
        menuWidth={160}>
        {options.map(option => {
          const hotkey = normalizeHotkey(option.hotkey);
          const isSelected = option.view === view;
          return (
            <DropdownMenuItem
              aria-keyshortcuts={hotkey ?? undefined}
              endContent={
                hotkey != null ? (
                  <Kbd aria-hidden={true} keys={hotkey} size="sm" />
                ) : null
              }
              isSelected={isSelected}
              key={option.label}
              label={option.label}
              onClick={() => onChangeView?.(option.view)}
              selectionMode="radio"
            />
          );
        })}
      </DropdownMenu>
    </>
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
