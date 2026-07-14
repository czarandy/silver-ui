'use client';

import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
  Ref,
} from 'react';
import {useId, useMemo} from 'react';
import {
  ChatMessageContext,
  useChatListContext,
  type ChatDensity,
  type ChatMessageSender,
} from 'components/Chat/ChatContext';
import {chatMessageRecipe} from 'components/Chat/ChatMessage.recipe';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

export interface ChatMessageProps extends ComponentPropsWithoutRef<'article'> {
  /**
   * Avatar rendered beside the message. Ignored for `system` messages.
   */
  avatar?: ReactNode;
  /**
   * Message body — typically one or more ChatMessageBubble elements followed
   * by a ChatMessageMetadata.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Density preset controlling gaps. Defaults to the surrounding
   * ChatMessageList density.
   * @default 'balanced'
   */
  density?: ChatDensity;
  /**
   * Metadata rendered below the message body. Use when the last child is raw
   * content; if the last child is a ChatMessageBubble, prefer the bubble's
   * `metadata` prop so it aligns with the bubble padding. Ignored for
   * `system` messages.
   */
  metadata?: ReactNode;
  /**
   * Sender name rendered above the message body. Use when the first child is
   * raw content; if the first child is a ChatMessageBubble, prefer the
   * bubble's `name` prop so it aligns with the bubble padding. Ignored for
   * `system` messages.
   */
  name?: ReactNode;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Who authored the message. Controls alignment, avatar placement, and how
   * child bubbles style themselves.
   */
  sender: ChatMessageSender;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

/**
 * A single chat message: sender-aware wrapper providing alignment, avatar,
 * name, and metadata around the message content.
 */
export function ChatMessage({
  avatar,
  children,
  className,
  'data-testid': dataTestId,
  density: densityProp,
  metadata,
  name,
  ref,
  sender,
  style,
  ...rest
}: ChatMessageProps): React.JSX.Element {
  const listContext = useChatListContext();
  const density = densityProp ?? listContext?.density ?? 'balanced';
  const contextValue = useMemo(() => ({density, sender}), [density, sender]);
  const classes = chatMessageRecipe({density, sender});
  const nameId = useId();
  const isSystem = sender === 'system';
  const hasAvatar = isReactNode(avatar) && !isSystem;
  const hasName = isReactNode(name) && !isSystem;

  return (
    <ChatMessageContext value={contextValue}>
      <article
        {...rest}
        aria-label={hasName ? undefined : `Message from ${sender}`}
        aria-labelledby={hasName ? nameId : undefined}
        className={cx(classes.root, className)}
        data-chat-message=""
        data-sender={sender}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {hasAvatar ? <div className={classes.avatar}>{avatar}</div> : null}
        <div className={classes.content}>
          {hasName ? (
            <div className={classes.name} id={nameId}>
              {name}
            </div>
          ) : null}
          <div className={classes.body}>{children}</div>
          {isReactNode(metadata) && !isSystem ? <div>{metadata}</div> : null}
        </div>
      </article>
    </ChatMessageContext>
  );
}

ChatMessage.displayName = 'ChatMessage';
