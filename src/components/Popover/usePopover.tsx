import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type RefCallback,
} from 'react';
import {css, cx} from 'styled-system/css';
import {useFocusTrap} from '../../internal/useFocusTrap';
import {useLayer, type ContextRenderProps} from '../../internal/useLayer';
import {Button} from '../Button';

export type {LayerAlignment, LayerPlacement} from '../../internal/useLayer';

export interface UsePopoverOptions {
  closeButtonLabel?: string;
  hasAutoFocus?: boolean;
  hasCloseButton?: boolean;
  hasLightDismiss?: boolean;
  hasSurface?: boolean;
  label?: string;
  onHide?: () => void;
  onShow?: () => void;
}

export interface UsePopoverReturn {
  anchorId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  hide: () => void;
  id: string;
  isOpen: boolean;
  render: (children: ReactNode, props?: ContextRenderProps) => ReactNode;
  show: (options?: {skipAutoFocus?: boolean}) => void;
  toggle: () => void;
  triggerProps: {
    'aria-controls': string;
    'aria-expanded': boolean;
    'aria-haspopup': 'dialog';
  };
  triggerRef: RefCallback<HTMLElement>;
}

const styles = {
  surface: css({
    position: 'relative',
    bg: 'bg',
    borderRadius: 'md',
    boxShadow: 'lg',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'silver-neutral.200',
    _dark: {
      borderColor: 'silver-neutral.700',
    },
  }),
  closeButtonWrapper: css({
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translate(-50%, 100%)',
    w: '1px',
    h: '1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    pointerEvents: 'none',
    _focusWithin: {
      w: 'auto',
      h: 'auto',
      overflow: 'visible',
      clipPath: 'none',
      pointerEvents: 'auto',
      pt: '1',
    },
  }),
} as const;

export function usePopover({
  onShow,
  onHide,
  hasLightDismiss = true,
  hasAutoFocus = true,
  hasSurface = true,
  hasCloseButton = true,
  closeButtonLabel = 'Close popover',
  label,
}: UsePopoverOptions = {}): UsePopoverReturn {
  const skipAutoFocusRef = useRef(false);
  const layer = useLayer({hasLightDismiss, onShow, onHide});
  const {containerRef: contentRef, focusFirst} = useFocusTrap<HTMLDivElement>({
    isActive: layer.isOpen,
    onEscape: layer.hide,
  });

  useEffect(() => {
    if (!layer.isOpen) {
      skipAutoFocusRef.current = false;
      return;
    }

    if (hasAutoFocus && !skipAutoFocusRef.current) {
      requestAnimationFrame(() => focusFirst());
    }
  }, [focusFirst, hasAutoFocus, layer.isOpen]);

  const show = useCallback(
    (options?: {skipAutoFocus?: boolean}) => {
      skipAutoFocusRef.current = options?.skipAutoFocus ?? false;
      layer.show();
    },
    [layer],
  );

  const toggle = useCallback(() => {
    if (layer.isOpen) {
      layer.hide();
      return;
    }

    show();
  }, [layer, show]);

  const render = useCallback(
    (children: ReactNode, props?: ContextRenderProps): ReactNode => {
      return layer.render(
        <div
          aria-label={label}
          aria-modal="true"
          className={hasSurface ? styles.surface : undefined}
          ref={contentRef}
          role="dialog">
          {children}
          {hasCloseButton ? (
            <div className={styles.closeButtonWrapper}>
              <Button label={closeButtonLabel} onClick={layer.hide} />
            </div>
          ) : null}
        </div>,
        {
          ...props,
          className: cx(
            hasSurface ? styles.surface : undefined,
            props?.className,
          ),
        },
      );
    },
    [closeButtonLabel, contentRef, hasCloseButton, hasSurface, label, layer],
  );

  return {
    anchorId: layer.anchorId,
    contentRef,
    hide: layer.hide,
    id: layer.id,
    isOpen: layer.isOpen,
    render,
    show,
    toggle,
    triggerProps: {
      'aria-controls': layer.id,
      'aria-expanded': layer.isOpen,
      'aria-haspopup': 'dialog',
    },
    triggerRef: layer.ref,
  };
}
