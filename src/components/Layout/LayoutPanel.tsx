import type {AriaRole, CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useLayoutArea} from './LayoutContext';
import type {SpacingStep} from './types';

export interface LayoutPanelProps {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
  hasDivider?: boolean;
  isScrollable?: boolean;
  label?: string;
  padding?: SpacingStep;
  ref?: Ref<HTMLDivElement>;
  role?: AriaRole;
  style?: CSSProperties;
  width?: number | string;
}

const styles = {
  root: css({
    boxSizing: 'border-box',
    flexShrink: 0,
    overflow: 'clip',
    p: 'var(--layout-region-padding)',
  }),
  scrollable: css({
    overflow: 'auto',
  }),
  dividerEnd: css({
    borderInlineEndWidth: '1px',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
  }),
  dividerStart: css({
    borderInlineStartWidth: '1px',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'border',
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

type LayoutPanelStyle = CSSProperties & {
  '--layout-region-padding': string;
};

export function LayoutPanel({
  children,
  className,
  'data-testid': dataTestId,
  hasDivider = false,
  isScrollable = true,
  label,
  padding = 4,
  ref,
  role,
  style,
  width,
}: LayoutPanelProps): React.JSX.Element {
  const area = useLayoutArea();
  const rootStyle: LayoutPanelStyle = {
    '--layout-region-padding': paddingByStep[padding],
    width,
    ...style,
  };

  return (
    <div
      aria-label={label}
      className={cx(
        styles.root,
        isScrollable && styles.scrollable,
        hasDivider && area === 'start' && styles.dividerEnd,
        hasDivider && area === 'end' && styles.dividerStart,
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      role={role}
      style={rootStyle}>
      {children}
    </div>
  );
}

LayoutPanel.displayName = 'LayoutPanel';
