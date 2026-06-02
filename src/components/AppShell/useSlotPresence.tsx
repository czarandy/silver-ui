import {useCallback, useEffect, useRef, useState} from 'react';

function hasChildContent(element: HTMLElement): boolean {
  for (const node of element.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      return true;
    }

    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '') {
      return true;
    }
  }

  return false;
}

export function useSlotPresence(initialValue = false): {
  hasContent: boolean;
  ref: (node: HTMLDivElement | null) => void;
} {
  const [hasContent, setHasContent] = useState(initialValue);
  const observerRef = useRef<MutationObserver | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (node == null) {
      setHasContent(false);
      return;
    }

    setHasContent(hasChildContent(node));

    const observer = new MutationObserver(() => {
      setHasContent(hasChildContent(node));
    });
    observer.observe(node, {childList: true});
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return {hasContent, ref};
}
