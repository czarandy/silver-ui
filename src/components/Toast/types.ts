import type {ReactNode} from 'react';

export type ToastType = 'error' | 'info' | 'success' | 'warning';
export type ToastPosition = 'bottomEnd' | 'bottomStart' | 'topEnd' | 'topStart';
export type ToastCollisionBehavior = 'ignore' | 'overwrite';
export type ToastDismissReason = 'auto' | 'manual';

export interface ToastOptions {
  /**
   * Auto-dismiss duration in milliseconds.
   * @default 5000
   */
  autoHideDuration?: number;
  /**
   * Toast message content.
   */
  body: ReactNode;
  /**
   * Collision behavior when a toast with this unique ID already exists.
   * @default 'overwrite'
   */
  collisionBehavior?: ToastCollisionBehavior;
  /**
   * Content rendered at the end of the toast.
   */
  endContent?: ReactNode;
  /**
   * Whether the toast auto-dismisses.
   */
  isAutoHide?: boolean;
  /**
   * Called when the toast is removed.
   */
  onHide?: (reason: ToastDismissReason) => void;
  /**
   * Toast tone.
   * @default 'info'
   */
  type?: ToastType;
  /**
   * Unique ID used for deduplication.
   */
  uniqueID?: string;
}

export type ToastDismissFn = () => void;
export type ShowToastFn = (options: ToastOptions) => ToastDismissFn;

export interface ToastEntry {
  createdAt: number;
  id: string;
  options: ToastOptions;
}
