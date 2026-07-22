'use client';

import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
  Ref,
} from 'react';
import {useChatMessageContext} from 'components/Chat/ChatContext';
import {chatMessageBubbleRecipe} from 'components/Chat/ChatMessageBubble.recipe';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

export type ChatMessageBubbleVariant = 'filled' | 'ghost';

export type ChatMessageBubbleGroup = 'first' | 'last' | 'middle';

export interface ChatMessageBubbleProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Bubble content — text or any ReactNode.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the bubble element.
   */
  className?: string;
  /**
   * Test ID applied to the bubble element.
   */
  'data-testid'?: string;
  /**
   * Position within a multi-bubble group. Tightens the sender-side corners so
   * consecutive bubbles read as one run: `first` tightens the bottom corner,
   * `middle` both, `last` the top. Leave unset for standalone bubbles.
   */
  group?: ChatMessageBubbleGroup;
  /**
   * Metadata rendered below the bubble, aligned with the bubble padding —
   * typically a ChatMessageMetadata. Use on the last bubble in a message.
   */
  metadata?: ReactNode;
  /**
   * Sender name rendered above the bubble, aligned with the bubble padding.
   * Use on the first bubble in a message.
   */
  name?: ReactNode;
  /**
   * Ref forwarded to the bubble element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the bubble element.
   */
  style?: CSSProperties;
  /**
   * Visual variant: `filled` draws a background, `ghost` keeps only the
   * inline padding so content aligns with sibling bubbles.
   * @default 'filled'
   */
  variant?: ChatMessageBubbleVariant;
}

/**
 * The styled chat "bubble". Reads sender and density from the surrounding
 * ChatMessage so it aligns and colors itself automatically.
 */
export function ChatMessageBubble({
  children,
  className,
  'data-testid': dataTestId,
  group,
  metadata,
  name,
  ref,
  style,
  variant = 'filled',
  ...rest
}: ChatMessageBubbleProps): React.JSX.Element {
  const messageContext = useChatMessageContext();
  const sender = messageContext?.sender ?? 'assistant';
  const density = messageContext?.density ?? 'balanced';
  const classes = chatMessageBubbleRecipe({density, group, sender, variant});

  return (
    <>
      {isNonEmptyReactNode(name) ? (
        <div className={classes.nameRow} data-chat-name="">
          {name}
        </div>
      ) : null}
      <div
        {...rest}
        className={cx(classes.bubble, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {children}
      </div>
      {isNonEmptyReactNode(metadata) ? (
        <div className={classes.metadataRow}>{metadata}</div>
      ) : null}
    </>
  );
}

ChatMessageBubble.displayName = 'ChatMessageBubble';
