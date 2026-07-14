'use client';

import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
  Ref,
  RefObject,
} from 'react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {ChatLayoutContext, type ChatDensity} from 'components/Chat/ChatContext';
import {chatLayoutRecipe} from 'components/Chat/ChatLayout.recipe';
import {ChatScrollButton} from 'components/Chat/ChatScrollButton';
import {useChatNewMessages} from 'components/Chat/useChatNewMessages';
import {useChatStreamScroll} from 'components/Chat/useChatStreamScroll';
import isReactNode from 'internal/isReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {observeResize, unobserveResize} from 'internal/sharedResizeObserver';
import {cx} from 'utils/cx';

function getDensity(width: number): ChatDensity {
  if (width < 480) {
    return 'compact';
  }
  if (width <= 768) {
    return 'balanced';
  }
  return 'spacious';
}

function hasVisibleContent(children: ReactNode): boolean {
  if (!isReactNode(children) || children === false) {
    return false;
  }
  return !(Array.isArray(children) && children.length === 0);
}

export interface ChatLayoutProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Message content — typically a ChatMessageList. Flows naturally and
   * scrolls behind the composer dock.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Composer element docked to the bottom over a frosted-glass layer.
   * Typically a ChatComposer.
   */
  composer: ReactNode;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Content shown when `children` is empty.
   */
  emptyState?: ReactNode;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Scroll-to-bottom button rendered above the composer. Defaults to a
   * ChatScrollButton wired to the layout's scroll state; pass a custom node
   * to replace it or `null` to hide it.
   */
  scrollButton?: ReactNode;
  /**
   * External scroll container. When provided, auto-scroll targets this
   * element and the dock is fixed to the viewport instead of the layout
   * root scrolling.
   */
  scrollRef?: RefObject<HTMLElement | null>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

/**
 * Full-page chat shell: a scrollable message area with a composer docked to
 * the bottom over a frosted-glass blur, streaming auto-scroll with
 * lock/unlock, and a scroll-to-bottom button that doubles as a new-message
 * indicator. Density adapts to the layout width.
 */
export function ChatLayout({
  children,
  className,
  composer,
  'data-testid': dataTestId,
  emptyState,
  ref,
  scrollButton,
  scrollRef: externalScrollRef,
  style,
  ...rest
}: ChatLayoutProps): React.JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = externalScrollRef ?? rootRef;
  const isSelfScrolling = externalScrollRef == null;
  const [density, setDensity] = useState<ChatDensity>('balanced');

  const scroll = useChatStreamScroll({scrollRef: scrollContainerRef});
  const newMessages = useChatNewMessages({
    isLocked: scroll.isLocked,
    onResize: scroll.scrollIfLocked,
  });

  const layoutContext = useMemo(
    () => ({
      contentRef: newMessages.contentRef,
      density,
      scrollContainerRef,
    }),
    [density, newMessages.contentRef, scrollContainerRef],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (root == null) {
      return;
    }
    observeResize(root, () => {
      setDensity(getDensity(root.clientWidth));
    });
    return () => unobserveResize(root);
  }, []);

  const classes = chatLayoutRecipe({density, isSelfScrolling});
  const showEmpty = !hasVisibleContent(children);
  const defaultScrollButton = (
    <ChatScrollButton
      isVisible={scroll.isScrolledUp || newMessages.hasNewMessages}
      label={newMessages.hasNewMessages ? 'New messages' : undefined}
      onClick={() => {
        newMessages.dismiss();
        scroll.scrollToBottom();
      }}
    />
  );

  return (
    <ChatLayoutContext value={layoutContext}>
      <div
        {...rest}
        className={cx(classes.root, className)}
        data-density={density}
        data-testid={dataTestId}
        ref={mergeRefs(ref, rootRef)}
        style={style}>
        <div className={classes.messageArea}>
          {showEmpty && isReactNode(emptyState) ? (
            <div className={classes.emptyState}>{emptyState}</div>
          ) : (
            children
          )}
        </div>
        <div className={classes.dockContainer}>
          {scrollButton === undefined ? defaultScrollButton : scrollButton}
          <div className={classes.blurLayer} />
          <div className={classes.dock}>
            <div className={classes.dockInner}>{composer}</div>
          </div>
        </div>
      </div>
    </ChatLayoutContext>
  );
}

ChatLayout.displayName = 'ChatLayout';
