'use client';

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import useAnnounce from 'hooks/useAnnounce';

export type ClipboardValue = string | (() => string);

export interface UseClipboardOptions {
  /**
   * Message announced politely after copying succeeds.
   * @default 'Copied'
   */
  copiedMessage?: string;
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
}

export interface UseClipboardResult {
  /**
   * The live regions to render for success and failure announcements.
   */
  announcer: ReactNode;
  /**
   * Resolves and copies a value. Returns whether the copy succeeded.
   */
  copy: (value: ClipboardValue) => Promise<boolean>;
  /**
   * Whether the most recent copy succeeded and its reset timeout is pending.
   */
  isCopied: boolean;
}

/**
 * Copies text to the clipboard, tracks transient copied state, and announces
 * the result to assistive technology.
 *
 * Render the returned `announcer` for announcements to have any effect.
 */
const useClipboard = ({
  copiedMessage = 'Copied',
  errorMessage = 'Copy failed',
  onCopy,
  onCopyError,
  resetTimeout = 2000,
}: UseClipboardOptions = {}): UseClipboardResult => {
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

  const copy = useCallback(
    async (value: ClipboardValue) => {
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
        return false;
      }

      clearResetTimeout();
      setIsCopied(true);
      announce(copiedMessage);
      resetTimeoutRef.current = window.setTimeout(() => {
        setIsCopied(false);
        resetTimeoutRef.current = null;
      }, resetTimeout);
      onCopy?.();
      return true;
    },
    [
      announce,
      clearResetTimeout,
      copiedMessage,
      errorMessage,
      onCopy,
      onCopyError,
      resetTimeout,
    ],
  );

  return {announcer, copy, isCopied};
};

export default useClipboard;
