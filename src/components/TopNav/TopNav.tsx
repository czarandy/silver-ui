import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {Divider} from '../Divider';
import {MobileNav, MobileNavToggle} from '../MobileNav';
import {topNavRecipe} from './TopNav.recipe';
import {
  TopNavSlotContext,
  useTopNavMobileContent,
  useTopNavRenderMode,
} from './TopNavContext';

export interface TopNavProps {
  centerContent?: ReactNode;
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
  endContent?: ReactNode;
  heading?: ReactNode;
  label?: string;
  ref?: Ref<HTMLElement>;
  startContent?: ReactNode;
  style?: CSSProperties;
}

const styles = {
  leftSection: css({
    display: 'flex',
    alignItems: 'center',
    gap: '4',
    flex: '1 1 0%',
    minW: 0,
  }),
  heading: css({
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  }),
  startContent: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
  }),
  centerContent: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1',
  }),
  rightSection: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '1',
  }),
  endContent: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
    flexShrink: 0,
    ms: 'auto',
  }),
  mobileEnd: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
    ms: 'auto',
  }),
  drawerItems: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
  }),
  drawerDivider: css({
    my: '2',
  }),
};

export function TopNav({
  centerContent,
  children,
  className,
  'data-testid': dataTestId,
  endContent,
  heading,
  label,
  ref,
  startContent,
  style,
}: TopNavProps): React.JSX.Element | null {
  const renderMode = useTopNavRenderMode();
  const mobileContent = useTopNavMobileContent();
  const {hasAutoToggle} = useAppShellMobile();
  const resolvedStartContent = startContent ?? children;
  const hasCenterContent = centerContent != null;
  const hasCollapsibleContent =
    resolvedStartContent != null || centerContent != null;
  const hasMobileDrawerContent = hasCollapsibleContent || mobileContent != null;

  if (renderMode === 'mobile-bar') {
    return (
      <nav
        aria-label={label}
        className={cx(topNavRecipe({layout: 'mobile'}), className)}
        data-testid={dataTestId}
        ref={ref}
        role="navigation"
        style={style}>
        {heading != null ? (
          <div className={styles.heading}>{heading}</div>
        ) : null}
        <div className={styles.mobileEnd}>
          {endContent}
          {hasMobileDrawerContent && hasAutoToggle ? <MobileNavToggle /> : null}
        </div>
      </nav>
    );
  }

  if (renderMode === 'drawer') {
    if (!hasCollapsibleContent && mobileContent == null) {
      return null;
    }

    return (
      <MobileNav header={heading}>
        {hasCollapsibleContent ? (
          <TopNavSlotContext value="start">
            <div className={styles.drawerItems}>
              {resolvedStartContent}
              {centerContent}
            </div>
          </TopNavSlotContext>
        ) : null}
        {hasCollapsibleContent && mobileContent != null ? (
          <div className={styles.drawerDivider}>
            <Divider />
          </div>
        ) : null}
        {mobileContent}
      </MobileNav>
    );
  }

  return (
    <nav
      aria-label={label}
      className={cx(
        topNavRecipe({layout: hasCenterContent ? 'grid' : 'flex'}),
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      role="navigation"
      style={style}>
      <div className={styles.leftSection}>
        {heading != null ? (
          <div className={styles.heading}>{heading}</div>
        ) : null}
        {resolvedStartContent != null ? (
          <TopNavSlotContext value="start">
            <div className={styles.startContent}>{resolvedStartContent}</div>
          </TopNavSlotContext>
        ) : null}
      </div>
      {hasCenterContent ? (
        <TopNavSlotContext value="center">
          <div className={styles.centerContent}>{centerContent}</div>
        </TopNavSlotContext>
      ) : null}
      {hasCenterContent ? (
        <div className={styles.rightSection}>
          <TopNavSlotContext value="end">{endContent}</TopNavSlotContext>
        </div>
      ) : endContent != null ? (
        <div className={styles.endContent}>
          <TopNavSlotContext value="end">{endContent}</TopNavSlotContext>
        </div>
      ) : null}
    </nav>
  );
}

TopNav.displayName = 'TopNav';
