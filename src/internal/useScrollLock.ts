import {useEffect} from 'react';

// Module-level reference count so overlapping locks cooperate: e.g. a Lightbox
// opened from within a Dialog. The body is unlocked only once every active lock
// has been released. Without this shared count, an out-of-order unmount would
// either unlock the body too early or leave it permanently locked, since each
// component would save and restore `overflow` independently.
let lockCount = 0;
let previousOverflow = '';
let previousPaddingRight = '';

/**
 * Locks body scroll while `isLocked` is true. Safe to call from multiple
 * components whose locks overlap; the body is restored only when the last one
 * releases. Compensates for the removed scrollbar width to avoid a layout
 * shift when the lock engages.
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    if (lockCount === 0) {
      const {body, documentElement} = document;
      previousOverflow = body.style.overflow;
      previousPaddingRight = body.style.paddingRight;

      // Reserve space for the scrollbar that `overflow: hidden` removes. Guard
      // against environments without layout (e.g. jsdom reports clientWidth 0),
      // where the difference is meaningless.
      const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
      if (documentElement.clientWidth > 0 && scrollbarWidth > 0) {
        const basePadding =
          parseFloat(window.getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${basePadding + scrollbarWidth}px`;
      }
      body.style.overflow = 'hidden';
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
      }
    };
  }, [isLocked]);
}
