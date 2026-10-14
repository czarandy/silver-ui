import {render, renderHook, screen} from '@testing-library/react';
import {createRef, type Ref, type RefCallback} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {useMergeRefs} from 'hooks/index';

describe('useMergeRefs', () => {
  it('keeps the merged callback stable when input refs are unchanged', () => {
    const objectRef = createRef<HTMLDivElement>();
    const callbackRef = vi.fn<RefCallback<HTMLDivElement>>();
    const {result, rerender} = renderHook(() =>
      useMergeRefs(objectRef, callbackRef),
    );
    const merged = result.current;
    rerender();
    expect(result.current).toBe(merged);
    expect(callbackRef).not.toHaveBeenCalled();
  });

  it('updates when any of the six refs changes, moves, or is removed', () => {
    const refs = Array.from({length: 6}, () => createRef<HTMLDivElement>());
    const {result, rerender} = renderHook(
      ({refs}: {refs: Ref<HTMLDivElement>[]}) =>
        useMergeRefs(refs[0], refs[1], refs[2], refs[3], refs[4], refs[5]),
      {initialProps: {refs}},
    );
    const original = result.current;
    for (let index = 0; index < refs.length; index++) {
      rerender({
        refs: refs.map((ref, i) =>
          i === index ? createRef<HTMLDivElement>() : ref,
        ),
      });
      expect(result.current).not.toBe(original);
      rerender({refs});
    }
    const beforeReorder = result.current;
    rerender({refs: [...refs].reverse()});
    expect(result.current).not.toBe(beforeReorder);
    const beforeRemoval = result.current;
    rerender({refs: refs.slice(0, 5)});
    expect(result.current).not.toBe(beforeRemoval);
  });

  it('keeps memoization local to each hook instance', () => {
    const ref = createRef<HTMLDivElement>();
    const {result: firstResult, rerender: rerenderFirst} = renderHook(() =>
      useMergeRefs(ref),
    );
    const {result: secondResult, rerender: rerenderSecond} = renderHook(() =>
      useMergeRefs(ref),
    );
    expect(firstResult.current).not.toBe(secondResult.current);
    const firstCallback = firstResult.current;
    rerenderSecond();
    rerenderFirst();
    expect(firstResult.current).toBe(firstCallback);
  });

  it('supports all six refs and optional inactive refs', () => {
    const refs = Array.from({length: 6}, () => createRef<HTMLDivElement>());
    function Example(): React.JSX.Element {
      const mergedRef = useMergeRefs(
        refs[0],
        refs[1],
        refs[2],
        refs[3],
        refs[4],
        refs[5],
      );
      const inactiveRef = useMergeRefs<HTMLDivElement>(null, undefined);
      return (
        <>
          <div data-testid="target" ref={mergedRef} />
          <div ref={inactiveRef} />
        </>
      );
    }
    const {unmount} = render(<Example />);
    const element = screen.getByTestId('target');
    for (const ref of refs) {
      expect(ref.current).toBe(element);
    }
    unmount();
    for (const ref of refs) {
      expect(ref.current).toBeNull();
    }
  });

  it('cleans up changed refs and attaches their replacement to the same live node', () => {
    const objectRef = createRef<HTMLDivElement>();
    const firstRef = vi.fn<RefCallback<HTMLDivElement>>();
    const secondRef = vi.fn<RefCallback<HTMLDivElement>>();
    const cleanup = vi.fn();
    const cleanupRef = vi.fn<RefCallback<HTMLDivElement>>(() => cleanup);
    function Example({ref}: {ref: Ref<HTMLDivElement>}): React.JSX.Element {
      const mergedRef = useMergeRefs(objectRef, ref, cleanupRef);
      return <div data-testid="target" ref={mergedRef} />;
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

  it('keeps cleanup local to each attachment when a merged callback is shared by nodes', () => {
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
      const mergedRef = useMergeRefs(callbackRef);
      return (
        <>
          {hasFirst ? (
            <div data-testid="first" key="first" ref={mergedRef} />
          ) : null}
          <div data-testid="second" key="second" ref={mergedRef} />
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
});
