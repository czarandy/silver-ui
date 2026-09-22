'use client';

import {useCallback, useRef, type ReactNode, type RefCallback} from 'react';
import {
  useHoverCard,
  type UseHoverCardOptions,
} from 'components/HoverCard/useHoverCard';
import {
  type EntryPointParams,
  type PreloadedContentOptions,
  type SurfaceRuntimeProps,
  usePreloadedEntryPoint,
} from 'relay/usePreloadedEntryPoint';

export type UsePreloadedHoverCardOptions<TEntryPoint> = Omit<
  UseHoverCardOptions,
  'onHide' | 'onShow'
> &
  PreloadedContentOptions & {
    entryPointParams: EntryPointParams<TEntryPoint>;
    onHide?: () => void;
    onShow?: () => void;
    runtimeProps: SurfaceRuntimeProps<TEntryPoint>;
  };

export interface PreloadedHoverCardTriggerProps {
  'aria-describedby': string;
  ref: RefCallback<HTMLElement>;
}

export interface PreloadedHoverCardController {
  element: ReactNode;
  hide: () => void;
  isOpen: boolean;
  triggerProps: PreloadedHoverCardTriggerProps;
  triggerRef: RefCallback<HTMLElement>;
}

/**
 * Creates a HoverCard backed by a lazily loaded Relay EntryPoint.
 */
export function usePreloadedHoverCard<TEntryPoint>(
  entryPoint: TEntryPoint,
  {
    entryPointParams,
    errorFallback,
    loadingFallback,
    onHide,
    onShow,
    runtimeProps,
    ...hoverCardOptions
  }: UsePreloadedHoverCardOptions<TEntryPoint>,
): PreloadedHoverCardController {
  const controller = usePreloadedEntryPoint(entryPoint, {
    errorFallback,
    loadingFallback,
  });
  const hoverCard = useHoverCard({
    ...hoverCardOptions,
    onHide: () => {
      controller.hide();
      onHide?.();
    },
    onShow: () => {
      controller.show(entryPointParams, runtimeProps);
      onShow?.();
    },
  });
  const intentElementRef = useRef<HTMLElement | null>(null);
  const preload = useCallback(
    (): void => controller.preload(entryPointParams),
    [controller, entryPointParams],
  );
  const triggerRef = useCallback<RefCallback<HTMLElement>>(
    element => {
      const previousElement = intentElementRef.current;
      previousElement?.removeEventListener('pointerenter', preload);
      previousElement?.removeEventListener('focusin', preload);
      intentElementRef.current = element;
      element?.addEventListener('pointerenter', preload);
      element?.addEventListener('focusin', preload);
      hoverCard.ref(element);
    },
    [hoverCard, preload],
  );
  const hide = useCallback((): void => {
    controller.hide();
    hoverCard.hide();
  }, [controller, hoverCard]);

  return {
    element: hoverCard.renderHoverCard(controller.content(hide)),
    hide,
    isOpen: controller.isOpen,
    triggerProps: {
      'aria-describedby': hoverCard.describedBy,
      ref: triggerRef,
    },
    triggerRef,
  };
}
