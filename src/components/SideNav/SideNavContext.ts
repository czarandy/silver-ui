'use client';

import {createContext, use} from 'react';

export type SideNavRenderMode =
  'default' | 'topbar' | 'drawer' | 'drawer-content';

export interface SideNavCollapseState {
  isCollapsed: boolean;
  isCollapsible: boolean;
  toggle: () => void;
}

export const SideNavRenderContext = createContext<SideNavRenderMode>('default');
SideNavRenderContext.displayName = 'SideNavRenderContext';
export const SideNavCollapseContext = createContext<SideNavCollapseState>({
  isCollapsed: false,
  isCollapsible: false,
  toggle: () => {},
});
SideNavCollapseContext.displayName = 'SideNavCollapseContext';

export function useSideNavRenderMode(): SideNavRenderMode {
  return use(SideNavRenderContext);
}

export function useSideNavCollapse(): SideNavCollapseState {
  return use(SideNavCollapseContext);
}
