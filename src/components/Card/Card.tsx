import type {CSSProperties, ReactNode, Ref} from 'react';
import {cx} from '../../internal/cx';
import type {SizeValue, StackGap} from '../Stack';
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
  padding?: StackGap;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  variant?: CardVariant;
  width?: SizeValue;
}

const paddingByStep: Record<StackGap, string> = {
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
};

type CardStyle = CSSProperties & {
  '--card-padding': string;
};

function toSize(value: SizeValue | undefined): string | number | undefined {
  return typeof value === 'number' ? `${value}px` : value;
}

export function Card({
  children,
  className,
  'data-testid': dataTestId,
  height,
  maxWidth,
  minHeight,
  padding = 4,
  ref,
  style,
  variant = 'default',
  width,
}: CardProps): React.JSX.Element {
  const hasFixedHeight = height != null && height !== 'auto';
  const cardStyle: CardStyle = {
    '--card-padding': paddingByStep[padding],
    width: toSize(width),
    height: toSize(height),
    maxWidth: toSize(maxWidth),
    minHeight: toSize(minHeight),
    ...style,
  };

  return (
    <div
      className={cx(cardRecipe({variant, hasFixedHeight}), className)}
      data-testid={dataTestId}
      ref={ref}
      style={cardStyle}>
      {children}
    </div>
  );
}

Card.displayName = 'Card';
