import {createContext, use} from 'react';

export type LayoutArea = 'header' | 'content' | 'start' | 'end' | 'footer';

export interface LayoutSlots {
  hasEnd: boolean;
  hasFooter: boolean;
  hasHeader: boolean;
  hasStart: boolean;
}

export interface LayoutDividerContextValue {
  defaultHasDividers: boolean;
}

export const LayoutAreaContext = createContext<LayoutArea>('content');
LayoutAreaContext.displayName = 'LayoutAreaContext';
export const LayoutSlotsContext = createContext<LayoutSlots>({
  hasEnd: false,
  hasFooter: false,
  hasHeader: false,
  hasStart: false,
});
LayoutSlotsContext.displayName = 'LayoutSlotsContext';
export const LayoutDividerContext =
  createContext<LayoutDividerContextValue | null>(null);
LayoutDividerContext.displayName = 'LayoutDividerContext';

export function useLayoutArea(): LayoutArea {
  return use(LayoutAreaContext);
}

export function useLayoutSlots(): LayoutSlots {
  return use(LayoutSlotsContext);
}

export function useLayoutDivider(): LayoutDividerContextValue | null {
  return use(LayoutDividerContext);
}
