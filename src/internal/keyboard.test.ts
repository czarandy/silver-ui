import {afterEach, describe, expect, it, vi} from 'vitest';
import {getKeyboardEventKey, isApplePlatform} from 'internal/keyboard';

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

describe('isApplePlatform', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false without a navigator', () => {
    vi.stubGlobal('navigator', undefined);

    expect(isApplePlatform()).toBe(false);
  });

  it.each(['MacIntel', 'iPhone', 'iPad', 'iPod'])(
    'falls back to the Apple platform %s when the hint is unknown',
    platform => {
      vi.stubGlobal('navigator', {
        platform,
        userAgentData: {platform: 'Unknown'},
      });

      expect(isApplePlatform()).toBe(true);
    },
  );

  it.each([undefined, null, 'macOS', {}, {platform: 123}, {platform: {}}])(
    'falls back when client hints are unavailable or malformed: %j',
    userAgentData => {
      vi.stubGlobal('navigator', {platform: 'MacIntel', userAgentData});

      expect(isApplePlatform()).toBe(true);
    },
  );
});
