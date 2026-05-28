import {use, useCallback} from 'react';
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

export function useToast(): ShowToastFn {
  const context = use(ToastContext);

  return useCallback(
    (options: ToastOptions): ToastDismissFn => {
      if (context == null) {
        throw new Error('useToast must be used within a ToastViewport.');
      }
      const id = generateToastId();
      const entry: ToastEntry = {createdAt: Date.now(), id, options};
      context.addToast(entry);
      return () => context.removeToast(id, 'manual');
    },
    [context],
  );
}
