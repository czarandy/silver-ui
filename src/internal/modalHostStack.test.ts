import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  getActiveModalHost,
  registerModalHost,
  subscribeModalHosts,
  unregisterModalHost,
} from 'internal/modalHostStack';

const first = document.createElement('dialog');
const second = document.createElement('dialog');

afterEach(() => {
  unregisterModalHost(first);
  unregisterModalHost(second);
});

describe('modalHostStack', () => {
  it('has no active host until a modal registers', () => {
    expect(getActiveModalHost()).toBeNull();
  });

  it('makes the most recently opened modal active', () => {
    registerModalHost(first);
    registerModalHost(second);
    expect(getActiveModalHost()).toBe(second);
  });

  it('falls back to the previous modal when the active one closes', () => {
    registerModalHost(first);
    registerModalHost(second);

    unregisterModalHost(second);
    expect(getActiveModalHost()).toBe(first);

    unregisterModalHost(first);
    expect(getActiveModalHost()).toBeNull();
  });

  it('keeps the active modal when a lower one closes first', () => {
    registerModalHost(first);
    registerModalHost(second);

    unregisterModalHost(first);
    expect(getActiveModalHost()).toBe(second);
  });

  it('moves a re-registered modal back to the top', () => {
    registerModalHost(first);
    registerModalHost(second);

    registerModalHost(first);
    expect(getActiveModalHost()).toBe(first);
  });

  it('notifies subscribers on every registration and on removal', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeModalHosts(listener);

    registerModalHost(first);
    // A dialog that re-runs showModal() re-enters the top layer, so hosted
    // content must hear about it even though the stack order is unchanged.
    registerModalHost(first);
    expect(listener).toHaveBeenCalledTimes(2);

    unregisterModalHost(second);
    expect(listener).toHaveBeenCalledTimes(2);

    unregisterModalHost(first);
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    registerModalHost(first);
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
