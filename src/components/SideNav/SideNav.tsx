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

export interface SideNavFooter {
  /**
   * Actions rendered at the outside edge of the footer.
   */
  actions?: ReactNode;
  /**
   * Primary footer content, such as an account avatar or workspace switcher.
   */
  content?: ReactNode;
}

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
   * Content and actions rendered in the sticky bottom section.
   */
  footer?: SideNavFooter;
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
        {footer ? (
          <div className={classes.topbarFooter}>
            {footer.content}
            {footer.actions}
          </div>
        ) : null}
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
        {footer?.content}
        {footer?.actions}
      </MobileNav>
    );
  }

  if (renderMode === 'drawer-content') {
    return (
      <>
        {topContent}
        {children}
        {footer?.content}
        {footer?.actions}
      </>
    );
  }

  const classes = sideNavRecipe({isCollapsed: resolvedIsCollapsed});
  const footerContent = footer?.content;
  const footerActions = footer?.actions;
  const footerContentNode = isNonEmptyReactNode(footerContent) ? (
    <div className={classes.footerContent}>{footerContent}</div>
  ) : null;
  const footerCollapseNode = isCollapsible ? (
    <div className={classes.footerCollapseButton}>
      <SideNavCollapseButton />
    </div>
  ) : null;
  const footerActionsNode = isNonEmptyReactNode(footerActions) ? (
    <div className={classes.footerActions}>{footerActions}</div>
  ) : null;

  return (
    <SideNavCollapseContext value={collapseContext}>
      <nav
        aria-label="Side navigation"
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {isNonEmptyReactNode(header) ||
        (!resolvedIsCollapsed && isNonEmptyReactNode(topContent)) ? (
          <div className={classes.stickyTop}>
            {isNonEmptyReactNode(header) ? (
              <div className={classes.headerArea}>{header}</div>
            ) : null}
            {!resolvedIsCollapsed ? topContent : null}
          </div>
        ) : null}
        <div className={classes.scrollable}>{children}</div>
        {footerContentNode || footerActionsNode || isCollapsible ? (
          <div className={classes.stickyBottom}>
            <div className={classes.footerRow}>
              {resolvedIsCollapsed ? (
                <>
                  {footerCollapseNode}
                  {footerActionsNode}
                  {footerContentNode}
                </>
              ) : (
                <>
                  {footerContentNode}
                  {footerCollapseNode}
                  {footerActionsNode}
                </>
              )}
            </div>
          </div>
        ) : null}
      </nav>
    </SideNavCollapseContext>
  );
}

SideNav.displayName = 'SideNav';
