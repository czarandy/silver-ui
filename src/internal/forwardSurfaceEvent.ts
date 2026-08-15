'use client';

import type {MouseEvent as ReactMouseEvent} from 'react';
import {isInteractiveTarget} from 'internal/interactiveTarget';

export type SurfaceMouseEventType = 'auxclick' | 'click';

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

function cloneMouseEvent(
  event: ReactMouseEvent<HTMLElement>,
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
  event: ReactMouseEvent<HTMLElement>;
  /**
   * Whether surface activation should be suppressed.
   */
  isDisabled?: boolean;
  /**
   * The mouse event type to redispatch.
   */
  type?: SurfaceMouseEventType;
}

/**
 * Routes pointer activation from a composite surface to its real semantic
 * control while leaving nested controls and text selection independent.
 */
export function forwardSurfaceEvent({
  allowAuxClick = false,
  control,
  event,
  isDisabled = false,
  type = 'click',
}: ForwardSurfaceEventOptions): void {
  const root = event.currentTarget;
  const targetNode = event.target instanceof Node ? event.target : null;

  if (control == null || (targetNode != null && control.contains(targetNode))) {
    return;
  }

  if (
    event.defaultPrevented ||
    isInteractiveTarget(event.target, root) ||
    hasSelectionWithin(root)
  ) {
    return;
  }

  if (type === 'auxclick' && (!allowAuxClick || event.button !== 1)) {
    return;
  }

  event.stopPropagation();
  if (isDisabled) {
    event.preventDefault();
    return;
  }

  control.dispatchEvent(cloneMouseEvent(event, type));
}
