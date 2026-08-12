// Native and ARIA interactive elements that own their own pointer activation.
// This is shared by composite surfaces so nested controls do not also trigger
// their containing row or card action.
export const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="tab"]',
  '[role="radio"]',
  '[role="option"]',
  '[role="combobox"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="textbox"]',
  '[role="treeitem"]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex^="-"])',
].join(', ');

/**
 * Returns whether an event target belongs to an independent interactive
 * element. An optional boundary prevents matching an ancestor outside the
 * surface currently routing the event.
 */
export function isInteractiveTarget(
  target: EventTarget | null,
  boundary?: HTMLElement,
): boolean {
  const element =
    target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null;
  const interactive = element?.closest<HTMLElement>(INTERACTIVE_SELECTOR);

  return (
    interactive != null && (boundary == null || boundary.contains(interactive))
  );
}
