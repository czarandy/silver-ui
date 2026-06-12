import {useCallback, useMemo, useState, type ReactNode} from 'react';
import {Dialog, type DialogProps} from 'components/Dialog/Dialog';

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
  // Options passed to the most recent `show()` call. Each call replaces these
  // rather than merging, so per-call options never bleed into later calls.
  // `defaultOptions` remains the baseline, applied beneath them below.
  const [callOptions, setCallOptions] = useState<DialogOptions | undefined>();

  const show = useCallback(
    (nextContent: ReactNode, nextOptions?: DialogOptions) => {
      setContent(nextContent);
      setCallOptions(nextOptions);
      setIsOpen(true);
    },
    [],
  );

  const hide = useCallback(() => setIsOpen(false), []);

  const element = useMemo(
    () => (
      <Dialog
        {...(defaultOptions ?? {})}
        {...(callOptions ?? {})}
        isOpen={isOpen}
        label={callOptions?.label ?? defaultOptions?.label}
        onOpenChange={setIsOpen}>
        {content}
      </Dialog>
    ),
    [content, defaultOptions, isOpen, callOptions],
  );

  return {element, hide, isOpen, show};
}
