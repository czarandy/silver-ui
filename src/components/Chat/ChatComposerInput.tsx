'use client';

import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  CSSProperties,
  KeyboardEvent,
  Ref,
} from 'react';
import {useRef, useState} from 'react';
import {chatComposerInputRecipe} from 'components/Chat/ChatComposerInput.recipe';
import {
  computeInputHeight,
  DEFAULT_LINE_HEIGHT,
} from 'components/Chat/ChatComposerInput.utils';
import {useChatComposerContext} from 'components/Chat/ChatContext';
import {isComposingEvent} from 'internal/isComposingEvent';
import {mergeRefs} from 'internal/mergeRefs';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';
import {cx} from 'utils/cx';

const rootClass = chatComposerInputRecipe();

export interface ChatComposerInputProps extends Omit<
  ComponentPropsWithoutRef<'textarea'>,
  'onChange' | 'value'
> {
  /**
   * Additional CSS class names applied to the textarea.
   */
  className?: string;
  /**
   * Test ID applied to the textarea.
   */
  'data-testid'?: string;
  /**
   * Whether the input is disabled. Defaults to the surrounding ChatComposer
   * state.
   * @default false
   */
  isDisabled?: boolean;
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
   * Called when the value changes. Defaults to the surrounding ChatComposer
   * state.
   */
  onChange?: (value: string) => void;
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
  ...rest
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
      {...rest}
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
