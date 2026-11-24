'use client';

import {createContext, use} from 'react';

const schedulePopoverDismissPointerEvents = new WeakSet<Event>();

/**
 * A rendered event pill with popover content. `ScheduleHandle.openEventPopover`
 * opens the first of an event's pills in document order.
 */
export interface ScheduleEventPopoverOpener {
  element: HTMLElement;
  getIsOpen: () => boolean;
  /**
   * Opens the popover (a no-op while it is being dismissed), then scrolls the
   * pill into view and focuses it.
   */
  open: () => void;
}

export interface ScheduleInteractionState {
  dispose: () => void;
  markPointerDown: (event: Event) => void;
  markPopoverHidden: (token: symbol) => void;
  markPopoverShown: (token: symbol) => void;
  /**
   * Opens the event's first pill unless one is open; returns whether one is.
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
 * Coordinates pointer gestures between otherwise independent Schedule plugins.
 * Popover light dismiss can happen before the target cell receives the
 * pointerdown, so a hidden popover remains active through the current frame.
 */
export function createScheduleInteractionState(): ScheduleInteractionState {
  const openPopovers = new Set<symbol>();
  const recentlyHiddenPopovers = new Set<symbol>();
  const hiddenFrames = new Map<symbol, number>();
  // Pills unregister themselves, so `dispose` leaves these alone.
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
      const openers = [...(eventPopoverOpeners.get(eventID) ?? [])];
      if (openers.some(opener => opener.getIsOpen())) {
        return true;
      }
      let first: ScheduleEventPopoverOpener | undefined;
      openers.forEach(opener => {
        if (
          first == null ||
          (first.element.compareDocumentPosition(opener.element) &
            Node.DOCUMENT_POSITION_PRECEDING) !==
            0
        ) {
          first = opener;
        }
      });
      if (first == null) {
        return false;
      }
      first.open();
      return first.getIsOpen();
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
