import type {FocusEvent, KeyboardEvent, MouseEvent, PointerEvent} from 'react';

type ReadOnlyEvent =
  | KeyboardEvent<HTMLElement>
  | MouseEvent<HTMLElement>
  | PointerEvent<HTMLElement>;

/**
 * Prevents activation inside a read-only form control.
 */
export function preventReadOnlyInteraction(event: ReadOnlyEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * Removes focus from a read-only control if it is focused indirectly.
 */
export function blurReadOnlyInteraction(event: FocusEvent<HTMLElement>): void {
  event.preventDefault();
  event.stopPropagation();
  event.target.blur();
}
