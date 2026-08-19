// Native and ARIA interactive elements that own their own pointer activation.
// This is shared by composite surfaces so nested controls do not also trigger
// their containing row or card action.
export const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'label',
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

function findInteractiveAncestor(
  target: EventTarget | null,
): HTMLElement | null {
  const element =
    target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null;

  return element?.closest<HTMLElement>(INTERACTIVE_SELECTOR) ?? null;
}

/**
 * Returns whether an event target belongs to an independent interactive
 * element. An optional boundary prevents matching an ancestor outside the
 * surface currently routing the event.
 */
export function isInteractiveTarget(
  target: EventTarget | null,
  boundary?: HTMLElement,
): boolean {
  const interactive = findInteractiveAncestor(target);

  return (
    interactive != null && (boundary == null || boundary.contains(interactive))
  );
}

/**
 * Returns whether an event target belongs to an interactive element nested
 * inside `control` rather than to `control` itself. Surfaces that render their
 * own control use this so consumer-provided controls keep owning their clicks,
 * including ones that portal their surface out of the DOM but still bubble
 * React events back through the tree.
 */
export function isNestedInteractiveTarget(
  target: EventTarget | null,
  control: HTMLElement | null,
): boolean {
  if (control == null) {
    return false;
  }

  const interactive = findInteractiveAncestor(target);

  return interactive != null && interactive !== control;
}
