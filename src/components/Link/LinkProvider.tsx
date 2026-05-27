/* eslint-disable silver-ui/require-component-props -- Context providers do not render a DOM root. */

import {useMemo, type ReactNode} from 'react';
import {LinkContext} from './LinkContext';
import type {LinkComponent} from './types';

export interface LinkProviderProps {
  component: LinkComponent;
  children: ReactNode;
}

export function LinkProvider({
  component,
  children,
}: LinkProviderProps): React.JSX.Element {
  const value = useMemo(() => ({component}), [component]);

  return <LinkContext value={value}>{children}</LinkContext>;
}

LinkProvider.displayName = 'LinkProvider';
