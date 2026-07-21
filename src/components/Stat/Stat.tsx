import {Minus, TrendingDown, TrendingUp} from 'lucide-react';
import type {ComponentPropsWithRef, ReactNode} from 'react';
import {Icon, type IconComponent} from 'components/Icon';
import {statRecipe} from 'components/Stat/Stat.recipe';
import {Text} from 'components/Text';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

const classes = statRecipe();

type StatChangeDirection = 'decrease' | 'increase' | 'unchanged';

function getChangeDirection(change: number): StatChangeDirection {
  if (change > 0) {
    return 'increase';
  }
  if (change < 0) {
    return 'decrease';
  }
  return 'unchanged';
}

const changeIconByDirection: Record<StatChangeDirection, IconComponent> = {
  decrease: TrendingDown,
  increase: TrendingUp,
  unchanged: Minus,
};

const changeLabelByDirection: Record<StatChangeDirection, string> = {
  decrease: 'decreased',
  increase: 'increased',
  unchanged: 'unchanged',
};

export interface StatProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
  /**
   * Percentage change. Positive values indicate an increase and negative
   * values indicate a decrease.
   */
  change?: number;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Optional supporting context rendered below the value.
   */
  description?: ReactNode;
  /**
   * Optional decorative icon rendered beside the statistic.
   */
  icon?: IconComponent;
  /**
   * Descriptive label for the statistic.
   */
  label: ReactNode;
  /**
   * Prominent statistic value.
   */
  value: ReactNode;
}

/**
 * Displays a prominent label-value summary with optional change, context, and
 * icon.
 */
export function Stat({
  change,
  className,
  'data-testid': dataTestId,
  description,
  icon,
  label,
  ref,
  style,
  value,
  ...htmlProps
}: StatProps): React.JSX.Element {
  const changeDirection = change == null ? null : getChangeDirection(change);

  return (
    <div
      {...htmlProps}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <dl className={classes.definition}>
        <dt className={classes.label}>
          {icon != null ? (
            <Icon
              className={classes.icon}
              color="secondary"
              icon={icon}
              size="sm"
            />
          ) : null}
          <Text color="secondary" type="label">
            {label}
          </Text>
        </dt>
        <dd className={classes.details}>
          <Text
            className={classes.value}
            display="block"
            hasTabularNumbers
            type="display-2">
            {value}
          </Text>
          {change != null && changeDirection != null ? (
            <span className={classes.change} data-direction={changeDirection}>
              <Icon
                color="inherit"
                icon={changeIconByDirection[changeDirection]}
                size="sm"
              />
              <Text
                color="inherit"
                hasTabularNumbers
                textWrap="nowrap"
                type="supporting">
                {Math.abs(change)}% {changeLabelByDirection[changeDirection]}
              </Text>
            </span>
          ) : null}
          {isReactNode(description) ? (
            <Text
              className={classes.description}
              color="secondary"
              display="block"
              type="supporting">
              {description}
            </Text>
          ) : null}
        </dd>
      </dl>
    </div>
  );
}

Stat.displayName = 'Stat';
