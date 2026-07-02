'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {useEffect, useId, useMemo, useRef, useState} from 'react';
import {appShellRecipe} from 'components/AppShell/AppShell.recipe';
import {
  AppShellMobileContext,
  type AppShellMobileContextValue,
} from 'components/AppShell/AppShellMobileContext';
import {useSlotPresence} from 'components/AppShell/useSlotPresence';
import {Layout, LayoutContent, LayoutPanel} from 'components/Layout';
import {SideNavRenderContext} from 'components/SideNav';
import {
  TopNavMobileContentContext,
  TopNavRenderContext,
} from 'components/TopNav';
import {MobileNavToggle} from 'internal/MobileNav';
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {observeResize, unobserveResize} from 'internal/sharedResizeObserver';
import type {SpacingToken} from 'internal/spacingTokens';
import {useMediaQuery} from 'internal/useMediaQuery';
import {css} from 'styled-system/css';

export type AppShellBreakpoint = 'sm' | 'md' | 'lg' | 'none';
export type AppShellVariant = 'default' | 'section';
export type AppShellHeight = 'fill' | 'auto';

/**
 * Application-level layout shell with top navigation, side navigation,
 * banner, skip-to-content support, and responsive mobile navigation.
 */
export interface AppShellProps {
  /**
   * System-wide content rendered above the top navigation.
   */
  banner?: ReactNode;
  /**
   * Main content rendered inside the shell's `<main>` landmark.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Padding applied to the main content area. Default is `0`.
   */
  contentPadding?: SpacingToken;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Height behavior. `fill` keeps scrolling inside the shell; `auto` lets the
   * page grow with content.
   */
  height?: AppShellHeight;
  /**
   * Disable generated mobile navigation.
   */
  isMobileNavDisabled?: boolean;
  /**
   * Breakpoint below which mobile navigation is used.
   * @default 'md'
   */
  mobileBreakpoint?: AppShellBreakpoint;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Side navigation slot, typically a SideNav.
   */
  sideNav?: ReactNode;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Top navigation slot, typically a TopNav.
   */
  topNav?: ReactNode;
  /**
   * Background and divider style for the shell.
   */
  variant?: AppShellVariant;
}

const BREAKPOINT_VALUES: Record<AppShellBreakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  none: 0,
};

