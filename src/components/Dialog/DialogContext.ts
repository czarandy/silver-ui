'use client';

import {createContext, use} from 'react';

export interface DialogContextValue {
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Stable ID for the parent surface's title heading. LayoutHeader applies
   * this ID so surfaces can coordinate accessible labeling and initial focus.
   */
  titleId: string;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
DialogContext.displayName = 'DialogContext';

export function useDialogContext(): DialogContextValue | null {
  return use(DialogContext);
}
