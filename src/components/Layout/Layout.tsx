import type {CSSProperties, ReactNode, Ref} from 'react';
import {useMemo} from 'react';
import {layoutRecipe} from 'components/Layout/Layout.recipe';
import {cx} from 'internal/cx';
import isReactNode from '../../internal/isReactNode';
import type {SpacingToken} from '../../internal/spacingTokens';
import {
  LayoutAreaContext,
  LayoutDividerContext,
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

function AreaProvider({
  area,
  children,
}: {
  area: LayoutArea;
  children?: ReactNode;
}): React.JSX.Element | null {
  if (!isReactNode(children)) {
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
  const dividerValue = useMemo(() => ({hasDividers}), [hasDividers]);
  const classes = layoutRecipe({height, padding});

  return (
    <LayoutDividerContext value={dividerValue}>
      <div
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        <AreaProvider area="header">{header}</AreaProvider>
        <div className={classes.middle}>
          <AreaProvider area="start">{start}</AreaProvider>
          <div className={classes.content}>
            <AreaProvider area="content">{content}</AreaProvider>
          </div>
          <AreaProvider area="end">{end}</AreaProvider>
        </div>
        <AreaProvider area="footer">{footer}</AreaProvider>
      </div>
    </LayoutDividerContext>
  );
}

Layout.displayName = 'Layout';
