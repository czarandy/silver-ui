import type {ComponentPropsWithRef, ElementType} from 'react';
import {
  layoutContentRecipe,
  layoutRegionRecipe,
} from 'components/Layout/Layout.recipe';
import {cx} from 'internal/cx';
import type {SpacingToken} from '../../internal/spacingTokens';

/**
 * Scrollable main content area within a Layout. Fills the remaining space
 * between panels and stretches to fill the available height.
 */
export interface LayoutContentProps extends ComponentPropsWithRef<'div'> {
  /**
   * HTML element to render. Default is `div`.
   */
  as?: ElementType;
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
  padding?: SpacingToken;
}

/**
 * Scrollable main content area within a Layout. Fills the remaining space
 * between panels and stretches to fill the available height.
 */
export function LayoutContent({
  as: Element = 'div',
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
    <Element
      {...rest}
      aria-label={label}
      className={cx(
        layoutContentRecipe({isScrollable}),
        layoutRegionRecipe({padding}),
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      role={role ?? (label != null ? 'region' : undefined)}
      style={style}>
      {children}
    </Element>
  );
}

LayoutContent.displayName = 'LayoutContent';
