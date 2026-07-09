'use client';

import type {ComponentPropsWithRef} from 'react';
import {
  layoutPanelRecipe,
  layoutRegionRecipe,
} from 'components/Layout/Layout.recipe';
import {useLayoutArea, useLayoutRegions} from 'components/Layout/LayoutContext';
import type {SpacingToken} from 'internal/spacingTokens';
import {cx} from 'utils/cx';

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
  padding?: SpacingToken;
  /**
   * Fixed width for the panel.
   */
  width?: number | string;
}

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
  const regions = useLayoutRegions();
  const hasDivider = regions?.hasDividers ?? false;
  const divider =
    hasDivider && (area === 'start' || area === 'end') ? area : 'none';

  return (
    <div
      {...rest}
      aria-label={label}
      className={cx(
        layoutPanelRecipe({isScrollable, divider}),
        layoutRegionRecipe({padding}),
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
