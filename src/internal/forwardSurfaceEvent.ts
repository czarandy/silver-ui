'use client';

import type {MouseEvent as ReactMouseEvent} from 'react';
import {isInteractiveTarget} from 'internal/interactiveTarget';

export type SurfaceMouseEventType = 'auxclick' | 'click';

/**
 * A pointer event received by a clickable surface, either through a React
 * handler or a native listener attached to the surface element.
 */
export type SurfaceMouseEvent = MouseEvent | ReactMouseEvent<HTMLElement>;

// Layered surfaces (popovers, dialogs, menus) rendered inside a clickable
// surface are independent of it, so clicks on their non-interactive content
// must not activate the surface underneath.
const LAYER_SELECTOR = [
  'dialog',
  '[popover]',
  '[role="dialog"]',
  '[role="alertdialog"]',
  '[role="menu"]',
  '[role="listbox"]',
].join(', ');

function hasSelectionWithin(container: HTMLElement): boolean {
  const selection = window.getSelection();
  if (
    selection == null ||
    selection.isCollapsed ||
    selection.toString() === ''
  ) {
    return false;
  }

  return (
    (selection.anchorNode != null &&
      container.contains(selection.anchorNode)) ||
    (selection.focusNode != null && container.contains(selection.focusNode))
  );
}

function isWithinLayer(target: Node, root: HTMLElement): boolean {
  const element = target instanceof Element ? target : target.parentElement;
  const layer = element?.closest(LAYER_SELECTOR);
  return layer != null && layer !== root && root.contains(layer);
}

/**
 * Returns whether a pointer event on `root` belongs to something independent of
 * the surface: a nested interactive control, a layered surface such as a
 * popover or dialog, content portalled out of the surface's DOM, an active text
 * selection, or a handler that already cancelled it.
 */
export function isIndependentSurfaceEvent(
  event: SurfaceMouseEvent,
  root: HTMLElement,
): boolean {
  const targetNode = event.target instanceof Node ? event.target : null;

  return (
    event.defaultPrevented ||
    // React events from portals bubble through the component tree even though
    // their DOM target is outside the surface.
    (targetNode != null && !root.contains(targetNode)) ||
    (targetNode != null && isWithinLayer(targetNode, root)) ||
    isInteractiveTarget(event.target, root) ||
    hasSelectionWithin(root)
  );
}

function cloneMouseEvent(
  event: SurfaceMouseEvent,
  type: SurfaceMouseEventType,
): MouseEvent {
  return new MouseEvent(type, {
    altKey: event.altKey,
    bubbles: true,
    button: event.button,
    buttons: event.buttons,
    cancelable: true,
    clientX: event.clientX,
    clientY: event.clientY,
    composed: true,
    ctrlKey: event.ctrlKey,
    detail: event.detail,
    metaKey: event.metaKey,
    relatedTarget: event.relatedTarget,
    screenX: event.screenX,
    screenY: event.screenY,
    shiftKey: event.shiftKey,
  });
}

function getNewTabHref(control: HTMLElement, event: MouseEvent): string | null {
  const isNewTabClick =
    event.type === 'auxclick' || event.ctrlKey || event.metaKey;
  return isNewTabClick && control instanceof HTMLAnchorElement && control.href
    ? control.href
    : null;
}

// Browsers do not reliably open a tab for a synthetic ctrl/meta-click, and a
// synthetic middle-click has no default action at all. So for those clicks on
// a link, replace the browser's default with opening the tab here, unless a
// handler such as a router link took over the click by cancelling it.
function dispatchToControl(control: HTMLElement, event: MouseEvent): void {
  const view = control.ownerDocument.defaultView;
  const newTabHref = getNewTabHref(control, event);
  if (view == null || newTabHref == null) {
    control.dispatchEvent(event);
    return;
  }

  const openInNewTab = (dispatched: Event): void => {
    if (dispatched === event && !dispatched.defaultPrevented) {
      dispatched.preventDefault();
      view.open(newTabHref, '_blank', 'noopener');
    }
  };
  view.addEventListener(event.type, openInNewTab);
  try {
    control.dispatchEvent(event);
  } finally {
    view.removeEventListener(event.type, openInNewTab);
  }
}

export interface ForwardSurfaceEventOptions {
  /**
   * Whether middle-button auxclick should be forwarded to the control.
   */
  allowAuxClick?: boolean;
  /**
   * The real semantic control that owns activation.
   */
  control: HTMLElement | null;
  /**
   * The pointer event received by the visible surface.
   */
  event: SurfaceMouseEvent;
  /**
   * Whether surface activation should be suppressed.
   */
  isDisabled?: boolean;
  /**
   * Whether to stop the surface event from propagating once it is forwarded.
   * Surfaces that listen natively pass `false` so React handlers inside them
   * still run.
   * @default true
   */
  shouldStopPropagation?: boolean;
  /**
   * The mouse event type to redispatch.
   */
  type?: SurfaceMouseEventType;
}

/**
 * Routes pointer activation from a composite surface to its real semantic
 * control while leaving nested controls, layered surfaces, and text selection
 * independent. Modified and middle clicks forwarded to a link open it in a new
 * tab.
 */
export function forwardSurfaceEvent({
  allowAuxClick = false,
  control,
  event,
  isDisabled = false,
  shouldStopPropagation = true,
  type = 'click',
}: ForwardSurfaceEventOptions): void {
  const root = event.currentTarget;
  const targetNode = event.target instanceof Node ? event.target : null;

  if (
    !(root instanceof HTMLElement) ||
    control == null ||
    (targetNode != null && control.contains(targetNode))
  ) {
    return;
  }

  if (isIndependentSurfaceEvent(event, root)) {
    return;
  }

  if (type === 'auxclick' && (!allowAuxClick || event.button !== 1)) {
    return;
  }

  if (shouldStopPropagation) {
    event.stopPropagation();
  }
  if (isDisabled) {
    event.preventDefault();
    return;
  }

  dispatchToControl(control, cloneMouseEvent(event, type));
}
