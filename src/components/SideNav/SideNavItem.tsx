/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import type {CSSProperties, MouseEventHandler, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import type {LinkComponent} from '../Link';
import {useLinkComponent} from '../Link';
import {useSideNavCollapse} from './SideNavContext';

export interface SideNavItemProps {
  /**
   * Custom link component used when href is set.
   */
  as?: LinkComponent;
  /**
   * Custom label content. Falls back to the `label` prop text.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the item.
   */
  className?: string;
  /**
   * Test ID applied to the item.
   */
  'data-testid'?: string;
  /**
   * Content rendered at the end of the item (e.g. a badge).
   */
  endContent?: ReactNode;
  /**
   * Link destination. When set, the item renders as a link.
   */
  href?: string;
  /**
   * Icon rendered before the label.
   */
  icon?: ReactNode;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the item is currently selected.
   * @default false
   */
  isSelected?: boolean;
  /**
   * Accessible item label, also used as visible text when children are omitted.
   */
  label: string;
  /**
   * Click handler for the item.
   */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLElement>;

  /**
   * Inline styles applied to the item.
   */
  style?: CSSProperties;
}

const styles = {
  item: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    w: '100%',
    minH: '8',
    px: '2',
    py: '1.5',
    borderRadius: 'md',
    color: 'fg.muted',
    textDecoration: 'none',
    fontFamily: 'body',
    fontSize: 'sm',
    fontWeight: 'medium',
    bg: 'transparent',
    borderWidth: 0,
    textAlign: 'start',
    cursor: 'pointer',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  selected: css({
    bg: 'bg.subtle',
    color: 'fg',
    fontWeight: 'semibold',
  }),
  disabled: css({
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  }),
  label: css({
    flex: 1,
    minW: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  icon: css({
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--silver-sizes-icon-md)',
    '& > svg': {
      w: '1em',
      h: '1em',
    },
  }),
  endContent: css({
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
  }),
  collapsed: css({
    justifyContent: 'center',
    px: 0,
    w: '10',
  }),
};

/**
 * A single navigation item inside a SideNav. Renders as a link when
 * `href` is provided, or a button otherwise.
 */
export function SideNavItem({
  as,
  children,
  className,
  'data-testid': dataTestId,
  endContent,
  href,
  icon,
  isDisabled = false,
  isSelected = false,
  label,
  onClick,
  ref,
  style,
}: SideNavItemProps): React.JSX.Element {
  const LinkComponent = useLinkComponent(as);
  const {closeMobileNav} = useAppShellMobile();
  const {isCollapsed} = useSideNavCollapse();
  const classNames = cx(
    styles.item,
    isSelected && styles.selected,
    isDisabled && styles.disabled,
    isCollapsed && styles.collapsed,
    className,
  );

  const content = (
    <>
      {icon != null ? (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      ) : null}
      {!isCollapsed ? (
        <span className={styles.label}>{children ?? label}</span>
      ) : null}
      {!isCollapsed && endContent != null ? (
        <span className={styles.endContent}>{endContent}</span>
      ) : null}
    </>
  );

  const handleClick: MouseEventHandler<HTMLElement> = event => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
    closeMobileNav();
  };

  if (href != null && !isDisabled) {
    return (
      <LinkComponent
        aria-current={isSelected ? 'page' : undefined}
        aria-label={isCollapsed ? label : undefined}
        className={classNames}
        data-testid={dataTestId}
        href={href}
        onClick={handleClick}
        ref={ref as Ref<HTMLAnchorElement>}
        style={style}
        to={LinkComponent === 'a' ? undefined : href}>
        {content}
      </LinkComponent>
    );
  }

  return (
    <button
      aria-current={isSelected ? 'page' : undefined}
      aria-label={isCollapsed ? label : undefined}
      className={classNames}
      data-testid={dataTestId}
      disabled={isDisabled}
      onClick={handleClick}
      ref={ref as Ref<HTMLButtonElement>}
      style={style}
      type="button">
      {content}
    </button>
  );
}

SideNavItem.displayName = 'SideNavItem';
