import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';

export interface InputGroupTextProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
}

const styles = {
  root: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    px: '3',
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'border.emphasized',
    bg: 'bg.subtle',
    color: 'fg.muted',
    fontFamily: 'body',
    fontSize: 'md',
    whiteSpace: 'nowrap',
  }),
} as const;

export function InputGroupText({
  children,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: InputGroupTextProps): React.JSX.Element {
  return (
    <div
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
    </div>
  );
}

InputGroupText.displayName = 'InputGroupText';
