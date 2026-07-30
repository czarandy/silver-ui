'use client';

import {useEffect, useRef, useState, type RefObject} from 'react';
import {getExitDurationMs} from 'internal/motion';
import useLatest from 'internal/useLatest';

interface UseDialogExitOptions {
  dialogRef: RefObject<HTMLDialogElement | null>;
  /**
   * Length of the CSS exit transition, e.g. DURATION_FAST_MS.
   */
  exitDurationMs: number;
  isOpen: boolean;
  /**
   * Runs after showModal(), where moving focus inside the dialog works.
   */
  onAfterEnter?: () => void;
  /**
   * Runs after close() fires, so focus() on an outside element works — while
   * a modal dialog is open the rest of the document is inert and focus()
   * silently fails.
   */
  onAfterExit?: () => void;
  /**
   * Runs before showModal(), while document.activeElement is still the
   * trigger.
   */
  onBeforeEnter?: () => void;
}

/**
 * Owns the native <dialog> open/close lifecycle with an animated exit: on
 * close intent the dialog enters a "closing" state and close() is deferred
 * until the exit transition has played. Entry animation needs no JS — the
 * recipes handle it with @starting-style.
 */
export function useDialogExit({
  dialogRef,
  exitDurationMs,
  isOpen,
  onAfterEnter,
  onAfterExit,
  onBeforeEnter,
}: UseDialogExitOptions): {isClosing: boolean} {
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const onAfterEnterRef = useLatest(onAfterEnter);
  const onAfterExitRef = useLatest(onAfterExit);
  const onBeforeEnterRef = useLatest(onBeforeEnter);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }

    if (isOpen) {
      // A re-open during the exit animation cancels the deferred close; the
      // dialog never lost [open], so showModal() is skipped and the panel
      // transitions back from wherever the exit got to.
      if (closeTimeoutRef.current != null) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- closing state mirrors the native dialog lifecycle, which only this effect drives
      setIsClosing(false);
      onBeforeEnterRef.current?.();
      if (!dialog.open) {
        dialog.showModal();
      }
      onAfterEnterRef.current?.();
    } else if (dialog.open && closeTimeoutRef.current == null) {
      setIsClosing(true);
      closeTimeoutRef.current = window.setTimeout(() => {
        closeTimeoutRef.current = null;
        // Clearing the closing state and closing the dialog in the same task
        // means React flushes both before the next paint — there is never a
        // painted frame where the recipe authors `display` on a dialog the UA
        // has already hidden (see useKeyboardHint.recipe.ts).
        setIsClosing(false);
        if (dialog.open) {
          dialog.close();
        }
        onAfterExitRef.current?.();
      }, getExitDurationMs(exitDurationMs));
    }
  }, [
    dialogRef,
    exitDurationMs,
    isOpen,
    onAfterEnterRef,
    onAfterExitRef,
    onBeforeEnterRef,
  ]);

  // Unmount-only cleanup: without it, unmounting mid-exit would leak the
  // timer and skip both close() and the focus restore in onAfterExit.
  useEffect(() => {
    const dialog = dialogRef.current;
    const onAfterExitLatest = onAfterExitRef;
    return () => {
      if (closeTimeoutRef.current != null) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
        if (dialog?.open) {
          dialog.close();
        }
        onAfterExitLatest.current?.();
      } else if (dialog?.open) {
        dialog.close();
      }
    };
  }, [dialogRef, onAfterExitRef]);

  return {isClosing};
}
