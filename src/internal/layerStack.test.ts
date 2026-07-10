import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  getTopLayerId,
  isTopLayer,
  pushLayer,
  removeLayer,
  resetLayerStack,
} from 'internal/layerStack';

afterEach(() => {
  resetLayerStack();
});

function escapeEvent(init?: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key: 'Escape',
    ...init,
  });
}

describe('layerStack', () => {
  it('tracks the top layer and removes layers', () => {
    pushLayer({getElement: () => null, id: 'first', onEscape: vi.fn()});
    pushLayer({getElement: () => null, id: 'second', onEscape: vi.fn()});

    expect(getTopLayerId()).toBe('second');
    expect(isTopLayer('second')).toBe(true);
    expect(isTopLayer('first')).toBe(false);

    removeLayer('second');
    expect(getTopLayerId()).toBe('first');
  });

  it('installs the document listener on first push and removes it after the last layer', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    pushLayer({getElement: () => null, id: 'first', onEscape: vi.fn()});
    pushLayer({getElement: () => null, id: 'second', onEscape: vi.fn()});
    removeLayer('first');
    removeLayer('second');

    expect(
      addSpy.mock.calls.filter(([type]) => type === 'keydown'),
    ).toHaveLength(1);
    expect(
      removeSpy.mock.calls.filter(([type]) => type === 'keydown'),
    ).toHaveLength(1);
  });

  it('uses DOM containment before insertion order', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.append(child);

    pushLayer({getElement: () => child, id: 'child', onEscape: vi.fn()});
    pushLayer({getElement: () => parent, id: 'parent', onEscape: vi.fn()});

    expect(getTopLayerId()).toBe('child');
  });

  it('uses insertion order for sibling layers', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');

    pushLayer({getElement: () => first, id: 'first', onEscape: vi.fn()});
    pushLayer({getElement: () => second, id: 'second', onEscape: vi.fn()});

    expect(getTopLayerId()).toBe('second');
  });

  it('dispatches Escape only to the top layer', () => {
    const firstEscape = vi.fn();
    const secondEscape = vi.fn();
    const event = escapeEvent();

    pushLayer({getElement: () => null, id: 'first', onEscape: firstEscape});
    pushLayer({getElement: () => null, id: 'second', onEscape: secondEscape});

    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(firstEscape).not.toHaveBeenCalled();
    expect(secondEscape).toHaveBeenCalledTimes(1);
  });

  it('skips default-prevented and composing Escape events', () => {
    const onEscape = vi.fn();
    const defaultPreventedEvent = escapeEvent();
    const composingEvent = escapeEvent({isComposing: true});

    pushLayer({getElement: () => null, id: 'layer', onEscape});

    defaultPreventedEvent.preventDefault();
    document.dispatchEvent(defaultPreventedEvent);
    document.dispatchEvent(composingEvent);

    expect(onEscape).not.toHaveBeenCalled();
  });
});
