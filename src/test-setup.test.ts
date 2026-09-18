import {describe, expect, it} from 'vitest';

describe('test setup', () => {
  it.each(['localStorage', 'sessionStorage'] as const)(
    'exposes a working jsdom %s',
    key => {
      const storage = globalThis[key];
      expect(storage).toBeInstanceOf(Storage);
      storage.setItem('test-setup', 'value');
      expect(storage.getItem('test-setup')).toBe('value');
      storage.removeItem('test-setup');
    },
  );
});
