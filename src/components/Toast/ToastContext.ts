import {createContext} from 'react';
import type {ToastDismissReason, ToastEntry} from './types';

export interface ToastContextValue {
  addToast: (entry: ToastEntry) => void;
  findByUniqueID: (uniqueID: string) => ToastEntry | undefined;
  removeToast: (id: string, reason: ToastDismissReason) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

ToastContext.displayName = 'ToastContext';
