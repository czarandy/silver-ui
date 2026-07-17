'use client';

import {useCallback, useEffect, useMemo, useRef} from 'react';
import {isComposingEvent} from 'internal/isComposingEvent';
import {
  getKeyboardEventKey,
  isApplePlatform,
  keyboardModifierTokens,
  tokenizeKeyboardKeys,
} from 'internal/keyboard';
import useLatest from 'internal/useLatest';

export type HotkeyHandler = (event: KeyboardEvent) => void;

/**
 * A global browser target or a React ref to any event target.
 */
export type HotkeyTarget =
  'document' | 'window' | Readonly<{current: EventTarget | null}>;

export interface UseHotkeyOptions {
  /**
   * Whether the hotkey listener is active.
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether shortcuts may fire from inputs and other editable elements.
   * @default false
   */
  enableOnFormElements?: boolean;
  /**
   * Whether to suppress the matched browser shortcut before calling `handler`.
   * @default false
   */
  preventDefault?: boolean;
  /**
   * Where to listen for keydown events.
   * @default 'document'
   */
  target?: HotkeyTarget;
}

interface HotkeyDescriptor {
  alt: boolean;
  ctrl: boolean;
  key: string;
  mod: boolean;
  shift: boolean;
}

interface HotkeyRegistration {
  listener: EventListener;
  target: EventTarget;
}

const EDITABLE_TARGET_SELECTOR =
  'input, select, textarea, [contenteditable]:not([contenteditable="false"]), [role="textbox"]';

function parseHotkeyDescriptor(keys: string): HotkeyDescriptor | null {
  const tokens = tokenizeKeyboardKeys(keys);
  const primaryKeys = tokens.filter(
    token => !keyboardModifierTokens.has(token),
  );

  if (primaryKeys.length !== 1) {
    if (process.env.NODE_ENV !== 'production') {
      const reason =
        primaryKeys.length === 0
          ? 'must include exactly one non-modifier key'
          : 'cannot include multiple non-modifier keys; key sequences are not supported';
      throw new Error(`useHotkey: descriptor \`${keys}\` ${reason}.`);
    }
    return null;
  }

  return {
    alt: tokens.includes('alt'),
    ctrl: tokens.includes('ctrl'),
    key: getKeyboardEventKey(primaryKeys[0]),
    mod: tokens.includes('mod'),
    shift: tokens.includes('shift'),
  };
}

function isEditableTarget(target: EventTarget | null): boolean {
  const element =
    target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null;
  return element?.closest(EDITABLE_TARGET_SELECTOR) != null;
}

function matchesHotkey(
  event: KeyboardEvent,
  descriptor: HotkeyDescriptor,
): boolean {
  const isApple = isApplePlatform();
  return (
    event.key.toLowerCase() === descriptor.key.toLowerCase() &&
    event.altKey === descriptor.alt &&
    event.ctrlKey === (descriptor.ctrl || (!isApple && descriptor.mod)) &&
    event.metaKey === (isApple && descriptor.mod) &&
    event.shiftKey === descriptor.shift
  );
}

function resolveTarget(target: HotkeyTarget): EventTarget | null {
  if (target === 'document') {
    return typeof document === 'undefined' ? null : document;
  }
  if (target === 'window') {
    return typeof window === 'undefined' ? null : window;
  }
  return target.current;
}

/**
 * Registers one keyboard shortcut such as `f6`, `shift+k`, or `mod+k`.
 * Modifiers match exactly, `mod` means Command on Apple platforms and Control
 * elsewhere, and composition events are always ignored.
 */
const useHotkey = (
  keys: string,
  handler: HotkeyHandler,
  {
    enabled = true,
    enableOnFormElements = false,
    preventDefault = false,
    target = 'document',
  }: UseHotkeyOptions = {},
): void => {
  const descriptor = useMemo(() => parseHotkeyDescriptor(keys), [keys]);
  const currentRef = useLatest({
    descriptor,
    enableOnFormElements,
    handler,
    preventDefault,
  });
  const registrationRef = useRef<HotkeyRegistration | null>(null);

  const listener = useCallback(
    (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      const current = currentRef.current;
      if (
        current.descriptor == null ||
        isComposingEvent(keyboardEvent) ||
        (!current.enableOnFormElements && isEditableTarget(event.target)) ||
        !matchesHotkey(keyboardEvent, current.descriptor)
      ) {
        return;
      }

      if (current.preventDefault) {
        keyboardEvent.preventDefault();
      }
      current.handler(keyboardEvent);
    },
    [currentRef],
  );

  // This effect intentionally runs after every render so a ref target that is
  // conditionally mounted can be detected without requiring a callback ref.
  useEffect(() => {
    const nextTarget = enabled ? resolveTarget(target) : null;
    const registration = registrationRef.current;
    if (registration?.target === nextTarget) {
      return;
    }
    if (registration != null) {
      registration.target.removeEventListener('keydown', registration.listener);
      registrationRef.current = null;
    }
    if (nextTarget != null) {
      // The separate unmount effect below owns the listener's final cleanup;
      // this effect also removes it above whenever the resolved target changes.
      // eslint-disable-next-line @eslint-react/web-api-no-leaked-event-listener
      nextTarget.addEventListener('keydown', listener);
      registrationRef.current = {listener, target: nextTarget};
    }
  }, undefined);

  useEffect(
    () => () => {
      const registration = registrationRef.current;
      if (registration != null) {
        registration.target.removeEventListener(
          'keydown',
          registration.listener,
        );
        registrationRef.current = null;
      }
    },
    [],
  );
};

export default useHotkey;
