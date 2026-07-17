'use client';

import {useCallback, useState} from 'react';

export type ImageLoadStatus = 'error' | 'loaded' | 'loading';

export interface ImageLoadState {
  /**
   * Handler for the `<img>` `onError` event.
   */
  onError: () => void;
  /**
   * Handler for the `<img>` `onLoad` event.
   */
  onLoad: () => void;
  /**
   * Ref for the `<img>`. Reveals an already-complete image synchronously on
   * mount so cached images do not flash a loading state. Pair it with a
   * `key={sourceKey}` on the `<img>` so it re-runs when the source changes.
   */
  ref: (image: HTMLImageElement | null) => void;
  /**
   * Intrinsic load status of the image, derived from its native load/error
   * events plus a synchronous check for already-complete (cached) images.
   */
  status: ImageLoadStatus;
}

/**
 * Tracks the intrinsic loading/loaded/error state of an `<img>`, including
 * already-cached images. Pass a `sourceKey` derived from the image source
 * (e.g. `JSON.stringify([src, srcSet])`); the status resets to `loading`
 * whenever it changes.
 */
export default function useImageLoadState(sourceKey: string): ImageLoadState {
  const [status, setStatus] = useState<ImageLoadStatus>('loading');
  // Reset to loading when the source changes. Adjusting state during render is
  // synchronous (no flash); the caller's keyed <img> then re-runs `ref`, which
  // reveals already-cached images before paint.
  const [prevSourceKey, setPrevSourceKey] = useState(sourceKey);
  if (sourceKey !== prevSourceKey) {
    setPrevSourceKey(sourceKey);
    setStatus('loading');
  }

  const ref = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete === true) {
      setStatus(image.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, []);
  const onLoad = useCallback(() => setStatus('loaded'), []);
  const onError = useCallback(() => setStatus('error'), []);

  return {status, ref, onLoad, onError};
}
