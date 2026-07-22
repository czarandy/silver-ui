'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {useMemo} from 'react';
import {layoutRecipe} from 'components/Layout/Layout.recipe';
import {
  LayoutAreaContext,
  LayoutRegionsContext,
  type LayoutArea,
} from 'components/Layout/LayoutContext';
import type {LayoutHeight} from 'components/Layout/types';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import type {SpacingToken} from 'internal/spacingTokens';
import {cx} from 'utils/cx';

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
   * Whether child layout regions should show dividers. Default is `true`.
   *
   * Without dividers the regions read as one surface, so the content region
   * drops its block padding on the edges that meet a header or a footer rather
   * than stacking a second padding against theirs.
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
  if (!isNonEmptyReactNode(children)) {
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
  const hasHeader = isNonEmptyReactNode(header);
  const hasFooter = isNonEmptyReactNode(footer);
  const regionsValue = useMemo(
    () => ({hasDividers, hasFooter, hasHeader}),
    [hasDividers, hasFooter, hasHeader],
  );
  const classes = layoutRecipe({height, padding});

  return (
    <LayoutRegionsContext value={regionsValue}>
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
    </LayoutRegionsContext>
  );
}

Layout.displayName = 'Layout';
