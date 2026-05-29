import type {ComponentPropsWithRef} from 'react';
import {cx} from '../../internal/cx';
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
export interface CardProps extends ComponentPropsWithRef<'div'> {
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Inner padding step.
   * @default 0
   */
  padding?: SpacingStep;
  /**
   * Visual style variant.
   * @default 'default'
   */
  variant?: CardVariant;
}

/**
 * Rounded container surface for grouping related content.
 */
export function Card({
  children,
  className,
  'data-testid': dataTestId,
  padding = 0,
  ref,
  style,
  variant = 'default',
  ...htmlProps
}: CardProps): React.JSX.Element {
  return (
    <div
      {...htmlProps}
      className={cx(cardRecipe({variant, padding}), className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
    </div>
  );
}

Card.displayName = 'Card';
