import {useCallback, useMemo, useState, type ReactNode} from 'react';
import {
  Lightbox,
  type LightboxMedia,
  type LightboxProps,
} from 'components/Lightbox/Lightbox';

type LightboxOptions = Omit<
  LightboxProps,
  | 'defaultIndex'
  | 'index'
  | 'isOpen'
  | 'media'
  | 'onIndexChange'
  | 'onOpenChange'
>;

export interface UseLightboxOptions extends LightboxOptions {
  /**
   * Media to display in the lightbox.
   */
  media: LightboxMedia | ReadonlyArray<LightboxMedia>;
}

export interface UseLightboxReturn {
  /**
   * Close the lightbox.
   */
  close: () => void;
  /**
   * Render this element in your tree.
   */
  element: ReactNode;
  /**
   * Returns trigger props that open at the given gallery index.
   */
  getTriggerProps: (index: number) => {
    'aria-haspopup': 'dialog';
    onClick: () => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
    role: 'button';
    tabIndex: 0;
  };
  /**
   * Current gallery index.
   */
  index: number;
  /**
   * Whether the lightbox is open.
   */
  isOpen: boolean;
  /**
   * Open the lightbox, optionally at a specific gallery index.
   */
  open: (index?: number) => void;
  /**
   * Trigger props that open the first item.
   */
  triggerProps: {
    'aria-haspopup': 'dialog';
    onClick: () => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
    role: 'button';
    tabIndex: 0;
  };
}

/**
 * State helper for Lightbox triggers and rendering.
 */
export function useLightbox(options: UseLightboxOptions): UseLightboxReturn {
  const {media, ...lightboxProps} = options;
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const open = useCallback((nextIndex = 0) => {
    setIndex(nextIndex);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const getTriggerProps = useCallback(
    (nextIndex: number) => ({
      'aria-haspopup': 'dialog' as const,
      onClick: () => open(nextIndex),
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open(nextIndex);
        }
      },
      role: 'button' as const,
      tabIndex: 0 as const,
    }),
    [open],
  );
  const triggerProps = useMemo(() => getTriggerProps(0), [getTriggerProps]);
  const element = (
    <Lightbox
      {...lightboxProps}
      index={index}
      isOpen={isOpen}
      media={media}
      onIndexChange={setIndex}
      onOpenChange={setIsOpen}
    />
  );

  return {close, element, getTriggerProps, index, isOpen, open, triggerProps};
}
