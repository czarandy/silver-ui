/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import type {CSSProperties, MouseEventHandler, ReactNode, Ref} from 'react';
import {useAppShellMobile} from 'components/AppShell/AppShellMobileContext';
import {useLinkComponent} from 'components/Link';
import {Text} from 'components/Text';
import {useTopNavRenderMode} from 'components/TopNav/TopNavContext';
import {topNavItemRecipe} from 'components/TopNav/TopNavItem.recipe';
import {cx} from 'internal/cx';
import {VisuallyHidden} from '../../internal';
import {getAriaLabel, useRel} from '../../internal/linkAccessibility';
import {Icon, type IconComponent} from '../Icon';
import type {LinkComponent} from '../Link';

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
   * Link destination. When set, the item renders as a link. When omitted,
   * the item renders as a button driven by `onClick`.
   */
  href?: string;
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
   * Ref forwarded to the anchor or button element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * The `rel` attribute for the anchor element. `noopener noreferrer` are
   * added automatically for `target="_blank"`. Ignored when rendering as a
   * button (no `href`).
   */
  rel?: string;
  /**
   * Inline styles applied to the item.
   */
  style?: CSSProperties;
  /**
   * The `target` attribute for the anchor element. Ignored when rendering as
   * a button (no `href`).
   */
  target?: string;
}

/**
 * A single navigation item inside a TopNav. Renders as a link when `href`
 * is provided, or a button driven by `onClick` otherwise. Supports icons,
 * selected state, and adapts to drawer layout on mobile.
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
  const opensInNewTab = target === '_blank';
  const linkRel = useRel({target, rel});
  const labelContent = children ?? (
    <Text color="inherit" size="md" type="body" weight="inherit">
      {label}
    </Text>
  );

  const handleClick: MouseEventHandler<HTMLElement> = event => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);

    if (isDrawer) {
      closeMobileNav();
    }
  };

  const className_ = cx(
    topNavItemRecipe({isSelected, isDisabled, isIconOnly, isDrawer}),
    className,
  );

  const content = (
    <>
      {icon != null ? (
        <Icon aria-hidden="true" color="inherit" icon={icon} size="md" />
      ) : null}
      {!isIconOnly ? labelContent : null}
    </>
  );

  if (href == null) {
    return (
      <button
        aria-current={isSelected ? 'page' : undefined}
        aria-label={isIconOnly ? label : undefined}
        className={className_}
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

  return (
    <LinkComponent
      aria-current={isSelected ? 'page' : undefined}
      aria-disabled={isDisabled || undefined}
      aria-label={isIconOnly ? getAriaLabel(label, opensInNewTab) : undefined}
      className={className_}
      data-testid={dataTestId}
      href={href}
      onClick={handleClick}
      ref={ref as Ref<HTMLAnchorElement>}
      rel={linkRel}
      style={style}
      tabIndex={isDisabled ? -1 : undefined}
      target={target}
      to={LinkComponent === 'a' ? undefined : href}>
      {content}
      {opensInNewTab && !isIconOnly ? (
        <>
          {' '}
          <VisuallyHidden>(opens in new tab)</VisuallyHidden>
        </>
      ) : null}
    </LinkComponent>
  );
}

TopNavItem.displayName = 'TopNavItem';
