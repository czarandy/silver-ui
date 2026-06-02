/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import {
  use,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon, type IconComponent} from '../Icon';
import type {LinkComponent} from '../Link';
import {useLinkComponent} from '../Link';
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

const styles = {
  item: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
    m: 0,
    '--breadcrumb-separator-display': 'flex',
    _first: {
      '--breadcrumb-separator-display': 'none',
    },
  }),
  defaultSize: css({
    fontSize: 'sm',
    lineHeight: 'normal',
  }),
  supportingSize: css({
    fontSize: 'xs',
    lineHeight: 'normal',
  }),
  content: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    minW: 0,
  }),
  link: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    minW: 0,
    p: 0,
    py: '1',
    borderWidth: 0,
    bg: 'transparent',
    color: 'fg.muted',
    cursor: 'pointer',
    font: 'inherit',
    textDecoration: 'none',
    _hover: {
      textDecoration: 'underline',
    },
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  }),
  current: css({
    color: 'fg',
  }),
  supportingCurrent: css({
    color: 'fg.muted',
  }),
  icon: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  }),
  separator: css({
    display: 'var(--breadcrumb-separator-display)',
    alignItems: 'center',
    color: 'fg.muted',
    py: '1',
    userSelect: 'none',
  }),
} as const;

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
  const isSupporting = context.variant === 'supporting';

  const content = (
    <>
      {startIcon != null ? (
        <span className={styles.icon}>
          <Icon icon={startIcon} size="sm" />
        </span>
      ) : null}
      {children}
    </>
  );

  const itemClassName = cx(
    styles.item,
    isSupporting ? styles.supportingSize : styles.defaultSize,
    className,
  );

  if (isCurrent) {
    return (
      <li
        className={itemClassName}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        <span aria-hidden="true" className={styles.separator}>
          {context.separator}
        </span>
        <span
          aria-current="page"
          className={cx(
            styles.content,
            isSupporting ? styles.supportingCurrent : styles.current,
          )}>
          {content}
        </span>
      </li>
    );
  }

  return (
    <li
      className={itemClassName}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <span aria-hidden="true" className={styles.separator}>
        {context.separator}
      </span>
      {href != null ? (
        <LinkComponent
          className={styles.link}
          href={href}
          onClick={onClick}
          to={LinkComponent === 'a' ? undefined : href}>
          {content}
        </LinkComponent>
      ) : onClick != null ? (
        <button className={styles.link} onClick={onClick} type="button">
          {content}
        </button>
      ) : (
        <span
          className={cx(
            styles.content,
            isSupporting ? styles.supportingCurrent : styles.current,
          )}>
          {content}
        </span>
      )}
    </li>
  );
}

BreadcrumbItem.displayName = 'BreadcrumbItem';
