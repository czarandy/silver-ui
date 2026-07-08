'use client';

import {ExternalLink} from 'lucide-react';
import type {CSSProperties, MouseEventHandler, ReactNode, Ref} from 'react';
import {Icon} from 'components/Icon';
import {linkRecipe} from 'components/Link/Link.recipe';
import type {LinkComponent} from 'components/Link/types';
import type {TextColor, TextSize, TextWeight} from 'components/Text';
import {Tooltip} from 'components/Tooltip';
import {VisuallyHidden} from 'components/VisuallyHidden';
import {ActionElement} from 'internal/ActionElement';
import {getAriaLabel, useRel} from 'internal/linkAccessibility';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

/**
 * A polymorphic link component with built-in accessibility, external link handling,
 * and router integration via LinkProvider. Supports custom link components (e.g.
 * React Router's Link) through the `as` prop or a parent `LinkProvider`.
 */
export interface LinkProps {
  /**
   * Identifies the element(s) whose contents are controlled by the link.
   */
  'aria-controls'?: string;
  /**
   * Indicates the current item in a set (e.g. current page in navigation).
   */
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true';
  /**
   * Identifies the element(s) that describe the link.
   */
  'aria-describedby'?: string;
  /**
   * Accessible description for the link.
   */
  'aria-description'?: string;
  /**
   * Identifies the element that provides a detailed description.
   */
  'aria-details'?: string;
  /**
   * Indicates whether a controlled element is expanded or collapsed.
   */
  'aria-expanded'?: boolean;
  /**
   * Indicates the link opens an interactive popup element.
   */
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  /**
   * Indicates whether the element is exposed to the accessibility API.
   */
  'aria-hidden'?: boolean;
  /**
   * Keyboard shortcuts that activate or focus the link.
   */
  'aria-keyshortcuts'?: string;
  /**
   * Identifies the element(s) that label the link.
   */
  'aria-labelledby'?: string;
  /**
   * Identifies element(s) owned by the link that are not DOM children.
   */
  'aria-owns'?: string;
  /**
   * Human-readable description of the role of the link.
   */
  'aria-roledescription'?: string;
  /**
   * Custom element type to render instead of `<a>`. Useful for integrating with routers.
   * If you want to set this globally, use LinkProvider at the top level of your app.
   */
  as?: LinkComponent;
  /**
   * Link content.
   */
  children: ReactNode;
  /**
   * Optionally, rendering by setting the className.
   */
  className?: string;
  /**
   * Color variant controlling the link text color. Default is `active`.
   */
  color?: TextColor;
  /**
   * Test id applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Show a persistent underline on the link text.
   */
  hasUnderline?: boolean;
  /**
   * URL destination. Custom link components receive this as both `href` and
   * `to` so router links and anchor-like links can share the same Silver UI API.
   * When omitted, Link renders as a native `<button>`.
   */
  href?: string;
  /**
   * Visually and functionally disable the link. Prevents navigation and removes from tab order.
   */
  isDisabled?: boolean;
  /**
   * Mark as an external link. Adds an icon and rel="noopener noreferrer".
   * Defaults target to "_blank" unless target is set explicitly.
   */
  isExternalLink?: boolean;
  /**
   * Accessible label (aria-label). It is recommended to set this if your link does not contain sufficient text to make its purpose clear.
   */
  label?: string;
  /**
   * Click handler. Not called when the link is disabled.
   */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * Ref forwarded to the underlying anchor or button element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * HTML rel attribute.
   */
  rel?: string;
  /**
   * Font size variant. Default is `md`.
   */
  size?: TextSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * HTML target attribute.
   */
  target?: string;
  /**
   * Tooltip text shown on hover.
   */
  tooltip?: string;
  /**
   * Font weight variant. Default is inherited from parent styles.
   */
  weight?: TextWeight;
}

export function Link({
  'aria-controls': ariaControls,
  'aria-current': ariaCurrent,
  'aria-description': ariaDescription,
  'aria-describedby': ariaDescribedby,
  'aria-details': ariaDetails,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup,
  'aria-hidden': ariaHidden,
  'aria-keyshortcuts': ariaKeyshortcuts,
  'aria-labelledby': ariaLabelledby,
  'aria-owns': ariaOwns,
  'aria-roledescription': ariaRoledescription,
  as,
  label,
  href: hrefFromProps,
  hasUnderline = false,
  isDisabled = false,
  isExternalLink = false,
  target: targetFromProps,
  rel: relFromProps,
  size,
  tooltip,
  color,
  weight,
  className,
  'data-testid': dataTestId,
  style,
  ref,
  children,
  onClick,
}: LinkProps): React.JSX.Element {
  const renderAsLink = hrefFromProps != null;
  const target = targetFromProps ?? (isExternalLink ? '_blank' : undefined);
  const opensInNewTab = renderAsLink && target === '_blank';
  const rel = useRel({isExternalLink, target, rel: relFromProps});

  const ariaAttrs = {
    'aria-controls': ariaControls,
    'aria-current': ariaCurrent,
    'aria-description': ariaDescription,
    'aria-describedby': ariaDescribedby,
    'aria-details': ariaDetails,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHaspopup,
    'aria-hidden': ariaHidden,
    'aria-keyshortcuts': ariaKeyshortcuts,
    'aria-labelledby': ariaLabelledby,
    'aria-owns': ariaOwns,
    'aria-roledescription': ariaRoledescription,
  };

  const handleClick: MouseEventHandler<HTMLElement> = event => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  const element = (
    <ActionElement
      {...ariaAttrs}
      aria-disabled={isDisabled || undefined}
      aria-label={getAriaLabel(label, opensInNewTab)}
      as={as}
      className={cx(linkRecipe({color, hasUnderline, size, weight}), className)}
      data-testid={dataTestId}
      href={isDisabled ? undefined : hrefFromProps}
      isDisabled={!renderAsLink ? isDisabled : undefined}
      isLink={renderAsLink}
      onClick={handleClick}
      ref={ref}
      rel={!isDisabled && renderAsLink ? rel : undefined}
      style={style}
      tabIndex={isDisabled ? -1 : undefined}
      target={!isDisabled && renderAsLink ? target : undefined}>
      {children}
      {opensInNewTab && label == null ? (
        <>
          {' '}
          <VisuallyHidden>(opens in new tab)</VisuallyHidden>
        </>
      ) : null}
      {isExternalLink ? (
        <span aria-hidden="true" className={styles.externalLink}>
          <Icon icon={ExternalLink} size="sm" />
        </span>
      ) : null}
    </ActionElement>
  );

  if (tooltip != null) {
    return <Tooltip content={tooltip}>{element}</Tooltip>;
  }

  return element;
}

Link.displayName = 'Link';

const styles = {
  externalLink: css({
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.875em',
    lineHeight: 1,
  }),
};
