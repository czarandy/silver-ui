'use client';

import {CircleAlert, TriangleAlert} from 'lucide-react';
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  MouseEvent,
  ReactNode,
  Ref,
} from 'react';
import {useCallback, useMemo, useRef, useState} from 'react';
import {chatComposerRecipe} from 'components/Chat/ChatComposer.recipe';
import {ChatComposerInput} from 'components/Chat/ChatComposerInput';
import {
  ChatComposerContext,
  useChatLayoutContext,
  type ChatDensity,
} from 'components/Chat/ChatContext';
import {ChatSendButton} from 'components/Chat/ChatSendButton';
import {Icon} from 'components/Icon';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

export interface ChatComposerStatus {
  /**
   * Status message shown next to the icon.
   */
  message?: string;
  /**
   * Severity of the status.
   */
  type: 'error' | 'warning';
}

export interface ChatComposerProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'onChange' | 'onSubmit'
> {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Density preset controlling body padding and gaps. Defaults to the
   * surrounding ChatLayout density.
   * @default 'balanced'
   */
  density?: ChatDensity;
  /**
   * Actions rendered at the start of the footer row.
   */
  footerActions?: ReactNode;
  /**
   * Actions rendered at the start of the header row (e.g. attach buttons).
   */
  headerActions?: ReactNode;
  /**
   * Contextual info rendered at the end of the header row.
   */
  headerContext?: ReactNode;
  /**
   * Custom input element that replaces the default ChatComposerInput.
   */
  input?: ReactNode;
  /**
   * Whether the composer is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the stop button is shown instead of the send button. Use while a
   * response is streaming.
   * @default false
   */
  isStopShown?: boolean;
  /**
   * Called when the input value changes.
   */
  onChange?: (value: string) => void;
  /**
   * Called when the user clicks the stop button.
   */
  onStop?: () => void;
  /**
   * Called with the trimmed input value when the user submits. The input is
   * cleared afterwards when uncontrolled.
   */
  onSubmit: (value: string) => void;
  /**
   * Placeholder text for the input.
   * @default 'Type a message…'
   */
  placeholder?: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Actions rendered directly before the send button.
   */
  sendActions?: ReactNode;
  /**
   * Custom send button that replaces the default ChatSendButton.
   */
  sendButton?: ReactNode;
  /**
   * Status message rendered attached to the composer body.
   */
  status?: ChatComposerStatus;
  /**
   * Which edge of the composer the status attaches to.
   * @default 'bottom'
   */
  statusPosition?: 'bottom' | 'top';
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Controlled input value. When set, the parent owns the value and should
   * clear it in `onSubmit`.
   */
  value?: string;
}

/**
 * Chat input shell: manages the message value, wires the default input and
 * send button through context, and lays out header, footer, and status slots
 * around them.
 */
export function ChatComposer({
  className,
  'data-testid': dataTestId,
  density: densityProp,
  footerActions,
  headerActions,
  headerContext,
  input,
  isDisabled = false,
  isStopShown = false,
  onChange,
  onSubmit,
  onStop,
  placeholder = 'Type a message…',
  ref,
  sendActions,
  sendButton,
  status,
  statusPosition = 'bottom',
  style,
  value: controlledValue,
  ...rest
}: ChatComposerProps): React.JSX.Element {
  const layoutContext = useChatLayoutContext();
  const density = densityProp ?? layoutContext?.density ?? 'balanced';
  const [internalValue, setInternalValue] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const updateValue = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const handleSubmit = useCallback(() => {
    const trimmed = currentValue.trim();
    if (trimmed === '' || isDisabled) {
      return;
    }
    onSubmit(trimmed);
    updateValue('');
  }, [currentValue, isDisabled, onSubmit, updateValue]);

  const canSend = currentValue.trim().length > 0 && !isDisabled;

  const handleBodyClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    // Focus the input when clicking empty space in the body, but leave
    // interactive elements alone.
    const target = event.target as HTMLElement;
    if (target.closest('button, a, [role="button"], textarea, input')) {
      return;
    }
    bodyRef.current
      ?.querySelector<HTMLElement>('textarea, [contenteditable="true"]')
      ?.focus();
  }, []);

  const composerContext = useMemo(
    () => ({
      canSend,
      isDisabled,
      isStopShown,
      onChange: updateValue,
      onStop,
      onSubmit: handleSubmit,
      placeholder,
      value: currentValue,
    }),
    [
      canSend,
      currentValue,
      handleSubmit,
      isDisabled,
      isStopShown,
      onStop,
      placeholder,
      updateValue,
    ],
  );

  const classes = chatComposerRecipe({
    density,
    isDisabled,
    statusPosition,
    statusType: status?.type,
  });

  const statusElement =
    status != null ? (
      <div
        className={classes.statusBar}
        role={status.type === 'error' ? 'alert' : 'status'}>
        <Icon
          icon={status.type === 'error' ? CircleAlert : TriangleAlert}
          size="md"
        />
        {status.message}
      </div>
    ) : null;

  return (
    <ChatComposerContext value={composerContext}>
      <div
        {...rest}
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {statusPosition === 'top' ? statusElement : null}
        {/* The body is a click-to-focus convenience, not an interactive
            control; keyboard users focus the textarea directly. */}
        {/* eslint-disable-next-line jsx-a11y-x/no-static-element-interactions, jsx-a11y-x/click-events-have-key-events */}
        <div className={classes.body} onClick={handleBodyClick} ref={bodyRef}>
          {isNonEmptyReactNode(headerActions) ||
          isNonEmptyReactNode(headerContext) ? (
            <div className={classes.header}>
              <div className={classes.headerStart}>{headerActions}</div>
              <div className={classes.headerEnd}>{headerContext}</div>
            </div>
          ) : null}
          <div className={classes.inputArea}>
            {input ?? <ChatComposerInput />}
          </div>
          <div className={classes.footer}>
            <div className={classes.footerStart}>{footerActions}</div>
            <div className={classes.footerEnd}>
              {sendActions}
              {sendButton ?? <ChatSendButton />}
            </div>
          </div>
        </div>
        {statusPosition === 'bottom' ? statusElement : null}
      </div>
    </ChatComposerContext>
  );
}

ChatComposer.displayName = 'ChatComposer';
