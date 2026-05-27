import {use} from 'react';
import {LinkContext} from './LinkContext';
import type {LinkComponent} from './types';

export function useLinkComponent(as?: LinkComponent): LinkComponent {
  const context = use(LinkContext);
  return as ?? context?.component ?? 'a';
}
