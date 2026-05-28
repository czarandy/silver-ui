import type {CSSProperties, ReactNode, Ref} from 'react';
import {cx} from '../../internal/cx';
import type {SizeValue} from '../Stack';
import {centerRecipe} from './Center.recipe';

export type CenterAxis = 'both' | 'horizontal' | 'vertical';

export interface CenterProps {
  axis?: CenterAxis;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  height?: SizeValue;
  isInline?: boolean;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  width?: SizeValue;
}

function toSize(value: SizeValue | undefined): string | number | undefined {
  return typeof value === 'number' ? `${value}px` : value;
}

export function Center({
  axis = 'both',
  children,
  className,
  'data-testid': dataTestId,
  height,
  isInline = false,
  ref,
  style,
  width,
}: CenterProps): React.JSX.Element {
  return (
    <div
      className={cx(centerRecipe({axis, isInline}), className)}
      data-testid={dataTestId}
      ref={ref}
      style={{width: toSize(width), height: toSize(height), ...style}}>
      {children}
    </div>
  );
}

Center.displayName = 'Center';
