import {describe, expect, it} from 'vitest';
import {getKeyboardEventKey} from 'internal/keyboard';

describe('getKeyboardEventKey', () => {
  it.each(['__proto__', 'constructor', 'toString', 'custom-key', 'k'])(
    'preserves the literal value of %s',
    token => {
      expect(getKeyboardEventKey(token)).toBe(token);
    },
  );

  it.each([
    ['backspace', 'Backspace'],
    ['down', 'ArrowDown'],
    ['enter', 'Enter'],
    ['escape', 'Escape'],
    ['left', 'ArrowLeft'],
    ['plus', '+'],
    ['right', 'ArrowRight'],
    ['tab', 'Tab'],
    ['up', 'ArrowUp'],
  ])('maps %s to %s', (token, expected) => {
    expect(getKeyboardEventKey(token)).toBe(expected);
  });
});
