'use client';

import {ArrowUp, Square} from 'lucide-react';
import type {CSSProperties, Ref} from 'react';
import {Button} from 'components/Button';
import {useChatComposerContext} from 'components/Chat/ChatContext';
import type {IconComponent} from 'components/Icon';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

const sendButtonStyle = css({
  borderRadius: 'full',
  flexShrink: 0,
});

export interface ChatSendButtonProps {
  /**
   * Additional CSS class names applied to the button.
   */
  className?: string;
  /**
   * Test ID applied to the button.
   */
  'data-testid'?: string;
  /**
   * Whether the send button is disabled. Defaults to `!canSend` from the
   * surrounding ChatComposer.
   */
  isDisabled?: boolean;
  /**
   * Whether the stop button is shown instead of the send button. Defaults to
   * the surrounding ChatComposer state.
   * @default false
   */
  isStopShown?: boolean;
  /**
   * Called when the user clicks the send button. Defaults to submitting the
   * surrounding ChatComposer.
   */
  onSend?: () => void;
  /**
   * Called when the user clicks the stop button. Defaults to the surrounding
   * ChatComposer `onStop`.
   */
  onStop?: () => void;
  /**
   * Ref forwarded to the button element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Icon for the send state.
   * @default ArrowUp
   */
  sendIcon?: IconComponent;
  /**
   * Button size.
   * @default 'md'
   */
  size?: 'md' | 'sm';
  /**
   * Icon for the stop state.
   * @default Square
   */
  stopIcon?: IconComponent;
  /**
   * Inline styles applied to the button.
   */
  style?: CSSProperties;
}

/**
 * Circular send/stop toggle button for the chat composer. Reads state from
 * the surrounding ChatComposer by default; every value can be overridden via
 * props for standalone usage.
 */
export function ChatSendButton({
  className,
  'data-testid': dataTestId,
  isDisabled,
  isStopShown,
  onSend,
  onStop,
  ref,
  sendIcon = ArrowUp,
  size = 'md',
  stopIcon = Square,
  style,
}: ChatSendButtonProps): React.JSX.Element {
  const composer = useChatComposerContext();
  const showStop = isStopShown ?? composer?.isStopShown ?? false;
  const sendDisabled = isDisabled ?? !(composer?.canSend ?? false);

  return (
    <Button
      className={cx(sendButtonStyle, className)}
      data-testid={dataTestId}
      icon={showStop ? stopIcon : sendIcon}
      isDisabled={showStop ? false : sendDisabled}
      isIconOnly
      label={showStop ? 'Stop' : 'Send'}
      onClick={
        showStop ? (onStop ?? composer?.onStop) : (onSend ?? composer?.onSubmit)
      }
      ref={ref}
      size={size}
      style={style}
      variant={showStop ? 'secondary' : 'primary'}
    />
  );
}

ChatSendButton.displayName = 'ChatSendButton';
