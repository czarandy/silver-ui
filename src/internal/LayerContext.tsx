'use client';

import {createContext, use} from 'react';
import {isTopLayer} from 'internal/layerStack';

export const LayerContext = createContext<{layerId: string} | null>(null);
LayerContext.displayName = 'LayerContext';

export function useIsTopLayer(): () => boolean {
  const context = use(LayerContext);
  if (context == null) {
    return () => true;
  }
  return () => isTopLayer(context.layerId);
}
