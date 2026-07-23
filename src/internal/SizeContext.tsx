'use client';

import {createContext, use} from 'react';

/**
 * Size vocabulary shared by components that can inherit an ambient size.
 */
export type ComponentSize = 'sm' | 'md' | 'lg';

/**
 * Ambient default size provided by a container so sizeable children match it
 * without setting `size` on each one. A null value intentionally resets the
 * cascade at a new surface, such as an overlay.
 */
export const SizeContext = createContext<ComponentSize | null>(null);
SizeContext.displayName = 'SizeContext';

/**
 * Resolves a component size from ordered local overrides, then the ambient
 * size, and finally the library default.
 */
export function useResolvedSize(
  ...overrides: ReadonlyArray<ComponentSize | null | undefined>
): ComponentSize {
  const ambientSize = use(SizeContext);
  return (
    overrides.find((size): size is ComponentSize => size != null) ??
    ambientSize ??
    'md'
  );
}
