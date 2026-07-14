'use client';

import {Check, CheckCheck, CircleAlert, Clock} from 'lucide-react';
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
  Ref,
} from 'react';
import {useChatMessageContext} from 'components/Chat/ChatContext';
import {chatMessageMetadataRecipe} from 'components/Chat/ChatMessageMetadata.recipe';
import {Icon, type IconComponent} from 'components/Icon';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

export type ChatMessageStatus =
  'delivered' | 'error' | 'read' | 'sending' | 'sent';

const STATUS_CONFIG: Record<
  ChatMessageStatus,
  {icon: IconComponent; label: string}
> = {
  delivered: {icon: CheckCheck, label: 'Delivered'},
  error: {icon: CircleAlert, label: 'Failed'},
  read: {icon: CheckCheck, label: 'Read'},
  sending: {icon: Clock, label: 'Sending'},
  sent: {icon: Check, label: 'Sent'},
};

export interface ChatMessageMetadataProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Footer content — model info, ratings, reactions.
   */
  footer?: ReactNode;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Message delivery status, shown as an icon with a label.
   */
  status?: ChatMessageStatus;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Timestamp content — typically a `<Timestamp format="time">`.
   */
  timestamp?: ReactNode;
}

/**
 * Metadata row for a chat message, rendered as `timestamp · footer · status`
 * (reversed for user messages). Renders nothing when all parts are empty.
 */
export function ChatMessageMetadata({
  className,
  'data-testid': dataTestId,
  footer,
  ref,
  status,
  style,
  timestamp,
  ...rest
}: ChatMessageMetadataProps): React.JSX.Element | null {
  const messageContext = useChatMessageContext();
  const sender = messageContext?.sender ?? 'assistant';
  const statusConfig = status != null ? STATUS_CONFIG[status] : null;

  if (!isReactNode(timestamp) && !isReactNode(footer) && statusConfig == null) {
    return null;
  }

  const classes = chatMessageMetadataRecipe({sender, status});

  return (
    <div
      {...rest}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {isReactNode(timestamp) ? <span>{timestamp}</span> : null}
      {isReactNode(timestamp) &&
      (isReactNode(footer) || statusConfig != null) ? (
        <span aria-hidden="true">·</span>
      ) : null}
      {footer}
      {isReactNode(footer) && statusConfig != null ? (
        <span aria-hidden="true">·</span>
      ) : null}
      {statusConfig != null ? (
        <span
          aria-label={`Message ${statusConfig.label.toLowerCase()}`}
          className={classes.status}
          title={statusConfig.label}>
          <Icon icon={statusConfig.icon} size="sm" />
          <span>{statusConfig.label}</span>
        </span>
      ) : null}
    </div>
  );
}

ChatMessageMetadata.displayName = 'ChatMessageMetadata';
