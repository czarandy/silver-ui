'use client';

import {use} from 'react';
import {LinkContext} from 'components/Link/LinkContext';
import type {LinkComponent} from 'components/Link/types';

export function useLinkComponent(as?: LinkComponent): LinkComponent {
  const context = use(LinkContext);
  return as ?? context?.component ?? 'a';
}
