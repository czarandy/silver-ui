import {act, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
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

function dispatchTouch(
  element: HTMLElement,
  type: 'touchmove' | 'touchstart',
  clientY: number,
): void {
  const event = new Event(type);
  Object.defineProperty(event, 'touches', {value: [{clientY}]});
  act(() => {
    element.dispatchEvent(event);
  });
}

const METRICS = {clientHeight: 400, offsetHeight: 400, scrollHeight: 1000};

function createMatchMedia(matches: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function renderScrollHook(element: HTMLElement) {
  const scrollRef = {current: element};
  return renderHook(() => useChatStreamScroll({scrollRef}));
}

describe('useChatStreamScroll', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.stubGlobal('matchMedia', createMatchMedia(false));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts locked and scrolled down before the next animation frame', () => {
    const animationFrame = vi.spyOn(window, 'requestAnimationFrame');
    const {element, state} = createScrollContainer(METRICS);
    const {result} = renderScrollHook(element);

    expect(result.current.isLocked).toBe(true);
    expect(result.current.isScrolledUp).toBe(false);
    expect(state.scrollTop).toBe(600);
    expect(animationFrame).not.toHaveBeenCalled();
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

  it('scrollToBottom scrolls instantly when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));
    const {element, scrollTo} = createScrollContainer(METRICS);
    const {result} = renderScrollHook(element);

    act(() => result.current.scrollToBottom());

    expect(scrollTo).toHaveBeenCalledWith({behavior: 'instant', top: 600});
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

  it('unlocks on wheel input while streaming content grows', () => {
    const {element, state} = createScrollContainer(METRICS);
    state.scrollTop = 600;
    const {result} = renderScrollHook(element);

    // The user's input arrives in the same frame as content growth. The
    // following scroll event will look synthetic because scrollHeight changed,
    // so the wheel handler must capture the intent before it fires.
    state.scrollHeight = 1400;
    act(() => {
      element.dispatchEvent(new WheelEvent('wheel', {deltaY: -10}));
    });
    state.scrollTop = 599;
    dispatchScroll(element);

    expect(result.current.isLocked).toBe(false);
  });

  it('unlocks on a touch scroll-up while streaming content grows', () => {
    const {element, state} = createScrollContainer(METRICS);
    state.scrollTop = 600;
    const {result} = renderScrollHook(element);

    state.scrollHeight = 1400;
    dispatchTouch(element, 'touchstart', 100);
    // A finger moving down scrolls the content upward.
    dispatchTouch(element, 'touchmove', 120);
    state.scrollTop = 599;
    dispatchScroll(element);

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
    const {element, scrollTo, state} = createScrollContainer(METRICS);
    const first = document.createElement('div');
    first.dataset.chatMessage = '';
    const last = document.createElement('div');
    last.dataset.chatMessage = '';
    element.append(first, last);
    const {result} = renderScrollHook(element);
    state.scrollTop = 0;

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
