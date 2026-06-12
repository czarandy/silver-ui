/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import {ChevronDown} from 'lucide-react';
import type {CSSProperties, MouseEventHandler, ReactNode, Ref} from 'react';
import {useCallback, useId, useState} from 'react';
import {useAppShellMobile} from 'components/AppShell/AppShellMobileContext';
import {Icon, type IconComponent} from 'components/Icon';
import {Item} from 'components/Item';
import {useLinkComponent} from 'components/Link';
import type {LinkComponent} from 'components/Link';
import {useSideNavCollapse} from 'components/SideNav/SideNavContext';
import {sideNavItemRecipe} from 'components/SideNav/SideNavItem.recipe';
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';

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
  icon?: IconComponent;
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
  const {closeMobileNav, isMobileNavOpen} = useAppShellMobile();
  const {isCollapsed} = useSideNavCollapse();
  const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);
  const childrenId = useId();

  const hasChildren = isReactNode(children);
  const isExpandable = hasChildren && isItemCollapsible;
  const hasPrimaryAction = href != null || onClick != null;

  const classes = sideNavItemRecipe({
    isSelected,
    isDisabled,
    // Only expandable items animate their children open/closed and rotate a
    // chevron; non-expandable items keep their children fully shown.
    isExpanded: !isExpandable || isExpanded,
  });

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleClick: MouseEventHandler<HTMLElement> = event => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    // Dismiss the mobile drawer after navigating, but only when it is actually
    // open so non-mobile render modes don't fire a no-op close on every click.
    if (isMobileNavOpen) {
      closeMobileNav();
    }
  };

  const iconSlot =
    icon != null ? (
      <span aria-hidden="true" className={classes.icon}>
        <Icon icon={icon} size="sm" />
      </span>
    ) : undefined;

  // --- Collapsed sidebar: icon-only rendering ---
  if (isCollapsed) {
    const collapsedClassNames = cx(classes.collapsed, className);

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
    <span className={classes.chevron}>
      <Icon icon={ChevronDown} size="sm" />
    </span>
  ) : null;

  const childrenContainer = isReactNode(children) ? (
    <div className={classes.childrenContainer} id={childrenId} role="group">
      <div className={classes.childrenInner}>{children}</div>
    </div>
  ) : null;

  // Collapsible WITHOUT primary action: whole row toggles
  if (isExpandable && !hasPrimaryAction) {
    return (
      <>
        <button
          aria-controls={childrenId}
          aria-expanded={isExpanded}
          className={cx(classes.toggleRow, className)}
          data-testid={dataTestId}
          disabled={isDisabled}
          onClick={toggleExpanded}
          ref={ref as Ref<HTMLButtonElement>}
          style={style}
          type="button">
          <Item
            as="span"
            className={classes.toggleLabel}
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
          className={cx(classes.item, className)}
          data-testid={dataTestId}
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
              className={classes.toggleButton}
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
        className={cx(classes.item, className)}
        data-testid={dataTestId}
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
