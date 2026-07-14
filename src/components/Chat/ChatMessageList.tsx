'use client';

import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
  Ref,
} from 'react';
import {useEffect, useMemo, useRef, useTransition} from 'react';
import {
  ChatListContext,
  useChatLayoutContext,
  type ChatDensity,
} from 'components/Chat/ChatContext';
import {chatMessageListRecipe} from 'components/Chat/ChatMessageList.recipe';
import {Spinner} from 'components/Spinner';
import isReactNode from 'internal/isReactNode';
import type {SpacingToken} from 'internal/spacingTokens';
import useLatest from 'internal/useLatest';
import {cx} from 'utils/cx';

export interface ChatMessageListProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Message elements — typically ChatMessage components, optionally mixed
   * with ChatSystemMessage separators.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Visual density; flows to child messages via context. Defaults to the
   * surrounding ChatLayout density.
   * @default 'balanced'
   */
  density?: ChatDensity;
  /**
   * Content shown when the list has no messages.
   */
  emptyState?: ReactNode;
  /**
   * Gap between top-level message rows, on the spacing scale. Defaults to
   * the selected density's gap; override when row spacing should be tuned
   * separately from density.
   */
  gap?: SpacingToken;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Async action invoked when the user scrolls to the top of the list. Use
   * for loading older messages; a spinner is shown at the top while pending.
   */
  scrollToTopAction?: () => Promise<void>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

/**
 * Presentational container for chat messages: a `role="log"` flex column with
 * density-based spacing, a bottom-aligning spacer, and optional
 * load-older-messages support. Auto-scroll is owned by ChatLayout.
 */
export function ChatMessageList({
  children,
  className,
  'data-testid': dataTestId,
  density: densityProp,
  emptyState,
  gap,
  ref,
  scrollToTopAction,
  style,
  ...rest
}: ChatMessageListProps): React.JSX.Element {
  const layoutContext = useChatLayoutContext();
  const density = densityProp ?? layoutContext?.density ?? 'balanced';
  const sentinelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isLoadingTop, startTransition] = useTransition();
  const contentRef = layoutContext?.contentRef;
  const scrollContainerRef = layoutContext?.scrollContainerRef;

  // Register the inner content element with the layout so it can observe
  // content growth for auto-scroll and new-message detection.
  useEffect(() => {
    const inner = innerRef.current;
    if (contentRef == null || inner == null) {
      return;
    }
    contentRef(inner);
    return () => contentRef(null);
  }, [contentRef]);

  // Read the action through a latest ref so a new function identity (common
  // when the action closes over a paging cursor) doesn't recreate the
  // observer — a recreated observer fires immediately while the sentinel is
  // still intersecting, which would chain-load every history page.
  const scrollToTopActionRef = useLatest(scrollToTopAction);
  const hasScrollToTopAction = scrollToTopAction != null;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!hasScrollToTopAction || sentinel == null) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          startTransition(async () => {
            await scrollToTopActionRef.current?.();
          });
        }
      },
      {root: scrollContainerRef?.current ?? null, threshold: 0},
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasScrollToTopAction, scrollContainerRef, scrollToTopActionRef]);

  const contextValue = useMemo(() => ({density}), [density]);
  const classes = chatMessageListRecipe({density, gap});
  const hasChildren =
    isReactNode(children) &&
    children !== false &&
    !(Array.isArray(children) && children.length === 0);

  return (
    <ChatListContext value={contextValue}>
      <div
        {...rest}
        aria-live="polite"
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={ref}
        role="log"
        style={style}>
        <div className={classes.inner} ref={innerRef}>
          {scrollToTopAction != null ? (
            <div aria-hidden="true" ref={sentinelRef} />
          ) : null}
          {isLoadingTop ? (
            <div className={classes.loadingTop}>
              <Spinner size="md" />
            </div>
          ) : null}
          <div aria-hidden="true" className={classes.spacer} />
          {hasChildren ? (
            children
          ) : isReactNode(emptyState) ? (
            <div className={classes.emptyState}>{emptyState}</div>
          ) : null}
        </div>
      </div>
    </ChatListContext>
  );
}

ChatMessageList.displayName = 'ChatMessageList';
