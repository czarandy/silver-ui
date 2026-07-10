'use client';

import {isComposingEvent} from 'internal/isComposingEvent';

interface LayerNode {
  getElement: () => HTMLElement | null;
  id: string;
  parentId: string | null;
}

interface LayerEntry extends LayerNode {
  onEscape: (event: KeyboardEvent) => void;
}

/**
 * Every layer in the tree, whether or not it handles Escape. Layers that opt out
 * of Escape dismissal still take part in nesting so that `isTopLayer` can tell
 * whether an Escape-handling layer sits above them.
 */
const nodes = new Map<string, LayerNode>();

/**
 * The Escape-handling layers, in registration order. A subset of `nodes`.
 */
const layers: LayerEntry[] = [];

/**
 * Whether `childId` sits inside `ancestorId`. Nesting is read from the React
 * tree first (via the parent ids threaded through `LayerContext`), which stays
 * correct across portals and before the layer element is attached, and falls
 * back to DOM containment for layers rendered outside their owner's subtree.
 */
function isNested(childId: string, ancestorId: string): boolean {
  if (childId === ancestorId) {
    return false;
  }

  const seen = new Set<string>();
  let currentId = nodes.get(childId)?.parentId ?? null;
  while (currentId != null && !seen.has(currentId)) {
    if (currentId === ancestorId) {
      return true;
    }
    seen.add(currentId);
    currentId = nodes.get(currentId)?.parentId ?? null;
  }

  const childElement = nodes.get(childId)?.getElement() ?? null;
  const ancestorElement = nodes.get(ancestorId)?.getElement() ?? null;
  return (
    childElement != null &&
    ancestorElement != null &&
    ancestorElement !== childElement &&
    ancestorElement.contains(childElement)
  );
}

function getTopLayer(): LayerEntry | undefined {
  const candidates = layers.filter(
    layer =>
      !layers.some(
        other => other.id !== layer.id && isNested(other.id, layer.id),
      ),
  );
  return candidates.at(-1);
}

function handleKeyDown(event: KeyboardEvent): void {
  if (
    event.key !== 'Escape' ||
    event.defaultPrevented ||
    isComposingEvent(event)
  ) {
    return;
  }

  const topLayer = getTopLayer();
  if (topLayer == null) {
    return;
  }

  event.preventDefault();
  topLayer.onEscape(event);
}

function ensureListener(): void {
  if (typeof document === 'undefined' || layers.length !== 1) {
    return;
  }
  document.addEventListener('keydown', handleKeyDown);
}

function removeListenerIfEmpty(): void {
  if (typeof document === 'undefined' || layers.length !== 0) {
    return;
  }
  document.removeEventListener('keydown', handleKeyDown);
}

/**
 * Adds a layer to the nesting tree without giving it Escape handling. Layers
 * that never dismiss on Escape still register so that descendants can resolve
 * their position relative to layers that do.
 */
export function registerLayerNode(node: LayerNode): void {
  nodes.set(node.id, node);
}

export function unregisterLayerNode(id: string): void {
  nodes.delete(id);
}

export function pushLayer(entry: {
  getElement: () => HTMLElement | null;
  id: string;
  onEscape: (event: KeyboardEvent) => void;
  parentId?: string | null;
}): void {
  const layer: LayerEntry = {...entry, parentId: entry.parentId ?? null};
  removeLayer(layer.id);
  registerLayerNode(layer);
  layers.push(layer);
  ensureListener();
}

export function removeLayer(id: string): void {
  const index = layers.findIndex(layer => layer.id === id);
  if (index === -1) {
    return;
  }
  layers.splice(index, 1);
  removeListenerIfEmpty();
}

/**
 * Whether a layer may act on Escape. True when no Escape-handling layer is open,
 * when the layer is itself the topmost one, or when it sits inside the topmost
 * one (an Escape-handling ancestor never covers its own descendants).
 */
export function isTopLayer(id: string): boolean {
  const topLayer = getTopLayer();
  if (topLayer == null || topLayer.id === id) {
    return true;
  }
  return isNested(id, topLayer.id);
}

export function getTopLayerId(): string | undefined {
  return getTopLayer()?.id;
}

export function resetLayerStack(): void {
  layers.splice(0, layers.length);
  nodes.clear();
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeyDown);
  }
}
