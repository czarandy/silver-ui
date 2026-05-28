import type {CSSProperties, ReactNode, Ref} from 'react';
import {useCallback, useMemo, useState} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {MobileNav} from '../MobileNav';
import {sideNavRecipe} from './SideNav.recipe';
import {SideNavCollapseContext, useSideNavRenderMode} from './SideNavContext';

export interface SideNavProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  footer?: ReactNode;
  footerIcons?: ReactNode;
  header?: ReactNode;
  isCollapsible?:
    | boolean
    | {
        buttonLabel?: string;
        defaultIsCollapsed?: boolean;
        hasButton?: boolean;
        isCollapsed?: boolean;
        onCollapsedChange?: (isCollapsed: boolean) => void;
      };
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
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
    py: '2',
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
    borderBlockStartColor: 'silver-neutral.200',
  }),
  footerRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
  }),
  topbarIcons: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
    ms: 'auto',
  }),
};

export function SideNav({
  children,
  className,
  isCollapsible: isCollapsibleFromProps = false,
  'data-testid': dataTestId,
  footer,
  footerIcons,
  header,
  ref,
  style,
  topContent,
}: SideNavProps): React.JSX.Element {
  const renderMode = useSideNavRenderMode();
  const collapsibleConfig = useMemo(
    () =>
      typeof isCollapsibleFromProps === 'object' ? isCollapsibleFromProps : {},
    [isCollapsibleFromProps],
  );
  const isCollapsible = Boolean(isCollapsibleFromProps);
  const isControlled = collapsibleConfig.isCollapsed != null;
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(
    collapsibleConfig.defaultIsCollapsed ?? false,
  );
  const isCollapsed = isControlled
    ? Boolean(collapsibleConfig.isCollapsed)
    : uncontrolledCollapsed;
  const toggle = useCallback(() => {
    const nextValue = !isCollapsed;
    if (!isControlled) {
      setUncontrolledCollapsed(nextValue);
    }
    collapsibleConfig.onCollapsedChange?.(nextValue);
  }, [collapsibleConfig, isCollapsed, isControlled]);
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
        {header != null || topContent != null ? (
          <div className={styles.stickyTop}>
            {header}
            {topContent}
          </div>
        ) : null}
        <div className={styles.scrollable}>{children}</div>
        {footer != null || footerIcons != null ? (
          <div className={styles.stickyBottom}>
            {footer}
            <div className={styles.footerRow}>{footerIcons}</div>
          </div>
        ) : null}
      </nav>
    </SideNavCollapseContext>
  );
}

SideNav.displayName = 'SideNav';
