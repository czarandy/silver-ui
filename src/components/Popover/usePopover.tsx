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
import {VisuallyHidden} from '../../internal';
import {useFocusTrap} from '../../internal/useFocusTrap';
import {useLayer, type ContextRenderProps} from '../../internal/useLayer';
import {Button} from '../Button';

export type {LayerAlignment, LayerPlacement} from '../../internal/useLayer';

export interface UsePopoverOptions {
  /**
   * Accessible label for the close button rendered when `hasCloseButton` is
   * `true`. Defaults to `'Close popover'`.
   */
  closeButtonLabel?: string;
  /**
   * When `true`, focus moves to the first focusable element inside the popover
   * when it opens. Defaults to `true`.
   */
  hasAutoFocus?: boolean;
  /**
   * When `true`, renders a visually hidden close button inside the popover so
   * assistive technology users can dismiss it. Defaults to `true`.
   */
  hasCloseButton?: boolean;
  /**
   * When `true`, wraps the content in a styled surface (background, border,
   * shadow). Set to `false` to render unstyled content. Defaults to `true`.
   */
  hasSurface?: boolean;
  /**
   * When `true`, the popover can be dismissed by clicking outside or pressing
   * Escape. Defaults to `true`.
   */
  isDismissable?: boolean;
  /**
   * Accessible label applied to the popover content via `aria-label`.
   */
  label?: string;
  /**
   * Id applied to the underlying layer element. Falls back to a generated id.
   * Supply this when another element needs a stable `aria-controls` reference
   * to the popover.
   */
  layerId?: string;
  /**
   * Called after the popover is hidden, including via light dismiss.
   */
  onHide?: () => void;
  /**
   * Called after the popover is shown.
   */
  onShow?: () => void;
  /**
   * ARIA role for the popover content. Defaults to `'dialog'`; use `'menu'` for
   * menu-style popovers.
   */
  role?: 'dialog' | 'menu';
}

export interface UsePopoverReturn {
  /**
   * CSS anchor name tying the popover content to the trigger for positioning.
   */
  anchorId: string;
  /**
   * Ref attached to the popover content element.
   */
  contentRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Hides the popover.
   */
  hide: () => void;
  /**
   * Id of the underlying layer element, matching `triggerProps['aria-controls']`.
   */
  id: string;
  /**
   * Whether the popover is currently open.
   */
  isOpen: boolean;
  /**
   * Renders the given children inside the popover layer.
   */
  render: (children: ReactNode, props?: ContextRenderProps) => ReactNode;
  /**
   * Shows the popover. Pass `isAutoFocusSkipped` to suppress moving focus into
   * the content for this open.
   */
  show: (options?: {isAutoFocusSkipped?: boolean}) => void;
  /**
   * Toggles the popover between open and closed.
   */
  toggle: () => void;
  /**
   * ARIA props to spread onto the trigger element.
   */
  triggerProps: {
    'aria-controls': string;
    'aria-expanded': boolean;
    'aria-haspopup': 'dialog' | 'menu';
  };
  /**
   * Ref callback to attach to the trigger element for anchor positioning.
   */
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
} as const;

export function usePopover({
  onShow,
  onHide,
  isDismissable = true,
  hasAutoFocus = true,
  hasSurface = true,
  hasCloseButton = true,
  closeButtonLabel = 'Close popover',
  label,
  role = 'dialog',
  layerId,
}: UsePopoverOptions = {}): UsePopoverReturn {
  const skipAutoFocusRef = useRef(false);
  const layer = useLayer({isDismissable, id: layerId, onShow, onHide});
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
            <VisuallyHidden>
              <Button
                icon={X}
                isIconOnly
                label={closeButtonLabel}
                onClick={layer.hide}
                size="sm"
                variant="ghost"
              />
            </VisuallyHidden>
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
