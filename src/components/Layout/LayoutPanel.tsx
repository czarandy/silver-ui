import type {ComponentPropsWithRef} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {layoutRegionRecipe} from './Layout.recipe';
import {useLayoutArea, useLayoutDivider} from './LayoutContext';
import type {SpacingStep} from './types';

/**
 * Side panel region within a Layout. Placed in the start or end slot,
 * with optional dividers and scrolling.
 */
export interface LayoutPanelProps extends ComponentPropsWithRef<'div'> {
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Whether the panel scrolls when it overflows.
   */
  isScrollable?: boolean;
  /**
   * Accessible label. Automatically sets role="region" when provided.
   */
  label?: string;
  /**
   * Inner padding.
   */
  padding?: SpacingStep;
  /**
   * Fixed width for the panel.
   */
  width?: number | string;
}

const styles = {
  root: css({
    boxSizing: 'border-box',
    flexShrink: 0,
    overflow: 'clip',
  }),
  scrollable: css({
    overflow: 'auto',
  }),
  dividerEnd: css({
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
  }),
  dividerStart: css({
    borderInlineStartWidth: 'default',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'border',
  }),
};

/**
 * Side panel region within a Layout. Placed in the start or end slot,
 * with optional dividers and scrolling.
 */
export function LayoutPanel({
  children,
  className,
  'data-testid': dataTestId,
  isScrollable = true,
  label,
  padding = 4,
  ref,
  role,
  style,
  width,
  ...rest
}: LayoutPanelProps): React.JSX.Element {
  const area = useLayoutArea();
  const dividerContext = useLayoutDivider();
  const hasDivider = dividerContext?.hasDividers ?? false;

  return (
    <div
      {...rest}
      aria-label={label}
      className={cx(
        styles.root,
        layoutRegionRecipe({padding}),
        isScrollable && styles.scrollable,
        hasDivider && area === 'start' && styles.dividerEnd,
        hasDivider && area === 'end' && styles.dividerStart,
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      role={role ?? (label != null ? 'region' : undefined)}
      style={{width, ...style}}>
      {children}
    </div>
  );
}

LayoutPanel.displayName = 'LayoutPanel';
