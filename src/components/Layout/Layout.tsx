import type {CSSProperties, ReactNode, Ref} from 'react';
import {useMemo} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {layoutMiddleRecipe, layoutRecipe} from './Layout.recipe';
import {
  LayoutAreaContext,
  LayoutDividerContext,
  LayoutSlotsContext,
  type LayoutArea,
} from './LayoutContext';
import type {LayoutHeight, SpacingStep} from './types';

/**
 * Page shell with header, side panels, content, and footer slots.
 */
export interface LayoutProps {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Main content slot.
   */
  content?: ReactNode;
  /**
   * Maximum content width in pixels.
   */
  contentWidth?: number;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * End panel slot.
   */
  end?: ReactNode;
  /**
   * Footer slot.
   */
  footer?: ReactNode;
  /**
   * Whether child layout regions should show dividers by default.
   */
  hasDefaultDividers?: boolean;
  /**
   * Header slot.
   */
  header?: ReactNode;
  /**
   * Layout height behavior. Default is `fill`.
   */
  height?: LayoutHeight;
  /**
   * Outer padding for layout edges.
   */
  padding?: SpacingStep;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Start panel slot.
   */
  start?: ReactNode;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

const styles = {
  padded: css({
    p: 'var(--layout-padding)',
  }),
  contentWidth: css({
    w: '100%',
    maxW: 'var(--layout-content-width)',
    mx: 'auto',
  }),
  contentFill: css({
    flex: 1,
    minW: 0,
    display: 'flex',
    flexDirection: 'column',
  }),
};

const spacingByStep: Record<SpacingStep, string> = {
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

type LayoutStyle = CSSProperties & {
  '--layout-content-width'?: string;
  '--layout-padding'?: string;
};

function AreaProvider({
  area,
  children,
}: {
  area: LayoutArea;
  children?: ReactNode;
}): React.JSX.Element | null {
  if (children == null) {
    return null;
  }

  return <LayoutAreaContext value={area}>{children}</LayoutAreaContext>;
}

export function Layout({
  className,
  content,
  contentWidth,
  'data-testid': dataTestId,
  hasDefaultDividers,
  end,
  footer,
  header,
  height = 'fill',
  padding,
  ref,
  start,
  style,
}: LayoutProps): React.JSX.Element {
  const slots = useMemo(
    () => ({
      hasEnd: end != null,
      hasFooter: footer != null,
      hasHeader: header != null,
      hasStart: start != null,
    }),
    [end, footer, header, start],
  );
  const dividerValue = useMemo(
    () =>
      hasDefaultDividers != null
        ? {defaultHasDividers: hasDefaultDividers}
        : null,
    [hasDefaultDividers],
  );
  const rootStyle: LayoutStyle = {
    ...(contentWidth != null
      ? {'--layout-content-width': `${contentWidth}px`}
      : undefined),
    ...(padding != null ? {'--layout-padding': spacingByStep[padding]} : {}),
    ...style,
  };

  const tree = (
    <LayoutSlotsContext value={slots}>
      <div
        className={cx(
          layoutRecipe({height}),
          padding != null && styles.padded,
          className,
        )}
        data-testid={dataTestId}
        ref={ref}
        style={rootStyle}>
        <AreaProvider area="header">{header}</AreaProvider>
        <div
          className={cx(
            layoutMiddleRecipe(),
            contentWidth != null && styles.contentWidth,
          )}>
          <AreaProvider area="start">{start}</AreaProvider>
          <div className={styles.contentFill}>
            <AreaProvider area="content">{content}</AreaProvider>
          </div>
          <AreaProvider area="end">{end}</AreaProvider>
        </div>
        <AreaProvider area="footer">{footer}</AreaProvider>
      </div>
    </LayoutSlotsContext>
  );

  if (dividerValue != null) {
    return (
      <LayoutDividerContext value={dividerValue}>{tree}</LayoutDividerContext>
    );
  }

  return tree;
}

Layout.displayName = 'Layout';
