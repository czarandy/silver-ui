import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefCallback,
} from 'react';
import {css, cx} from 'styled-system/css';
import {
  useLayer,
  type ContextRenderProps,
  type LayerAlignment,
  type LayerPlacement,
} from '../../internal/useLayer';

export type TooltipFocusTrigger = 'auto' | 'always' | 'never';

const isTouchDevice =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: none)').matches;

export interface UseTooltipOptions {
  alignment?: LayerAlignment;
  delay?: number;
  focusTrigger?: TooltipFocusTrigger;
  hideDelay?: number;
  isEnabled?: boolean;
  onHide?: () => void;
  onShow?: () => void;
  placement?: LayerPlacement;
}

export interface TooltipRenderProps extends ContextRenderProps {
  contentStyle?: CSSProperties;
}

export interface UseTooltipReturn {
  /**
   * ID of the anchor element, used for CSS anchor positioning.
   */
  anchorId: string;
  /**
   * ID of the tooltip element. Pass to `aria-describedby` on the trigger.
   */
  describedBy: string;
  /**
   * Attaches hover/focus/keyboard listeners only.
   * Use when another element handles positioning (e.g., a wrapper provides the anchor).
   */
  interactionRef: RefCallback<HTMLElement>;
  /**
   * Attaches CSS anchor positioning only.
   * Use when another element handles interaction listeners.
   */
  positionRef: RefCallback<HTMLElement>;
  /**
   * Combined ref that attaches both positioning and interaction.
   * Use this for the common case where one element is both the anchor and trigger.
   * Do not combine with `interactionRef` or `positionRef` — use one or the other.
   */
  ref: RefCallback<HTMLElement>;
  /**
   * Renders the tooltip content into the layer.
   */
  renderTooltip: (children: ReactNode, props?: TooltipRenderProps) => ReactNode;
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
    '--silver-text-color': 'currentColor',
    '--silver-text-color-muted':
      'color-mix(in srgb, currentColor 70%, transparent)',
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
    if (!isEnabled) {
      return;
    }

    clearTimeouts();
    showTimeoutRef.current = setTimeout(() => {
      layer.show();
    }, delay);
  }, [clearTimeouts, delay, isEnabled, layer]);

  const scheduleHide = useCallback(() => {
    clearTimeouts();

    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        layer.hide();
      }, hideDelay);
      return;
    }

    layer.hide();
  }, [clearTimeouts, hideDelay, layer]);

  const handleMouseEnter = useCallback(() => {
    if (isTouchDevice) {
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

  useEffect(() => {
    if (!layer.isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        layer.hide();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [layer, layer.isOpen]);

  const handlersRef = useRef({
    mouseEnter: handleMouseEnter,
    mouseLeave: handleMouseLeave,
    focusIn: handleFocusIn,
    focusOut: handleFocusOut,
  });
  // eslint-disable-next-line @eslint-react/refs -- latest-ref pattern
  handlersRef.current = {
    mouseEnter: handleMouseEnter,
    mouseLeave: handleMouseLeave,
    focusIn: handleFocusIn,
    focusOut: handleFocusOut,
  };

  const stableMouseEnter = useCallback(() => {
    handlersRef.current.mouseEnter();
  }, []);
  const stableMouseLeave = useCallback(() => {
    handlersRef.current.mouseLeave();
  }, []);
  const stableFocusIn = useCallback((e: Event) => {
    handlersRef.current.focusIn(e);
  }, []);
  const stableFocusOut = useCallback(() => {
    handlersRef.current.focusOut();
  }, []);

  const interactionRef: RefCallback<HTMLElement> = useCallback(
    element => {
      if (triggerRef.current != null) {
        triggerRef.current.removeEventListener('mouseenter', stableMouseEnter);
        triggerRef.current.removeEventListener('mouseleave', stableMouseLeave);
        triggerRef.current.removeEventListener('focusin', stableFocusIn);
        triggerRef.current.removeEventListener('focusout', stableFocusOut);
      }

      if (element != null) {
        element.addEventListener('mouseenter', stableMouseEnter);
        element.addEventListener('mouseleave', stableMouseLeave);

        const shouldAttachFocus =
          focusTrigger === 'always' ||
          (focusTrigger === 'auto' && isFocusable(element));

        if (shouldAttachFocus) {
          element.addEventListener('focusin', stableFocusIn);
          element.addEventListener('focusout', stableFocusOut);
        }
      }

      triggerRef.current = element;
    },
    [
      focusTrigger,
      stableFocusIn,
      stableFocusOut,
      stableMouseEnter,
      stableMouseLeave,
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

  const renderTooltip = useCallback(
    (children: ReactNode, props?: TooltipRenderProps): ReactNode => {
      const renderPlacement = props?.placement ?? placement;
      return layer.render(
        <div className={styles.tooltipContent} style={props?.contentStyle}>
          {children}
        </div>,
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
