import type {CSSProperties, Ref} from 'react';
import {spinnerRecipe} from 'components/Spinner/Spinner.recipe';
import type {
  SpinnerSize,
  SpinnerVariant,
} from 'components/Spinner/Spinner.types';
import {Text} from 'components/Text';
import {cx} from 'internal/cx';

export interface SpinnerProps {
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
   * Visual size of the spinner. Matches Button size names. Default is `md`.
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
  'aria-label': ariaLabelFromProps,
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
  // Scale the text with the spinner: xl uses 16px/14px, all others 14px/12px.
  const labelSize = size === 'xl' ? 'md' : undefined;
  const descriptionSize = size === 'xl' ? 'sm' : 'xs';
  const classes = spinnerRecipe({size, variant, hasText});

  return (
    <span
      aria-label={ariaLabel}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      role="status"
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
