/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import isReactNode from '../../internal/isReactNode';
import type {LinkComponent} from '../Link';
import {useLinkComponent} from '../Link';
import {Text} from '../Text';

export interface TopNavHeadingProps {
  /**
   * Accessible label for the heading link. Use when `heading` text is absent
   * (e.g., logo-only headings) to ensure the link has an accessible name.
   */
  'aria-label'?: string;
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
  logo: css({
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
  }),
  text: css({
    display: 'flex',
    flexDirection: 'column',
    minW: 0,
  }),
  endContent: css({
    ms: 'auto',
    flexShrink: 0,
  }),
};

export function TopNavHeading({
  'aria-label': ariaLabel,
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
}: TopNavHeadingProps): React.JSX.Element {
  const LinkComponent = useLinkComponent(as);
  const resolvedHref = headingHref ?? href;
  const Element = resolvedHref != null ? LinkComponent : 'div';

  return (
    <Element
      aria-label={ariaLabel}
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      href={resolvedHref}
      ref={ref as Ref<HTMLAnchorElement & HTMLDivElement>}
      style={style}
      to={Element === 'a' ? undefined : resolvedHref}>
      {isReactNode(logo) ? <span className={styles.logo}>{logo}</span> : null}
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
      {isReactNode(headerEndContent) ? (
        <span className={styles.endContent}>{headerEndContent}</span>
      ) : null}
    </Element>
  );
}

TopNavHeading.displayName = 'TopNavHeading';
