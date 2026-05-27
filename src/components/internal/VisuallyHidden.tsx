import type {JSX, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';

export interface VisuallyHiddenProps {
  children: ReactNode;
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
  ref,
}: VisuallyHiddenProps): JSX.Element {
  return (
    <span className={styles.root} ref={ref}>
      {children}
    </span>
  );
}

VisuallyHidden.displayName = 'VisuallyHidden';
