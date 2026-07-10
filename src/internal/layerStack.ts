'use client';

import {isComposingEvent} from 'internal/isComposingEvent';

interface LayerEntry {
  getElement: () => HTMLElement | null;
  id: string;
  onEscape: (event: KeyboardEvent) => void;
}

const layers: LayerEntry[] = [];

function getTopLayer(): LayerEntry | undefined {
  const candidates = layers.filter(layer => {
    const element = layer.getElement();
    if (element == null) {
      return true;
    }

    return !layers.some(other => {
      const otherElement = other.getElement();
      return (
        other.id !== layer.id &&
        otherElement != null &&
        element.contains(otherElement)
      );
    });
  });
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

export function pushLayer(entry: LayerEntry): void {
  removeLayer(entry.id);
  layers.push(entry);
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

export function isTopLayer(id: string): boolean {
  return getTopLayer()?.id === id;
}

export function getTopLayerId(): string | undefined {
  return getTopLayer()?.id;
}

export function resetLayerStack(): void {
  layers.splice(0, layers.length);
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeyDown);
  }
}
