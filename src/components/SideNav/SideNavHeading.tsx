/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */
'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {useLinkComponent} from 'components/Link';
import type {LinkComponent} from 'components/Link';
import {useSideNavCollapse} from 'components/SideNav/SideNavContext';
import {Text} from 'components/Text';
import isReactNode from 'internal/isReactNode';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

export interface SideNavHeadingProps {
  as?: LinkComponent;
  className?: string;
  'data-testid'?: string;
  headerEndContent?: ReactNode;
  heading?: string;
  headingHref?: string;
  href?: string;
  logo?: ReactNode;
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
  subheading?: string;
  superheading?: string;
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    minH: '8',
    px: '2',
    color: 'fg',
    textDecoration: 'none',
  }),
  collapsed: css({
    justifyContent: 'center',
    px: 0,
  }),
  logo: css({
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
  }),
  text: css({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minW: 0,
  }),
  endContent: css({
    ms: 'auto',
    flexShrink: 0,
  }),
};

export function SideNavHeading({
  as,
  className,
  'data-testid': dataTestId,
  headerEndContent,
  heading,
  headingHref,
  href,
  logo,
  ref,
  style,
  subheading,
  superheading,
}: SideNavHeadingProps): React.JSX.Element | null {
  const LinkComponent = useLinkComponent(as);
  const {isCollapsed} = useSideNavCollapse();
  const resolvedHref = headingHref ?? href;
  const Element = resolvedHref != null ? LinkComponent : 'div';

  if (isCollapsed && !isReactNode(logo)) {
    return null;
  }

  return (
    <Element
      aria-label={isCollapsed && resolvedHref != null ? heading : undefined}
      className={cx(styles.root, isCollapsed && styles.collapsed, className)}
      data-testid={dataTestId}
      href={resolvedHref}
      ref={ref as Ref<HTMLAnchorElement & HTMLDivElement>}
      style={style}
      to={Element === 'a' ? undefined : resolvedHref}>
      {isReactNode(logo) ? <span className={styles.logo}>{logo}</span> : null}
      {!isCollapsed ? (
        <span className={styles.text}>
          {superheading != null ? (
            <Text color="secondary" type="supporting">
              {superheading}
            </Text>
          ) : null}
          {heading != null ? (
            <Text type="large" weight="semibold">
              {heading}
            </Text>
          ) : null}
          {subheading != null ? (
            <Text color="secondary" type="supporting">
              {subheading}
            </Text>
          ) : null}
        </span>
      ) : null}
      {!isCollapsed && isReactNode(headerEndContent) ? (
        <span className={styles.endContent}>{headerEndContent}</span>
      ) : null}
    </Element>
  );
}

SideNavHeading.displayName = 'SideNavHeading';
