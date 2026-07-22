import {act, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useChatNewMessages} from 'components/Chat/useChatNewMessages';
import {createResizeObserverStub} from 'internal/testHelpers';

const resizeObserver = createResizeObserverStub();

function fireResize(element: Element): void {
  act(() => {
    resizeObserver.resize(element);
  });
}

function appendMessage(element: HTMLElement): void {
  const message = document.createElement('div');
  message.dataset.chatMessage = '';
  element.append(message);
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', resizeObserver.ResizeObserverStub);
});

afterEach(() => {
  resizeObserver.reset();
  vi.unstubAllGlobals();
});

describe('useChatNewMessages', () => {
  it('flags new messages while unlocked', () => {
    const content = document.createElement('div');
    const {result} = renderHook(() => useChatNewMessages({isLocked: false}));

    act(() => result.current.contentRef(content));
    appendMessage(content);
    fireResize(content);

    expect(result.current.hasNewMessages).toBe(true);
  });

  it('does not flag new messages while locked', () => {
    const content = document.createElement('div');
    const {result} = renderHook(() => useChatNewMessages({isLocked: true}));

    act(() => result.current.contentRef(content));
    appendMessage(content);
    fireResize(content);

    expect(result.current.hasNewMessages).toBe(false);
  });

  it('does not flag growth of the same last message', () => {
    const content = document.createElement('div');
    appendMessage(content);
    const {rerender, result} = renderHook(
      ({isLocked}: {isLocked: boolean}) => useChatNewMessages({isLocked}),
      {initialProps: {isLocked: true}},
    );

    act(() => result.current.contentRef(content));
    // First resize registers the existing last message while locked.
    fireResize(content);

    // Same message resizing (streaming growth) never flags, even unlocked.
    rerender({isLocked: false});
    fireResize(content);

    expect(result.current.hasNewMessages).toBe(false);
  });

  it('clears the flag when scrolling re-locks', () => {
    const content = document.createElement('div');
    const {rerender, result} = renderHook(
      ({isLocked}: {isLocked: boolean}) => useChatNewMessages({isLocked}),
      {initialProps: {isLocked: false}},
    );

    act(() => result.current.contentRef(content));
    appendMessage(content);
    fireResize(content);
    expect(result.current.hasNewMessages).toBe(true);

    // Manually scrolling back to the bottom re-locks auto-follow; the user
    // has seen the messages, so the flag must clear without dismiss().
    rerender({isLocked: true});

    expect(result.current.hasNewMessages).toBe(false);
  });

  it('dismiss clears the flag', () => {
    const content = document.createElement('div');
    const {result} = renderHook(() => useChatNewMessages({isLocked: false}));

    act(() => result.current.contentRef(content));
    appendMessage(content);
    fireResize(content);
    expect(result.current.hasNewMessages).toBe(true);

    act(() => result.current.dismiss());
    expect(result.current.hasNewMessages).toBe(false);
  });

  it('calls onResize on every content resize', () => {
    const content = document.createElement('div');
    const onResize = vi.fn();
    const {result} = renderHook(() =>
      useChatNewMessages({isLocked: true, onResize}),
    );

    act(() => result.current.contentRef(content));
    fireResize(content);
    fireResize(content);

    expect(onResize).toHaveBeenCalledTimes(2);
  });

  it('stops observing on unmount', () => {
    const content = document.createElement('div');
    const {result, unmount} = renderHook(() =>
      useChatNewMessages({isLocked: false}),
    );

    act(() => result.current.contentRef(content));
    expect(resizeObserver.isObserved(content)).toBe(true);

    unmount();
    expect(resizeObserver.isObserved(content)).toBe(false);
  });

  it('swaps observation when the content element changes', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    const {result} = renderHook(() => useChatNewMessages({isLocked: false}));

    act(() => result.current.contentRef(first));
    expect(resizeObserver.isObserved(first)).toBe(true);

    act(() => result.current.contentRef(second));
    expect(resizeObserver.isObserved(first)).toBe(false);
    expect(resizeObserver.isObserved(second)).toBe(true);
  });
});
