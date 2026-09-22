'use client';

import type {ReactNode} from 'react';
import {Dialog, type DialogProps} from 'components/Dialog';
import {PreloadedSurfaceLoadingFallback} from 'relay/PreloadedSurfaceLoadingFallback';
import {
  type EntryPointParams,
  type PreloadedContentOptions,
  type SurfaceRuntimeProps,
  usePreloadedEntryPoint,
} from 'relay/usePreloadedEntryPoint';

export type UsePreloadedDialogOptions = Omit<
  DialogProps,
  'children' | 'isOpen' | 'onOpenChange'
> &
  PreloadedContentOptions;

export interface PreloadedDialogController<TEntryPoint> {
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
 * Creates a Dialog backed by a lazily loaded Relay EntryPoint.
 */
export function usePreloadedDialog<TEntryPoint>(
  entryPoint: TEntryPoint,
  {errorFallback, loadingFallback, ...dialogProps}: UsePreloadedDialogOptions,
): PreloadedDialogController<TEntryPoint> {
  const controller = usePreloadedEntryPoint(entryPoint, {
    errorFallback,
    loadingFallback:
      loadingFallback === undefined ? (
        <PreloadedSurfaceLoadingFallback surface="dialog" />
      ) : (
        loadingFallback
      ),
  });
  const {hide, isOpen} = controller;
  const element = (
    <Dialog
      {...dialogProps}
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) {
          hide();
        }
      }}>
      {isOpen ? controller.content(hide) : null}
    </Dialog>
  );

  return {
    element,
    hide,
    isOpen,
    preload: controller.preload,
    show: controller.show,
  };
}
