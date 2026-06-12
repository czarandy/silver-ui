import {createContext} from 'react';
import type {LinkComponent} from 'components/Link/types';

export interface LinkContextValue {
  component: LinkComponent;
}

export const LinkContext = createContext<LinkContextValue | null>(null);
LinkContext.displayName = 'LinkContext';
