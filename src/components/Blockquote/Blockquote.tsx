import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';

export interface BlockquoteProps {
  children: ReactNode;
  cite?: ReactNode;
  className?: string;
  'data-testid'?: string;
  ref?: Ref<HTMLQuoteElement>;
  style?: CSSProperties;
}

const styles = {
  root: css({
    borderInlineStartWidth: '2px',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'silver-neutral.300',
    ps: '4',
    color: 'fg.muted',
    m: 0,
  }),
  cite: css({
    display: 'block',
    mt: '2',
    fontSize: 'sm',
    lineHeight: 'normal',
    fontStyle: 'normal',
  }),
} as const;

export function Blockquote({
  children,
  cite,
  className,
  'data-testid': dataTestId,
  ref,
  style,
}: BlockquoteProps): React.JSX.Element {
  return (
    <blockquote
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
      {cite != null ? (
        <footer>
          <cite className={styles.cite}>{cite}</cite>
        </footer>
      ) : null}
    </blockquote>
  );
}

Blockquote.displayName = 'Blockquote';
