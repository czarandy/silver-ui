'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {observeResize, unobserveResize} from 'internal/sharedResizeObserver';
import useLatest from 'internal/useLatest';

export interface UseChatNewMessagesOptions {
  /**
   * Whether the scroll is currently locked (following content). While
   * locked, new messages don't flag — the user is already at the bottom.
   */
  isLocked: boolean;
  /**
   * Called on every content size change (new message or streaming growth).
   * Use to trigger `scrollIfLocked` in the scroll hook.
   */
  onResize?: () => void;
}

export interface UseChatNewMessagesReturn {
  /**
   * Callback ref to attach to the content element. Handles late mount — the
   * observer attaches whenever the element appears.
   */
  contentRef: (element: HTMLElement | null) => void;
  /**
   * Dismiss the new-messages flag.
   */
  dismiss: () => void;
  /**
   * Whether new messages arrived while the scroll was unlocked.
   */
  hasNewMessages: boolean;
}

/**
 * Detects new chat messages by observing a content element and tracking its
 * last `[data-chat-message]` descendant. When a new message appears while
 * the user is scrolled up (unlocked), `hasNewMessages` becomes true.
 */
export function useChatNewMessages({
  isLocked,
  onResize,
}: UseChatNewMessagesOptions): UseChatNewMessagesReturn {
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const lastMessageRef = useRef<Element | null>(null);
  const isLockedRef = useLatest(isLocked);
  const onResizeRef = useLatest(onResize);

  const elementRef = useRef<HTMLElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const attach = useCallback((element: HTMLElement) => {
    observeResize(element, () => {
      onResizeRef.current?.();

      const messages = element.querySelectorAll('[data-chat-message]');
      const last = messages.length > 0 ? messages[messages.length - 1] : null;

      if (last != null && last !== lastMessageRef.current) {
        lastMessageRef.current = last;
        if (!isLockedRef.current) {
          setHasNewMessages(true);
        }
      }
    });
    cleanupRef.current = () => unobserveResize(element);
  }, []);

  const detach = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  const contentRef = useCallback(
    (element: HTMLElement | null) => {
      if (element === elementRef.current) {
        return;
      }
      detach();
      elementRef.current = element;
      if (element != null) {
        attach(element);
      }
    },
    [attach, detach],
  );

  useEffect(() => {
    return () => detach();
  }, [detach]);

  const dismiss = useCallback(() => {
    setHasNewMessages(false);
  }, []);

  return {contentRef, dismiss, hasNewMessages};
}
