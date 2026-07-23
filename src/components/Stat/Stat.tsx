import {Minus, TrendingDown, TrendingUp} from 'lucide-react';
import type {ComponentPropsWithRef, ReactNode} from 'react';
import {Icon, type IconComponent} from 'components/Icon';
import {statRecipe} from 'components/Stat/Stat.recipe';
import {Text} from 'components/Text';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

type StatChangeDirection = 'decrease' | 'increase' | 'unchanged';

export type StatChangeSentiment = 'auto' | 'inverted' | 'neutral';

function getChangeDirection(change: number): StatChangeDirection {
  if (change > 0) {
    return 'increase';
  }
  if (change < 0) {
    return 'decrease';
  }
  return 'unchanged';
}

function getChangeTone(
  direction: StatChangeDirection,
  sentiment: StatChangeSentiment,
): 'negative' | 'neutral' | 'positive' {
  if (direction === 'unchanged' || sentiment === 'neutral') {
    return 'neutral';
  }
  const isImprovement = (direction === 'increase') === (sentiment === 'auto');
  return isImprovement ? 'positive' : 'negative';
}

const changeIconByDirection: Record<StatChangeDirection, IconComponent> = {
  decrease: TrendingDown,
  increase: TrendingUp,
  unchanged: Minus,
};

const changeFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

function formatChangeAsPercent(change: number): string {
  return `${changeFormat.format(Math.abs(change))}%`;
}

export interface StatProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
  /**
   * Percentage change. Positive values indicate an increase and negative
   * values indicate a decrease. Non-finite values (`NaN`, `Infinity`) are not
   * rendered.
   */
  change?: number;
  /**
   * How the change maps to a positive or negative tone. Use `inverted` for
   * metrics where a decrease is an improvement (for example churn or costs)
   * and `neutral` to avoid signaling either way.
   */
  changeSentiment?: StatChangeSentiment;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Label rendered after the formatted change when it is a decrease.
   */
  decreaseLabel?: string;
  /**
   * Optional supporting context rendered below the value.
   */
  description?: ReactNode;
  /**
   * Formats the change for display. Receives the signed change and defaults
   * to a locale-formatted absolute percentage, for example `12.5%`.
   */
  formatChange?: (change: number) => string;
  /**
   * Whether to use tabular (monospaced) number figures for the value and
   * change.
   * @default true
   */
  hasTabularNumbers?: boolean;
  /**
   * Optional decorative icon rendered beside the statistic.
   */
  icon?: IconComponent;
  /**
   * Label rendered after the formatted change when it is an increase.
   */
  increaseLabel?: string;
  /**
   * Descriptive label for the statistic.
   */
  label: ReactNode;
  /**
   * Label rendered after the formatted change when it is zero.
   */
  unchangedLabel?: string;
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
  changeSentiment = 'auto',
  className,
  'data-testid': dataTestId,
  decreaseLabel = 'decreased',
  description,
  formatChange = formatChangeAsPercent,
  hasTabularNumbers = true,
  icon,
  increaseLabel = 'increased',
  label,
  ref,
  style,
  unchangedLabel = 'unchanged',
  value,
  ...htmlProps
}: StatProps): React.JSX.Element {
  const changeDirection =
    change != null && Number.isFinite(change)
      ? getChangeDirection(change)
      : null;
  const classes = statRecipe({
    changeTone:
      changeDirection == null
        ? 'neutral'
        : getChangeTone(changeDirection, changeSentiment),
  });
  const changeLabelByDirection: Record<StatChangeDirection, string> = {
    decrease: decreaseLabel,
    increase: increaseLabel,
    unchanged: unchangedLabel,
  };

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
            <Icon color="secondary" icon={icon} size="sm" />
          ) : null}
          <Text color="secondary" type="label">
            {label}
          </Text>
        </dt>
        <dd className={classes.details}>
          <Text
            className={classes.value}
            display="block"
            hasTabularNumbers={hasTabularNumbers}
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
                hasTabularNumbers={hasTabularNumbers}
                type="supporting">
                {formatChange(change)} {changeLabelByDirection[changeDirection]}
              </Text>
            </span>
          ) : null}
          {isNonEmptyReactNode(description) ? (
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
