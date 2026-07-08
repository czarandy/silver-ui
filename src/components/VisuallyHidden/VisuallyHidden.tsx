import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  JSX,
  ReactNode,
  Ref,
} from 'react';
import {cx} from 'internal/cx';
import {css} from 'styled-system/css';

export interface VisuallyHiddenProps extends Omit<
  ComponentPropsWithoutRef<'span'>,
  'ref' | 'style'
> {
  children?: ReactNode;
  /**
   * Test id applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the root span element.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

const styles = {
  root: css({
    position: 'absolute',
    w: '1px',
    h: '1px',
    p: 0,
    m: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }),
};

export function VisuallyHidden({
  children,
  className,
  'data-testid': dataTestId,
  ref,
  style,
  ...props
}: VisuallyHiddenProps): JSX.Element {
  return (
    <span
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}
      {...props}>
      {children}
    </span>
  );
}

VisuallyHidden.displayName = 'VisuallyHidden';
