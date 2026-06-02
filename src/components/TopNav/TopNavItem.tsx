/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import type {CSSProperties, MouseEventHandler, ReactNode, Ref} from 'react';
import {cx} from '../../internal/cx';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {Icon, type IconComponent} from '../Icon';
import type {LinkComponent} from '../Link';
import {useLinkComponent} from '../Link';
import {useTopNavRenderMode} from './TopNavContext';
import {topNavItemRecipe} from './TopNavItem.recipe';

export interface TopNavItemProps {
  /**
   * Custom link component used for routing.
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
   * Link destination.
   */
  href: string;
  /**
   * Icon rendered before the label.
   */
  icon?: IconComponent;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether only the icon is visible (label used for accessibility).
   * @default false
   */
  isIconOnly?: boolean;
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
   * Click handler called when the item is clicked.
   */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * Ref forwarded to the anchor element.
   */
  ref?: Ref<HTMLAnchorElement>;
  /**
   * The `rel` attribute for the anchor element.
   */
  rel?: string;
  /**
   * Inline styles applied to the item.
   */
  style?: CSSProperties;
  /**
   * The `target` attribute for the anchor element.
   */
  target?: string;
}

/**
 * A single navigation link inside a TopNav. Supports icons, selected
 * state, and adapts to drawer layout on mobile.
 */
export function TopNavItem({
  as,
  children,
  className,
  'data-testid': dataTestId,
  href,
  icon,
  isDisabled = false,
  isIconOnly = false,
  isSelected = false,
  label,
  onClick,
  ref,
  rel,
  style,
  target,
}: TopNavItemProps): React.JSX.Element {
  const LinkComponent = useLinkComponent(as);
  const renderMode = useTopNavRenderMode();
  const {closeMobileNav} = useAppShellMobile();
  const isDrawer = renderMode === 'drawer';

  return (
    <LinkComponent
      aria-current={isSelected ? 'page' : undefined}
      aria-disabled={isDisabled || undefined}
      aria-label={isIconOnly ? label : undefined}
      className={cx(
        topNavItemRecipe({isSelected, isDisabled, isIconOnly, isDrawer}),
        className,
      )}
      data-testid={dataTestId}
      href={href}
      onClick={event => {
        if (isDisabled) {
          event.preventDefault();
          return;
        }

        onClick?.(event);

        if (isDrawer) {
          closeMobileNav();
        }
      }}
      ref={ref}
      rel={rel}
      style={style}
      tabIndex={isDisabled ? -1 : undefined}
      target={target}
      to={LinkComponent === 'a' ? undefined : href}>
      {icon != null ? (
        <Icon aria-hidden="true" color="inherit" icon={icon} size="md" />
      ) : null}
      {!isIconOnly ? (children ?? label) : null}
    </LinkComponent>
  );
}

TopNavItem.displayName = 'TopNavItem';
