'use client';

import {createContext, use} from 'react';

export interface DialogContextValue {
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Stable ID for a Dialog or Drawer's title heading. LayoutHeader applies
   * this ID to its heading element so Dialog can reference it via
   * `aria-labelledby` and either surface can coordinate initial focus.
   */
  titleId: string;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
DialogContext.displayName = 'DialogContext';

export function useDialogContext(): DialogContextValue | null {
  return use(DialogContext);
}
