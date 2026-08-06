'use client';

import type {
  ChangeEvent,
  ClipboardEventHandler,
  CSSProperties,
  FocusEventHandler,
  KeyboardEvent,
  KeyboardEventHandler,
  Ref,
  TextareaHTMLAttributes,
} from 'react';
import {useRef, useState} from 'react';
import {chatComposerInputRecipe} from 'components/Chat/ChatComposerInput.recipe';
import {
  computeInputHeight,
  DEFAULT_LINE_HEIGHT,
} from 'components/Chat/ChatComposerInput.utils';
import {useChatComposerContext} from 'components/Chat/ChatContext';
import type {ChatPassthroughProps} from 'components/Chat/ChatPassthroughProps';
import {isComposingEvent} from 'internal/isComposingEvent';
import {mergeRefs} from 'internal/mergeRefs';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';
import {cx} from 'utils/cx';

const rootClass = chatComposerInputRecipe();

export interface ChatComposerInputProps extends ChatPassthroughProps {
  /**
   * HTML `autocomplete` attribute for the textarea.
   */
  autoComplete?: string;
  /**
   * Additional CSS class names applied to the textarea.
   */
  className?: string;
  /**
   * Test ID applied to the textarea.
   */
  'data-testid'?: string;
  /**
   * Action label shown on the virtual keyboard's enter key.
   */
  enterKeyHint?: TextareaHTMLAttributes<HTMLTextAreaElement>['enterKeyHint'];
  /**
   * Whether the input is disabled. Defaults to the surrounding ChatComposer
   * state.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Maximum number of characters the user can type.
   */
  maxLength?: number;
  /**
   * Maximum number of lines the input grows to before scrolling.
   * @default 8
   */
  maxRows?: number;
  /**
   * Minimum number of lines the input occupies.
   * @default 1
   */
  minRows?: number;
  /**
   * HTML `name` attribute for form submission.
   */
  name?: string;
  /**
   * Blur event handler for the textarea.
   */
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  /**
   * Called when the value changes. Defaults to the surrounding ChatComposer
   * state.
   */
  onChange?: (value: string) => void;
  /**
   * Focus event handler for the textarea.
   */
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;
  /**
   * Keyboard event handler for the textarea, called before the built-in
   * Enter-to-submit handling. Call `preventDefault()` to suppress it.
   */
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  /**
   * Paste event handler for the textarea — use to intercept pasted files or
   * rich content.
   */
  onPaste?: ClipboardEventHandler<HTMLTextAreaElement>;
  /**
   * Called with the trimmed value when the user presses Enter. Defaults to
   * submitting the surrounding ChatComposer.
   */
  onSubmit?: () => void;
  /**
   * Placeholder text. Defaults to the surrounding ChatComposer placeholder.
   * @default 'Type a message…'
   */
  placeholder?: string;
  /**
   * Ref forwarded to the textarea element.
   */
  ref?: Ref<HTMLTextAreaElement>;
  /**
   * Inline styles applied to the textarea.
   */
  style?: CSSProperties;
  /**
   * Controlled value. Defaults to the surrounding ChatComposer value.
   */
  value?: string;
}

/**
 * Auto-growing textarea for the chat composer. Enter submits, Shift+Enter
 * inserts a newline, and the input grows with its content up to `maxRows`
 * lines. Reads value, submit, and placeholder wiring from the surrounding
 * ChatComposer, so it works with no props inside one.
 */
export function ChatComposerInput({
  className,
  'data-testid': dataTestId,
  isDisabled,
  maxRows = 8,
  minRows = 1,
  onChange,
  onKeyDown,
  onSubmit,
  placeholder,
  ref,
  style,
  value,
  ...passthrough
}: ChatComposerInputProps): React.JSX.Element {
  const composer = useChatComposerContext();
  const [internalValue, setInternalValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentValue = value ?? composer?.value ?? internalValue;
  const currentPlaceholder =
    placeholder ?? composer?.placeholder ?? 'Type a message…';
  const currentDisabled = isDisabled ?? composer?.isDisabled ?? false;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    setInternalValue(next);
    (onChange ?? composer?.onChange)?.(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey && !isComposingEvent(event)) {
      event.preventDefault();
      (onSubmit ?? composer?.onSubmit)?.();
    }
  };

  useIsomorphicLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea == null) {
      return;
    }
    const computedLineHeight = Number.parseFloat(
      getComputedStyle(textarea).lineHeight,
    );
    const lineHeight = Number.isFinite(computedLineHeight)
      ? computedLineHeight
      : DEFAULT_LINE_HEIGHT;
    textarea.style.height = 'auto';
    const height = computeInputHeight(
      textarea.scrollHeight,
      lineHeight,
      minRows,
      maxRows,
    );
    textarea.style.height = `${height}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxRows * lineHeight ? 'auto' : 'hidden';
  }, [currentValue, maxRows, minRows]);

  return (
    <textarea
      {...passthrough}
      className={cx(rootClass, className)}
      data-testid={dataTestId}
      disabled={currentDisabled}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={currentPlaceholder}
      ref={mergeRefs(textareaRef, ref)}
      rows={minRows}
      style={style}
      value={currentValue}
    />
  );
}

ChatComposerInput.displayName = 'ChatComposerInput';
