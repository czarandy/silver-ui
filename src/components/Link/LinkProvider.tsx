'use client';

import {useMemo, type ReactNode} from 'react';
import {LinkContext} from 'components/Link/LinkContext';
import type {LinkComponent} from 'components/Link/types';

export interface LinkProviderProps {
  children: ReactNode;
  component: LinkComponent;
}

export function LinkProvider({
  component,
  children,
}: LinkProviderProps): React.JSX.Element {
  const value = useMemo(() => ({component}), [component]);

  return <LinkContext value={value}>{children}</LinkContext>;
}

LinkProvider.displayName = 'LinkProvider';
