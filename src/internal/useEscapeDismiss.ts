'use client';

import {useCallback, useEffect, useId, useMemo} from 'react';
import {useParentLayerId, type LayerContextValue} from 'internal/LayerContext';
import {
  isTopLayer,
  pushLayer,
  registerLayerNode,
  removeLayer,
  unregisterLayerNode,
} from 'internal/layerStack';
import useLatest from 'internal/useLatest';

interface UseEscapeDismissOptions {
  getElement?: () => HTMLElement | null;
  id?: string;
  isEnabled: boolean;
  onEscape: () => void;
}

interface UseEscapeDismissReturn {
  isTopLayer: () => boolean;
  /**
   * Provide this through `LayerContext` around the layer's children so that
   * nested layers and Escape-handling descendants can locate themselves in the
   * layer tree.
   */
  layerContextValue: LayerContextValue;
  layerId: string;
}

export function useEscapeDismiss({
  getElement = () => null,
  id: providedId,
  isEnabled,
  onEscape,
}: UseEscapeDismissOptions): UseEscapeDismissReturn {
  const generatedId = useId();
  const layerId = providedId ?? generatedId;
  const parentId = useParentLayerId();
  const onEscapeRef = useLatest(onEscape);
  const getElementRef = useLatest(getElement);

  useEffect(() => {
    // Register in the tree even when Escape dismissal is off, so descendants
    // can still tell whether an Escape-handling layer sits above them.
    registerLayerNode({
      getElement: () => getElementRef.current(),
      id: layerId,
      parentId,
    });

    if (isEnabled) {
      pushLayer({
        getElement: () => getElementRef.current(),
        id: layerId,
        onEscape: () => onEscapeRef.current(),
        parentId,
      });
    }

    return () => {
      removeLayer(layerId);
      unregisterLayerNode(layerId);
    };
  }, [getElementRef, isEnabled, layerId, onEscapeRef, parentId]);

  const isCurrentTopLayer = useCallback(() => isTopLayer(layerId), [layerId]);
  const layerContextValue = useMemo(
    () => ({layerId, parentId}),
    [layerId, parentId],
  );

  return {isTopLayer: isCurrentTopLayer, layerContextValue, layerId};
}
