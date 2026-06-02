import type {ComponentPropsWithoutRef, JSX, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from './cx';

export interface VisuallyHiddenProps extends Omit<
  ComponentPropsWithoutRef<'span'>,
  'ref'
> {
  children?: ReactNode;
  ref?: Ref<HTMLSpanElement>;
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
  ref,
  ...props
}: VisuallyHiddenProps): JSX.Element {
  return (
    <span className={cx(styles.root, className)} ref={ref} {...props}>
      {children}
    </span>
  );
}

VisuallyHidden.displayName = 'VisuallyHidden';
