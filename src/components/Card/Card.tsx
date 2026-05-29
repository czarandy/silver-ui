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

export interface CardProps {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
  height?: SizeValue;
  maxWidth?: SizeValue;
  minHeight?: SizeValue;
  padding?: SpacingStep;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  variant?: CardVariant;
  width?: SizeValue;
}

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
