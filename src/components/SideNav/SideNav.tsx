import type {CSSProperties, ReactNode, Ref} from 'react';
import {useCallback, useMemo, useState} from 'react';
import {css} from 'styled-system/css';
import {MobileNav} from '../../internal/MobileNav';
import {cx} from '../../internal/cx';
import {sideNavRecipe} from './SideNav.recipe';
import {SideNavCollapseContext, useSideNavRenderMode} from './SideNavContext';
import {SideNavCollapseButton} from './internal/SideNavCollapseButton';

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

const styles = {
  stickyTop: css({
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    p: '2',
    gap: '2',
  }),
  scrollable: css({
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    px: '2',
  }),
  scrollableCollapsed: css({
    flex: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }),
  stickyBottom: css({
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    mt: 'auto',
    p: '2',
    gap: '2',
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'border',
  }),
  footerRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
  }),
  footerRowCollapsed: css({
    flexDirection: 'column-reverse',
    alignItems: 'center',
  }),
  footerIcons: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
    ms: 'auto',
  }),
  footerIconsCollapsed: css({
    flexDirection: 'column',
    alignItems: 'center',
    ms: '0',
  }),
  topbarIcons: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
    ms: 'auto',
  }),
};

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
    return (
      <div
        className={cx(sideNavRecipe({mode: 'topbar'}), className)}
        data-testid={dataTestId}
        style={style}>
        {header}
        <div className={styles.topbarIcons}>{footerIcons}</div>
      </div>
    );
  }

  if (renderMode === 'drawer') {
    return (
      <MobileNav data-testid={dataTestId} header={header}>
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

  return (
    <SideNavCollapseContext value={collapseContext}>
      <nav
        aria-label="Side navigation"
        className={cx(sideNavRecipe({isCollapsed}), className)}
        data-testid={dataTestId}
        ref={ref}
        role="navigation"
        style={style}>
        {header != null || (!isCollapsed && topContent != null) ? (
          <div className={styles.stickyTop}>
            {header}
            {!isCollapsed ? topContent : null}
          </div>
        ) : null}
        <div
          className={cx(
            styles.scrollable,
            isCollapsed && styles.scrollableCollapsed,
          )}>
          {children}
        </div>
        {footer != null || footerIcons != null || isCollapsible ? (
          <div className={styles.stickyBottom}>
            {footer}
            <div
              className={cx(
                styles.footerRow,
                isCollapsed && styles.footerRowCollapsed,
              )}>
              {isCollapsible ? <SideNavCollapseButton /> : null}
              {footerIcons != null ? (
                <div
                  className={cx(
                    styles.footerIcons,
                    isCollapsed && styles.footerIconsCollapsed,
                  )}>
                  {footerIcons}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </nav>
    </SideNavCollapseContext>
  );
}

SideNav.displayName = 'SideNav';
