'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {useCallback, useMemo, useState, useSyncExternalStore} from 'react';
import {sideNavRecipe} from 'components/SideNav/SideNav.recipe';
import {
  SideNavCollapseContext,
  useSideNavRenderMode,
} from 'components/SideNav/SideNavContext';
import {SideNavCollapseButton} from 'components/SideNav/internal/SideNavCollapseButton';
import {MobileNav} from 'internal/MobileNav';
import {getMaxWidthBreakpointQuery} from 'internal/breakpoints';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

export type SideNavCollapseBreakpoint = 'sm' | 'md' | 'lg' | 'none';

function getExpandedServerSnapshot(): boolean {
  return false;
}

function subscribeToInitialCollapse(): () => void {
  return () => {};
}

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
   * Breakpoint at or below which a collapsible nav starts collapsed. This is
   * evaluated only when the nav first mounts. Use `none` to always start
   * expanded.
   * @default 'lg'
   */
  collapseBreakpoint?: SideNavCollapseBreakpoint;
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
  collapseBreakpoint = 'lg',
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
  // Hydrate from an expanded server snapshot, then cache the first browser
  // match so later viewport changes cannot override the user's toggle state.
  const [getInitialCollapseSnapshot] = useState(() => {
    let initialSnapshot: boolean | undefined;
    return (): boolean => {
      initialSnapshot ??=
        isCollapsible &&
        collapseBreakpoint !== 'none' &&
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia(getMaxWidthBreakpointQuery(collapseBreakpoint))
          .matches;
      return initialSnapshot;
    };
  });
  const isInitiallyCollapsed = useSyncExternalStore(
    subscribeToInitialCollapse,
    getInitialCollapseSnapshot,
    getExpandedServerSnapshot,
  );
  const [userIsCollapsed, setUserIsCollapsed] = useState<boolean>();
  const resolvedIsCollapsed =
    isCollapsible && (userIsCollapsed ?? isInitiallyCollapsed);
  const toggle = useCallback(() => {
    if (isCollapsible) {
      setUserIsCollapsed(current => !(current ?? isInitiallyCollapsed));
    }
  }, [isCollapsible, isInitiallyCollapsed]);
  const collapseContext = useMemo(
    () => ({isCollapsed: resolvedIsCollapsed, isCollapsible, toggle}),
    [resolvedIsCollapsed, isCollapsible, toggle],
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

  const classes = sideNavRecipe({
    isCollapsed: resolvedIsCollapsed,
    isCollapsible,
  });

  return (
    <SideNavCollapseContext value={collapseContext}>
      <nav
        aria-label="Side navigation"
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {isCollapsible && !resolvedIsCollapsed ? (
          <div className={classes.collapseButton}>
            <SideNavCollapseButton />
          </div>
        ) : null}
        {isNonEmptyReactNode(header) ||
        (!resolvedIsCollapsed && isNonEmptyReactNode(topContent)) ||
        isCollapsible ? (
          <div className={classes.stickyTop}>
            {isNonEmptyReactNode(header) || isCollapsible ? (
              <div className={classes.headerArea}>{header}</div>
            ) : null}
            {!resolvedIsCollapsed ? topContent : null}
          </div>
        ) : null}
        <div className={classes.scrollable}>{children}</div>
        {isCollapsible && resolvedIsCollapsed ? (
          <div className={classes.collapsedCollapseButton}>
            <SideNavCollapseButton />
          </div>
        ) : null}
        {isNonEmptyReactNode(footer) || isNonEmptyReactNode(footerIcons) ? (
          <div className={classes.stickyBottom}>
            {footer}
            {isNonEmptyReactNode(footerIcons) ? (
              <div className={classes.footerRow}>
                <div className={classes.footerIcons}>{footerIcons}</div>
              </div>
            ) : null}
          </div>
        ) : null}
      </nav>
    </SideNavCollapseContext>
  );
}

SideNav.displayName = 'SideNav';
