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
  open: () => void;
}

export interface ScheduleInteractionState {
  dispose: () => void;
  /**
   * How many times `openEventPopover` has opened a popover. The time grid
   * skips a deferred initial scroll once it changes, so it does not scroll an
   * opened event back out of view.
   */
  getEventPopoverOpenCount: () => number;
  markPointerDown: (event: Event) => void;
  markPopoverHidden: (token: symbol) => void;
  markPopoverShown: (token: symbol) => void;
  /**
   * Opens the popover of the event's earliest registered pill. Returns
   * `false` when no pill for the event is registered.
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
  let eventPopoverOpenCount = 0;

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
    getEventPopoverOpenCount: () => eventPopoverOpenCount,
    openEventPopover: eventID => {
      let first: ScheduleEventPopoverOpener | undefined;
      eventPopoverOpeners.get(eventID)?.forEach(opener => {
        if (first == null || opener.dayIndex < first.dayIndex) {
          first = opener;
        }
      });
      if (first == null) {
        return false;
      }
      eventPopoverOpenCount += 1;
      first.open();
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
