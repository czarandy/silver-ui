/**
 * The element kinds that can hold focus. Kept in one place so every consumer
 * of a focusable-element query agrees on what "focusable" means; derive
 * stricter selectors from these parts rather than hand-writing a new list.
 */
const FOCUSABLE_PARTS = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[tabindex]',
] as const;

/**
 * Matches every potentially focusable element, including disabled ones and
 * those removed from the tab order with `tabindex="-1"`. Callers filter for
 * their own semantics — a roving-tabindex container must keep matching the
 * items it itself sets to `tabindex="-1"`.
 */
export const FOCUSABLE_SELECTOR = FOCUSABLE_PARTS.join(', ');

/**
 * Matches elements in the tab order: focusable, not disabled, and not opted
 * out with `tabindex="-1"`.
 */
export const TABBABLE_SELECTOR = FOCUSABLE_PARTS.map(
  part => `${part}:not([disabled]):not([tabindex="-1"])`,
).join(', ');
