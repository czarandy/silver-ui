import {use, useCallback} from 'react';
import {ToastContext} from 'components/Toast/ToastContext';
import type {
  ShowToastFn,
  ToastDismissFn,
  ToastEntry,
  ToastOptions,
} from 'components/Toast/types';
import {nowEpochMilliseconds} from 'internal/time';

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

  if (context == null) {
    throw new Error(
      'useToast must be used within a ToastViewport. Add <ToastViewport> near your app root to enable toast notifications.',
    );
  }

  return useCallback(
    (options: ToastOptions): ToastDismissFn => {
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
