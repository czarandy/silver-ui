'use client';

import {useCallback, useEffect, useId} from 'react';
import {isTopLayer, pushLayer, removeLayer} from 'internal/layerStack';
import useLatest from 'internal/useLatest';

interface UseEscapeDismissOptions {
  getElement?: () => HTMLElement | null;
  id?: string;
  isEnabled: boolean;
  onEscape: () => void;
}

interface UseEscapeDismissReturn {
  isTopLayer: () => boolean;
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
  const onEscapeRef = useLatest(onEscape);
  const getElementRef = useLatest(getElement);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    pushLayer({
      getElement: () => getElementRef.current(),
      id: layerId,
      onEscape: () => onEscapeRef.current(),
    });

    return () => removeLayer(layerId);
  }, [getElementRef, isEnabled, layerId, onEscapeRef]);

  const isCurrentTopLayer = useCallback(() => isTopLayer(layerId), [layerId]);

  return {isTopLayer: isCurrentTopLayer, layerId};
}
