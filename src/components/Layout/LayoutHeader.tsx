import type {AriaRole, CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useLayoutDivider} from './LayoutContext';
import type {SpacingStep} from './types';

export interface LayoutHeaderProps {
  /**
   * Content to render inside the header.
   */
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
  hasDivider?: boolean;
  height?: number | string;
  /**
   * Accessible label when a landmark role is used.
   */
  label?: string;
  padding?: SpacingStep;
  ref?: Ref<HTMLDivElement>;
  role?: AriaRole;
  style?: CSSProperties;
}

const styles = {
  root: css({
    flexShrink: 0,
  }),
  divider: css({
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'silver-neutral.200',
  }),
  inner: css({
    boxSizing: 'border-box',
    p: 'var(--layout-region-padding)',
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

type LayoutHeaderStyle = CSSProperties & {
  '--layout-region-padding': string;
};

export function LayoutHeader({
  children,
  className,
  'data-testid': dataTestId,
  hasDivider,
  height,
  label,
  padding = 4,
  ref,
  role,
  style,
}: LayoutHeaderProps): React.JSX.Element {
  const dividerContext = useLayoutDivider();
  const resolvedHasDivider =
    hasDivider ?? dividerContext?.defaultHasDividers ?? false;
  const rootStyle: CSSProperties = {height, ...style};
  const innerStyle: LayoutHeaderStyle = {
    '--layout-region-padding': paddingByStep[padding],
  };

  return (
    <div
      aria-label={label}
      className={cx(
        styles.root,
        resolvedHasDivider && styles.divider,
        className,
      )}
      data-divider={resolvedHasDivider || undefined}
      data-testid={dataTestId}
      ref={ref}
      role={role}
      style={rootStyle}>
      <div className={styles.inner} style={innerStyle}>
        {children}
      </div>
    </div>
  );
}

LayoutHeader.displayName = 'LayoutHeader';
