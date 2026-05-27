import {useMemo, type ReactNode} from 'react';
import {LinkContext} from './LinkContext';
import type {LinkComponent} from './types';

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
