import type {CSSProperties, ReactNode, Ref} from 'react';
import {
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';
import {
  observeResize,
  unobserveResize,
} from '../../internal/sharedResizeObserver';
import {useMediaQuery} from '../../internal/useMediaQuery';
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  type SpacingStep,
} from '../Layout';
import {MobileNavToggle} from '../MobileNav';
import {SideNavRenderContext} from '../SideNav';
import {TopNavMobileContentContext, TopNavRenderContext} from '../TopNav';
import {appShellRecipe} from './AppShell.recipe';
import {
  AppShellMobileContext,
  type AppShellMobileContextValue,
} from './AppShellMobileContext';
import {useSlotPresence} from './useSlotPresence';

export type AppShellBreakpoint = 'sm' | 'md' | 'lg' | 'none';
export type AppShellVariant = 'wash' | 'surface' | 'section' | 'elevated';
export type AppShellHeight = 'fill' | 'auto';

export interface MobileNavConfig {
  /**
   * Breakpoint below which mobile navigation is used. Default is `md`.
   */
  breakpoint?: AppShellBreakpoint;
  /**
   * Custom drawer content for the generated mobile navigation.
   */
  content?: ReactNode;
  /**
   * Whether AppShell should render an automatic mobile nav toggle.
   */
  hasToggle?: boolean;
  /**
   * Initial mobile-layout hint for server-rendered apps.
   */
  isDefaultMobile?: boolean;
  /**
   * Controlled open state for the generated mobile nav.
   */
  isOpen?: boolean;
  /**
   * Called when the generated mobile nav requests an open-state change.
   */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Application-level layout shell with top navigation, side navigation, banner,
 * skip-to-content support, and responsive mobile navigation.
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
  contentPadding?: SpacingStep;
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
   * Mobile navigation configuration or a fully custom mobile navigation node.
   */
  mobileNav?: MobileNavConfig | ReactNode;
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

const MAIN_CONTENT_ID = 'silver-app-shell-main';

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
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
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
    borderStartStartRadius: 'lg',
    pointerEvents: 'none',
  }),
  contentSurface: css({
    bg: 'bg',
  }),
  contentWash: css({
    bg: 'bg.subtle',
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
  mobileNav,
  ref,
  sideNav,
  style,
  topNav,
  variant = 'elevated',
}: AppShellProps): React.JSX.Element {
  const mobileNavConfig: MobileNavConfig | null =
    mobileNav != null &&
    typeof mobileNav === 'object' &&
    !isValidElement(mobileNav)
      ? (mobileNav as MobileNavConfig)
      : null;
  const mobileNavReactNode: ReactNode | null =
    mobileNav != null &&
    (isValidElement(mobileNav) || typeof mobileNav === 'string')
      ? mobileNav
      : null;
  const mobileNavConfigContent = mobileNavConfig?.content ?? null;
  const mobileNavHasToggle = mobileNavConfig?.hasToggle !== false;
  const breakpoint = mobileNavConfig?.breakpoint ?? 'md';
  const breakpointQuery =
    breakpoint === 'none'
      ? '(max-width: 0px)'
      : `(max-width: ${BREAKPOINT_VALUES[breakpoint]}px)`;
  const isBelowBreakpoint = useMediaQuery(breakpointQuery);
  const [uncontrolledMobileOpen, setUncontrolledMobileOpen] = useState(false);
  const isMobileNavOpen = mobileNavConfig?.isOpen ?? uncontrolledMobileOpen;
  const isControlled = mobileNavConfig?.isOpen !== undefined;
  const setMobileNavOpen = useCallback(
    (isOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledMobileOpen(isOpen);
      }

      mobileNavConfig?.onOpenChange?.(isOpen);
    },
    [isControlled, mobileNavConfig],
  );
  const {ref: topNavPresenceRef, hasContent: hasTopNavContent} =
    useSlotPresence(topNav != null);
  const {ref: sideNavPresenceRef, hasContent: hasSideNavContent} =
    useSlotPresence(sideNav != null);
  const hasTopNav = topNav != null;
  const hasSideNav = sideNav != null;
  const hasNavContent = hasTopNavContent || hasSideNavContent;
  const mobileNavEnabled =
    !isMobileNavDisabled && hasNavContent && mobileNavReactNode == null;
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
      closeMobileNav: () => setMobileNavOpen(false),
      hasAutoToggle: mobileNavHasToggle,
      isMobile: isBelowBreakpoint,
      isMobileNavEnabled: mobileNavEnabled,
      isMobileNavOpen,
      openMobileNav: () => mobileNavEnabled && setMobileNavOpen(true),
      toggleMobileNav: () =>
        mobileNavEnabled && setMobileNavOpen(!isMobileNavOpen),
    }),
    [
      isBelowBreakpoint,
      isMobileNavOpen,
      mobileNavEnabled,
      mobileNavHasToggle,
      setMobileNavOpen,
    ],
  );

  const mobileContentValue = useMemo(
    () =>
      hasSideNavContent && mobileNavHasToggle ? (
        <SideNavRenderContext value="drawer-content">
          <div className={styles.slotContents} ref={sideNavPresenceRef}>
            {sideNav}
          </div>
        </SideNavRenderContext>
      ) : null,
    [hasSideNavContent, mobileNavHasToggle, sideNav, sideNavPresenceRef],
  );
  const drawerMobileContentValue = useMemo(
    () =>
      hasSideNavContent ? (
        <SideNavRenderContext value="drawer-content">
          {sideNav}
        </SideNavRenderContext>
      ) : null,
    [hasSideNavContent, sideNav],
  );
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
    hasTopNav || banner != null ? (
      <div className={cx(isAuto && styles.headerSticky)} ref={headerRef}>
        <LayoutHeader padding={0}>
          {banner != null ? (
            <div className={styles.banner}>{banner}</div>
          ) : null}
          {hasTopNav ? (
            <div className={styles.slotContents} ref={topNavPresenceRef}>
              {topNavContent}
            </div>
          ) : null}
        </LayoutHeader>
      </div>
    ) : undefined;
  const autoMobileTopBar =
    !isMobileNavDisabled &&
    mobileNavHasToggle &&
    isBelowBreakpoint &&
    !hasTopNavContent &&
    hasSideNav ? (
      <LayoutHeader padding={0}>
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
      </LayoutHeader>
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
    variant === 'wash'
      ? styles.contentWash
      : variant === 'elevated' && hasTopNavContent && showSideNavInline
        ? styles.contentTransparent
        : variant === 'surface' || variant === 'elevated'
          ? styles.contentSurface
          : undefined;
  const mainInner = (
    <LayoutContent
      className={contentClassName}
      id={MAIN_CONTENT_ID}
      isScrollable={isFill}
      padding={contentPadding ?? 0}
      role="main">
      {children}
    </LayoutContent>
  );
  const shouldElevateWithCorner =
    variant === 'elevated' && hasTopNavContent && showSideNavInline;
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
          href={`#${MAIN_CONTENT_ID}`}>
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
        {mobileNavReactNode}
        {mobileNavConfigContent}
        {isBelowBreakpoint &&
        !isMobileNavDisabled &&
        mobileNavReactNode == null &&
        mobileNavConfigContent == null ? (
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
