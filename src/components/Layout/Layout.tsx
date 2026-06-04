import type {CSSProperties, ReactNode, Ref} from 'react';
import {useMemo} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import type {SpacingToken} from '../../internal/spacingTokens';
import {layoutMiddleRecipe, layoutRecipe} from './Layout.recipe';
import {
  LayoutAreaContext,
  LayoutDividerContext,
  LayoutSlotsContext,
  type LayoutArea,
} from './LayoutContext';
import type {LayoutHeight} from './types';

/**
 * Shell with header, side panels, content, and footer slots.
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
   * Whether child layout regions should show dividers.
   */
  hasDividers?: boolean;
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
  padding?: SpacingToken;
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
  contentFill: css({
    flex: 1,
    minW: 0,
    display: 'flex',
    flexDirection: 'column',
  }),
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
  'data-testid': dataTestId,
  hasDividers = true,
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
  const dividerValue = useMemo(() => ({hasDividers}), [hasDividers]);
  const rootStyle: CSSProperties = {
    ...style,
  };

  return (
    <LayoutDividerContext value={dividerValue}>
      <LayoutSlotsContext value={slots}>
        <div
          className={cx(layoutRecipe({height, padding}), className)}
          data-testid={dataTestId}
          ref={ref}
          style={rootStyle}>
          <AreaProvider area="header">{header}</AreaProvider>
          <div className={layoutMiddleRecipe()}>
            <AreaProvider area="start">{start}</AreaProvider>
            <div className={styles.contentFill}>
              <AreaProvider area="content">{content}</AreaProvider>
            </div>
            <AreaProvider area="end">{end}</AreaProvider>
          </div>
          <AreaProvider area="footer">{footer}</AreaProvider>
        </div>
      </LayoutSlotsContext>
    </LayoutDividerContext>
  );
}

Layout.displayName = 'Layout';
