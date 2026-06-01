/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import type {CSSProperties, MouseEventHandler, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {Icon, type IconComponent} from '../Icon';
import type {LinkComponent} from '../Link';
import {useLinkComponent} from '../Link';
import {useTopNavRenderMode} from './TopNavContext';

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

const styles = {
  item: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    minH: '8',
    px: '3',
    py: '1.5',
    borderRadius: 'md',
    color: 'fg.muted',
    textDecoration: 'none',
    fontFamily: 'body',
    fontSize: 'sm',
    fontWeight: 'medium',
    cursor: 'pointer',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  drawer: css({
    display: 'flex',
    w: '100%',
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
  iconOnly: css({
    px: '2',
    aspectRatio: 'square',
  }),
};

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

  const content = (
    <>
      {icon != null ? (
        <Icon aria-hidden="true" color="inherit" icon={icon} size="md" />
      ) : null}
      {!isIconOnly ? (children ?? label) : null}
    </>
  );

  const sharedClassName = cx(
    styles.item,
    isDrawer && styles.drawer,
    isSelected && styles.selected,
    isDisabled && styles.disabled,
    isIconOnly && styles.iconOnly,
    className,
  );

  return (
    <LinkComponent
      aria-current={isSelected ? 'page' : undefined}
      aria-disabled={isDisabled || undefined}
      aria-label={isIconOnly ? label : undefined}
      className={sharedClassName}
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
      {content}
    </LinkComponent>
  );
}

TopNavItem.displayName = 'TopNavItem';
