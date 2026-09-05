'use client';

import type {CSSProperties, ReactNode, Ref, RefObject} from 'react';
import {useMemo, useRef, useState} from 'react';
import {ChatLayoutContext, type ChatDensity} from 'components/Chat/ChatContext';
import {chatLayoutRecipe} from 'components/Chat/ChatLayout.recipe';
import type {ChatPassthroughProps} from 'components/Chat/ChatPassthroughProps';
import {ChatScrollButton} from 'components/Chat/ChatScrollButton';
import {useChatNewMessages} from 'components/Chat/useChatNewMessages';
import {useChatStreamScroll} from 'components/Chat/useChatStreamScroll';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {observeResize, unobserveResize} from 'internal/sharedResizeObserver';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';
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
  if (!isNonEmptyReactNode(children) || children === false) {
    return false;
  }
  return !(Array.isArray(children) && children.length === 0);
}

export interface ChatLayoutProps extends ChatPassthroughProps {
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
  ...passthrough
}: ChatLayoutProps): React.JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const dockContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = externalScrollRef ?? rootRef;
  const isSelfScrolling = externalScrollRef == null;
  const [density, setDensity] = useState<ChatDensity>('balanced');
  const [dockInset, setDockInset] = useState(0);

  const scroll = useChatStreamScroll({scrollRef: scrollContainerRef});
  const {scrollIfLocked} = scroll;
  const newMessages = useChatNewMessages({
    isLocked: scroll.isLocked,
    onResize: scrollIfLocked,
  });

  const layoutContext = useMemo(
    () => ({
      contentRef: newMessages.contentRef,
      density,
      scrollContainerRef,
    }),
    [density, newMessages.contentRef, scrollContainerRef],
  );

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (root == null) {
      return;
    }

    const updateDensity = () => {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- responsive state is derived from measured DOM width before paint
      setDensity(getDensity(root.clientWidth));
    };
    updateDensity();
    observeResize(root, updateDensity);
    return () => unobserveResize(root, updateDensity);
  }, []);

  // The message area must account for the dock's measured height in both
  // modes. Self-scrolling: the sticky dock stays in flow after the
  // full-height message area, so its height must come out of the area's
  // minimum or a short history gains a dock-height scroll range that lets
  // the last message slide underneath the composer. External container: the
  // dock is position: fixed and out of that container's flow, so the area
  // must instead pad by the dock height or the final messages hide under it.
  useIsomorphicLayoutEffect(() => {
    const dock = dockContainerRef.current;
    if (dock == null) {
      return;
    }

    const updateDockInset = () => {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- layout inset is derived from measured dock height before paint
      setDockInset(dock.offsetHeight);
    };
    updateDockInset();
    observeResize(dock, updateDockInset);
    return () => unobserveResize(dock, updateDockInset);
  }, [density]);

  // Density and dock measurements can change the message area's geometry.
  // Keep a locked history bottom-aligned in the same pre-paint cycle while
  // preserving the position of a user who has intentionally scrolled up.
  useIsomorphicLayoutEffect(() => {
    scrollIfLocked();
  }, [density, dockInset, scrollIfLocked]);

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
        {...passthrough}
        className={cx(classes.root, className)}
        data-density={density}
        data-testid={dataTestId}
        ref={mergeRefs(ref, rootRef)}
        style={style}>
        <div
          className={classes.messageArea}
          style={
            isSelfScrolling
              ? {minHeight: `calc(100% - ${dockInset}px)`}
              : {paddingBlockEnd: dockInset}
          }>
          {showEmpty && isNonEmptyReactNode(emptyState) ? (
            <div className={classes.emptyState}>{emptyState}</div>
          ) : (
            children
          )}
        </div>
        <div className={classes.dockContainer} ref={dockContainerRef}>
          <div className={classes.scrollButtonContainer}>
            {scrollButton === undefined ? defaultScrollButton : scrollButton}
          </div>
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
