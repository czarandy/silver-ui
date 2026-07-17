import {act, renderHook} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import useImageLoadState from 'internal/useImageLoadState';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useImageLoadState', () => {
  it('starts in the loading state', () => {
    const {result} = renderHook(() => useImageLoadState('a'));
    expect(result.current.status).toBe('loading');
  });

  it('transitions to loaded on load and error on error', () => {
    const {result} = renderHook(() => useImageLoadState('a'));

    act(() => result.current.onLoad());
    expect(result.current.status).toBe('loaded');

    act(() => result.current.onError());
    expect(result.current.status).toBe('error');
  });

  it('resets to loading when the source key changes', () => {
    const {result, rerender} = renderHook(
      ({sourceKey}) => useImageLoadState(sourceKey),
      {initialProps: {sourceKey: 'a'}},
    );

    act(() => result.current.onError());
    expect(result.current.status).toBe('error');

    rerender({sourceKey: 'b'});
    expect(result.current.status).toBe('loading');
  });

  it('keeps state when the source key is unchanged', () => {
    const {result, rerender} = renderHook(
      ({sourceKey}) => useImageLoadState(sourceKey),
      {initialProps: {sourceKey: 'a'}},
    );

    act(() => result.current.onLoad());
    rerender({sourceKey: 'a'});
    expect(result.current.status).toBe('loaded');
  });

  function createImage(
    complete: boolean,
    naturalWidth: number,
  ): HTMLImageElement {
    const image = document.createElement('img');
    Object.defineProperty(image, 'complete', {value: complete});
    Object.defineProperty(image, 'naturalWidth', {value: naturalWidth});
    return image;
  }

  it('reveals an already-complete cached image via ref', () => {
    const {result} = renderHook(() => useImageLoadState('a'));

    act(() => result.current.ref(createImage(true, 640)));
    expect(result.current.status).toBe('loaded');
  });

  it('marks an already-complete broken cached image as error via ref', () => {
    const {result} = renderHook(() => useImageLoadState('a'));

    act(() => result.current.ref(createImage(true, 0)));
    expect(result.current.status).toBe('error');
  });

  it('leaves the status untouched when the image is not yet complete', () => {
    const {result} = renderHook(() => useImageLoadState('a'));

    act(() => result.current.ref(createImage(false, 0)));
    expect(result.current.status).toBe('loading');
  });
});
