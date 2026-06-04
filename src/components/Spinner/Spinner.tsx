import type {CSSProperties, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Text} from '../Text';
import {spinnerRecipe, type SpinnerVariants} from './Spinner.recipe';

type SpinnerSize = NonNullable<SpinnerVariants>['size'];
type SpinnerVariant = NonNullable<SpinnerVariants>['variant'];

/**
 * A compact loading indicator for pending or indeterminate work.
 *
 * Spinner renders with `role="status"` and an accessible name so assistive
 * technologies can announce loading state without exposing the decorative visual.
 */
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

const styles = {
  visual: css({
    display: 'block',
    w: 'var(--spinner-size)',
    h: 'var(--spinner-size)',
    flexShrink: 0,
    aspectRatio: 'square',
    borderRadius: 'full',
    borderWidth: 'emphasized',
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderTopColor: 'transparent',
    animation: 'spin 0.8s linear infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  }),
};

export function Spinner({
  size,
  variant,
  label,
  className,
  'data-testid': dataTestId,
  style,
  ref,
  'aria-label': ariaLabelFromProps,
}: SpinnerProps): React.JSX.Element {
  const hasLabel = typeof label === 'string' && label !== '';
  const ariaLabel =
    ariaLabelFromProps != null && ariaLabelFromProps !== ''
      ? ariaLabelFromProps
      : hasLabel
        ? label
        : 'Loading';
  const labelColor = variant === 'onMedia' ? 'inherit' : undefined;

  return (
    <span
      aria-label={ariaLabel}
      className={cx(spinnerRecipe({size, variant, hasLabel}), className)}
      data-testid={dataTestId}
      ref={ref}
      role="status"
      style={style}>
      <span aria-hidden="true" className={styles.visual} />
      {hasLabel ? (
        <Text as="span" color={labelColor} type="label">
          {label}
        </Text>
      ) : null}
    </span>
  );
}

Spinner.displayName = 'Spinner';
