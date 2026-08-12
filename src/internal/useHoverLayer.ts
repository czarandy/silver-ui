'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type RefCallback,
  type RefObject,
} from 'react';
import {mergeRefs} from 'internal/mergeRefs';
import useLatest from 'internal/useLatest';
import {useLayer, type LayerReturn} from 'internal/useLayer';

export type HoverLayerFocusTrigger = 'auto' | 'always' | 'never';

export interface UseHoverLayerOptions {
  delay?: number;
  focusTrigger?: HoverLayerFocusTrigger;
  hideDelay?: number;
  isEnabled?: boolean;
  isHiddenOnPress?: boolean;
  /**
   * Forwarded to the underlying layer: children are not mounted until the
   * layer first opens. Set to `false` when closed content must stay in the
   * accessibility tree, e.g. tooltip content referenced by `aria-describedby`.
   * Defaults to `true`.
   */
  isLazy?: boolean;
  onFocusIn?: (event: FocusEvent) => boolean;
  onFocusOut?: (event: FocusEvent) => boolean;
  onHide?: () => void;
  onShow?: () => void;
  onTriggerEscape?: (event: KeyboardEvent) => void;
  shouldHide?: () => boolean;
}

export interface UseHoverLayerReturn {
  anchorId: string;
  clearTimeouts: () => void;
  describedBy: string;
  hide: () => void;
  interactionRef: RefCallback<HTMLElement>;
  layer: LayerReturn;
  positionRef: RefCallback<HTMLElement>;
  ref: RefCallback<HTMLElement>;
  scheduleHide: () => void;
  show: () => void;
  triggerRef: RefObject<HTMLElement | null>;
}

function isFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute('tabindex')) {
    return element.tabIndex >= 0;
  }

  if (
    ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)
  ) {
    return !(element as HTMLButtonElement).disabled;
  }

  return element.isContentEditable;
}

function isTouchDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: none)').matches
  );
}

export function useHoverLayer({
  delay = 200,
  focusTrigger = 'auto',
  hideDelay = 0,
  isEnabled = true,
  isHiddenOnPress = false,
  isLazy,
  onFocusIn,
  onFocusOut,
  onHide,
  onShow,
  onTriggerEscape,
  shouldHide,
}: UseHoverLayerOptions = {}): UseHoverLayerReturn {
  const layer = useLayer({isLazy, onShow, onHide});
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current != null) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (hideTimeoutRef.current != null) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleShow = useCallback(() => {
    if (!isEnabled) {
      return;
    }

    clearTimeouts();
    showTimeoutRef.current = setTimeout(() => layer.show(), delay);
  }, [clearTimeouts, delay, isEnabled, layer]);

  const hideIfAllowed = useCallback(() => {
    if (shouldHide?.() === false) {
      return;
    }

    layer.hide();
  }, [layer, shouldHide]);

  const scheduleHide = useCallback(() => {
    clearTimeouts();

    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(hideIfAllowed, hideDelay);
      return;
    }

    hideIfAllowed();
  }, [clearTimeouts, hideDelay, hideIfAllowed]);

  const handleMouseEnter = useCallback(() => {
    if (isTouchDevice()) {
      return;
    }

    scheduleShow();
  }, [scheduleShow]);

  const handleMouseLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const handlePress = useCallback(() => {
    clearTimeouts();
    layer.hide();
  }, [clearTimeouts, layer]);

  const handleFocusIn = useCallback(
    (event: FocusEvent) => {
      if (!isEnabled || onFocusIn?.(event) === false) {
        return;
      }

      clearTimeouts();
      layer.show();
    },
    [clearTimeouts, isEnabled, layer, onFocusIn],
  );

  const handleFocusOut = useCallback(
    (event: FocusEvent) => {
      if (onFocusOut?.(event) === false) {
        return;
      }

      scheduleHide();
    },
    [onFocusOut, scheduleHide],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && layer.isOpen) {
        onTriggerEscape?.(event);
      }
    },
    [layer.isOpen, onTriggerEscape],
  );

  const handlersRef = useLatest({
    focusIn: handleFocusIn,
    focusOut: handleFocusOut,
    keyDown: handleKeyDown,
    mouseEnter: handleMouseEnter,
    mouseLeave: handleMouseLeave,
    press: handlePress,
  });

  const stableMouseEnter = useCallback(() => {
    handlersRef.current.mouseEnter();
  }, []);
  const stableMouseLeave = useCallback(() => {
    handlersRef.current.mouseLeave();
  }, []);
  const stableFocusIn = useCallback((event: Event) => {
    handlersRef.current.focusIn(event as FocusEvent);
  }, []);
  const stableFocusOut = useCallback((event: Event) => {
    handlersRef.current.focusOut(event as FocusEvent);
  }, []);
  const stableKeyDown = useCallback((event: Event) => {
    handlersRef.current.keyDown(event as KeyboardEvent);
  }, []);
  const stablePress = useCallback(() => {
    handlersRef.current.press();
  }, []);

  const hasTriggerEscape = onTriggerEscape != null;

  const interactionRef: RefCallback<HTMLElement> = useCallback(
    element => {
      if (triggerRef.current != null) {
        triggerRef.current.removeEventListener('mouseenter', stableMouseEnter);
        triggerRef.current.removeEventListener('mouseleave', stableMouseLeave);
        triggerRef.current.removeEventListener('focusin', stableFocusIn);
        triggerRef.current.removeEventListener('focusout', stableFocusOut);
        triggerRef.current.removeEventListener('keydown', stableKeyDown);
        triggerRef.current.removeEventListener('pointerdown', stablePress);
        triggerRef.current.removeEventListener('click', stablePress);
      }

      if (element != null) {
        element.addEventListener('mouseenter', stableMouseEnter);
        element.addEventListener('mouseleave', stableMouseLeave);

        const shouldAttachFocus =
          focusTrigger === 'always' ||
          (focusTrigger === 'auto' && isFocusable(element));

        if (shouldAttachFocus) {
          element.addEventListener('focusin', stableFocusIn);
          element.addEventListener('focusout', stableFocusOut);
        }

        if (hasTriggerEscape) {
          element.addEventListener('keydown', stableKeyDown);
        }

        // `pointerdown` covers mouse/touch presses, where neither `mouseleave`
        // nor `focusout` fires; `click` also covers keyboard activation.
        if (isHiddenOnPress) {
          element.addEventListener('pointerdown', stablePress);
          element.addEventListener('click', stablePress);
        }
      }

      triggerRef.current = element;
    },
    [
      focusTrigger,
      hasTriggerEscape,
      isHiddenOnPress,
      stableFocusIn,
      stableFocusOut,
      stableKeyDown,
      stableMouseEnter,
      stableMouseLeave,
      stablePress,
    ],
  );

  const ref = useMemo(
    () => mergeRefs(layer.ref, interactionRef),
    [layer.ref, interactionRef],
  );

  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  return useMemo(
    () => ({
      anchorId: layer.anchorId,
      clearTimeouts,
      describedBy: layer.id,
      hide: layer.hide,
      interactionRef,
      layer,
      positionRef: layer.ref,
      ref,
      scheduleHide,
      show: layer.show,
      triggerRef,
    }),
    [clearTimeouts, interactionRef, layer, ref, scheduleHide],
  );
}
