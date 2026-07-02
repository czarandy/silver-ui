'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {useCallback, useMemo, useState} from 'react';
import {sideNavRecipe} from 'components/SideNav/SideNav.recipe';
import {
  SideNavCollapseContext,
  useSideNavRenderMode,
} from 'components/SideNav/SideNavContext';
import {SideNavCollapseButton} from 'components/SideNav/internal/SideNavCollapseButton';
import {MobileNav} from 'internal/MobileNav';
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';

export interface SideNavProps {
  /**
   * Navigation item children rendered in the scrollable area.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the nav element.
   */
  className?: string;
  /**
   * Test ID applied to the nav element.
   */
  'data-testid'?: string;
  /**
   * Content rendered in the sticky bottom section.
   */
  footer?: ReactNode;
  /**
   * Icon actions rendered alongside the footer.
   */
  footerIcons?: ReactNode;
  /**
   * Content rendered at the top of the nav (e.g. a logo or title).
   */
  header?: ReactNode;
  /**
   * Whether the nav can be collapsed to an icon-only toolbar.
   * @default false
   */
  isCollapsible?: boolean;
  /**
   * Ref forwarded to the nav element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Inline styles applied to the nav element.
   */
  style?: CSSProperties;
  /**
   * Non-scrollable content rendered below the header.
   */
  topContent?: ReactNode;
}

/**
 * Vertical side navigation panel with optional collapsing support.
 * Adapts to AppShell render modes (inline, drawer, topbar).
 */
export function SideNav({
  children,
  className,
  isCollapsible = false,
  'data-testid': dataTestId,
  footer,
  footerIcons,
  header,
  ref,
  style,
  topContent,
}: SideNavProps): React.JSX.Element {
  const renderMode = useSideNavRenderMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);
  const collapseContext = useMemo(
    () => ({isCollapsed, isCollapsible, toggle}),
    [isCollapsed, isCollapsible, toggle],
  );

  if (renderMode === 'topbar') {
    const classes = sideNavRecipe({mode: 'topbar'});

    return (
      <div
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={ref as Ref<HTMLDivElement>}
        style={style}>
        {header}
        <div className={classes.topbarIcons}>{footerIcons}</div>
      </div>
    );
  }

  if (renderMode === 'drawer') {
    return (
      <MobileNav
        data-testid={dataTestId}
        header={header}
        ref={ref as Ref<HTMLDialogElement>}>
        {topContent}
        {children}
        {footer}
        {footerIcons}
      </MobileNav>
    );
  }

  if (renderMode === 'drawer-content') {
    return (
      <>
        {topContent}
        {children}
        {footer}
        {footerIcons}
      </>
    );
  }

  const classes = sideNavRecipe({isCollapsed});

  return (
    <SideNavCollapseContext value={collapseContext}>
      <nav
        aria-label="Side navigation"
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {isReactNode(header) || (!isCollapsed && isReactNode(topContent)) ? (
          <div className={classes.stickyTop}>
            {header}
            {!isCollapsed ? topContent : null}
          </div>
        ) : null}
        <div className={classes.scrollable}>{children}</div>
        {isReactNode(footer) || isReactNode(footerIcons) || isCollapsible ? (
          <div className={classes.stickyBottom}>
            {footer}
            <div className={classes.footerRow}>
              {isCollapsible ? <SideNavCollapseButton /> : null}
              {isReactNode(footerIcons) ? (
                <div className={classes.footerIcons}>{footerIcons}</div>
              ) : null}
            </div>
          </div>
        ) : null}
      </nav>
    </SideNavCollapseContext>
  );
}

SideNav.displayName = 'SideNav';
