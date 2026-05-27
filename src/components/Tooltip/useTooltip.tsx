import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefCallback,
} from 'react';
import {css, cx} from 'styled-system/css';
import {
  useLayer,
  type ContextRenderProps,
  type LayerAlignment,
  type LayerPlacement,
} from '../internal/useLayer';

export type TooltipFocusTrigger = 'auto' | 'always' | 'never';

export interface UseTooltipOptions {
  alignment?: LayerAlignment;
  delay?: number;
  focusTrigger?: TooltipFocusTrigger;
  hideDelay?: number;
  isDefaultOpen?: boolean;
  isEnabled?: boolean;
  isOpen?: boolean;
  onHide?: () => void;
  onShow?: () => void;
  placement?: LayerPlacement;
}

export interface UseTooltipReturn {
  anchorId: string;
  describedBy: string;
  interactionRef: RefCallback<HTMLElement>;
  positionRef: RefCallback<HTMLElement>;
  ref: RefCallback<HTMLElement>;
  renderTooltip: (children: ReactNode, props?: ContextRenderProps) => ReactNode;
}

const styles = {
  tooltipContainer: css({
    bg: 'fg',
    color: 'bg',
    borderRadius: 'md',
    fontFamily: 'body',
    fontSize: 'sm',
    lineHeight: 'normal',
    boxShadow: 'md',
  }),
  tooltipContent: css({
    px: '2',
    py: '1',
    maxW: 'xs',
    wordBreak: 'break-word',
  }),
  marginByPlacement: {
    above: css({mb: '1'}),
    below: css({mt: '1'}),
    start: css({mr: '1'}),
    end: css({ml: '1'}),
  },
} as const;

function isFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute('tabindex')) {
    return element.tabIndex >= 0;
  }

  if (
    ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)
  ) {
    return !(element as HTMLButtonElement).disabled;
  }

  return element.isContentEditable;
}

export function useTooltip(options: UseTooltipOptions = {}): UseTooltipReturn {
  const {
    placement = 'above',
    alignment = 'center',
    delay = 200,
    hideDelay = 0,
    focusTrigger = 'auto',
    isEnabled = true,
    isOpen,
    isDefaultOpen = false,
    onShow,
    onHide,
  } = options;

  const layer = useLayer({onShow, onHide});
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current != null) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (hideTimeoutRef.current != null) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleShow = useCallback(() => {
    if (!isEnabled || isOpen === false) {
      return;
    }

    clearTimeouts();
    showTimeoutRef.current = setTimeout(() => {
      layer.show();
    }, delay);
  }, [clearTimeouts, delay, isEnabled, isOpen, layer]);

  const scheduleHide = useCallback(() => {
    if (isOpen === true) {
      return;
    }

    clearTimeouts();

    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        layer.hide();
      }, hideDelay);
      return;
    }

    layer.hide();
  }, [clearTimeouts, hideDelay, isOpen, layer]);

  const handleMouseEnter = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: none)').matches
    ) {
      return;
    }

    scheduleShow();
  }, [scheduleShow]);

  const handleMouseLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const handleFocusIn = useCallback(
    (event: Event) => {
      if (!isEnabled) {
        return;
      }

      const target = event.target as HTMLElement;
      if (!target.matches(':focus-visible')) {
        return;
      }

      clearTimeouts();
      layer.show();
    },
    [clearTimeouts, isEnabled, layer],
  );

  const handleFocusOut = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const interactionRef: RefCallback<HTMLElement> = useCallback(
    element => {
      if (triggerRef.current != null) {
        triggerRef.current.removeEventListener('mouseenter', handleMouseEnter);
        triggerRef.current.removeEventListener('mouseleave', handleMouseLeave);
        triggerRef.current.removeEventListener('focusin', handleFocusIn);
        triggerRef.current.removeEventListener('focusout', handleFocusOut);
      }

      if (element != null) {
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        const shouldAttachFocus =
          focusTrigger === 'always' ||
          (focusTrigger === 'auto' && isFocusable(element));

        if (shouldAttachFocus) {
          element.addEventListener('focusin', handleFocusIn);
          element.addEventListener('focusout', handleFocusOut);
        }
      }

      triggerRef.current = element;
    },
    [
      focusTrigger,
      handleFocusIn,
      handleFocusOut,
      handleMouseEnter,
      handleMouseLeave,
    ],
  );

  const ref: RefCallback<HTMLElement> = useCallback(
    element => {
      layer.ref(element);
      interactionRef(element);
    },
    [interactionRef, layer],
  );

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  useEffect(() => {
    if (isDefaultOpen) {
      layer.show();
    }
  }, [isDefaultOpen, layer]);

  useEffect(() => {
    if (isOpen === undefined) {
      return;
    }

    clearTimeouts();

    if (isOpen) {
      layer.show();
      return;
    }

    layer.hide();
  }, [clearTimeouts, isOpen, layer]);

  const renderTooltip = useCallback(
    (children: ReactNode, props?: ContextRenderProps): ReactNode => {
      const renderPlacement = props?.placement ?? placement;
      return layer.render(
        <div className={styles.tooltipContent}>{children}</div>,
        {
          placement: renderPlacement,
          alignment: props?.alignment ?? alignment,
          className: cx(
            styles.tooltipContainer,
            styles.marginByPlacement[renderPlacement],
            props?.className,
          ),
          role: 'tooltip',
          style: props?.style,
        },
      );
    },
    [alignment, layer, placement],
  );

  return useMemo(
    () => ({
      ref,
      positionRef: layer.ref,
      interactionRef,
      anchorId: layer.anchorId,
      describedBy: layer.id,
      renderTooltip,
    }),
    [ref, layer.ref, interactionRef, layer.anchorId, layer.id, renderTooltip],
  );
}
