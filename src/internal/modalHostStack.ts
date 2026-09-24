/**
 * Open native modal dialogs, in the order they opened. The last one is the
 * active modal: while it is open, every element outside its DOM subtree is
 * inert. Surfaces that must stay visible and operable above any modal (the
 * toast viewport) render into the active host instead of `document.body`.
 *
 * Every component that calls `showModal()` registers its dialog through
 * `useModalHost`.
 *
 * This is separate from `layerStack`, which orders every dismissable layer
 * (popovers and menus included) for Escape handling. Only a modal dialog makes
 * the rest of the page inert, so only modals can host.
 */
const hosts: HTMLElement[] = [];
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Marks `host` as the active modal. Registering an already registered host
 * moves it back to the top and notifies again even if it already was: a dialog
 * that re-runs `showModal()` re-enters the top layer above anything hosted in
 * it, which must then re-enter above the dialog.
 */
export function registerModalHost(host: HTMLElement): void {
  const index = hosts.indexOf(host);
  if (index !== -1) {
    hosts.splice(index, 1);
  }
  hosts.push(host);
  notify();
}

/**
 * Removes `host`. The previously opened modal, if any, becomes active again.
 */
export function unregisterModalHost(host: HTMLElement): void {
  const index = hosts.indexOf(host);
  if (index === -1) {
    return;
  }
  hosts.splice(index, 1);
  notify();
}

/**
 * The most recently opened modal, skipping any that `isEligible` rejects.
 */
export function getActiveModalHost(
  isEligible?: (host: HTMLElement) => boolean,
): HTMLElement | null {
  for (let index = hosts.length - 1; index >= 0; index--) {
    const host = hosts[index];
    if (isEligible == null || isEligible(host)) {
      return host;
    }
  }
  return null;
}

export function subscribeModalHosts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
