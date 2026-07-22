'use client';

import {createContext, use} from 'react';

/**
 * Size vocabulary shared by components that can inherit an ambient size
 * (Button, ButtonGroup, SegmentedControl, Select, Tabs, TextInput).
 */
export type AmbientSize = 'lg' | 'md' | 'sm';

/**
 * Ambient default size provided by a container (currently Toolbar) so sizeable
 * children match the container without setting `size` on each one. An explicit
 * `size` prop on a child always wins.
 */
export const SizeContext = createContext<AmbientSize | null>(null);
SizeContext.displayName = 'SizeContext';

export function useAmbientSize(): AmbientSize | null {
  return use(SizeContext);
}
