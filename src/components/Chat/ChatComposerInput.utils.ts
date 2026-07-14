/**
 * Fallback line height (px) when a computed line height is unavailable, e.g.
 * in jsdom.
 */
export const DEFAULT_LINE_HEIGHT = 24;

/**
 * Clamps a textarea's natural content height between `minRows` and `maxRows`
 * worth of lines.
 */
export function computeInputHeight(
  scrollHeight: number,
  lineHeight: number,
  minRows: number,
  maxRows: number,
): number {
  const min = minRows * lineHeight;
  const max = maxRows * lineHeight;
  return Math.min(Math.max(scrollHeight, min), max);
}
