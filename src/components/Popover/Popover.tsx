import {
  useCallback,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {css, cx} from 'styled-system/css';
import {useIsomorphicLayoutEffect} from '../../internal/useIsomorphicLayoutEffect';
import type {LayerAlignment, LayerPlacement} from '../../internal/useLayer';
import {usePopover} from './usePopover';

export interface PopoverProps {
  /**
   * Alignment along the placement axis.
   * @default 'start'
   */
  alignment?: LayerAlignment;
  /**
   * External trigger element. When provided without children, Popover attaches
   * click and ARIA behavior directly to this element.
   */
  anchorRef?: RefObject<HTMLElement | null>;
  /**
   * Trigger content. Must contain a `<button>` or `[role="button"]`.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the popover content.
   */
  className?: string;
  /**
   * Label for the hidden close button.
   * @default 'Close popover'
   */
  closeButtonLabel?: string;
  /**
   * Content displayed inside the popover dialog.
   */
  content: ReactNode;
  /**
   * Test ID applied to the popover content.
   */
  'data-testid'?: string;
  /**
   * Whether to focus the first focusable item after opening.
   * @default true
   */
  hasAutoFocus?: boolean;
  /**
   * Whether to include a keyboard-accessible close button.
   * @default true
   */
  hasCloseButton?: boolean;
  /**
   * Whether trigger interactions open the popover.
   * @default true
   */
  isEnabled?: boolean;
  /**
   * Controlled open state.
   */
  isOpen?: boolean;
  /**
   * Accessible label for the popover dialog.
   */
  label?: string;
  /**
   * Callback fired when open state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Position relative to the trigger.
   * @default 'below'
   */
  placement?: LayerPlacement;
  /**
   * Ref forwarded to the popover content element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the popover content.
   */
  style?: CSSProperties;
  /**
   * Width of the popover content.
   */
  width?: number | string;
}

const BUTTON_SELECTOR = 'button, [role="button"]';

const styles = {
  anchor: css({
    display: 'inline-flex',
  }),
  content: css({
    p: '3',
    minW: 'anchor-size(width)',
  }),
  gap: {
    above: css({mb: '1'}),
    below: css({mt: '1'}),
    start: css({mr: '1'}),
    end: css({ml: '1'}),
  },
} as const;

function findTriggerButton(element: HTMLElement): HTMLElement | null {
  if (element.matches(BUTTON_SELECTOR)) {
    return element;
  }

  return element.querySelector<HTMLElement>(BUTTON_SELECTOR);
}

/**
 * A click-triggered floating dialog anchored to a trigger element.
 */
export function Popover({
  anchorRef,
  children,
  content,
  placement = 'below',
  alignment = 'start',
  isOpen,
  onOpenChange,
  isEnabled = true,
  width,
  label,
  hasCloseButton,
  closeButtonLabel,
  ref,
  hasAutoFocus,
  className,
  style,
  'data-testid': dataTestId,
}: PopoverProps): React.JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isControlled = isOpen !== undefined;
  const lastHideTimeRef = useRef(0);

  const popover = usePopover({
    closeButtonLabel,
    hasAutoFocus,
    hasCloseButton,
    label,
    onHide: () => {
      lastHideTimeRef.current = Date.now();
      onOpenChange?.(false);
    },
    onShow: () => onOpenChange?.(true),
  });

  const handleTriggerClick = useCallback(() => {
    if (!isEnabled) {
      return;
    }

    if (Date.now() - lastHideTimeRef.current < 50) {
      return;
    }

    popover.toggle();
  }, [isEnabled, popover]);

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleTriggerClick();
      }
    },
    [handleTriggerClick],
  );

  const attachTrigger = useCallback(
    (button: HTMLElement) => {
      button.setAttribute(
        'aria-haspopup',
        popover.triggerProps['aria-haspopup'],
      );
      button.setAttribute(
        'aria-expanded',
        String(popover.triggerProps['aria-expanded']),
      );
      button.setAttribute(
        'aria-controls',
        popover.triggerProps['aria-controls'],
      );
      button.addEventListener('click', handleTriggerClick);

      const needsKeyDown =
        button.tagName !== 'BUTTON' && button.getAttribute('role') === 'button';
      if (needsKeyDown) {
        button.addEventListener('keydown', handleTriggerKeyDown);
      }

      return () => {
        button.removeAttribute('aria-haspopup');
        button.removeAttribute('aria-expanded');
        button.removeAttribute('aria-controls');
        button.removeEventListener('click', handleTriggerClick);
        if (needsKeyDown) {
          button.removeEventListener('keydown', handleTriggerKeyDown);
        }
      };
    },
    [handleTriggerClick, handleTriggerKeyDown, popover.triggerProps],
  );

  useIsomorphicLayoutEffect(() => {
    const anchor = anchorRef?.current ?? wrapperRef.current;
    if (anchor == null) {
      return;
    }

    popover.triggerRef(anchor);
    const trigger = findTriggerButton(anchor);
    if (trigger == null) {
      return () => {
        popover.triggerRef(null);
      };
    }

    const detach = attachTrigger(trigger);
    return () => {
      popover.triggerRef(null);
      detach();
    };
  }, [anchorRef, attachTrigger, popover]);

  useIsomorphicLayoutEffect(() => {
    if (!isControlled) {
      return;
    }

    if (isOpen === true && !popover.isOpen) {
      popover.show();
    } else if (isOpen === false && popover.isOpen) {
      popover.hide();
    }
  }, [isControlled, isOpen, popover]);

  const widthStyle =
    width == null
      ? undefined
      : {width: typeof width === 'number' ? `${width}px` : width};

  const popoverContent = popover.render(
    <div
      className={cx(styles.content, className)}
      data-testid={dataTestId}
      ref={ref}
      style={{...widthStyle, ...style}}>
      {content}
    </div>,
    {placement, alignment, className: styles.gap[placement]},
  );

  if (anchorRef != null && children == null) {
    return <>{popoverContent}</>;
  }

  return (
    <>
      <div className={styles.anchor} ref={wrapperRef}>
        {children}
      </div>
      {popoverContent}
    </>
  );
}

Popover.displayName = 'Popover';
