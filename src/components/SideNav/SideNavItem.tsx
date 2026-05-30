/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import {ChevronDown} from 'lucide-react';
import type {CSSProperties, MouseEventHandler, ReactNode, Ref} from 'react';
import {useCallback, useId, useState} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {Item} from '../Item';
import type {LinkComponent} from '../Link';
import {useLinkComponent} from '../Link';
import {useSideNavCollapse} from './SideNavContext';

export interface SideNavItemProps {
  /**
   * Custom link component used when href is set.
   */
  as?: LinkComponent;
  /**
   * Nested sub-items rendered below this item.
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
   * Whether the item can expand/collapse its children.
   * @default false
   */
  isCollapsible?: boolean;
  /**
   * Whether the item's children are initially expanded.
   * @default true
   */
  isDefaultExpanded?: boolean;
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
   * Accessible item label, also used as visible text.
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
  navItem: css({
    color: 'fg.muted',
    fontSize: 'sm',
    fontWeight: 'medium',
    minH: '8',
    py: '0.5',
  }),
  navItemSelected: css({
    bg: 'bg.subtle',
    color: 'fg',
    fontWeight: 'semibold',
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
  collapsed: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: '10',
    minH: '8',
    px: 0,
    py: '1.5',
    borderRadius: 'md',
    color: 'fg.muted',
    textDecoration: 'none',
    bg: 'transparent',
    borderWidth: 0,
    cursor: 'pointer',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  collapsedSelected: css({
    bg: 'bg.subtle',
    color: 'fg',
  }),
  collapsedDisabled: css({
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  }),
  toggleRow: css({
    all: 'unset',
    boxSizing: 'border-box',
    display: 'flex',
    w: '100%',
    cursor: 'pointer',
    borderRadius: 'md',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  toggleRowDisabled: css({
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  }),
  chevron: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transitionProperty: 'transform',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    '& > svg': {
      w: '1em',
      h: '1em',
    },
  }),
  chevronExpanded: css({
    transform: 'rotate(180deg)',
  }),
  toggleButton: css({
    all: 'unset',
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    w: '7',
    h: '7',
    borderRadius: 'md',
    cursor: 'pointer',
    color: 'fg.muted',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  childrenContainer: css({
    display: 'grid',
    gridTemplateRows: '1fr',
    transitionProperty: 'grid-template-rows',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
  }),
  childrenCollapsed: css({
    gridTemplateRows: '0fr',
  }),
  childrenInner: css({
    overflow: 'hidden',
    ps: '6',
  }),
};

/**
 * A single navigation item inside a SideNav. Renders as a link when
 * `href` is provided, or a button otherwise. Supports nested sub-items
 * via `children` with optional expand/collapse behavior.
 */
export function SideNavItem({
  as,
  children,
  className,
  'data-testid': dataTestId,
  endContent,
  href,
  icon,
  isCollapsible: isItemCollapsible = false,
  isDefaultExpanded = true,
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
  const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);
  const childrenId = useId();

  const hasChildren = children != null;
  const isExpandable = hasChildren && isItemCollapsible;
  const hasPrimaryAction = href != null || onClick != null;

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleClick: MouseEventHandler<HTMLElement> = event => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    closeMobileNav();
  };

  const iconSlot =
    icon != null ? (
      <span aria-hidden="true" className={styles.icon}>
        {icon}
      </span>
    ) : undefined;

  // --- Collapsed sidebar: icon-only rendering ---
  if (isCollapsed) {
    const collapsedClassNames = cx(
      styles.collapsed,
      isSelected && styles.collapsedSelected,
      isDisabled && styles.collapsedDisabled,
      className,
    );

    if (href != null && !isDisabled) {
      return (
        <LinkComponent
          aria-current={isSelected ? 'page' : undefined}
          aria-label={label}
          className={collapsedClassNames}
          data-testid={dataTestId}
          href={href}
          onClick={handleClick}
          ref={ref as Ref<HTMLAnchorElement>}
          style={style}
          to={LinkComponent === 'a' ? undefined : href}>
          {iconSlot}
        </LinkComponent>
      );
    }

    return (
      <button
        aria-current={isSelected ? 'page' : undefined}
        aria-label={label}
        className={collapsedClassNames}
        data-testid={dataTestId}
        disabled={isDisabled}
        onClick={handleClick}
        ref={ref as Ref<HTMLButtonElement>}
        style={style}
        type="button">
        {iconSlot}
      </button>
    );
  }

  // --- Expanded sidebar ---

  const chevronSlot = isExpandable ? (
    <span className={cx(styles.chevron, isExpanded && styles.chevronExpanded)}>
      <ChevronDown />
    </span>
  ) : null;

  const childrenContainer =
    children != null ? (
      <div
        className={cx(
          styles.childrenContainer,
          isExpandable && !isExpanded && styles.childrenCollapsed,
        )}
        id={childrenId}
        role="group">
        <div className={styles.childrenInner}>{children}</div>
      </div>
    ) : null;

  // Collapsible WITHOUT primary action: whole row toggles
  if (isExpandable && !hasPrimaryAction) {
    return (
      <>
        <button
          aria-controls={childrenId}
          aria-expanded={isExpanded}
          className={cx(
            styles.toggleRow,
            isSelected && styles.navItemSelected,
            isDisabled && styles.toggleRowDisabled,
            className,
          )}
          data-testid={dataTestId}
          disabled={isDisabled}
          onClick={toggleExpanded}
          ref={ref as Ref<HTMLButtonElement>}
          style={style}
          type="button">
          <Item
            as="span"
            className={styles.navItem}
            density="compact"
            endContent={chevronSlot}
            label={label}
            startContent={iconSlot}
          />
        </button>
        {childrenContainer}
      </>
    );
  }

  // Collapsible WITH primary action: split-action (link + chevron)
  if (isExpandable && hasPrimaryAction) {
    return (
      <>
        <Item
          aria-current={isSelected ? 'page' : undefined}
          className={cx(
            styles.navItem,
            isSelected && styles.navItemSelected,
            className,
          )}
          data-testid={dataTestId}
          density="compact"
          endContent={endContent}
          href={isDisabled ? undefined : href}
          isDisabled={isDisabled}
          label={label}
          linkComponent={as}
          onClick={handleClick}
          ref={ref}
          startContent={iconSlot}
          style={style}
          trailingContent={
            <button
              aria-controls={childrenId}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
              className={styles.toggleButton}
              onClick={toggleExpanded}
              type="button">
              {chevronSlot}
            </button>
          }
        />
        {childrenContainer}
      </>
    );
  }

  // Leaf item (no collapsible children): compose Item directly
  return (
    <>
      <Item
        aria-current={isSelected ? 'page' : undefined}
        className={cx(
          styles.navItem,
          isSelected && styles.navItemSelected,
          className,
        )}
        data-testid={dataTestId}
        density="compact"
        endContent={endContent}
        href={isDisabled ? undefined : href}
        isDisabled={isDisabled}
        label={label}
        linkComponent={as}
        onClick={handleClick}
        ref={ref}
        startContent={iconSlot}
        style={style}
      />
      {childrenContainer}
    </>
  );
}

SideNavItem.displayName = 'SideNavItem';
