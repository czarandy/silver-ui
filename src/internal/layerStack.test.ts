import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  getTopLayerId,
  isTopLayer,
  pushLayer,
  registerLayerNode,
  removeLayer,
  resetLayerStack,
  unregisterLayerNode,
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

  it('uses the parent id before insertion order when elements are unavailable', () => {
    // React runs a nested layer's effects before its parent's, so the child can
    // register first. Without the parent link the parent would look topmost.
    pushLayer({
      getElement: () => null,
      id: 'child',
      onEscape: vi.fn(),
      parentId: 'parent',
    });
    pushLayer({getElement: () => null, id: 'parent', onEscape: vi.fn()});

    expect(getTopLayerId()).toBe('child');
    expect(isTopLayer('parent')).toBe(false);
    expect(isTopLayer('child')).toBe(true);
  });

  it('resolves nesting through intermediate layers in the parent chain', () => {
    // `middle` opted out of Escape dismissal, so the chain from `leaf` to `root`
    // only closes if non-dismissing layers are still part of the tree.
    registerLayerNode({getElement: () => null, id: 'middle', parentId: 'root'});
    pushLayer({
      getElement: () => null,
      id: 'leaf',
      onEscape: vi.fn(),
      parentId: 'middle',
    });
    pushLayer({getElement: () => null, id: 'root', onEscape: vi.fn()});

    expect(getTopLayerId()).toBe('leaf');
    expect(isTopLayer('root')).toBe(false);
  });

  it('treats a layer with no Escape-handling layers open as topmost', () => {
    registerLayerNode({getElement: () => null, id: 'quiet', parentId: null});

    expect(isTopLayer('quiet')).toBe(true);
  });

  it('treats a node nested inside the top layer as topmost', () => {
    pushLayer({getElement: () => null, id: 'dialog', onEscape: vi.fn()});
    // A layer that opted out of Escape dismissal but sits above the dialog.
    registerLayerNode({
      getElement: () => null,
      id: 'inner',
      parentId: 'dialog',
    });

    expect(isTopLayer('inner')).toBe(true);
  });

  it('treats a node outside the top layer as covered', () => {
    pushLayer({getElement: () => null, id: 'dialog', onEscape: vi.fn()});
    registerLayerNode({getElement: () => null, id: 'sibling', parentId: null});

    expect(isTopLayer('sibling')).toBe(false);
  });

  it('drops nodes on unregister', () => {
    registerLayerNode({getElement: () => null, id: 'node', parentId: null});
    pushLayer({getElement: () => null, id: 'other', onEscape: vi.fn()});
    expect(isTopLayer('node')).toBe(false);

    unregisterLayerNode('node');
    removeLayer('other');

    expect(isTopLayer('node')).toBe(true);
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
