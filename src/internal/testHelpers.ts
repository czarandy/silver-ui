import {expect, vi, type Mock} from 'vitest';

/**
 * Asserts a value is neither null nor undefined, then returns it narrowed to
 * `NonNullable<T>`. Lets tests drop `!` non-null assertions and `?.` access
 * while still failing with a clear diff when the value is unexpectedly missing.
 */
export function assertNonNull<T>(value: T, message?: string): NonNullable<T> {
  expect(value, message).not.toBeNull();
  expect(value, message).not.toBeUndefined();
  return value as NonNullable<T>;
}

export interface PopoverFocusShim {
  /**
   * Spy standing in for `HTMLElement.prototype.hidePopover`.
   */
  hidePopover: Mock<(this: HTMLElement) => void>;
  /**
   * Patches the prototypes. Call from `beforeAll`.
   */
  install: () => void;
  /**
   * Whether `element` was last shown rather than hidden.
   */
  isPopoverOpen: (element: HTMLElement) => boolean;
  /**
   * Clears both spies and restores `:focus-visible` to matching. Call from
   * `beforeEach`.
   */
  reset: () => void;
  /**
   * Controls what `element.matches(':focus-visible')` answers, so a test can
   * distinguish keyboard focus from pointer focus. Defaults to `true`.
   */
  setFocusVisible: (isFocusVisible: boolean) => void;
  /**
   * Spy standing in for `HTMLElement.prototype.showPopover`.
   */
  showPopover: Mock<(this: HTMLElement) => void>;
  /**
   * Restores the prototypes. Call from `afterAll`.
   */
  uninstall: () => void;
}

/**
 * Fakes the two browser features that layer-based components depend on and
 * jsdom does not implement: the Popover API, and `:focus-visible`.
 *
 * jsdom answers `false` for `matches(':focus-visible')` no matter how focus
 * arrived, so a component that only acts on keyboard focus can never be
 * exercised without this. `showPopover`/`hidePopover` are spies rather than real
 * implementations, which makes them — not the element's presence in the DOM —
 * the signal for whether a layer is open. A popover is always in the jsdom tree.
 *
 * ```ts
 * const shim = createPopoverFocusShim();
 * beforeAll(shim.install);
 * afterAll(shim.uninstall);
 * beforeEach(shim.reset);
 * ```
 */
export function createPopoverFocusShim(): PopoverFocusShim {
  const openState = new WeakMap<HTMLElement, boolean>();
  let isFocusVisible = true;

  const showPopover = vi.fn(function (this: HTMLElement) {
    openState.set(this, true);
  });
  const hidePopover = vi.fn(function (this: HTMLElement) {
    openState.set(this, false);
  });

  let originalMatches: PropertyDescriptor | undefined;

  return {
    hidePopover,
    install() {
      originalMatches = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'matches',
      );
      HTMLElement.prototype.showPopover = showPopover;
      HTMLElement.prototype.hidePopover = hidePopover;
      HTMLElement.prototype.matches = function (
        this: HTMLElement,
        selector: string,
      ): boolean {
        if (selector === ':popover-open') {
          return openState.get(this) ?? false;
        }
        if (selector === ':focus-visible') {
          return isFocusVisible;
        }
        return Element.prototype.matches.call(this, selector);
      } as typeof HTMLElement.prototype.matches;
    },
    isPopoverOpen: element => openState.get(element) ?? false,
    reset() {
      showPopover.mockClear();
      hidePopover.mockClear();
      isFocusVisible = true;
    },
    setFocusVisible(value: boolean) {
      isFocusVisible = value;
    },
    showPopover,
    uninstall() {
      if (originalMatches != null) {
        Object.defineProperty(
          HTMLElement.prototype,
          'matches',
          originalMatches,
        );
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, 'matches');
      }
      Reflect.deleteProperty(HTMLElement.prototype, 'showPopover');
      Reflect.deleteProperty(HTMLElement.prototype, 'hidePopover');
    },
  };
}

export interface ResizeObserverStubControls {
  /**
   * Whether an observer is currently observing `element`.
   */
  isObserved: (element: Element) => boolean;
  /**
   * Forgets every observed element. Call from `afterEach`.
   */
  reset: () => void;
  /**
   * Invokes the callback observing `element` with a single entry for it.
   * Wrap in `act()` when the callback updates React state.
   */
  resize: (element: Element) => void;
  /**
   * Constructor standing in for the global, e.g.
   * `vi.stubGlobal('ResizeObserver', stub.ResizeObserverStub)`.
   */
  ResizeObserverStub: new (callback: ResizeObserverCallback) => ResizeObserver;
}

/**
 * Creates a `ResizeObserver` replacement for jsdom, which lacks the API.
 * Install the returned class as the global, then drive size changes from the
 * test with `resize`. One callback is tracked per element, matching how
 * components and `internal/sharedResizeObserver` observe.
 */
export function createResizeObserverStub(): ResizeObserverStubControls {
  const observed = new Map<
    Element,
    {callback: ResizeObserverCallback; observer: ResizeObserver}
  >();

  class ResizeObserverStub implements ResizeObserver {
    readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    disconnect(): void {
      for (const [element, entry] of observed) {
        if (entry.observer === this) {
          observed.delete(element);
        }
      }
    }

    observe(element: Element): void {
      observed.set(element, {callback: this.callback, observer: this});
    }

    unobserve(element: Element): void {
      observed.delete(element);
    }
  }

  return {
    ResizeObserverStub,
    isObserved: element => observed.has(element),
    reset: () => observed.clear(),
    resize: element => {
      const entry = observed.get(element);
      if (entry == null) {
        return;
      }
      const resizeEntry: Partial<ResizeObserverEntry> = {target: element};
      entry.callback([resizeEntry as ResizeObserverEntry], entry.observer);
    },
  };
}
