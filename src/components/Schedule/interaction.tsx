'use client';

import {createContext, use} from 'react';

const eventPopoverDismissPointerEvents = new WeakSet<Event>();

export interface ScheduleInteractionState {
  dispose: () => void;
  markEventPopoverHidden: (token: symbol) => void;
  markEventPopoverShown: (token: symbol) => void;
  markPointerDown: (event: Event) => void;
  unregisterEventPopover: (token: symbol) => void;
}

/**
 * Coordinates pointer gestures between otherwise independent Schedule plugins.
 * Event-popover light dismiss can happen before the target cell receives the
 * pointerdown, so a hidden popover remains active through the current frame.
 */
export function createScheduleInteractionState(): ScheduleInteractionState {
  const openEventPopovers = new Set<symbol>();
  const recentlyHiddenEventPopovers = new Set<symbol>();
  const hiddenFrames = new Map<symbol, number>();

  const clearHiddenFrame = (token: symbol): void => {
    const frame = hiddenFrames.get(token);
    if (frame != null) {
      cancelAnimationFrame(frame);
      hiddenFrames.delete(token);
    }
  };

  const unregisterEventPopover = (token: symbol): void => {
    clearHiddenFrame(token);
    openEventPopovers.delete(token);
    recentlyHiddenEventPopovers.delete(token);
  };

  return {
    dispose: () => {
      hiddenFrames.forEach(frame => cancelAnimationFrame(frame));
      hiddenFrames.clear();
      openEventPopovers.clear();
      recentlyHiddenEventPopovers.clear();
    },
    markEventPopoverHidden: token => {
      clearHiddenFrame(token);
      openEventPopovers.delete(token);
      recentlyHiddenEventPopovers.add(token);
      hiddenFrames.set(
        token,
        requestAnimationFrame(() => {
          hiddenFrames.delete(token);
          recentlyHiddenEventPopovers.delete(token);
        }),
      );
    },
    markEventPopoverShown: token => {
      clearHiddenFrame(token);
      recentlyHiddenEventPopovers.delete(token);
      openEventPopovers.add(token);
    },
    markPointerDown: event => {
      if (openEventPopovers.size > 0 || recentlyHiddenEventPopovers.size > 0) {
        eventPopoverDismissPointerEvents.add(event);
      }
    },
    unregisterEventPopover,
  };
}

export function isEventPopoverDismissPointerEvent(event: Event): boolean {
  return eventPopoverDismissPointerEvents.has(event);
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
