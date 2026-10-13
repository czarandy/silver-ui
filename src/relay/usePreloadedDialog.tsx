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
  PreloadedContentOptions & {
    /**
     * Consulted once, synchronously, each time the user tries to dismiss the
     * dialog: Escape, a backdrop click, or the close button that `LayoutHeader`
     * renders. Return `false` to keep the dialog open, for example after
     * asking whether to discard unsaved changes. Calling `hide()` or the
     * EntryPoint's `close` prop always closes the dialog without consulting it.
     */
    shouldDismiss?: () => boolean;
  };

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
  {
    errorFallback,
    loadingFallback,
    shouldDismiss,
    ...dialogProps
  }: UsePreloadedDialogOptions,
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
        if (!open && isOpen && shouldDismiss?.() !== false) {
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
