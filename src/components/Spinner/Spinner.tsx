import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../lib/cx';
import {Text} from '../Text';
import {spinnerRecipe, type SpinnerVariants} from './Spinner.recipe';

type SpinnerSize = NonNullable<SpinnerVariants>['size'];
type SpinnerShade = NonNullable<SpinnerVariants>['shade'];

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
  label?: ReactNode;
  /**
   * Ref forwarded to the root span element.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Visual color treatment for the spinner. Default is `default`.
   */
  shade?: SpinnerShade;
  /**
   * Visual size of the spinner. Matches Button size names. Default is `md`.
   */
  size?: SpinnerSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

const styles = {
  visual: css({
    display: 'block',
    w: 'var(--spinner-size)',
    h: 'var(--spinner-size)',
    flexShrink: 0,
    boxSizing: 'border-box',
    aspectRatio: 'square',
    borderRadius: 'full',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderTopColor: 'transparent',
    animation: 'spin 0.8s linear infinite',
  }),
};

export function Spinner({
  size: sizeFromProps,
  shade,
  label,
  className,
  'data-testid': dataTestId,
  style,
  ref,
  'aria-label': ariaLabelFromProps,
}: SpinnerProps): React.JSX.Element {
  const hasLabel = label != null;
  const size = sizeFromProps ?? 'md';
  const ariaLabel =
    ariaLabelFromProps ??
    (typeof label === 'string' ? label : undefined) ??
    'Loading';

  return (
    <span
      aria-label={ariaLabel}
      className={cx(spinnerRecipe({size, shade, hasLabel}), className)}
      data-testid={dataTestId}
      ref={ref}
      role="status"
      style={style}>
      <span aria-hidden="true" className={styles.visual} />
      {hasLabel ? (
        <Text as="span" type="label">
          {label}
        </Text>
      ) : null}
    </span>
  );
}

Spinner.displayName = 'Spinner';
