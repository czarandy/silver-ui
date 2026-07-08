/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */
'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {useLinkComponent} from 'components/Link';
import type {LinkComponent} from 'components/Link';
import {Text} from 'components/Text';
import {topNavHeadingRecipe} from 'components/TopNav/TopNavHeading.recipe';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

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
  const classes = topNavHeadingRecipe();

  return (
    <Element
      aria-label={ariaLabel}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      href={resolvedHref}
      ref={ref as Ref<HTMLAnchorElement & HTMLDivElement>}
      style={style}
      to={Element === 'a' ? undefined : resolvedHref}>
      {isReactNode(logo) ? <span className={classes.logo}>{logo}</span> : null}
      <span className={classes.text}>
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
        <span className={classes.endContent}>{headerEndContent}</span>
      ) : null}
    </Element>
  );
}

TopNavHeading.displayName = 'TopNavHeading';