const styles = {
  skipLink: css({
    position: 'absolute',
    top: 0,
    insetInlineStart: 0,
    w: '1px',
    h: '1px',
    p: 0,
    m: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
    zIndex: 9999,
    bg: 'bg',
    color: 'primary',
    textDecoration: 'none',
    fontWeight: 'semibold',
    _focus: {
      position: 'fixed',
      top: '2',
      insetInlineStart: '2',
      w: 'auto',
      h: 'auto',
      p: '2',
      m: 0,
      overflow: 'visible',
      clipPath: 'none',
      whiteSpace: 'normal',
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  }),
  headerSticky: css({
    position: 'sticky',
    top: 0,
    zIndex: 1,
  }),
  banner: css({
    flexShrink: 0,
  }),
  autoMobileTopBar: css({
    display: 'flex',
    alignItems: 'center',
    h: '12',
    px: '2',
  }),
  sideNavSticky: css({
    flexShrink: 0,
    overflow: 'clip',
    position: 'sticky',
    top: 'var(--appshell-header-height, 0px)',
    h: 'calc(100dvh - var(--appshell-header-height, 0px))',
    display: 'flex',
    flexDirection: 'column',
  }),
  elevatedWrapper: css({
    position: 'relative',
    display: 'flex',
    flex: 1,
    minH: 0,
    h: '100%',
  }),
  elevatedBackdrop: css({
    position: 'absolute',
    inset: 0,
    bg: 'bg',
    borderStartStartRadius: '2xl',
    pointerEvents: 'none',
  }),
  contentSurface: css({
    bg: 'bg',
  }),
  contentTransparent: css({
    bg: 'transparent',
    isolation: 'isolate',
  }),
  slotContents: css({
    display: 'contents',
  }),
};

type AppShellRootStyle = CSSProperties & {
  '--appshell-header-height'?: string;
};

/**
 * Application-level layout shell with top navigation, side navigation,
 * banner, skip-to-content support, and responsive mobile navigation.
 */
export function AppShell({
  banner,
  children,
  className,
  contentPadding,
  'data-testid': dataTestId,
  height = 'fill',
  isMobileNavDisabled = false,
  mobileBreakpoint = 'md',
  ref,
  sideNav,
  style,
  topNav,
  variant = 'default',
}: AppShellProps): React.JSX.Element {
  const mainContentId = useId();
  const breakpointQuery =
    mobileBreakpoint === 'none'
      ? '(max-width: 0px)'
      : `(max-width: ${BREAKPOINT_VALUES[mobileBreakpoint]}px)`;
  const isBelowBreakpoint = useMediaQuery(breakpointQuery);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const {ref: topNavPresenceRef, hasContent: hasTopNavContent} =
    useSlotPresence(isReactNode(topNav));
  const {ref: sideNavPresenceRef, hasContent: hasSideNavContent} =
    useSlotPresence(isReactNode(sideNav));
  const hasTopNav = isReactNode(topNav);
  const hasSideNav = isReactNode(sideNav);
  const hasNavContent = hasTopNavContent || hasSideNavContent;
  const mobileNavEnabled = !isMobileNavDisabled && hasNavContent;
  const showSideNavInline = hasSideNav && !isBelowBreakpoint;
  const isAuto = height === 'auto';
  const isFill = height === 'fill';
  const navHasDividers = variant === 'section';
  const headerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuto || headerRef.current == null || shellRef.current == null) {
      return;
    }

    const headerElement = headerRef.current;
    const shellElement = shellRef.current;
    const updateHeight = () => {
      shellElement.style.setProperty(
        '--appshell-header-height',
        `${headerElement.getBoundingClientRect().height}px`,
      );
    };

    observeResize(headerElement, updateHeight);
    return () => unobserveResize(headerElement);
  }, [isAuto]);

  const mobileContextValue = useMemo<AppShellMobileContextValue>(
    () => ({
      closeMobileNav: () => setIsMobileNavOpen(false),
      hasAutoToggle: true,
      isMobile: isBelowBreakpoint,
      isMobileNavEnabled: mobileNavEnabled,
      isMobileNavOpen,
      openMobileNav: () => mobileNavEnabled && setIsMobileNavOpen(true),
      toggleMobileNav: () => {
        if (mobileNavEnabled) {
          setIsMobileNavOpen(prev => !prev);
        }
      },
    }),
    [isBelowBreakpoint, isMobileNavOpen, mobileNavEnabled],
  );

  /* eslint-disable @eslint-react/no-unstable-context-value -- sideNav ReactNode prop prevents stable memoization */
  const mobileContentValue = hasSideNavContent ? (
    <SideNavRenderContext value="drawer-content">
      <div className={styles.slotContents} ref={sideNavPresenceRef}>
        {sideNav}
      </div>
    </SideNavRenderContext>
  ) : null;
  const drawerMobileContentValue = hasSideNavContent ? (
    <SideNavRenderContext value="drawer-content">
      {sideNav}
    </SideNavRenderContext>
  ) : null;
  /* eslint-enable @eslint-react/no-unstable-context-value */
  const topNavContent =
    hasTopNav && isBelowBreakpoint && !isMobileNavDisabled ? (
      <TopNavMobileContentContext value={mobileContentValue}>
        <TopNavRenderContext value="mobile-bar">
          <div className={styles.slotContents} ref={topNavPresenceRef}>
            {topNav}
          </div>
        </TopNavRenderContext>
      </TopNavMobileContentContext>
    ) : (
      topNav
    );
  const headerContent =
    hasTopNav || isReactNode(banner) ? (
      <div className={cx(isAuto && styles.headerSticky)} ref={headerRef}>
        <header style={{flexShrink: 0}}>
          {isReactNode(banner) ? (
            <div className={styles.banner}>{banner}</div>
          ) : null}
          {hasTopNav ? (
            <div className={styles.slotContents} ref={topNavPresenceRef}>
              {topNavContent}
            </div>
          ) : null}
        </header>
      </div>
    ) : undefined;
  const autoMobileTopBar =
    !isMobileNavDisabled &&
    isBelowBreakpoint &&
    !hasTopNavContent &&
    hasSideNav ? (
      <header style={{flexShrink: 0}}>
        <div
          aria-label="Mobile navigation"
          className={styles.autoMobileTopBar}
          role="navigation">
          <SideNavRenderContext value="topbar">
            <div className={styles.slotContents} ref={sideNavPresenceRef}>
              {sideNav}
            </div>
          </SideNavRenderContext>
          <MobileNavToggle />
        </div>
      </header>
    ) : undefined;
  const sideNavPanel = showSideNavInline ? (
    <LayoutPanel isScrollable={isFill} padding={0}>
      <div className={styles.slotContents} ref={sideNavPresenceRef}>
        {sideNav}
      </div>
    </LayoutPanel>
  ) : undefined;
  const sideNavContent =
    sideNavPanel != null && isAuto ? (
      <div className={styles.sideNavSticky}>{sideNavPanel}</div>
    ) : (
      sideNavPanel
    );
  const contentClassName =
    variant === 'default' && hasTopNavContent && showSideNavInline
      ? styles.contentTransparent
      : variant === 'default'
        ? styles.contentSurface
        : undefined;
  const mainInner = (
    <LayoutContent
      as="main"
      className={contentClassName}
      id={mainContentId}
      isScrollable={isFill}
      padding={contentPadding ?? 0}>
      {children}
    </LayoutContent>
  );
  const shouldElevateWithCorner =
    variant === 'default' && hasTopNavContent && showSideNavInline;
  const mainContent = shouldElevateWithCorner ? (
    <div className={styles.elevatedWrapper}>
      <div className={styles.elevatedBackdrop} />
      {mainInner}
    </div>
  ) : (
    mainInner
  );
  const rootStyle: AppShellRootStyle = {...style};

  return (
    <AppShellMobileContext value={mobileContextValue}>
      <div
        className={cx(appShellRecipe({height, variant}), className)}
        data-testid={dataTestId}
        ref={mergeRefs(ref, shellRef)}
        style={rootStyle}>
        <a
          className={styles.skipLink}
          data-testid="skip-to-content"
          href={`#${mainContentId}`}>
          Skip to content
        </a>
        <Layout
          content={mainContent}
          hasDividers={navHasDividers}
          header={
            <>
              {headerContent}
              {autoMobileTopBar}
            </>
          }
          height={height}
          padding={0}
          start={sideNavContent}
        />
        {isBelowBreakpoint && !isMobileNavDisabled ? (
          <>
            {hasSideNav && !hasTopNavContent ? (
              <SideNavRenderContext value="drawer">
                {sideNav}
              </SideNavRenderContext>
            ) : null}
            {hasTopNav && hasTopNavContent ? (
              <TopNavMobileContentContext value={drawerMobileContentValue}>
                <TopNavRenderContext value="drawer">
                  {topNav}
                </TopNavRenderContext>
              </TopNavMobileContentContext>
            ) : null}
          </>
        ) : null}
      </div>
    </AppShellMobileContext>
  );
}

AppShell.displayName = 'AppShell';
