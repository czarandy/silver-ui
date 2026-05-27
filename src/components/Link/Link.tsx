import {ExternalLink} from 'lucide-react';
import {
  createElement,
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../lib/cx';
import {Tooltip} from '../Tooltip';
import {linkRecipe, type LinkVariants} from './Link.recipe';
import type {LinkComponent} from './types';
import {useLinkComponent} from './useLinkComponent';

type LinkRecipeVariants = NonNullable<LinkVariants>;

export interface LinkProps extends LinkRecipeVariants {
  as?: LinkComponent;
  label?: string;
  hasUnderline?: boolean;
  isDisabled?: boolean;
  isExternalLink?: boolean;
  tooltip?: string;
  children: ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLAnchorElement>;
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
  const LinkComponent = useLinkComponent(as);
  const target = isExternalLink ? '_blank' : targetFromProps;
  const rel = getRel({isExternalLink, target, rel: relFromProps});
  const handleClick: MouseEventHandler<HTMLAnchorElement> = event => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  const element = createElement(
    LinkComponent,
    {
      ref,
      href,
      to: LinkComponent === 'a' ? undefined : href,
      target,
      rel,
      'aria-label': label,
      'aria-disabled': isDisabled || undefined,
      tabIndex: isDisabled ? -1 : undefined,
      className: cx(linkRecipe({color, hasUnderline}), className),
      style,
      onClick: handleClick,
    },
    children,
    isExternalLink ? (
      <span
        className={css({
          display: 'inline-flex',
          flexShrink: 0,
          fontSize: '0.875em',
          lineHeight: 1,
        })}
        aria-hidden="true">
        <ExternalLink size="1em" strokeWidth={2} />
      </span>
    ) : null,
  );

  if (tooltip != null) {
    return <Tooltip content={tooltip}>{element}</Tooltip>;
  }

  return element;
}

Link.displayName = 'Link';

function getRel({
  isExternalLink,
  target,
  rel,
}: {
  isExternalLink: boolean;
  target?: string;
  rel?: string;
}): string | undefined {
  if (!isExternalLink && target !== '_blank') {
    return rel;
  }

  const relValues = new Set((rel ?? '').split(/\s+/).filter(Boolean));
  relValues.add('noopener');
  relValues.add('noreferrer');

  return Array.from(relValues).join(' ');
}
