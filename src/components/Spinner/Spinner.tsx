import type {ComponentPropsWithRef, ReactNode} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../lib/cx';
import {spinnerRecipe, type SpinnerVariants} from './Spinner.recipe';

type NativeSpinnerProps = Omit<
  ComponentPropsWithRef<'span'>,
  'children' | 'color'
>;

export interface SpinnerProps
  extends NativeSpinnerProps, NonNullable<SpinnerVariants> {
  'data-testid'?: string;
  label?: ReactNode;
}

const visualClassName = css({
  display: 'block',
  w: '1em',
  h: '1em',
  borderRadius: 'full',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: 'currentColor',
  borderTopColor: 'transparent',
  animation: 'spin 0.8s linear infinite',
});

const labelClassName = css({
  color: 'fg',
  fontFamily: 'body',
  fontSize: 'sm',
  fontWeight: 'medium',
  lineHeight: 'normal',
});

export function Spinner({
  size,
  shade,
  label,
  className,
  'data-testid': dataTestId,
  style,
  ref,
  'aria-label': ariaLabel,
  ...rest
}: SpinnerProps): React.JSX.Element {
  const hasLabel = label != null;
  const resolvedAriaLabel =
    ariaLabel ?? (typeof label === 'string' ? label : undefined) ?? 'Loading';

  return (
    <span
      aria-label={resolvedAriaLabel}
      className={cx(spinnerRecipe({size, shade, hasLabel}), className)}
      data-testid={dataTestId}
      ref={ref}
      role="status"
      style={style}
      {...rest}>
      <span aria-hidden="true" className={visualClassName} />
      {hasLabel ? <span className={labelClassName}>{label}</span> : null}
    </span>
  );
}

Spinner.displayName = 'Spinner';
