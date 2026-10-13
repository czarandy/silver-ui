'use client';

import type {ReactNode} from 'react';
import {Drawer, type DrawerProps} from 'components/Drawer';
import {PreloadedSurfaceLoadingFallback} from 'relay/PreloadedSurfaceLoadingFallback';
import {
  type EntryPointParams,
  type PreloadedContentOptions,
  type SurfaceRuntimeProps,
  usePreloadedEntryPoint,
} from 'relay/usePreloadedEntryPoint';

export type UsePreloadedDrawerOptions = Omit<
  DrawerProps,
  'children' | 'isOpen' | 'onOpenChange'
> &
  PreloadedContentOptions & {
    /**
     * Called once, synchronously, before the drawer hides in response to the
     * user: Escape, a backdrop click, or the close button that `LayoutHeader`
     * renders. Its return value can veto the hide: return `false` to keep the
     * drawer open, for example after asking whether to discard unsaved
     * changes. Returning `true`, or omitting this option, lets it close.
     * Calling `hide()` or the EntryPoint's `close` prop always closes the
     * drawer without calling it.
     */
    onHide?: () => boolean;
  };

export interface PreloadedDrawerController<TEntryPoint> {
  element: ReactNode;
  hide: () => void;
  isOpen: boolean;
  preload: (params: EntryPointParams<TEntryPoint>) => void;
  show: (
    params: EntryPointParams<TEntryPoint>,
    runtimeProps: SurfaceRuntimeProps<TEntryPoint>,
  ) => void;
}

/**
 * Creates a Drawer backed by a lazily loaded Relay EntryPoint.
 */
export function usePreloadedDrawer<TEntryPoint>(
  entryPoint: TEntryPoint,
  {
    errorFallback,
    loadingFallback,
    onHide,
    ...drawerProps
  }: UsePreloadedDrawerOptions,
): PreloadedDrawerController<TEntryPoint> {
  const controller = usePreloadedEntryPoint(entryPoint, {
    errorFallback,
    loadingFallback:
      loadingFallback === undefined ? (
        <PreloadedSurfaceLoadingFallback surface="drawer" />
      ) : (
        loadingFallback
      ),
  });
  const {hide, isOpen} = controller;
  const element = (
    <Drawer
      {...drawerProps}
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open && isOpen && onHide?.() !== false) {
          hide();
        }
      }}>
      {isOpen ? controller.content(hide) : null}
    </Drawer>
  );

  return {
    element,
    hide,
    isOpen,
    preload: controller.preload,
    show: controller.show,
  };
}
