'use client';

/**
 * Scrolls the option element with the given id into view within its nearest
 * scrollable ancestor. Used by keyboard-navigable listboxes so the highlighted
 * option stays visible when arrowing through an overflowing option list.
 *
 * The lookup is id-based so callers do not have to thread refs to every option
 * element; each listbox already renders a stable id per option.
 */
export function scrollOptionIntoView(optionId: string | undefined): void {
  if (optionId == null || typeof document === 'undefined') {
    return;
  }

  const optionElement = document.getElementById(optionId);
  optionElement?.scrollIntoView({block: 'nearest'});
}
