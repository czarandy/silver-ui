'use client';

import {
  useCallback,
  useMemo,
  useRef,
  type FocusEvent as ReactFocusEvent,
  type ReactNode,
  type RefCallback,
} from 'react';
import {layerPlacementGapRecipe} from 'internal/layerPlacementGap.recipe';
import {
  useHoverLayer,
  type HoverLayerFocusTrigger,
} from 'internal/useHoverLayer';
import type {
  ContextRenderProps,
  LayerAlignment,
  LayerPlacement,
} from 'internal/useLayer';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

export type HoverCardFocusTrigger = HoverLayerFocusTrigger;

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
} as const;

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
  const isHoveringContentRef = useRef(false);
  const isEscapeDismissingRef = useRef(false);

  const hoverLayer = useHoverLayer({
    delay,
    focusTrigger,
    hideDelay,
    isEnabled,
    onFocusIn: () => {
      if (isEscapeDismissingRef.current) {
        isEscapeDismissingRef.current = false;
        return false;
      }

      return true;
    },
    onFocusOut: event => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      const popoverElement = document.getElementById(hoverLayer.describedBy);

      return !popoverElement?.contains(relatedTarget);
    },
    onHide,
    onShow,
    onTriggerEscape: event => {
      event.stopPropagation();
      hoverLayer.clearTimeouts();
      hoverLayer.hide();
    },
    shouldHide: () => !isHoveringContentRef.current,
  });

  const {clearTimeouts, interactionRef, layer, ref, scheduleHide, triggerRef} =
    hoverLayer;

  const handleContentBlur = useCallback(
    (event: ReactFocusEvent<HTMLElement>) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      if (
        event.currentTarget.contains(relatedTarget) ||
        triggerRef.current?.contains(relatedTarget)
      ) {
        return;
      }

      scheduleHide();
    },
    [scheduleHide, triggerRef],
  );

  const renderHoverCard = useCallback(
    (children: ReactNode, props?: ContextRenderProps): ReactNode => {
      const renderPlacement = props?.placement ?? placement;

      return layer.render(
        // eslint-disable-next-line jsx-a11y-x/no-static-element-interactions
        <div
          className={styles.content}
          onBlur={handleContentBlur}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              isEscapeDismissingRef.current = true;
              clearTimeouts();
              hoverLayer.hide();
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
            layerPlacementGapRecipe({placement: renderPlacement}),
            props?.className,
          ),
          role: props?.role ?? 'dialog',
          style: props?.style,
        },
      );
    },
    [
      alignment,
      clearTimeouts,
      handleContentBlur,
      hoverLayer,
      layer,
      placement,
      scheduleHide,
      triggerRef,
    ],
  );

  return useMemo(
    () => ({
      anchorId: layer.anchorId,
      describedBy: layer.id,
      hide: hoverLayer.hide,
      interactionRef,
      positionRef: layer.ref,
      ref,
      renderHoverCard,
      show: hoverLayer.show,
    }),
    [
      hoverLayer.hide,
      hoverLayer.show,
      interactionRef,
      layer.anchorId,
      layer.id,
      layer.ref,
      ref,
      renderHoverCard,
    ],
  );
}
