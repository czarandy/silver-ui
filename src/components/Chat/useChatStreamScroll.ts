'use client';

import {useCallback, useEffect, useRef, useState, type RefObject} from 'react';

export interface UseChatStreamScrollOptions {
  /**
   * Distance from the bottom (px) beyond which `isScrolledUp` becomes true,
   * typically revealing a scroll-to-bottom button.
   * @default 100
   */
  buttonThreshold?: number;
  /**
   * Whether the scroll behavior is enabled.
   * @default true
   */
  isEnabled?: boolean;
  /**
   * Distance from the bottom (px) within which a finished scroll re-locks
   * auto-follow. Keep small so users aren't yanked back after a slight
   * scroll.
   * @default 10
   */
  lockThreshold?: number;
  /**
   * Ref to the scrollable container element.
   */
  scrollRef: RefObject<HTMLElement | null>;
}

export interface UseChatStreamScrollReturn {
  /**
   * Whether auto-follow is locked (following growing content).
   */
  isLocked: boolean;
  /**
   * Whether the user has scrolled up past `buttonThreshold`.
   */
  isScrolledUp: boolean;
  /**
   * Lock auto-follow and scroll to the bottom.
   */
  lock: () => void;
  /**
   * Scroll to the bottom if auto-follow is locked. Call on content resize.
   */
  scrollIfLocked: () => void;
  /**
   * Scroll to the bottom of the container and re-lock.
   */
  scrollToBottom: () => void;
  /**
   * Scroll to the last message (`[data-chat-message]`) in the container.
   */
  scrollToLastMessage: () => void;
  /**
   * Scroll so a specific element is at the top of the visible area. Does not
   * change the lock state.
   */
  scrollToMessage: (element: HTMLElement) => void;
  /**
   * Unlock auto-follow.
   */
  unlock: () => void;
}

function scrollElementToBottom(el: HTMLElement): void {
  el.scrollTop = el.scrollHeight - el.clientHeight;
}

function setScrollTop(el: HTMLElement, top: number): void {
  el.scrollTop = top;
}

/**
 * Scroll-to-bottom behavior for streaming chat containers.
 *
 * While locked (the default), growing content keeps the container pinned to
 * the bottom. Scrolling up — by wheel, touch, scrollbar, or keyboard —
 * unlocks it; a scroll that settles near the bottom re-locks it. Synthetic
 * scroll events caused by content resizing never change the lock state.
 */
export function useChatStreamScroll({
  buttonThreshold = 100,
  isEnabled = true,
  lockThreshold = 10,
  scrollRef,
}: UseChatStreamScrollOptions): UseChatStreamScrollReturn {
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const lockedRef = useRef(true);
  // True while a smooth scrollToBottom is in flight, so wheel/touch input
  // can take control back before the scroll position catches up.
  const isProgrammaticScrollRef = useRef(false);
  // For scroll direction detection.
  const lastScrollTopRef = useRef(0);
  // For synthetic scroll detection (content/viewport resizes fire scroll
  // events without user intent).
  const lastScrollHeightRef = useRef(0);
  const lastOffsetHeightRef = useRef(0);

  const setLocked = useCallback((locked: boolean) => {
    lockedRef.current = locked;
    setIsLocked(locked);
  }, []);

  const followBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el == null || el.scrollHeight <= el.clientHeight) {
      return;
    }
    scrollElementToBottom(el);
    lastScrollTopRef.current = el.scrollTop;
  }, [scrollRef]);

  const scrollToBottom = useCallback(() => {
    setLocked(true);
    setIsScrolledUp(false);
    const el = scrollRef.current;
    if (el == null) {
      return;
    }
    if (typeof el.scrollTo === 'function') {
      isProgrammaticScrollRef.current = true;
      el.scrollTo({
        behavior: 'smooth',
        top: el.scrollHeight - el.clientHeight,
      });
    } else {
      followBottom();
    }
  }, [followBottom, scrollRef, setLocked]);

  const scrollToMessage = useCallback(
    (element: HTMLElement) => {
      const container = scrollRef.current;
      if (container == null) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offset = elementRect.top - containerRect.top + container.scrollTop;
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({behavior: 'instant', top: offset});
      } else {
        setScrollTop(container, offset);
      }
      lastScrollTopRef.current = container.scrollTop;
    },
    [scrollRef],
  );

  const scrollToLastMessage = useCallback(() => {
    const container = scrollRef.current;
    if (container == null) {
      return;
    }
    const messages = container.querySelectorAll('[data-chat-message]');
    const last = messages[messages.length - 1];
    if (last instanceof HTMLElement) {
      scrollToMessage(last);
    }
  }, [scrollRef, scrollToMessage]);

  const lock = useCallback(() => {
    setLocked(true);
    setIsScrolledUp(false);
    followBottom();
  }, [followBottom, setLocked]);

  const unlock = useCallback(() => {
    setLocked(false);
  }, [setLocked]);

  const scrollIfLocked = useCallback(() => {
    if (isEnabled && lockedRef.current) {
      followBottom();
    }
  }, [followBottom, isEnabled]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el == null || !isEnabled) {
      return;
    }

    lastScrollTopRef.current = el.scrollTop;
    lastScrollHeightRef.current = el.scrollHeight;
    lastOffsetHeightRef.current = el.offsetHeight;

    const onScroll = () => {
      const {offsetHeight, scrollHeight, scrollTop} = el;
      const distanceFromBottom = scrollHeight - scrollTop - offsetHeight;

      setIsScrolledUp(distanceFromBottom > buttonThreshold);

      const scrollHeightChanged = scrollHeight !== lastScrollHeightRef.current;
      const offsetHeightChanged = offsetHeight !== lastOffsetHeightRef.current;
      lastScrollHeightRef.current = scrollHeight;
      lastOffsetHeightRef.current = offsetHeight;

      if (scrollHeightChanged || offsetHeightChanged) {
        // Synthetic scroll from a resize — don't change the lock state.
        lastScrollTopRef.current = scrollTop;
        return;
      }

      const isScrollingUp = scrollTop < lastScrollTopRef.current;
      lastScrollTopRef.current = scrollTop;

      if (isScrollingUp && lockedRef.current) {
        setLocked(false);
      }
    };

    const onScrollEnd = () => {
      isProgrammaticScrollRef.current = false;
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.offsetHeight;
      if (distanceFromBottom <= lockThreshold) {
        setLocked(true);
      }
    };

    // Wheel up and touch drag interrupt an in-flight smooth scroll before
    // the scroll position updates, so react to them directly.
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY < 0 && isProgrammaticScrollRef.current) {
        isProgrammaticScrollRef.current = false;
        setLocked(false);
      }
    };

    const onTouchMove = () => {
      if (isProgrammaticScrollRef.current) {
        isProgrammaticScrollRef.current = false;
        setLocked(false);
      }
    };

    el.addEventListener('scroll', onScroll, {passive: true});
    el.addEventListener('scrollend', onScrollEnd);
    el.addEventListener('wheel', onWheel, {passive: true});
    el.addEventListener('touchmove', onTouchMove, {passive: true});

    const initialFrame = requestAnimationFrame(() => {
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTop = el.scrollHeight - el.clientHeight;
        lastScrollTopRef.current = el.scrollTop;
      }
    });

    return () => {
      cancelAnimationFrame(initialFrame);
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', onScrollEnd);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [buttonThreshold, isEnabled, lockThreshold, scrollRef, setLocked]);

  return {
    isLocked,
    isScrolledUp,
    lock,
    scrollIfLocked,
    scrollToBottom,
    scrollToLastMessage,
    scrollToMessage,
    unlock,
  };
}
