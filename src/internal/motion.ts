'use client';

// Millisecond mirrors of the Panda preset duration tokens
// (--silver-durations-fast / --silver-durations-normal). Keep in sync with the
// `transitionDuration` tokens used in recipes.
export const DURATION_FAST_MS = 150;
export const DURATION_NORMAL_MS = 200;

// Cushion past the CSS transition so a deferred close() never clips the last
// frame of an exit animation.
const EXIT_BUFFER_MS = 30;

// Recipes collapse transitions to 0.01s under prefers-reduced-motion; the
// matching JS timer collapses too, so focus return is not delayed by a
// full-length dead wait.
const REDUCED_MOTION_EXIT_MS = 10;

/**
 * Resolves how long a deferred close should wait for the exit transition,
 * honoring the user's reduced-motion preference at the moment the close
 * starts.
 */
export function getExitDurationMs(durationMs: number): number {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReducedMotion
    ? REDUCED_MOTION_EXIT_MS
    : durationMs + EXIT_BUFFER_MS;
}
