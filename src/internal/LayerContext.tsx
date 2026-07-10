'use client';

import {createContext, use, useCallback} from 'react';
import {isTopLayer} from 'internal/layerStack';

export interface LayerContextValue {
  /**
   * Id of the nearest enclosing layer.
   */
  layerId: string;
  /**
   * Id of the layer that encloses `layerId`, or `null` at the root. Threading
   * this through context lets the layer stack derive nesting from the React
   * tree rather than relying on DOM containment alone.
   */
  parentId: string | null;
}

export const LayerContext = createContext<LayerContextValue | null>(null);
LayerContext.displayName = 'LayerContext';

/**
 * Id of the layer enclosing the caller, or `null` when the caller is not inside
 * a layer.
 */
export function useParentLayerId(): string | null {
  return use(LayerContext)?.layerId ?? null;
}

/**
 * Returns a getter for whether the enclosing layer is free to act on Escape —
 * that is, no other layer is stacked above it. Components outside any layer are
 * always free to act.
 */
export function useIsTopLayer(): () => boolean {
  const layerId = useParentLayerId();
  return useCallback(
    () => (layerId == null ? true : isTopLayer(layerId)),
    [layerId],
  );
}
