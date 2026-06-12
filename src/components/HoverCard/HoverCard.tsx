import type {CSSProperties, ReactNode, Ref} from 'react';
import {
  useHoverCard,
  type HoverCardFocusTrigger,
} from 'components/HoverCard/useHoverCard';
import {HoverLayerTrigger} from 'internal/HoverLayerTrigger';
import type {LayerAlignment, LayerPlacement} from 'internal/useLayer';

export type {HoverCardFocusTrigger} from 'components/HoverCard/useHoverCard';

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
   * Delay before closing after hover/focus leaves, in milliseconds.
   * @default 200
   */
  hideDelay?: number;
  /**
   * Dashed underline display for text triggers.
   * @default 'auto'
   */
  hoverIndication?: 'always' | 'auto' | 'never';
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
  hoverIndication = 'auto',
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
      hoverIndication={hoverIndication}
      isNonTextWrapperPropsForwarded={false}
      layer={hoverCard.renderHoverCard(content)}
      style={style}
      triggerRef={hoverCard.ref}
      wrapperRef={ref}>
      {children}
    </HoverLayerTrigger>
  );
}

HoverCard.displayName = 'HoverCard';
