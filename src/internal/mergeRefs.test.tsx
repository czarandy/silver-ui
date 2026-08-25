import {render, screen} from '@testing-library/react';
import {createRef, type RefCallback} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {mergeRefs} from 'internal/mergeRefs';

describe('mergeRefs', () => {
  it('detaches every ref when a callback ref returns a cleanup', () => {
    const objectRef = createRef<HTMLDivElement>();
    const plainRef = vi.fn<RefCallback<HTMLDivElement>>();
    const cleanup = vi.fn();
    const cleanupRef = vi.fn<RefCallback<HTMLDivElement>>(() => cleanup);

    const {unmount} = render(
      <div
        data-testid="target"
        ref={mergeRefs(objectRef, plainRef, cleanupRef)}
      />,
    );
    const element = screen.getByTestId('target');

    expect(objectRef.current).toBe(element);
    expect(plainRef).toHaveBeenCalledExactlyOnceWith(element);
    expect(cleanupRef).toHaveBeenCalledExactlyOnceWith(element);

    unmount();

    expect(cleanup).toHaveBeenCalledOnce();
    expect(objectRef.current).toBeNull();
    expect(plainRef).toHaveBeenCalledTimes(2);
    expect(plainRef).toHaveBeenNthCalledWith(2, null);
    expect(cleanupRef).toHaveBeenCalledOnce();
  });
});
