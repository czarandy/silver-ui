import type {ComponentPropsWithRef} from 'react';
import {cardRecipe} from 'components/Card/Card.recipe';
import type {SpacingToken} from 'internal/spacingTokens';
import {cx} from 'utils/cx';

export type CardColor =
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

export type CardVariant = 'default' | 'section' | 'transparent' | 'muted';

/**
 * Rounded container surface for grouping related content.
 */
export interface CardProps extends ComponentPropsWithRef<'div'> {
  /**
   * Decorative surface color. When set, overrides the variant's default
   * background with the corresponding surface color token.
   */
  color?: CardColor;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Inner padding step.
   * @default 0
   */
  padding?: SpacingToken;
  /**
   * Visual style variant.
   *
   * - `default` — bordered, rounded container with `bg` background.
   * - `section` — flat container with no border or border-radius, for use
   *   inside a larger container.
   * - `transparent` — no background.
   * - `muted` — subtle background, no visible border.
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
  color,
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
      className={cx(cardRecipe({variant, color, padding}), className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
    </div>
  );
}

Card.displayName = 'Card';
