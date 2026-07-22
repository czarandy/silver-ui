import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
  Ref,
} from 'react';
import {chatSystemMessageRecipe} from 'components/Chat/ChatSystemMessage.recipe';
import {Divider} from 'components/Divider';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

export type ChatSystemMessageVariant = 'default' | 'divider';

export interface ChatSystemMessageProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * System message content — text or any ReactNode.
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
   * Icon rendered before the text. Ignored by the `divider` variant.
   */
  icon?: ReactNode;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Visual variant: `default` is plain centered text, `divider` renders the
   * content as a labeled horizontal divider (date-separator style).
   * @default 'default'
   */
  variant?: ChatSystemMessageVariant;
}

/**
 * Centered system notice for chat threads: date separators, "conversation
 * started", membership changes, and similar non-sender content.
 */
export function ChatSystemMessage({
  children,
  className,
  'data-testid': dataTestId,
  icon,
  ref,
  style,
  variant = 'default',
  ...rest
}: ChatSystemMessageProps): React.JSX.Element {
  const classes = chatSystemMessageRecipe({variant});

  if (variant === 'divider') {
    return (
      <div
        {...rest}
        className={cx(classes.dividerWrap, className)}
        data-chat-message=""
        data-sender="system"
        data-testid={dataTestId}
        ref={ref}
        role="status"
        style={style}>
        <Divider label={children} />
      </div>
    );
  }

  return (
    <div
      {...rest}
      className={cx(classes.root, className)}
      data-chat-message=""
      data-sender="system"
      data-testid={dataTestId}
      ref={ref}
      role="status"
      style={style}>
      <span className={classes.content}>
        {isNonEmptyReactNode(icon) ? (
          <span className={classes.icon}>{icon}</span>
        ) : null}
        {children}
      </span>
    </div>
  );
}

ChatSystemMessage.displayName = 'ChatSystemMessage';
