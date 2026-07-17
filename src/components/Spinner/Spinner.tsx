import type {CSSProperties, HTMLAttributes, Ref} from 'react';
import {spinnerRecipe} from 'components/Spinner/Spinner.recipe';
import type {
  SpinnerSize,
  SpinnerVariant,
} from 'components/Spinner/Spinner.types';
import {Text} from 'components/Text';
import {cx} from 'utils/cx';

type NativeSpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, 'size'>;

export interface SpinnerProps extends NativeSpinnerProps {
  /**
   * Accessible label for the loading status. Defaults to a string label when
   * provided, otherwise "Loading".
   */
  'aria-label'?: string;
  /**
   * Optionally adjust rendering by setting the className.
   */
  className?: string;
  /**
   * Test id applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Optional secondary text shown below the label to give more context about
   * the pending work.
   */
  description?: string;
  /**
   * Optional visible label shown below the spinner.
   */
  label?: string;
  /**
   * Ref forwarded to the root span element.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Visual size of the spinner. `sm`/`md`/`lg` use design-system icon size
   * tokens; the numeric sizes (`28`/`32`/`36`) are bespoke pixel values for
   * larger standalone loading states. Default is `md`.
   */
  size?: SpinnerSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Visual style variant for the spinner. Default is `default`.
   */
  variant?: SpinnerVariant;
}

/**
 * A compact loading indicator for pending or indeterminate work.
 *
 * Spinner renders with `role="status"` and an accessible name so assistive
 * technologies can announce loading state without exposing the decorative visual.
 */
export function Spinner({
  size,
  variant,
  label,
  description,
  className,
  'data-testid': dataTestId,
  style,
  ref,
  role = 'status',
  'aria-label': ariaLabelFromProps,
  ...htmlProps
}: SpinnerProps): React.JSX.Element {
  const hasLabel = typeof label === 'string' && label !== '';
  const hasDescription = typeof description === 'string' && description !== '';
  const hasText = hasLabel || hasDescription;
  const ariaLabel =
    ariaLabelFromProps != null && ariaLabelFromProps !== ''
      ? ariaLabelFromProps
      : hasLabel
        ? label
        : 'Loading';
  const onMedia = variant === 'onMedia';
  const labelColor = onMedia ? 'inherit' : undefined;
  const descriptionColor = onMedia ? 'inherit' : 'secondary';
  // Scale the text with the spinner: the larger numeric sizes use 16px/14px,
  // the token sizes use 14px/12px.
  const isLargeSize = typeof size === 'number';
  const labelSize = isLargeSize ? 'md' : undefined;
  const descriptionSize = isLargeSize ? 'sm' : 'xs';
  const classes = spinnerRecipe({size, variant, hasText});

  return (
    <span
      {...htmlProps}
      aria-label={ariaLabel}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      role={role}
      style={style}>
      <span aria-hidden="true" className={classes.visual} />
      {hasText ? (
        <span className={classes.text}>
          {hasLabel ? (
            <Text
              as="span"
              color={labelColor}
              size={labelSize}
              type="label"
              weight="bold">
              {label}
            </Text>
          ) : null}
          {hasDescription ? (
            <Text
              as="span"
              color={descriptionColor}
              size={descriptionSize}
              type="supporting">
              {description}
            </Text>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

Spinner.displayName = 'Spinner';
