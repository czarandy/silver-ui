import type {CSSProperties, ReactNode, Ref} from 'react';
import {cx} from '../../internal/cx';
import {toPixelSize, type SizeValue} from '../../internal/toPixelSize';
import type {SpacingStep} from '../Layout/types';
import {cardRecipe} from './Card.recipe';

export type CardVariant =
  | 'default'
  | 'transparent'
  | 'muted'
  | 'blue'
  | 'cyan'
  | 'gray'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow';

/**
 * Rounded container surface for grouping related content.
 */
export interface CardProps {
  /**
   * Card content.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Fixed height of the card.
   */
  height?: SizeValue;
  /**
   * Maximum width of the card.
   */
  maxWidth?: SizeValue;
  /**
   * Minimum height of the card.
   */
  minHeight?: SizeValue;
  /**
   * Inner padding step.
   * @default 0
   */
  padding?: SpacingStep;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Visual style variant.
   * @default 'default'
   */
  variant?: CardVariant;
  /**
   * Fixed width of the card.
   */
  width?: SizeValue;
}

/**
 * Rounded container surface for grouping related content.
 */
export function Card({
  children,
  className,
  'data-testid': dataTestId,
  height,
  maxWidth,
  minHeight,
  padding = 0,
  ref,
  style,
  variant = 'default',
  width,
}: CardProps): React.JSX.Element {
  const hasFixedHeight = height != null && height !== 'auto';
  const cardStyle: CSSProperties = {
    width: toPixelSize(width),
    height: toPixelSize(height),
    maxWidth: toPixelSize(maxWidth),
    minHeight: toPixelSize(minHeight),
    ...style,
  };

  return (
    <div
      className={cx(cardRecipe({variant, padding, hasFixedHeight}), className)}
      data-testid={dataTestId}
      ref={ref}
      style={cardStyle}>
      {children}
    </div>
  );
}

Card.displayName = 'Card';
