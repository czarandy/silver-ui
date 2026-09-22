'use client';

import {useCallback, type ReactNode} from 'react';
import type {PopoverProps} from 'components/Popover';
import {
  usePopover,
  type UsePopoverOptions,
  type UsePopoverReturn,
} from 'components/Popover/usePopover';
import {
  type EntryPointParams,
  type PreloadedContentOptions,
  type SurfaceRuntimeProps,
  usePreloadedEntryPoint,
} from 'relay/usePreloadedEntryPoint';

export type UsePreloadedPopoverOptions = UsePopoverOptions &
  PreloadedContentOptions & {
    alignment?: PopoverProps['alignment'];
    className?: string;
    'data-testid'?: string;
    offsetX?: number;
    offsetY?: number;
    placement?: PopoverProps['placement'];
  };

export interface PreloadedPopoverController<TEntryPoint> {
  element: ReactNode;
  hide: () => void;
  isOpen: boolean;
  preload: (params: EntryPointParams<TEntryPoint>) => void;
  show: (
    params: EntryPointParams<TEntryPoint>,
    runtimeProps: SurfaceRuntimeProps<TEntryPoint>,
  ) => void;
  triggerProps: UsePopoverReturn['triggerProps'];
  triggerRef: UsePopoverReturn['triggerRef'];
}

/**
 * Creates a Popover backed by a lazily loaded Relay EntryPoint.
 */
export function usePreloadedPopover<TEntryPoint>(
  entryPoint: TEntryPoint,
  {
    alignment = 'start',
    className,
    'data-testid': dataTestId,
    errorFallback,
    loadingFallback,
    offsetX,
    offsetY,
    placement = 'below',
    ...popoverOptions
  }: UsePreloadedPopoverOptions = {},
): PreloadedPopoverController<TEntryPoint> {
  const controller = usePreloadedEntryPoint(entryPoint, {
    errorFallback,
    loadingFallback,
  });
  const popover = usePopover({
    ...popoverOptions,
    onHide: () => {
      controller.hide();
      popoverOptions.onHide?.();
    },
    onShow: popoverOptions.onShow,
  });
  const hide = useCallback((): void => {
    controller.hide();
    popover.hide();
  }, [controller, popover]);
  const show = useCallback(
    (
      params: EntryPointParams<TEntryPoint>,
      runtimeProps: SurfaceRuntimeProps<TEntryPoint>,
    ): void => {
      controller.show(params, runtimeProps);
      popover.show();
    },
    [controller, popover],
  );
  const element = popover.render(
    <div className={className} data-testid={dataTestId}>
      {controller.content(hide)}
    </div>,
    {alignment, offsetX, offsetY, placement},
  );

  return {
    element,
    hide,
    isOpen: controller.isOpen,
    preload: controller.preload,
    show,
    triggerProps: popover.triggerProps,
    triggerRef: popover.triggerRef,
  };
}
