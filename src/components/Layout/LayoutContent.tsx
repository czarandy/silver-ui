import type {AriaRole, CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import type {SpacingStep} from './types';

export interface LayoutContentProps {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
  id?: string;
  isScrollable?: boolean;
  label?: string;
  padding?: SpacingStep;
  ref?: Ref<HTMLDivElement>;
  role?: AriaRole;
  style?: CSSProperties;
}

const styles = {
  root: css({
    boxSizing: 'border-box',
    flex: 1,
    minH: 0,
    minW: 0,
    overflow: 'clip',
    p: 'var(--layout-region-padding)',
  }),
  scrollable: css({
    overflow: 'auto',
  }),
};

const paddingByStep: Record<SpacingStep, string> = {
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
};

type LayoutContentStyle = CSSProperties & {
  '--layout-region-padding': string;
};

export function LayoutContent({
  children,
  className,
  'data-testid': dataTestId,
  id,
  isScrollable = true,
  label,
  padding = 4,
  ref,
  role,
  style,
}: LayoutContentProps): React.JSX.Element {
  const rootStyle: LayoutContentStyle = {
    '--layout-region-padding': paddingByStep[padding],
    ...style,
  };

  return (
    <div
      aria-label={label}
      className={cx(styles.root, isScrollable && styles.scrollable, className)}
      data-testid={dataTestId}
      id={id}
      ref={ref}
      role={role}
      style={rootStyle}>
      {children}
    </div>
  );
}

LayoutContent.displayName = 'LayoutContent';
