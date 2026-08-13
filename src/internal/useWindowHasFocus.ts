'use client';

import {useEffect, useRef, useState} from 'react';

function getInitialWindowFocus(): boolean {
  return typeof document === 'undefined' || document.hasFocus();
}

/**
 * Reports whether the window was focused before the current browser event.
 * Regaining focus is deferred by one frame so the pointer press that activates
 * an unfocused window still observes `false`.
 */
export function useWindowHasFocus(): boolean {
  const [hasFocus, setHasFocus] = useState(getInitialWindowFocus);
  const focusFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleBlur = () => {
      if (focusFrameRef.current != null) {
        cancelAnimationFrame(focusFrameRef.current);
        focusFrameRef.current = null;
      }
      setHasFocus(false);
    };
    const handleFocus = () => {
      if (focusFrameRef.current != null) {
        cancelAnimationFrame(focusFrameRef.current);
      }
      // Browsers may report window focus before the pointerdown that activated
      // it. Wait a frame so that activation press still sees `false`.
      focusFrameRef.current = requestAnimationFrame(() => {
        setHasFocus(true);
        focusFrameRef.current = null;
      });
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      if (focusFrameRef.current != null) {
        cancelAnimationFrame(focusFrameRef.current);
      }
    };
  }, []);

  return hasFocus;
}
