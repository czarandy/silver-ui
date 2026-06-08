import {useCallback, useMemo, useState, type ReactNode} from 'react';
import {Dialog, type DialogProps} from './Dialog';

export type DialogOptions = Partial<
  Omit<DialogProps, 'children' | 'isOpen' | 'onOpenChange'>
>;

export interface UseDialogReturn {
  element: ReactNode;
  hide: () => void;
  isOpen: boolean;
  show: (content: ReactNode, options?: DialogOptions) => void;
}

export function useDialog(defaultOptions?: DialogOptions): UseDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<DialogOptions | undefined>(
    defaultOptions,
  );

  const show = useCallback(
    (nextContent: ReactNode, nextOptions?: DialogOptions) => {
      setContent(nextContent);
      setOptions(previous => ({...previous, ...nextOptions}));
      setIsOpen(true);
    },
    [],
  );

  const hide = useCallback(() => setIsOpen(false), []);

  const element = useMemo(
    () => (
      <Dialog
        {...(defaultOptions ?? {})}
        {...(options ?? {})}
        isOpen={isOpen}
        label={options?.label ?? defaultOptions?.label}
        onOpenChange={setIsOpen}>
        {content}
      </Dialog>
    ),
    [content, defaultOptions, isOpen, options],
  );

  return {element, hide, isOpen, show};
}
