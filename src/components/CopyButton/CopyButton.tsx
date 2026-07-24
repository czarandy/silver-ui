'use client';

import {Check, Copy} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Button, type ButtonProps} from 'components/Button';
import useAnnounce from 'hooks/useAnnounce';

export interface CopyButtonProps extends Pick<
  ButtonProps,
  | 'className'
  | 'data-testid'
  | 'isDisabled'
  | 'ref'
  | 'size'
  | 'style'
  | 'variant'
> {
  /**
   * Label and tooltip shown after a successful copy.
   * @default 'Copied'
   */
  copiedLabel?: string;
  /**
   * Label and tooltip shown when the button is ready to copy.
   * @default 'Copy'
   */
  copyLabel?: string;
  /**
   * Message announced assertively when copying fails.
   * @default 'Copy failed'
   */
  errorMessage?: string;
  /**
   * Called after the value is successfully copied.
   */
  onCopy?: () => void;
  /**
   * Called when resolving the value or writing to the clipboard fails.
   */
  onCopyError?: (error: unknown) => void;
  /**
   * Time in milliseconds before the copied state resets.
   * @default 2000
   */
  resetTimeout?: number;
  /**
   * Text to copy, or a synchronous getter evaluated on each activation.
   */
  value: string | (() => string);
}

/**
 * Icon button that copies a value to the clipboard and announces the result.
 */
export function CopyButton({
  className,
  copiedLabel = 'Copied',
  copyLabel = 'Copy',
  'data-testid': dataTestId,
  errorMessage = 'Copy failed',
  isDisabled,
  onCopy,
  onCopyError,
  ref,
  resetTimeout = 2000,
  size,
  style,
  value,
  variant = 'ghost',
}: CopyButtonProps): React.JSX.Element {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);
  const {announce, announcer} = useAnnounce();

  const clearResetTimeout = useCallback(() => {
    if (resetTimeoutRef.current != null) {
      window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearResetTimeout, [clearResetTimeout]);

  const handleCopy = useCallback(async () => {
    try {
      const resolvedValue = typeof value === 'function' ? value() : value;
      const clipboard = (navigator as {clipboard?: Clipboard}).clipboard;
      if (clipboard?.writeText == null) {
        throw new Error('Clipboard API is unavailable.');
      }
      await clipboard.writeText(resolvedValue);
    } catch (error) {
      clearResetTimeout();
      setIsCopied(false);
      announce(errorMessage, 'assertive');
      onCopyError?.(error);
      return;
    }

    clearResetTimeout();
    setIsCopied(true);
    announce(copiedLabel);
    resetTimeoutRef.current = window.setTimeout(() => {
      setIsCopied(false);
      resetTimeoutRef.current = null;
    }, resetTimeout);
    onCopy?.();
  }, [
    announce,
    clearResetTimeout,
    copiedLabel,
    errorMessage,
    onCopy,
    onCopyError,
    resetTimeout,
    value,
  ]);

  const currentLabel = isCopied ? copiedLabel : copyLabel;

  return (
    <>
      <Button
        className={className}
        data-testid={dataTestId}
        icon={isCopied ? Check : Copy}
        isDisabled={isDisabled}
        isIconOnly
        label={currentLabel}
        onClick={() => {
          void handleCopy();
        }}
        ref={ref}
        size={size}
        style={style}
        variant={variant}
      />
      {announcer}
    </>
  );
}

CopyButton.displayName = 'CopyButton';
