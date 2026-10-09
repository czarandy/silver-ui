'use client';

import {useSyncExternalStore} from 'react';
import type {Instant} from 'components/Schedule/types';
import {Temporal} from 'internal/temporal';

const UPDATE_INTERVAL_MS = 60 * 1000;
const listeners = new Set<() => void>();
let interval: ReturnType<typeof setInterval> | null = null;
// Read lazily rather than at module load: silver-ui must be importable before
// the app installs a Temporal polyfill (README: "Temporal").
let currentTime: Instant | null = null;

function getCurrentTime(): Instant {
  return Temporal.Now.instant().epochMilliseconds;
}

function getSnapshot(): Instant {
  currentTime ??= getCurrentTime();
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
