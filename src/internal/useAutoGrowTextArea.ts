'use client';

import type {RefObject} from 'react';
import {observeResize, unobserveResize} from 'internal/sharedResizeObserver';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';

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

function resize(
  textarea: HTMLTextAreaElement,
  minRows: number,
  maxRows: number,
): void {
  const computedLineHeight = Number.parseFloat(
    getComputedStyle(textarea).lineHeight,
  );
  const lineHeight = Number.isFinite(computedLineHeight)
    ? computedLineHeight
    : DEFAULT_LINE_HEIGHT;
  // Measuring collapses the textarea to `auto` for a moment. Pin the parent's
  // height meanwhile so the page does not shrink, or a scroll container
  // scrolled to the bottom clamps its position and jumps on every keystroke.
  const parent = textarea.parentElement;
  const parentMinHeight = parent?.style.minHeight ?? '';
  if (parent != null) {
    parent.style.minHeight = `${parent.offsetHeight}px`;
  }
  textarea.style.height = 'auto';
  const height = computeInputHeight(
    textarea.scrollHeight,
    lineHeight,
    minRows,
    maxRows,
  );
  textarea.style.height = `${height}px`;
  if (parent != null) {
    parent.style.minHeight = parentMinHeight;
  }
  textarea.style.overflowY =
    textarea.scrollHeight > maxRows * lineHeight ? 'auto' : 'hidden';
}

/**
 * Sizes a textarea to its content, between `minRows` and `maxRows` lines.
 * Re-measures when `value` changes and when the textarea's width changes,
 * since narrower text wraps onto more lines. Pass `isEnabled: false` to leave
 * the textarea alone.
 */
export function useAutoGrowTextArea(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  minRows: number,
  maxRows: number,
  isEnabled = true,
): void {
  useIsomorphicLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!isEnabled || textarea == null) {
      return;
    }
    resize(textarea, minRows, maxRows);
  }, [isEnabled, maxRows, minRows, textareaRef, value]);

  useIsomorphicLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (
      !isEnabled ||
      textarea == null ||
      typeof ResizeObserver === 'undefined'
    ) {
      return;
    }
    let width = textarea.clientWidth;
    // Setting the height also fires the observer, so only a width change
    // triggers a re-measure.
    const handleResize = () => {
      if (textarea.clientWidth !== width) {
        width = textarea.clientWidth;
        resize(textarea, minRows, maxRows);
      }
    };
    observeResize(textarea, handleResize);
    return () => unobserveResize(textarea, handleResize);
  }, [isEnabled, maxRows, minRows, textareaRef]);
}
