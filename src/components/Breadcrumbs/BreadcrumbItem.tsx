/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import {
  use,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from 'internal/cx';
import {Icon, type IconComponent} from '../Icon';
import type {LinkComponent} from '../Link';
import {useLinkComponent} from '../Link';
import {breadcrumbItemRecipe} from './BreadcrumbItem.recipe';
import {BreadcrumbsContext} from './BreadcrumbsContext';

export interface BreadcrumbItemProps {
  /**
   * Custom link component used when href is set.
   */
  as?: LinkComponent;
  /**
   * Breadcrumb label content.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the list item.
   */
  className?: string;
  /**
   * Test ID applied to the list item.
   */
  'data-testid'?: string;
  /**
   * Link destination. Omit for the current page.
   */
  href?: string;
  /**
   * Whether this item represents the current page.
   */
  isCurrent?: boolean;
  /**
   * Click handler for link or button items.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * Ref forwarded to the list item.
   */
  ref?: Ref<HTMLLIElement>;
  /**
   * Icon rendered before the label.
   */
  startIcon?: IconComponent;
  /**
   * Inline styles applied to the list item.
   */
  style?: CSSProperties;
}

/**
 * A single item in a breadcrumb trail, rendered as a link, button, or
 * static text depending on the props provided.
 */
export function BreadcrumbItem({
  as,
  children,
  className,
  'data-testid': dataTestId,
  href,
  isCurrent: isCurrentProp,
  onClick,
  ref,
  startIcon,
  style,
}: BreadcrumbItemProps): React.JSX.Element {
  const context = use(BreadcrumbsContext);
  const LinkComponent = useLinkComponent(as);
  const isCurrent = isCurrentProp === true;
  const classes = breadcrumbItemRecipe({
    variant: context.variant,
    isCurrent: isCurrent || undefined,
  });

  const content = (
    <>
      {startIcon != null ? (
        <span className={classes.icon}>
          <Icon icon={startIcon} size="sm" />
        </span>
      ) : null}
      {children}
    </>
  );

  if (isCurrent) {
    return (
      <li
        className={cx(classes.item, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        <span aria-hidden="true" className={classes.separator}>
          {context.separator}
        </span>
        <span aria-current="page" className={classes.content}>
          {content}
        </span>
      </li>
    );
  }

  return (
    <li
      className={cx(classes.item, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <span aria-hidden="true" className={classes.separator}>
        {context.separator}
      </span>
      {href != null ? (
        <LinkComponent
          className={classes.link}
          href={href}
          onClick={onClick}
          to={LinkComponent === 'a' ? undefined : href}>
          {content}
        </LinkComponent>
      ) : onClick != null ? (
        <button className={classes.link} onClick={onClick} type="button">
          {content}
        </button>
      ) : (
        <span className={classes.content}>{content}</span>
      )}
    </li>
  );
}

BreadcrumbItem.displayName = 'BreadcrumbItem';
