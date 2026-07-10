'use client';

import {useCallback, useEffect, useRef} from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';

export interface UseFocusTrapOptions {
  isActive: boolean;
}

export interface UseFocusTrapReturn<T extends HTMLElement = HTMLElement> {
  containerRef: React.RefObject<T | null>;
  focusFirst: () => void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
}

function focusFirstDescendant(container: HTMLElement): void {
  getFocusableElements(container)[0]?.focus();
}

function focusLastDescendant(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  elements.at(-1)?.focus();
}

export function useFocusTrap<T extends HTMLElement = HTMLElement>({
  isActive,
}: UseFocusTrapOptions): UseFocusTrapReturn<T> {
  const containerRef = useRef<T>(null);

  const focusFirst = useCallback(() => {
    if (containerRef.current != null) {
      focusFirstDescendant(containerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const container = containerRef.current;
      if (container == null) {
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        focusLastDescendant(container);
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        focusFirstDescendant(container);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return {containerRef, focusFirst};
}
