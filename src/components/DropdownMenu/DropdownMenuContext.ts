import {createContext, use} from 'react';
import type {ButtonSize} from '../Button';

export interface DropdownMenuContextValue {
  closeMenu: () => void;
  menuSize: ButtonSize;
}

export const DropdownMenuContext =
  createContext<DropdownMenuContextValue | null>(null);

DropdownMenuContext.displayName = 'DropdownMenuContext';

export function useDropdownMenuContext(): DropdownMenuContextValue | null {
  return use(DropdownMenuContext);
}
