import {useCallback, useMemo, useState, type ReactNode} from 'react';
import {Drawer, type DrawerProps} from './Drawer';

export type DrawerOptions = Partial<
  Omit<DrawerProps, 'children' | 'isOpen' | 'onOpenChange'>
>;

export interface UseDrawerReturn {
  element: ReactNode;
  hide: () => void;
  isOpen: boolean;
  show: (content: ReactNode, options?: DrawerOptions) => void;
}

export function useDrawer(defaultOptions?: DrawerOptions): UseDrawerReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  // Options passed to the most recent `show()` call. Each call replaces these
  // rather than merging, so per-call options never bleed into later calls.
  // `defaultOptions` remains the baseline, applied beneath them below.
  const [callOptions, setCallOptions] = useState<DrawerOptions | undefined>();

  const show = useCallback(
    (nextContent: ReactNode, nextOptions?: DrawerOptions) => {
      setContent(nextContent);
      setCallOptions(nextOptions);
      setIsOpen(true);
    },
    [],
  );

  const hide = useCallback(() => setIsOpen(false), []);

  const element = useMemo(
    () => (
      <Drawer
        {...(defaultOptions ?? {})}
        {...(callOptions ?? {})}
        isOpen={isOpen}
        label={callOptions?.label ?? defaultOptions?.label ?? 'Drawer'}
        onOpenChange={setIsOpen}>
        {content}
      </Drawer>
    ),
    [content, defaultOptions, isOpen, callOptions],
  );

  return {element, hide, isOpen, show};
}
