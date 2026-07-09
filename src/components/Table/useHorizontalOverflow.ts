'use client';

import {useCallback, useRef, useState, type RefCallback} from 'react';
import {observeResize, unobserveResize} from 'internal/sharedResizeObserver';

export interface UseHorizontalOverflowReturn {
  /**
   * Whether the observed element's content is wider than its visible box.
   */
  isOverflowing: boolean;
  /**
   * Ref attached to the scroll container.
   */
  ref: RefCallback<HTMLElement>;
}

// Sub-pixel layout can leave `scrollWidth` a fraction wider than `clientWidth`
// on an element that cannot actually scroll, so require a full pixel before
// calling it overflow.
const OVERFLOW_TOLERANCE = 1;

/**
 * Tracks whether a scroll container overflows horizontally, re-measuring when
 * either the container or its content changes size. Callers use this to add
 * keyboard affordances (`tabIndex`, `role="region"`) only when the region can
 * actually be scrolled, so a table that fits never becomes a dead tab stop.
 */
export function useHorizontalOverflow(): UseHorizontalOverflowReturn {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const measure = useCallback((): void => {
    const element = elementRef.current;
    if (element == null) {
      return;
    }

    setIsOverflowing(
      element.scrollWidth - element.clientWidth > OVERFLOW_TOLERANCE,
    );
  }, []);

  const ref = useCallback<RefCallback<HTMLElement>>(
    element => {
      elementRef.current = element;
      measure();

      if (element == null || typeof ResizeObserver === 'undefined') {
        return;
      }

      // The container's own width and its content's width both decide whether
      // the region scrolls, and either can change without the other.
      const content = element.firstElementChild;
      observeResize(element, measure);
      if (content != null) {
        observeResize(content, measure);
      }

      return () => {
        elementRef.current = null;
        unobserveResize(element);
        if (content != null) {
          unobserveResize(content);
        }
      };
    },
    [measure],
  );

  return {isOverflowing, ref};
}
