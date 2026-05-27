import {ExternalLink} from 'lucide-react';
import {createElement} from 'react';
import type {ComponentPropsWithRef, MouseEventHandler, ReactNode} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../lib/cx';
import {linkRecipe, type LinkVariants} from './Link.recipe';
import type {LinkComponent} from './types';
import {useLinkComponent} from './useLinkComponent';

type LinkRecipeVariants = Omit<NonNullable<LinkVariants>, 'underline'>;
type NativeAnchorProps = Omit<
  ComponentPropsWithRef<'a'>,
  'aria-disabled' | 'children' | 'color'
>;

export interface LinkProps extends NativeAnchorProps, LinkRecipeVariants {
  as?: LinkComponent;
  label?: string;
  hasUnderline?: boolean;
  isDisabled?: boolean;
  isExternalLink?: boolean;
  tooltip?: string;
  children: ReactNode;
}

const externalIconClassName = css({
  display: 'inline-flex',
  flexShrink: 0,
  fontSize: '0.875em',
  lineHeight: 1,
});

export function Link({
  as,
  label,
  href,
  hasUnderline = false,
  isDisabled = false,
  isExternalLink = false,
  target,
  rel,
  tooltip,
  color,
  isStandalone,
  className,
  style,
  ref,
  children,
  onClick,
  ...rest
}: LinkProps): React.JSX.Element {
  const LinkComponent = useLinkComponent(as);
  const computedTarget = isExternalLink ? '_blank' : target;
  const computedRel = getRel({isExternalLink, rel});
  const handleClick: MouseEventHandler<HTMLAnchorElement> = event => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  return createElement(
    LinkComponent,
    {
      ref,
      href,
      target: computedTarget,
      rel: computedRel,
      'aria-label': label,
      'aria-disabled': isDisabled || undefined,
      tabIndex: isDisabled ? -1 : undefined,
      title: tooltip,
      className: cx(
        linkRecipe({color, isStandalone, underline: hasUnderline}),
        className,
      ),
      style,
      onClick: handleClick,
      ...rest,
    },
    children,
    isExternalLink ? (
      <span className={externalIconClassName} aria-hidden="true">
        <ExternalLink size="1em" strokeWidth={2} />
      </span>
    ) : null,
  );
}

Link.displayName = 'Link';

function getRel({
  isExternalLink,
  rel,
}: {
  isExternalLink: boolean;
  rel?: string;
}): string | undefined {
  if (!isExternalLink) {
    return rel;
  }

  const relValues = new Set((rel ?? '').split(/\s+/).filter(Boolean));
  relValues.add('noopener');
  relValues.add('noreferrer');

  return Array.from(relValues).join(' ');
}
