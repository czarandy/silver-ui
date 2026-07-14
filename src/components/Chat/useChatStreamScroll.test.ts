import {act, renderHook} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {useChatStreamScroll} from 'components/Chat/useChatStreamScroll';

interface ScrollMetrics {
  clientHeight: number;
  offsetHeight: number;
  scrollHeight: number;
}

/**
 * A scroll container with mutable scroll metrics (jsdom reports 0 for all
 * of them by default) and a spied `scrollTo` that applies `top` instantly.
 */
function createScrollContainer(metrics: ScrollMetrics) {
  const element = document.createElement('div');
  const state = {...metrics, scrollTop: 0};

  Object.defineProperties(element, {
    clientHeight: {get: () => state.clientHeight},
    offsetHeight: {get: () => state.offsetHeight},
    scrollHeight: {get: () => state.scrollHeight},
    scrollTop: {
      get: () => state.scrollTop,
      set: (value: number) => {
        state.scrollTop = value;
      },
    },
  });
  const scrollTo = vi.fn((options: ScrollToOptions) => {
    state.scrollTop = options.top ?? 0;
  });
  Object.defineProperty(element, 'scrollTo', {value: scrollTo});

  document.body.append(element);
  return {element, scrollTo, state};
}

function dispatchScroll(element: HTMLElement): void {
  act(() => {
    element.dispatchEvent(new Event('scroll'));
  });
}

function dispatchScrollEnd(element: HTMLElement): void {
  act(() => {
    element.dispatchEvent(new Event('scrollend'));
  });
}

const METRICS = {clientHeight: 400, offsetHeight: 400, scrollHeight: 1000};

function renderScrollHook(element: HTMLElement) {
  return renderHook(() => useChatStreamScroll({scrollRef: {current: element}}));
}

describe('useChatStreamScroll', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('starts locked and scrolled down', () => {
    const {element} = createScrollContainer(METRICS);
    const {result} = renderScrollHook(element);

    expect(result.current.isLocked).toBe(true);
    expect(result.current.isScrolledUp).toBe(false);
  });

  it('unlocks when the user scrolls up', () => {
    const {element, state} = createScrollContainer(METRICS);
    state.scrollTop = 600;
    const {result} = renderScrollHook(element);

    state.scrollTop = 300;
    dispatchScroll(element);

    expect(result.current.isLocked).toBe(false);
    expect(result.current.isScrolledUp).toBe(true);
  });

  it('stays locked on synthetic scrolls caused by content growth', () => {
    const {element, state} = createScrollContainer(METRICS);
    state.scrollTop = 600;
    const {result} = renderScrollHook(element);

    // Content grows; the browser fires a scroll event with a smaller
    // relative position but a changed scrollHeight.
    state.scrollHeight = 1400;
    state.scrollTop = 599;
    dispatchScroll(element);

    expect(result.current.isLocked).toBe(true);
  });

  it('re-locks when a scroll settles near the bottom', () => {
    const {element, state} = createScrollContainer(METRICS);
    state.scrollTop = 600;
    const {result} = renderScrollHook(element);

    state.scrollTop = 300;
    dispatchScroll(element);
    expect(result.current.isLocked).toBe(false);

    state.scrollTop = 595; // 5px from the bottom, within lockThreshold
    dispatchScroll(element);
    dispatchScrollEnd(element);

    expect(result.current.isLocked).toBe(true);
  });

  it('does not re-lock when a scroll settles far from the bottom', () => {
    const {element, state} = createScrollContainer(METRICS);
    state.scrollTop = 600;
    const {result} = renderScrollHook(element);

    state.scrollTop = 300;
    dispatchScroll(element);
    dispatchScrollEnd(element);

    expect(result.current.isLocked).toBe(false);
  });

  it('scrollToBottom smooth-scrolls to the bottom and re-locks', () => {
    const {element, scrollTo, state} = createScrollContainer(METRICS);
    state.scrollTop = 300;
    const {result} = renderScrollHook(element);

    state.scrollTop = 100;
    dispatchScroll(element);
    expect(result.current.isLocked).toBe(false);

    act(() => result.current.scrollToBottom());

    expect(scrollTo).toHaveBeenCalledWith({behavior: 'smooth', top: 600});
    expect(result.current.isLocked).toBe(true);
    expect(result.current.isScrolledUp).toBe(false);
  });

  it('unlocks when the user wheels up during a programmatic scroll', () => {
    const {element} = createScrollContainer(METRICS);
    const {result} = renderScrollHook(element);

    act(() => result.current.scrollToBottom());
    act(() => {
      element.dispatchEvent(new WheelEvent('wheel', {deltaY: -10}));
    });

    expect(result.current.isLocked).toBe(false);
  });

  it('scrollIfLocked follows the bottom only while locked', () => {
    const {element, state} = createScrollContainer(METRICS);
    state.scrollTop = 600;
    const {result} = renderScrollHook(element);

    state.scrollHeight = 1400;
    act(() => result.current.scrollIfLocked());
    expect(state.scrollTop).toBe(1000);

    act(() => result.current.unlock());
    state.scrollHeight = 1800;
    act(() => result.current.scrollIfLocked());
    expect(state.scrollTop).toBe(1000);
  });

  it('scrollToLastMessage targets the last [data-chat-message]', () => {
    const {element, scrollTo} = createScrollContainer(METRICS);
    const first = document.createElement('div');
    first.dataset.chatMessage = '';
    const last = document.createElement('div');
    last.dataset.chatMessage = '';
    element.append(first, last);
    const {result} = renderScrollHook(element);

    act(() => result.current.scrollToLastMessage());

    expect(scrollTo).toHaveBeenCalledWith({behavior: 'instant', top: 0});
  });

  it('lock and unlock toggle the locked state', () => {
    const {element} = createScrollContainer(METRICS);
    const {result} = renderScrollHook(element);

    act(() => result.current.unlock());
    expect(result.current.isLocked).toBe(false);

    act(() => result.current.lock());
    expect(result.current.isLocked).toBe(true);
  });
});
