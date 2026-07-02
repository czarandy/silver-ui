'use client';

import {createContext, use} from 'react';

export interface AppShellMobileContextValue {
  closeMobileNav: () => void;
  hasAutoToggle: boolean;
  isMobile: boolean;
  isMobileNavEnabled: boolean;
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  toggleMobileNav: () => void;
}

const defaultValue: AppShellMobileContextValue = {
  closeMobileNav: () => {},
  hasAutoToggle: true,
  isMobile: false,
  isMobileNavEnabled: false,
  isMobileNavOpen: false,
  openMobileNav: () => {},
  toggleMobileNav: () => {},
};

export const AppShellMobileContext =
  createContext<AppShellMobileContextValue>(defaultValue);
AppShellMobileContext.displayName = 'AppShellMobileContext';

export function useAppShellMobile(): AppShellMobileContextValue {
  return use(AppShellMobileContext);
}
