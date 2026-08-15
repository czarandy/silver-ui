import type {CardColor, CardVariant} from 'components/Card/Card';
import {cardRecipe} from 'components/Card/Card.recipe';
import type {ClickableContainerProps} from 'components/Clickable';
import {ClickableContainerInternal} from 'components/Clickable/ClickableContainer';
import type {SpacingToken} from 'internal/spacingTokens';
import {cx} from 'utils/cx';

export interface ClickableCardProps extends ClickableContainerProps {
  /**
   * Decorative surface color. When set, overrides the variant's default
   * background with the corresponding surface color token.
   */
  color?: CardColor;
  /**
   * Inner padding step.
   * @default 0
   */
  padding?: SpacingToken;
  /**
   * Visual style variant.
   * @default 'default'
   */
  variant?: CardVariant;
}

/**
 * A Card surface that delegates activation to a real button or link while
 * keeping nested controls independently operable.
 */
export function ClickableCard({
  className,
  color,
  'data-testid': dataTestId,
  padding = 0,
  ref,
  style,
  variant = 'default',
  ...props
}: ClickableCardProps): React.JSX.Element {
  const cardClassName = cardRecipe({color, padding, variant});

  return (
    <ClickableContainerInternal
      {...props}
      className={cx(cardClassName, className)}
      data-testid={dataTestId}
      hasInheritedBorderRadius={false}
      ref={ref}
      style={style}
    />
  );
}

ClickableCard.displayName = 'ClickableCard';
