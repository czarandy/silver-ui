import {createElement, use, useMemo} from 'react';
import {LinkContext} from './LinkContext';
import type {LinkComponent, LinkComponentProps} from './types';

function createLinkWithTo(Component: LinkComponent): LinkComponent {
  function LinkWithTo({
    href,
    ref,
    ...rest
  }: LinkComponentProps): React.ReactElement {
    return createElement(Component, {ref, href, to: href, ...rest});
  }

  LinkWithTo.displayName = `LinkWithTo(${
    typeof Component === 'string' ? Component : 'Component'
  })`;

  return LinkWithTo;
}

export function useLinkComponent(as?: LinkComponent): LinkComponent {
  const context = use(LinkContext);
  const resolved = as ?? context?.component ?? 'a';

  return useMemo(() => {
    if (resolved === 'a') {
      return 'a';
    }

    return createLinkWithTo(resolved);
  }, [resolved]);
}
