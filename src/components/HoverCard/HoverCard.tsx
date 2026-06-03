import type {CSSProperties, ReactNode, Ref} from 'react';
import {HoverLayerTrigger} from '../../internal/HoverLayerTrigger';
import type {LayerAlignment, LayerPlacement} from '../../internal/useLayer';
import {useHoverCard, type HoverCardFocusTrigger} from './useHoverCard';

export type {HoverCardFocusTrigger} from './useHoverCard';

export interface HoverCardProps {
  /**
   * Alignment along the placement axis.
   * @default 'center'
   */
  alignment?: LayerAlignment;
  /**
   * Trigger content.
   */
  children: ReactNode;
  /**
   * Additional class names applied to the trigger wrapper for text triggers.
   */
  className?: string;
  /**
   * Content shown in the floating hover card.
   */
  content: ReactNode;
  /**
   * Test ID applied to the trigger wrapper for text triggers.
   */
  'data-testid'?: string;
  /**
   * Delay before opening on hover, in milliseconds.
   * @default 300
   */
  delay?: number;
  /**
   * Controls focus-trigger behavior.
   * @default 'auto'
   */
  focusTrigger?: HoverCardFocusTrigger;
  /**
   * Whether to visually underline text triggers.
   * @default 'auto'
   */
  hasHoverIndication?: 'auto' | boolean;
  /**
   * Delay before closing after hover/focus leaves, in milliseconds.
   * @default 200
   */
  hideDelay?: number;
  /**
   * Whether hover/focus interactions are enabled.
   * @default true
   */
  isEnabled?: boolean;
  /**
   * Position relative to the trigger.
   * @default 'above'
   */
  placement?: LayerPlacement;
  /**
   * Ref forwarded to the text trigger wrapper.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Inline styles applied to the text trigger wrapper.
   */
  style?: CSSProperties;
}

/**
 * A floating card that appears on hover or focus of a trigger element.
 */
export function HoverCard({
  children,
  content,
  placement = 'above',
  alignment = 'center',
  delay = 300,
  hideDelay = 200,
  focusTrigger = 'auto',
  isEnabled = true,
  hasHoverIndication = 'auto',
  className,
  style,
  ref,
  'data-testid': dataTestId,
}: HoverCardProps): React.JSX.Element {
  const hoverCard = useHoverCard({
    alignment,
    delay,
    focusTrigger,
    hideDelay,
    isEnabled,
    placement,
  });

  return (
    <HoverLayerTrigger
      className={className}
      data-testid={dataTestId}
      describedBy={hoverCard.describedBy}
      hasHoverIndication={hasHoverIndication}
      layer={hoverCard.renderHoverCard(content)}
      shouldForwardNonTextWrapperProps={false}
      style={style}
      triggerRef={hoverCard.ref}
      wrapperRef={ref}>
      {children}
    </HoverLayerTrigger>
  );
}

HoverCard.displayName = 'HoverCard';
