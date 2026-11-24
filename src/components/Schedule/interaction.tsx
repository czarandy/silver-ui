'use client';

import {createContext, use} from 'react';

const schedulePopoverDismissPointerEvents = new WeakSet<Event>();

/**
 * A rendered event pill whose popover `ScheduleHandle.openEventPopover` can
 * open. `dayIndex` is the index, within the view's days, of the first day the
 * pill covers, so an event split across pills opens from its earliest piece.
 */
export interface ScheduleEventPopoverOpener {
  dayIndex: number;
  element: HTMLElement;
  getIsOpen: () => boolean;
  /**
   * Opens the popover unless it is already open. Opening does nothing while
   * the popover is being dismissed.
   */
  open: () => void;
}

export interface ScheduleInteractionState {
  dispose: () => void;
  /**
   * The pill `openEventPopover` last opened, while its popover stays open. The
   * time grid scrolls it into view, rather than to its initial scroll time,
   * when the grid gets layout after the open.
   */
  getOpenedEventPill: () => HTMLElement | null;
  markPointerDown: (event: Event) => void;
  markPopoverHidden: (token: symbol) => void;
  markPopoverShown: (token: symbol) => void;
  /**
   * Opens the popover of the event's earliest registered pill and returns
   * whether it is open, or `null` when no pill for the event is registered.
   */
  openEventPopover(eventID: string): boolean | null;
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
  let openedEventPill: ScheduleEventPopoverOpener | null = null;

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
    getOpenedEventPill: () =>
      openedEventPill?.getIsOpen() === true ? openedEventPill.element : null,
    openEventPopover: eventID => {
      let first: ScheduleEventPopoverOpener | undefined;
      eventPopoverOpeners.get(eventID)?.forEach(opener => {
        if (first == null || opener.dayIndex < first.dayIndex) {
          first = opener;
        }
      });
      if (first == null) {
        return null;
      }
      first.open();
      const isOpen = first.getIsOpen();
      if (isOpen) {
        openedEventPill = first;
      }
      return isOpen;
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
        if (openedEventPill === opener) {
          openedEventPill = null;
        }
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
