import {Temporal} from '@js-temporal/polyfill';
import {useSyncExternalStore} from 'react';
import type {Instant} from 'components/Schedule/types';

const UPDATE_INTERVAL_MS = 60 * 1000;
const listeners = new Set<() => void>();
let interval: ReturnType<typeof setInterval> | null = null;
let currentTime = getCurrentTime();

function getCurrentTime(): Instant {
  return Temporal.Now.instant().epochMilliseconds;
}

function getSnapshot(): Instant {
  return currentTime;
}

function getServerSnapshot(): Instant {
  return 0;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  currentTime = getCurrentTime();
  listener();

  interval ??= setInterval(() => {
    currentTime = getCurrentTime();
    listeners.forEach(activeListener => activeListener());
  }, UPDATE_INTERVAL_MS);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && interval != null) {
      clearInterval(interval);
      interval = null;
    }
  };
}

export function useCurrentTime(): Instant {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
