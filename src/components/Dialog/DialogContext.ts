import {createContext, use} from 'react';

export interface DialogContextValue {
  onOpenChange: (isOpen: boolean) => void;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
DialogContext.displayName = 'DialogContext';

export function useDialogContext(): DialogContextValue | null {
  return use(DialogContext);
}
