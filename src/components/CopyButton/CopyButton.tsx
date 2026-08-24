'use client';

import {Check, Copy} from 'lucide-react';
import {
  Button,
  type ButtonPassthroughProps,
  type ButtonProps,
} from 'components/Button';
import useClipboard from 'hooks/useClipboard';

export interface CopyButtonProps
  extends
    ButtonPassthroughProps,
    Pick<
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
  ...passthrough
}: CopyButtonProps): React.JSX.Element {
  const {announcer, copy, isCopied} = useClipboard({
    copiedMessage: copiedLabel,
    errorMessage,
    onCopy,
    onCopyError,
    resetTimeout,
  });

  const currentLabel = isCopied ? copiedLabel : copyLabel;

  return (
    <>
      <Button
        {...passthrough}
        className={className}
        data-testid={dataTestId}
        icon={isCopied ? Check : Copy}
        isDisabled={isDisabled}
        isIconOnly
        label={currentLabel}
        onClick={() => {
          void copy(value);
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
