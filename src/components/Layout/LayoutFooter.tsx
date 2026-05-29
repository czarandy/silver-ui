import type {CSSProperties, ComponentPropsWithRef} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {layoutRegionRecipe} from './Layout.recipe';
import {useLayoutDivider} from './LayoutContext';
import type {SpacingStep} from './types';

/**
 * Footer landmark region within a Layout. Renders as a semantic
 * `<footer>` element with an optional top-edge divider.
 */
export interface LayoutFooterProps extends ComponentPropsWithRef<'footer'> {
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Fixed height for the footer.
   */
  height?: number | string;
  /**
   * Accessible label for the footer landmark.
   */
  label?: string;
  /**
   * Inner padding.
   */
  padding?: SpacingStep;
}

const styles = {
  root: css({
    flexShrink: 0,
  }),
  divider: css({
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'border',
  }),
  inner: css({
    boxSizing: 'border-box',
  }),
};

/**
 * Footer landmark region within a Layout. Renders as a semantic
 * `<footer>` element with an optional top-edge divider.
 */
export function LayoutFooter({
  children,
  className,
  'data-testid': dataTestId,
  height,
  label,
  padding = 4,
  ref,
  style,
  ...rest
}: LayoutFooterProps): React.JSX.Element {
  const dividerContext = useLayoutDivider();
  const hasDivider = dividerContext?.hasDividers ?? false;
  const rootStyle: CSSProperties = {height, ...style};

  return (
    <footer
      {...rest}
      aria-label={label}
      className={cx(styles.root, hasDivider && styles.divider, className)}
      data-divider={hasDivider || undefined}
      data-testid={dataTestId}
      ref={ref}
      style={rootStyle}>
      <div className={cx(styles.inner, layoutRegionRecipe({padding}))}>
        {children}
      </div>
    </footer>
  );
}

LayoutFooter.displayName = 'LayoutFooter';
