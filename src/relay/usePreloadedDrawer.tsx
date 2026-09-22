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
  PreloadedContentOptions;

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
  {errorFallback, loadingFallback, ...drawerProps}: UsePreloadedDrawerOptions,
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
        if (!open) {
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
