/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import {ExternalLink} from 'lucide-react';
import {
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  useMemo,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../lib/cx';
import type {TextColor} from '../Text';
import {Tooltip} from '../Tooltip';
import {linkRecipe} from './Link.recipe';
import type {LinkComponent} from './types';
import {useLinkComponent} from './useLinkComponent';

/**
 * A polymorphic link component with built-in accessibility, external link handling,
 * and router integration via LinkProvider. Supports custom link components (e.g.
 * React Router's Link) through the `as` prop or a parent `LinkProvider`.
 */
export interface LinkProps {
  /**
   * Custom element type to render instead of `<a>`. Useful for integrating with routers.
   * If you want to set this globally, use LinkProvider at the top level of your app.
   */
  as?: LinkComponent;
  /**
   * Color variant controlling the link text color. Default is `active`.
   */
  color?: TextColor;
  /**
   * Accessible label (aria-label). It is recommended to set this if your link does not contain sufficient text to make its purpose clear.
   */
  label?: string;
  /**
   * Show a persistent underline on the link text.
   */
  hasUnderline?: boolean;
  /**
   * Visually and functionally disable the link. Prevents navigation and removes from tab order.
   */
  isDisabled?: boolean;
  /**
   * Mark as an external link. Adds target="_blank", rel="noopener noreferrer", and an icon.
   */
  isExternalLink?: boolean;
  /**
   * Tooltip text shown on hover.
   */
  tooltip?: string;
  /**
   * Link content.
   */
  children: ReactNode;
  /**
   * URL destination. Passed as `to` for custom router components.
   */
  href?: string;
  /**
   * HTML target attribute.
   */
  target?: string;
  /**
   * HTML rel attribute.
   */
  rel?: string;
  /**
   * Optionally, rendering by setting the className.
   */
  className?: string;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Ref forwarded to the underlying anchor element.
   */
  ref?: Ref<HTMLAnchorElement>;
  /**
   * Click handler. Not called when the link is disabled.
   */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function Link({
  as,
  label,
  href,
  hasUnderline = false,
  isDisabled = false,
  isExternalLink = false,
  target: targetFromProps,
  rel: relFromProps,
  tooltip,
  color,
  className,
  style,
  ref,
  children,
  onClick,
}: LinkProps): React.JSX.Element {
  const Component = useLinkComponent(as);
  const target = isExternalLink ? '_blank' : targetFromProps;
  const rel = useRel({isExternalLink, target, rel: relFromProps});

  const handleClick: MouseEventHandler<HTMLAnchorElement> = event => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  const element = (
    <Component
      ref={ref}
      href={href}
      to={Component === 'a' ? undefined : href}
      target={target}
      rel={rel}
      aria-label={getAriaLabel(label, isExternalLink)}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : undefined}
      className={cx(linkRecipe({color, hasUnderline}), className)}
      style={style}
      onClick={handleClick}>
      {children}
      {isExternalLink ? (
        <span className={styles.externalLink} aria-hidden="true">
          <ExternalLink size="1em" strokeWidth={2} />
        </span>
      ) : null}
    </Component>
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

function getAriaLabel(
  label: string | undefined,
  isExternalLink: boolean,
): string | undefined {
  if (!isExternalLink) {
    return label;
  }

  const suffix = '(opens in new tab)';
  return label != null ? `${label} ${suffix}` : suffix;
}

function useRel({
  isExternalLink,
  target,
  rel,
}: {
  isExternalLink: boolean;
  target?: string;
  rel?: string;
}): string | undefined {
  return useMemo(() => {
    if (!isExternalLink && target !== '_blank') {
      return rel;
    }

    const relValues = new Set((rel ?? '').split(/\s+/).filter(Boolean));
    relValues.add('noopener');
    relValues.add('noreferrer');

    return Array.from(relValues).join(' ');
  }, [isExternalLink, target, rel]);
}
