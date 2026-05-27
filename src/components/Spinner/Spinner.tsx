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
      ref={ref}
      role="status"
      aria-label={resolvedAriaLabel}
      className={cx(spinnerRecipe({size, shade, hasLabel}), className)}
      style={style}
      {...rest}>
      <span className={visualClassName} aria-hidden="true" />
      {hasLabel ? <span className={labelClassName}>{label}</span> : null}
    </span>
  );
}

Spinner.displayName = 'Spinner';
