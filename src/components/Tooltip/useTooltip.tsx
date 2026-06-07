import {
  useCallback,
  useEffect,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type RefCallback,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {
  useHoverLayer,
  type HoverLayerFocusTrigger,
} from '../../internal/useHoverLayer';
import type {
  ContextRenderProps,
  LayerAlignment,
  LayerPlacement,
} from '../../internal/useLayer';

export type TooltipFocusTrigger = HoverLayerFocusTrigger;

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

  const hoverLayer = useHoverLayer({
    delay,
    focusTrigger,
    hideDelay,
    isEnabled,
    onFocusIn: event => {
      const target = event.target as HTMLElement;
      return target.matches(':focus-visible');
    },
    onHide,
    onShow,
  });

  const {interactionRef, layer, ref} = hoverLayer;

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
