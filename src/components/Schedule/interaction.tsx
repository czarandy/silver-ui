'use client';

import {createContext, use} from 'react';

const schedulePopoverDismissPointerEvents = new WeakSet<Event>();

/**
 * A rendered event pill whose popover `ScheduleHandle.openEventPopover` can
 * open.
 */
export interface ScheduleEventPopoverOpener {
  element: HTMLElement;
  open: () => void;
}

export interface ScheduleInteractionState {
  dispose: () => void;
  markPointerDown: (event: Event) => void;
  markPopoverHidden: (token: symbol) => void;
  markPopoverShown: (token: symbol) => void;
  /**
   * Opens the popover of the event's first rendered pill on the next frame.
   * Returns `false` when no pill for the event has popover content.
   */
  openEventPopover(eventID: string): boolean;
  /**
   * Registers a rendered pill with popover content; returns the unregister.
   */
  registerEventPopover: (
    eventID: string,
    opener: ScheduleEventPopoverOpener,
  ) => () => void;
  unregisterPopover: (token: symbol) => void;
}

/**
 * The pill that comes first in the document, so an event split across several
 * pills (month weeks, multi-day columns) opens from its earliest.
 */
function getFirstOpener(
  openers: ReadonlySet<ScheduleEventPopoverOpener> | undefined,
): ScheduleEventPopoverOpener | undefined {
  let first: ScheduleEventPopoverOpener | undefined;
  openers?.forEach(opener => {
    if (
      first == null ||
      (opener.element.compareDocumentPosition(first.element) &
        Node.DOCUMENT_POSITION_FOLLOWING) !==
        0
    ) {
      first = opener;
    }
  });
  return first;
}

/**
 * Coordinates pointer gestures between otherwise independent Schedule plugins.
 * Popover light dismiss can happen before the target cell receives the
 * pointerdown, so a hidden popover remains active through the current frame.
 */
export function createScheduleInteractionState(): ScheduleInteractionState {
  const openPopovers = new Set<symbol>();
  const recentlyHiddenPopovers = new Set<symbol>();
  const hiddenFrames = new Map<symbol, number>();
  const eventPopoverOpeners = new Map<
    string,
    Set<ScheduleEventPopoverOpener>
  >();

  const clearHiddenFrame = (token: symbol): void => {
    const frame = hiddenFrames.get(token);
    if (frame != null) {
      cancelAnimationFrame(frame);
      hiddenFrames.delete(token);
    }
  };

  const unregisterPopover = (token: symbol): void => {
    openPopovers.delete(token);
    // A create popover unmounts as soon as it is hidden. Keep its hidden token
    // through the current frame so the pointerdown that caused light dismiss
    // cannot immediately create another draft.
    if (!recentlyHiddenPopovers.has(token)) {
      clearHiddenFrame(token);
    }
  };

  return {
    dispose: () => {
      hiddenFrames.forEach(frame => cancelAnimationFrame(frame));
      hiddenFrames.clear();
      eventPopoverOpeners.clear();
      openPopovers.clear();
      recentlyHiddenPopovers.clear();
    },
    markPopoverHidden: token => {
      clearHiddenFrame(token);
      openPopovers.delete(token);
      recentlyHiddenPopovers.add(token);
      hiddenFrames.set(
        token,
        requestAnimationFrame(() => {
          hiddenFrames.delete(token);
          recentlyHiddenPopovers.delete(token);
        }),
      );
    },
    markPopoverShown: token => {
      clearHiddenFrame(token);
      recentlyHiddenPopovers.delete(token);
      openPopovers.add(token);
    },
    openEventPopover: eventID => {
      if (!eventPopoverOpeners.has(eventID)) {
        return false;
      }
      // Deferred to the next frame so a caller's mount effect works under
      // StrictMode: the effects StrictMode discards and re-runs (including
      // this pill's hide notification on unmount) settle before it opens.
      requestAnimationFrame(() => {
        getFirstOpener(eventPopoverOpeners.get(eventID))?.open();
      });
      return true;
    },
    registerEventPopover: (eventID, opener) => {
      let openers = eventPopoverOpeners.get(eventID);
      if (openers == null) {
        openers = new Set();
        eventPopoverOpeners.set(eventID, openers);
      }
      openers.add(opener);
      return () => {
        openers.delete(opener);
        if (
          openers.size === 0 &&
          eventPopoverOpeners.get(eventID) === openers
        ) {
          eventPopoverOpeners.delete(eventID);
        }
      };
    },
    markPointerDown: event => {
      if (openPopovers.size > 0 || recentlyHiddenPopovers.size > 0) {
        schedulePopoverDismissPointerEvents.add(event);
      }
    },
    unregisterPopover,
  };
}

export function isSchedulePopoverDismissPointerEvent(event: Event): boolean {
  return schedulePopoverDismissPointerEvents.has(event);
}

export const ScheduleInteractionContext =
  createContext<ScheduleInteractionState | null>(null);
ScheduleInteractionContext.displayName = 'ScheduleInteractionContext';

export function useScheduleInteractionState(): ScheduleInteractionState {
  const state = use(ScheduleInteractionContext);
  if (state == null) {
    throw new Error('Schedule interactions must be rendered inside Schedule.');
  }
  return state;
}
