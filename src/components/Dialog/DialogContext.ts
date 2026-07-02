'use client';

import {createContext, use} from 'react';

export interface DialogContextValue {
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Stable ID for the dialog's title heading. LayoutHeader applies this ID
   * to its heading element so the dialog can reference it via
   * `aria-labelledby`.
   */
  titleId: string;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
DialogContext.displayName = 'DialogContext';

export function useDialogContext(): DialogContextValue | null {
  return use(DialogContext);
}
