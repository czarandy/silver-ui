'use client';

import type {RefObject} from 'react';
import {registerModalHost, unregisterModalHost} from 'internal/modalHostStack';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';

/**
 * Keeps a modal `<dialog>` registered in the modal host stack for exactly as
 * long as it is open. Call it once in every component that uses
 * `showModal()`.
 *
 * It watches the `open` attribute rather than the component's `isOpen` prop,
 * so it follows the native dialog however it opens or closes: after the exit
 * animation, on a platform close the component answers by reopening, or on an
 * effect re-run under StrictMode. Mutation records arrive as a microtask, so
 * the stack updates before the next paint. The cleanup runs in the commit,
 * before paint, so a dialog unmounted while open hands back its hosted content
 * in the same frame.
 *
 * Stack order is the order mutation records arrive, which matches the order
 * `showModal()` ran except when two dialogs open in the same task: records are
 * then delivered per observer, in the order the observers were created.
 */
export function useModalHost(
  dialogRef: RefObject<HTMLDialogElement | null>,
): void {
  useIsomorphicLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }
    const sync = (): void => {
      if (dialog.open) {
        registerModalHost(dialog);
      } else {
        unregisterModalHost(dialog);
      }
    };
    const observer = new MutationObserver(sync);
    observer.observe(dialog, {attributeFilter: ['open']});
    sync();
    return () => {
      observer.disconnect();
      unregisterModalHost(dialog);
    };
  }, [dialogRef]);
}
