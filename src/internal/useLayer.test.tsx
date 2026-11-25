/* eslint-disable testing-library/no-node-access -- the mirror stands in for the browser's Popover API, which works on the popover element and its focus */
import {act, render, screen, waitFor} from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import {useLayer} from 'internal/useLayer';

// Chromium 150+ refuses `showPopover()` while any popover on the page is still
// showing or hiding, and hiding a popover with focus inside returns focus to
// the element focused before it opened. This mirrors both rules so jsdom can
// exercise a show that a hide wakes.
let isPopoverOperationInFlight = false;
const restoreFocusTargets = new WeakMap<HTMLElement, HTMLElement>();
let showPopoverSpy: MockInstance<HTMLElement['showPopover']>;

function installPopoverMirror(): void {
  showPopoverSpy = vi.spyOn(HTMLElement.prototype, 'showPopover');
  showPopoverSpy.mockImplementation(function (this: HTMLElement) {
    if (isPopoverOperationInFlight) {
      throw new DOMException(
        "Failed to execute 'showPopover' on 'HTMLElement': Invalid to show a popover during another show operation",
        'InvalidStateError',
      );
    }
    if (document.activeElement instanceof HTMLElement) {
      restoreFocusTargets.set(this, document.activeElement);
    }
    this.setAttribute('data-open', '');
  });
  vi.spyOn(HTMLElement.prototype, 'hidePopover').mockImplementation(function (
    this: HTMLElement,
  ) {
    isPopoverOperationInFlight = true;
    try {
      this.removeAttribute('data-open');
      if (this.contains(document.activeElement)) {
        restoreFocusTargets.get(this)?.focus();
      }
    } finally {
      isPopoverOperationInFlight = false;
    }
  });
}

type Layer = ReturnType<typeof useLayer>;

/**
 * A trigger that opens a layer and shows a tooltip-like layer while focused,
 * the shape of an icon button whose tooltip shows on focus.
 */
function Harness({onRender}: {onRender: (content: Layer) => void}) {
  const content = useLayer();
  const tip = useLayer();
  onRender(content);
  return (
    <>
      <button
        onBlur={tip.hide}
        onFocus={tip.show}
        ref={element => {
          content.ref(element);
          tip.ref(element);
        }}
        type="button">
        trigger
      </button>
      {content.render(
        <button data-testid="inside" type="button">
          inside
        </button>,
      )}
      {tip.render(<span data-testid="tip">tip</span>)}
    </>
  );
}

function renderHarness(): {content: () => Layer; trigger: HTMLElement} {
  let content: Layer | null = null;
  render(
    <Harness
      onRender={layer => {
        content = layer;
      }}
    />,
  );
  return {
    content: () => {
      if (content == null) {
        throw new Error('Harness has not rendered');
      }
      return content;
    },
    trigger: screen.getByRole('button', {name: 'trigger'}),
  };
}

function isTipOpen(): boolean {
  return (
    screen.getByTestId('tip').parentElement?.hasAttribute('data-open') ?? false
  );
}

// Opens the content from a focused trigger, as a press would.
function openContentAndFocusInside(
  content: () => Layer,
  trigger: HTMLElement,
): void {
  act(() => {
    trigger.focus();
    content().show();
  });
  act(() => {
    screen.getByTestId('inside').focus();
  });
}

describe('useLayer show during another popover operation', () => {
  beforeEach(() => {
    installPopoverMirror();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a layer once the hide that refused it has ended', async () => {
    const {content, trigger} = renderHarness();
    openContentAndFocusInside(content, trigger);

    // Hiding the content returns focus to the trigger, whose focus handler
    // asks the tip to show inside the hide.
    act(() => {
      content().hide();
    });
    expect(trigger).toHaveFocus();
    expect(isTipOpen()).toBe(false);

    await waitFor(() => {
      expect(isTipOpen()).toBe(true);
    });
  });

  it('cancels the retry when the layer hides before it runs', async () => {
    const {content, trigger} = renderHarness();
    openContentAndFocusInside(content, trigger);
    act(() => {
      content().hide();
      // Focus leaves the trigger, hiding the tip, before the retry fires.
      trigger.blur();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    expect(isTipOpen()).toBe(false);
  });

  it('rethrows a refusal that is not about another popover operation', () => {
    showPopoverSpy.mockImplementation(() => {
      throw new TypeError('not a popover');
    });
    const {content} = renderHarness();
    expect(() => {
      content().show();
    }).toThrow(TypeError);
  });
});
