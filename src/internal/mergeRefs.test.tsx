import {render, screen} from '@testing-library/react';
import {createRef, type Ref, type RefCallback} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {mergeRefs} from 'internal/mergeRefs';

describe('mergeRefs', () => {
  it('preserves callback identity for unchanged refs across interleaved calls', () => {
    const objectRef = createRef<HTMLDivElement>();
    const callbackRef = vi.fn<RefCallback<HTMLDivElement>>();
    const merged = mergeRefs(objectRef, callbackRef);
    mergeRefs(objectRef, vi.fn<RefCallback<HTMLDivElement>>());

    expect(mergeRefs(objectRef, callbackRef)).toBe(merged);
    expect(mergeRefs(objectRef, null, callbackRef, undefined)).toBe(merged);
    expect(mergeRefs()).toBe(mergeRefs(null, undefined));
  });

  it('distinguishes changed refs, ref order, and ref count', () => {
    const first = createRef<HTMLDivElement>();
    const second = createRef<HTMLDivElement>();
    const merged = mergeRefs(first, second);

    expect(mergeRefs(second, first)).not.toBe(merged);
    expect(mergeRefs(first)).not.toBe(merged);
    expect(mergeRefs(first, second, createRef<HTMLDivElement>())).not.toBe(
      merged,
    );
    expect(mergeRefs(first, createRef<HTMLDivElement>())).not.toBe(merged);
  });

  it('cleans up changed refs and attaches their replacement to the same live node', () => {
    const objectRef = createRef<HTMLDivElement>();
    const firstRef = vi.fn<RefCallback<HTMLDivElement>>();
    const secondRef = vi.fn<RefCallback<HTMLDivElement>>();
    const cleanup = vi.fn();
    const cleanupRef = vi.fn<RefCallback<HTMLDivElement>>(() => cleanup);
    function Example({ref}: {ref: Ref<HTMLDivElement>}): React.JSX.Element {
      return (
        <div data-testid="target" ref={mergeRefs(objectRef, ref, cleanupRef)} />
      );
    }
    const {rerender, unmount} = render(<Example ref={firstRef} />);
    const element = screen.getByTestId('target');

    rerender(<Example ref={firstRef} />);
    expect(firstRef).toHaveBeenCalledExactlyOnceWith(element);
    expect(cleanupRef).toHaveBeenCalledExactlyOnceWith(element);
    expect(cleanup).not.toHaveBeenCalled();

    rerender(<Example ref={secondRef} />);
    expect(screen.getByTestId('target')).toBe(element);
    expect(firstRef).toHaveBeenNthCalledWith(2, null);
    expect(firstRef).toHaveBeenCalledTimes(2);
    expect(secondRef).toHaveBeenCalledExactlyOnceWith(element);
    expect(cleanup).toHaveBeenCalledOnce();
    expect(cleanupRef).toHaveBeenCalledTimes(2);
    expect(objectRef.current).toBe(element);
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(2);
    expect(cleanupRef).toHaveBeenCalledTimes(2);
    expect(secondRef).toHaveBeenNthCalledWith(2, null);
    expect(objectRef.current).toBeNull();
  });

  it('keeps cleanup local to each attachment when a cached callback is shared by nodes', () => {
    const cleanups = [vi.fn(), vi.fn()];
    const callbackRef = vi
      .fn<RefCallback<HTMLDivElement>>()
      .mockReturnValueOnce(cleanups[0])
      .mockReturnValueOnce(cleanups[1]);
    function Example({
      hasFirst = true,
    }: {
      hasFirst?: boolean;
    }): React.JSX.Element {
      return (
        <>
          {hasFirst ? (
            <div data-testid="first" key="first" ref={mergeRefs(callbackRef)} />
          ) : null}
          <div data-testid="second" key="second" ref={mergeRefs(callbackRef)} />
        </>
      );
    }
    const {rerender, unmount} = render(<Example />);
    const second = screen.getByTestId('second');
    expect(callbackRef).toHaveBeenCalledTimes(2);

    rerender(<Example hasFirst={false} />);
    expect(screen.getByTestId('second')).toBe(second);
    expect(cleanups[0]).toHaveBeenCalledOnce();
    expect(cleanups[1]).not.toHaveBeenCalled();
    expect(callbackRef).toHaveBeenCalledTimes(2);
    unmount();
    expect(cleanups[0]).toHaveBeenCalledOnce();
    expect(cleanups[1]).toHaveBeenCalledOnce();
    expect(callbackRef).toHaveBeenCalledTimes(2);
  });

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
