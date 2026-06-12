import type {CSSProperties, ReactNode, Ref} from 'react';
import {useAppShellMobile} from 'components/AppShell/AppShellMobileContext';
import {Divider} from 'components/Divider';
import {topNavRecipe} from 'components/TopNav/TopNav.recipe';
import {
  useTopNavMobileContent,
  useTopNavRenderMode,
} from 'components/TopNav/TopNavContext';
import {MobileNav, MobileNavToggle} from 'internal/MobileNav';
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';

export interface TopNavProps {
  /**
   * Content rendered in the center section of the navigation bar.
   */
  centerContent?: ReactNode;
  /**
   * Shorthand for `startContent`. Rendered in the start section when
   * `startContent` is not provided.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the nav element.
   */
  className?: string;
  /**
   * Test ID applied to the nav element.
   */
  'data-testid'?: string;
  /**
   * Content rendered in the end (right) section of the navigation bar.
   */
  endContent?: ReactNode;
  /**
   * Branding or title content rendered at the start of the bar.
   */
  heading?: ReactNode;
  /**
   * Accessible label for the navigation landmark.
   * @default 'Top navigation'
   */
  label?: string;
  /**
   * Ref forwarded to the nav element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Content rendered in the start (left) section after the heading.
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the nav element.
   */
  style?: CSSProperties;
}

/**
 * Horizontal top navigation bar with heading, start, center, and end
 * content slots. Adapts to mobile layouts when rendered inside AppShell.
 */
export function TopNav({
  centerContent,
  children,
  className,
  'data-testid': dataTestId,
  endContent,
  heading,
  label = 'Top navigation',
  ref,
  startContent,
  style,
}: TopNavProps): React.JSX.Element | null {
  const renderMode = useTopNavRenderMode();
  const mobileContent = useTopNavMobileContent();
  const {hasAutoToggle} = useAppShellMobile();
  const resolvedStartContent = startContent ?? children;

  if (process.env.NODE_ENV !== 'production') {
    if (isReactNode(startContent) && isReactNode(children)) {
      console.warn(
        'TopNav: both `startContent` and `children` were provided. ' +
          '`startContent` takes precedence and `children` is ignored. ' +
          'Provide only one.',
      );
    }
  }

  const hasCenterContent = isReactNode(centerContent);
  const hasCollapsibleContent =
    isReactNode(resolvedStartContent) || isReactNode(centerContent);
  const hasMobileDrawerContent =
    hasCollapsibleContent || isReactNode(mobileContent);

  if (renderMode === 'mobile-bar') {
    const classes = topNavRecipe({layout: 'mobile'});
    return (
      <nav
        aria-label={label}
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {isReactNode(heading) ? (
          <div className={classes.heading}>{heading}</div>
        ) : null}
        <div className={classes.mobileEnd}>
          {endContent}
          {hasMobileDrawerContent && hasAutoToggle ? <MobileNavToggle /> : null}
        </div>
      </nav>
    );
  }

  if (renderMode === 'drawer') {
    if (!hasCollapsibleContent && !isReactNode(mobileContent)) {
      return null;
    }

    const classes = topNavRecipe();
    return (
      <MobileNav header={heading}>
        {hasCollapsibleContent ? (
          <div className={classes.drawerItems}>
            {resolvedStartContent}
            {centerContent}
          </div>
        ) : null}
        {hasCollapsibleContent && isReactNode(mobileContent) ? (
          <div className={classes.drawerDivider}>
            <Divider />
          </div>
        ) : null}
        {mobileContent}
      </MobileNav>
    );
  }

  const classes = topNavRecipe({layout: hasCenterContent ? 'grid' : 'flex'});
  return (
    <nav
      aria-label={label}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <div className={classes.leftSection}>
        {isReactNode(heading) ? (
          <div className={classes.heading}>{heading}</div>
        ) : null}
        {isReactNode(resolvedStartContent) ? (
          <div className={classes.startContent}>{resolvedStartContent}</div>
        ) : null}
      </div>
      {hasCenterContent ? (
        <div className={classes.centerContent}>{centerContent}</div>
      ) : null}
      {hasCenterContent ? (
        <div className={classes.rightSection}>{endContent}</div>
      ) : isReactNode(endContent) ? (
        <div className={classes.endContent}>{endContent}</div>
      ) : null}
    </nav>
  );
}

TopNav.displayName = 'TopNav';
