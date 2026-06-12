import type {CSSProperties, ReactNode, Ref} from 'react';
import {
  useTooltip,
  type TooltipFocusTrigger,
} from 'components/Tooltip/useTooltip';
import {HoverLayerTrigger} from 'internal/HoverLayerTrigger';
import type {LayerAlignment, LayerPlacement} from 'internal/useLayer';

export type {TooltipFocusTrigger} from 'components/Tooltip/useTooltip';

export interface TooltipProps {
  /**
   * Cross-axis alignment of the tooltip relative to the anchor.
   * @default 'center'
   */
  alignment?: LayerAlignment;
  /**
   * Element(s) that the tooltip is anchored to.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the wrapper.
   */
  className?: string;
  /**
   * Content rendered inside the tooltip popup.
   */
  content: ReactNode;
  /**
   * Inline styles applied to the tooltip content area.
   */
  contentStyle?: CSSProperties;
  /**
   * Test ID applied to the wrapper.
   */
  'data-testid'?: string;
  /**
   * Delay in milliseconds before the tooltip appears.
   * @default 200
   */
  delay?: number;
  /**
   * How focus interactions trigger the tooltip.
   * @default 'auto'
   */
  focusTrigger?: TooltipFocusTrigger;
  /**
   * Delay in milliseconds before the tooltip hides after leaving.
   * @default 0
   */
  hideDelay?: number;
  /**
   * Dashed underline display for tooltip triggers.
   * @default 'auto'
   */
  hoverIndication?: 'always' | 'auto' | 'never';
  /**
   * Whether the tooltip can be shown.
   * @default true
   */
  isEnabled?: boolean;
  /**
   * Preferred placement of the tooltip relative to the anchor.
   * @default 'above'
   */
  placement?: LayerPlacement;
  /**
   * Ref forwarded to the wrapper element.
   */
  ref?: Ref<HTMLDivElement | HTMLSpanElement>;
  /**
   * Inline styles applied to the wrapper.
   */
  style?: CSSProperties;
}

/**
 * Displays contextual information in a popup anchored to a trigger element.
 *
 * For attaching a tooltip to an external ref (without wrapping children),
 * use the `useTooltip` hook directly.
 */
export function Tooltip({
  children,
  content,
  contentStyle,
  placement = 'above',
  alignment = 'center',
  delay = 200,
  hideDelay = 0,
  focusTrigger = 'auto',
  isEnabled = true,
  hoverIndication = 'auto',
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: TooltipProps): React.JSX.Element {
  const tooltip = useTooltip({
    placement,
    alignment,
    delay,
    hideDelay,
    focusTrigger,
    isEnabled,
  });

  return (
    <HoverLayerTrigger
      className={className}
      data-testid={dataTestId}
      describedBy={tooltip.describedBy}
      hoverIndication={hoverIndication}
      layer={tooltip.renderTooltip(content, {contentStyle})}
      nonTextWrapperElement="div"
      style={style}
      triggerRef={tooltip.ref}
      wrapperRef={ref}>
      {children}
    </HoverLayerTrigger>
  );
}

Tooltip.displayName = 'Tooltip';
