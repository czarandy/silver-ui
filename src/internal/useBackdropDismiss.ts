'use client';

import {useRef, type MouseEvent, type PointerEvent} from 'react';

/**
 * Whether a pointer coordinate falls outside an element's border box. Native
 * `<dialog>` renders its backdrop outside this box, so a click whose
 * coordinates land outside the dialog rect is a backdrop click — regardless of
 * any padding, border, or margin on the dialog element.
 */
function isPointerOutsideElement(
  element: HTMLElement,
  clientX: number,
  clientY: number,
): boolean {
  const rect = element.getBoundingClientRect();
  return (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  );
}

/**
 * Native dialog backdrop events target the dialog itself. Events from a child
 * top-layer element, such as a popover extending beyond the dialog's border
 * box, can have the same outside coordinates but retain the child as their
 * target while bubbling through the dialog.
 */
function isBackdropPointerEvent<T extends HTMLElement>(
  event: MouseEvent<T> | PointerEvent<T>,
): boolean {
  return (
    event.target === event.currentTarget &&
    isPointerOutsideElement(event.currentTarget, event.clientX, event.clientY)
  );
}

export interface BackdropDismissHandlers<T extends HTMLElement> {
  onClick: (event: MouseEvent<T>) => void;
  onPointerDown: (event: PointerEvent<T>) => void;
}

/**
 * Pointer handlers that dismiss a native `<dialog>` when the backdrop is
 * clicked. Dismissal requires that both the press and the release land on the
 * backdrop, so clicks on dialog padding (inside the rect) and inside-out drags
 * (e.g. text selection that overshoots onto the backdrop) are ignored.
 */
export function useBackdropDismiss<T extends HTMLElement>({
  isEnabled,
  onDismiss,
}: {
  isEnabled: boolean;
  onDismiss: () => void;
}): BackdropDismissHandlers<T> {
  const pointerDownOnBackdropRef = useRef(false);

  return {
    onClick: event => {
      const startedOnBackdrop = pointerDownOnBackdropRef.current;
      pointerDownOnBackdropRef.current = false;
      // Keyboard-synthesized clicks (Enter/Space on a child control) report
      // detail 0 and 0,0 coordinates; ignore them so they are not mistaken
      // for a backdrop click.
      if (event.detail === 0) {
        return;
      }
      const releasedOnBackdrop = isBackdropPointerEvent(event);
      if (startedOnBackdrop && releasedOnBackdrop && isEnabled) {
        onDismiss();
      }
    },
    onPointerDown: event => {
      pointerDownOnBackdropRef.current = isBackdropPointerEvent(event);
    },
  };
}
