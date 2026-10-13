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
     * Called once, synchronously, before the dialog hides in response to the
     * user: Escape, a backdrop click, or the close button that `LayoutHeader`
     * renders. Its return value can veto the hide: return `false` to keep the
     * dialog open, for example after asking whether to discard unsaved
     * changes. Returning `true`, or omitting this option, lets it close.
     * Calling `hide()` or the EntryPoint's `close` prop always closes the
     * dialog without calling it.
     */
    onBeforeHide?: () => boolean;
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
    onBeforeHide,
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
        if (!open && isOpen && onBeforeHide?.() !== false) {
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
