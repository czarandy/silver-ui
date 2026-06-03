import {use, useCallback} from 'react';
import {nowEpochMilliseconds} from '../../internal/time';
import {ToastContext} from './ToastContext';
import type {
  ShowToastFn,
  ToastDismissFn,
  ToastEntry,
  ToastOptions,
} from './types';

let toastIdCounter = 0;

function generateToastId(): string {
  toastIdCounter += 1;
  return `silver-toast-${toastIdCounter}`;
}

/**
 * Returns a function that shows a toast notification.
 * Must be called within a `ToastViewport` provider.
 * The returned function accepts `ToastOptions` and returns a dismiss callback.
 */
export function useToast(): ShowToastFn {
  const context = use(ToastContext);

  return useCallback(
    (options: ToastOptions): ToastDismissFn => {
      if (context == null) {
        throw new Error(
          'useToast must be used within a ToastViewport. Add <ToastViewport> near your app root to enable toast notifications.',
        );
      }
      const id = generateToastId();
      const entry: ToastEntry = {
        createdAt: nowEpochMilliseconds(),
        id,
        options,
      };
      context.addToast(entry);
      return () => context.removeToast(id, 'manual');
    },
    [context],
  );
}
