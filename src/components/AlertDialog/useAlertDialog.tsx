import {useCallback, useMemo, useState, type ReactNode} from 'react';
import {AlertDialog, type AlertDialogProps} from './AlertDialog';

export type AlertDialogOptions = Omit<
  AlertDialogProps,
  'isOpen' | 'onOpenChange'
>;

export interface UseAlertDialogReturn {
  /**
   * Render this element in your tree.
   */
  element: ReactNode;
  /**
   * Hide the current alert dialog.
   */
  hide: () => void;
  /**
   * Whether the alert dialog is open.
   */
  isOpen: boolean;
  /**
   * Show an alert dialog with the provided options.
   */
  show: (options: AlertDialogOptions) => void;
}

export function useAlertDialog(): UseAlertDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertDialogOptions | null>(null);

  const show = useCallback((nextOptions: AlertDialogOptions) => {
    setOptions(nextOptions);
    setIsOpen(true);
  }, []);
  const hide = useCallback(() => setIsOpen(false), []);

  const element = useMemo(
    () =>
      options == null ? null : (
        <AlertDialog {...options} isOpen={isOpen} onOpenChange={setIsOpen} />
      ),
    [isOpen, options],
  );

  return {element, hide, isOpen, show};
}
