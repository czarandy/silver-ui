'use client';

import {Check} from 'lucide-react';
import {useEffect, useMemo, type ReactNode} from 'react';
import {DropdownMenu, DropdownMenuItem} from 'components/DropdownMenu';
import {Icon} from 'components/Icon';
import {Kbd} from 'components/Kbd';
import {useScheduleContext} from 'components/Schedule/context';
import type {
  ScheduleHeaderContent,
  SchedulePlugin,
  SchedulePluginPosition,
  ScheduleView,
  ScheduleViewBase,
} from 'components/Schedule/types';
import {isComposingEvent} from 'internal/isComposingEvent';
import {css} from 'styled-system/css';

const styles = {
  optionEndContent: css({
    alignItems: 'center',
    display: 'inline-flex',
    gap: '2',
  }),
} as const;

const EDITABLE_TARGET_SELECTOR =
  'input, select, textarea, [contenteditable]:not([contenteditable="false"]), [role="textbox"]';

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(EDITABLE_TARGET_SELECTOR) != null
  );
}

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

function ScheduleViewSelectorControl<View extends ScheduleViewBase>({
  onChangeView,
  options,
}: {
  onChangeView?: (view: View) => void;
  options: ReadonlyArray<ScheduleViewSelectorOption<View>>;
}): React.JSX.Element {
  const {view} = useScheduleContext();
  const currentOption = options.find(option => option.view === view);

  useEffect(() => {
    if (
      onChangeView == null ||
      !options.some(option => normalizeHotkey(option.hotkey) != null)
    ) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isComposingEvent(event) ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      const pressedKey = event.key.toLowerCase();
      const nextOption = options.find(
        option => normalizeHotkey(option.hotkey)?.toLowerCase() === pressedKey,
      );
      if (nextOption == null) {
        return;
      }

      event.preventDefault();
      onChangeView(nextOption.view);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onChangeView, options]);

  return (
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
              hotkey != null || isSelected ? (
                <span className={styles.optionEndContent}>
                  {hotkey != null ? (
                    <span aria-hidden="true">
                      <Kbd keys={hotkey} size="sm" />
                    </span>
                  ) : null}
                  {isSelected ? (
                    <Icon
                      color="primary"
                      data-testid="schedule-view-selector-selected-icon"
                      icon={Check}
                      size="sm"
                    />
                  ) : null}
                </span>
              ) : null
            }
            key={option.label}
            label={option.label}
            onClick={() => onChangeView?.(option.view)}
          />
        );
      })}
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
