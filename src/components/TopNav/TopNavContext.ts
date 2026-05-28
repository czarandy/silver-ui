import {createContext, use, type ReactNode} from 'react';

export type TopNavRenderMode = 'default' | 'mobile-bar' | 'drawer';
export type TopNavSlot = 'start' | 'center' | 'end';

export const TopNavRenderContext = createContext<TopNavRenderMode>('default');
TopNavRenderContext.displayName = 'TopNavRenderContext';
export const TopNavMobileContentContext = createContext<ReactNode>(null);
TopNavMobileContentContext.displayName = 'TopNavMobileContentContext';
export const TopNavSlotContext = createContext<TopNavSlot>('start');
TopNavSlotContext.displayName = 'TopNavSlotContext';

export function useTopNavRenderMode(): TopNavRenderMode {
  return use(TopNavRenderContext);
}

export function useTopNavMobileContent(): ReactNode {
  return use(TopNavMobileContentContext);
}

export function useTopNavSlot(): TopNavSlot {
  return use(TopNavSlotContext);
}
