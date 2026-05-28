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
  const [options, setOptions] = useState<DrawerOptions | undefined>(
    defaultOptions,
  );

  const show = useCallback(
    (nextContent: ReactNode, nextOptions?: DrawerOptions) => {
      setContent(nextContent);
      setOptions(previous => ({...previous, ...nextOptions}));
      setIsOpen(true);
    },
    [],
  );

  const hide = useCallback(() => setIsOpen(false), []);

  const element = useMemo(
    () => (
      <Drawer
        {...(defaultOptions ?? {})}
        {...(options ?? {})}
        isOpen={isOpen}
        label={options?.label ?? defaultOptions?.label ?? 'Drawer'}
        onOpenChange={setIsOpen}>
        {content}
      </Drawer>
    ),
    [content, defaultOptions, isOpen, options],
  );

  return {element, hide, isOpen, show};
}
