import type {KeyboardEvent} from 'react';
import {isComposingEvent} from 'internal/isComposingEvent';

/**
 * The combobox keyboard vocabulary shared by every listbox in the library.
 *
 * - `open` -- the listbox is closed and an arrow key should reveal it, seeded
 *   from the given edge.
 * - `move` -- step the highlight one option in `step`'s direction.
 * - `jump` -- send the highlight straight to an edge of the list.
 * - `commit` -- accept whatever is highlighted.
 */
export type ListboxKeyAction =
  | {edge: 'first' | 'last'; type: 'jump'}
  | {edge: 'first' | 'last'; type: 'open'}
  | {step: -1 | 1; type: 'move'}
  | {type: 'commit'};

/**
 * Whether the key event landed on something with a text caret, which claims
 * Home/End for caret movement. Comboboxes with an in-popover search field bind
 * the same handler to both the field and the trigger, so the target decides.
 */
function hasTextCaret(event: KeyboardEvent<HTMLElement>): boolean {
  const target = event.target;
  return (
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLInputElement &&
      // `selectionStart` is null on input types without a caret (checkbox,
      // color, range) and a number on the text-entry ones.
      target.selectionStart != null)
  );
}

/**
 * Maps a key event onto the listbox action it should perform, or null when the
 * listbox has no interest in the key. Callers own `preventDefault()` so they
 * can decline an action they cannot fulfil -- Enter with nothing highlighted,
 * for instance, must stay with the form.
 *
 * Home/End only reach the listbox when the caret is not in a text field;
 * PageUp/PageDown are the jumps that always belong to the listbox.
 */
export function resolveListboxKeyAction(
  event: KeyboardEvent<HTMLElement>,
  {isOpen}: {isOpen: boolean},
): ListboxKeyAction | null {
  if (isComposingEvent(event)) {
    return null;
  }

  switch (event.key) {
    case 'ArrowDown':
      return isOpen ? {step: 1, type: 'move'} : {edge: 'first', type: 'open'};
    case 'ArrowUp':
      return isOpen ? {step: -1, type: 'move'} : {edge: 'last', type: 'open'};
    case 'Home':
      return isOpen && !hasTextCaret(event)
        ? {edge: 'first', type: 'jump'}
        : null;
    case 'End':
      return isOpen && !hasTextCaret(event)
        ? {edge: 'last', type: 'jump'}
        : null;
    case 'PageUp':
      return isOpen ? {edge: 'first', type: 'jump'} : null;
    case 'PageDown':
      return isOpen ? {edge: 'last', type: 'jump'} : null;
    case 'Enter':
      return isOpen ? {type: 'commit'} : null;
    default:
      return null;
  }
}
