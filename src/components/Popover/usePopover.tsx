import {X} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefCallback,
} from 'react';
import {css} from 'styled-system/css';
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
  role?: 'dialog' | 'menu';
}

export interface UsePopoverReturn {
  anchorId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  hide: () => void;
  id: string;
  isOpen: boolean;
  render: (children: ReactNode, props?: ContextRenderProps) => ReactNode;
  show: (options?: {isAutoFocusSkipped?: boolean}) => void;
  toggle: () => void;
  triggerProps: {
    'aria-controls': string;
    'aria-expanded': boolean;
    'aria-haspopup': 'dialog' | 'menu';
  };
  triggerRef: RefCallback<HTMLElement>;
}

const styles = {
  surface: css({
    position: 'relative',
    bg: 'bg',
    borderRadius: 'md',
    boxShadow: 'lg',
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'border',
  }),
  closeButtonWrapper: css({
    position: 'absolute',
    w: '1px',
    h: '1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
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
  role = 'dialog',
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
    (options?: {isAutoFocusSkipped?: boolean}) => {
      skipAutoFocusRef.current = options?.isAutoFocusSkipped ?? false;
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
          className={hasSurface ? styles.surface : undefined}
          ref={contentRef}
          role={role}>
          {children}
          {hasCloseButton ? (
            <div className={styles.closeButtonWrapper}>
              <Button
                icon={X}
                isIconOnly
                label={closeButtonLabel}
                onClick={layer.hide}
                size="sm"
                variant="ghost"
              />
            </div>
          ) : null}
        </div>,
        {
          ...props,
          className: props?.className,
        },
      );
    },
    [
      closeButtonLabel,
      contentRef,
      hasCloseButton,
      hasSurface,
      label,
      layer,
      role,
    ],
  );

  const triggerProps = useMemo(
    () => ({
      'aria-controls': layer.id,
      'aria-expanded': layer.isOpen,
      'aria-haspopup': role,
    }),
    [layer.id, layer.isOpen, role],
  );

  return useMemo(
    () => ({
      anchorId: layer.anchorId,
      contentRef,
      hide: layer.hide,
      id: layer.id,
      isOpen: layer.isOpen,
      render,
      show,
      toggle,
      triggerProps,
      triggerRef: layer.ref,
    }),
    [
      contentRef,
      layer.anchorId,
      layer.hide,
      layer.id,
      layer.isOpen,
      layer.ref,
      render,
      show,
      toggle,
      triggerProps,
    ],
  );
}
