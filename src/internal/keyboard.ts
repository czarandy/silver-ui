'use client';

const specialKeyValues: Readonly<Record<string, string>> = {
  backspace: 'Backspace',
  down: 'ArrowDown',
  enter: 'Enter',
  escape: 'Escape',
  left: 'ArrowLeft',
  plus: '+',
  right: 'ArrowRight',
  tab: 'Tab',
  up: 'ArrowUp',
};

export const keyboardModifierTokens = new Set(['alt', 'ctrl', 'mod', 'shift']);

/**
 * Splits the keyboard descriptor vocabulary shared by Kbd and useHotkey.
 */
export function tokenizeKeyboardKeys(keys: string): string[] {
  return keys
    .split('+')
    .map(key => key.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns whether the current browser uses Apple keyboard conventions.
 */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const userAgentData =
    'userAgentData' in navigator ? navigator.userAgentData : null;
  if (
    userAgentData != null &&
    typeof userAgentData === 'object' &&
    'platform' in userAgentData
  ) {
    return /mac/i.test(String(userAgentData.platform));
  }
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

/**
 * Resolves a descriptor's primary-key token to KeyboardEvent.key.
 */
export function getKeyboardEventKey(token: string): string {
  return specialKeyValues[token] ?? token;
}
