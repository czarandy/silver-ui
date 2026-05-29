import type {ComponentPropsWithRef} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {layoutRegionRecipe} from './Layout.recipe';
import type {SpacingStep} from './types';

/**
 * Scrollable main content area within a Layout. Fills the remaining space
 * between panels and stretches to fill the available height.
 */
export interface LayoutContentProps extends ComponentPropsWithRef<'div'> {
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Whether the content area scrolls when it overflows.
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
}

const styles = {
  root: css({
    boxSizing: 'border-box',
    flex: 1,
    minH: 0,
    minW: 0,
    overflow: 'clip',
  }),
  scrollable: css({
    overflow: 'auto',
  }),
};

/**
 * Scrollable main content area within a Layout. Fills the remaining space
 * between panels and stretches to fill the available height.
 */
export function LayoutContent({
  children,
  className,
  'data-testid': dataTestId,
  isScrollable = true,
  label,
  padding = 4,
  ref,
  role,
  style,
  ...rest
}: LayoutContentProps): React.JSX.Element {
  return (
    <div
      {...rest}
      aria-label={label}
      className={cx(
        styles.root,
        layoutRegionRecipe({padding}),
        isScrollable && styles.scrollable,
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      role={role ?? (label != null ? 'region' : undefined)}
      style={style}>
      {children}
    </div>
  );
}

LayoutContent.displayName = 'LayoutContent';
