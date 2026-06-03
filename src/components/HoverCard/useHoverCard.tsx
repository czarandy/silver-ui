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
} from '../../internal/useLayer';

export type HoverCardFocusTrigger = 'auto' | 'always' | 'never';

export interface UseHoverCardOptions {
  alignment?: LayerAlignment;
  delay?: number;
  focusTrigger?: HoverCardFocusTrigger;
  hideDelay?: number;
  isEnabled?: boolean;
  onHide?: () => void;
  onShow?: () => void;
  placement?: LayerPlacement;
}

export interface UseHoverCardReturn {
  anchorId: string;
  describedBy: string;
  hide: () => void;
  interactionRef: RefCallback<HTMLElement>;
  positionRef: RefCallback<HTMLElement>;
  ref: RefCallback<HTMLElement>;
  renderHoverCard: (
    children: ReactNode,
    props?: ContextRenderProps,
  ) => ReactNode;
  show: () => void;
}

const styles = {
  container: css({
    bg: 'bg',
    borderRadius: 'md',
    boxShadow: 'lg',
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'border',
  }),
  content: css({
    p: '3',
  }),
  margin: {
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

export function useHoverCard({
  placement = 'above',
  alignment = 'center',
  delay = 300,
  hideDelay = 200,
  focusTrigger = 'auto',
  isEnabled = true,
  onShow,
  onHide,
}: UseHoverCardOptions = {}): UseHoverCardReturn {
  const layer = useLayer({onHide, onShow});
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isHoveringContentRef = useRef(false);
  const isEscapeDismissingRef = useRef(false);

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
    showTimeoutRef.current = setTimeout(() => layer.show(), delay);
  }, [clearTimeouts, delay, isEnabled, layer]);

  const scheduleHide = useCallback(() => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveringContentRef.current) {
        layer.hide();
      }
    }, hideDelay);
  }, [clearTimeouts, hideDelay, layer]);

  const handleMouseEnter = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: none)').matches
    ) {
      return;
    }
    scheduleShow();
  }, [scheduleShow]);
  const handleMouseLeave = useCallback(() => scheduleHide(), [scheduleHide]);

  const handleFocusIn = useCallback(() => {
    if (!isEnabled) {
      return;
    }

    if (isEscapeDismissingRef.current) {
      isEscapeDismissingRef.current = false;
      return;
    }

    clearTimeouts();
    layer.show();
  }, [clearTimeouts, isEnabled, layer]);

  const handleFocusOut = useCallback(
    (event: FocusEvent) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      const popoverElement = document.getElementById(layer.id);

      if (popoverElement?.contains(relatedTarget)) {
        return;
      }

      scheduleHide();
    },
    [layer.id, scheduleHide],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && layer.isOpen) {
        event.stopPropagation();
        clearTimeouts();
        layer.hide();
      }
    },
    [clearTimeouts, layer],
  );

  const interactionRef: RefCallback<HTMLElement> = useCallback(
    element => {
      if (triggerRef.current != null) {
        triggerRef.current.removeEventListener('mouseenter', handleMouseEnter);
        triggerRef.current.removeEventListener('mouseleave', handleMouseLeave);
        triggerRef.current.removeEventListener('focusin', handleFocusIn);
        triggerRef.current.removeEventListener(
          'focusout',
          handleFocusOut as EventListener,
        );
        triggerRef.current.removeEventListener('keydown', handleKeyDown);
      }

      if (element != null) {
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        const shouldAttachFocus =
          focusTrigger === 'always' ||
          (focusTrigger === 'auto' && isFocusable(element));

        if (shouldAttachFocus) {
          element.addEventListener('focusin', handleFocusIn);
          element.addEventListener('focusout', handleFocusOut as EventListener);
        }

        element.addEventListener('keydown', handleKeyDown);
      }

      triggerRef.current = element;
    },
    [
      focusTrigger,
      handleFocusIn,
      handleFocusOut,
      handleKeyDown,
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
    return () => clearTimeouts();
  }, [clearTimeouts]);

  const renderHoverCard = useCallback(
    (children: ReactNode, props?: ContextRenderProps): ReactNode => {
      const renderPlacement = props?.placement ?? placement;

      return layer.render(
        // eslint-disable-next-line jsx-a11y-x/no-static-element-interactions
        <div
          className={styles.content}
          onBlur={event => {
            const relatedTarget = event.relatedTarget as HTMLElement | null;
            if (event.currentTarget.contains(relatedTarget)) {
              return;
            }

            if (triggerRef.current?.contains(relatedTarget)) {
              return;
            }

            scheduleHide();
          }}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              isEscapeDismissingRef.current = true;
              clearTimeouts();
              layer.hide();
              triggerRef.current?.focus();
            }
          }}
          onMouseEnter={() => {
            isHoveringContentRef.current = true;
            clearTimeouts();
          }}
          onMouseLeave={() => {
            isHoveringContentRef.current = false;
            scheduleHide();
          }}>
          {children}
        </div>,
        {
          placement: renderPlacement,
          alignment: props?.alignment ?? alignment,
          className: cx(
            styles.container,
            styles.margin[renderPlacement],
            props?.className,
          ),
          role: props?.role,
          style: props?.style,
        },
      );
    },
    [alignment, clearTimeouts, layer, placement, scheduleHide],
  );

  return useMemo(
    () => ({
      anchorId: layer.anchorId,
      describedBy: layer.id,
      hide: layer.hide,
      interactionRef,
      positionRef: layer.ref,
      ref,
      renderHoverCard,
      show: layer.show,
    }),
    [
      interactionRef,
      layer.anchorId,
      layer.hide,
      layer.id,
      layer.ref,
      layer.show,
      ref,
      renderHoverCard,
    ],
  );
}
