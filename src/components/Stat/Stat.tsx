import type {ComponentPropsWithRef, ReactNode} from 'react';
import {Icon, type IconComponent} from 'components/Icon';
import {statRecipe} from 'components/Stat/Stat.recipe';
import {Text} from 'components/Text';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

const classes = statRecipe();

export interface StatProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
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
 * Displays a prominent label-value summary with optional context and icon.
 */
export function Stat({
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
  return (
    <div
      {...htmlProps}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {icon != null ? (
        <Icon
          className={classes.icon}
          color="secondary"
          icon={icon}
          size="lg"
        />
      ) : null}
      <dl className={classes.definition}>
        <dt className={classes.label}>
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
