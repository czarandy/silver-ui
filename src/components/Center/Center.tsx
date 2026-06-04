import type {HTMLAttributes, ReactNode, Ref} from 'react';
import {cx} from '../../internal/cx';
import {toPixelSize, type SizeValue} from '../../internal/toPixelSize';
import {centerRecipe} from './Center.recipe';

export type CenterAxis = 'both' | 'horizontal' | 'vertical';

export interface CenterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Which axes to center content along.
   */
  axis?: CenterAxis;
  /**
   * Content to center.
   */
  children: ReactNode;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Fixed height. Numbers are treated as pixels.
   */
  height?: SizeValue;
  /**
   * Render as `inline-flex` instead of `flex`.
   */
  isInline?: boolean;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Fixed width. Numbers are treated as pixels.
   */
  width?: SizeValue;
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
  ...htmlProps
}: CenterProps): React.JSX.Element {
  return (
    <div
      {...htmlProps}
      className={cx(centerRecipe({axis, isInline}), className)}
      data-testid={dataTestId}
      ref={ref}
      style={{
        ...style,
        ...(width != null ? {width: toPixelSize(width)} : undefined),
        ...(height != null ? {height: toPixelSize(height)} : undefined),
      }}>
      {children}
    </div>
  );
}

Center.displayName = 'Center';
