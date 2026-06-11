import {createContext, use, type ReactNode} from 'react';

export type TopNavRenderMode = 'default' | 'mobile-bar' | 'drawer';

export const TopNavRenderContext = createContext<TopNavRenderMode>('default');
TopNavRenderContext.displayName = 'TopNavRenderContext';
export const TopNavMobileContentContext = createContext<ReactNode>(null);
TopNavMobileContentContext.displayName = 'TopNavMobileContentContext';

export function useTopNavRenderMode(): TopNavRenderMode {
  return use(TopNavRenderContext);
}

export function useTopNavMobileContent(): ReactNode {
  return use(TopNavMobileContentContext);
}
